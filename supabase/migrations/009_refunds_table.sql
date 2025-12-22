-- =====================================================
-- Migration: 009_refunds_table.sql
-- Description: 환불 테이블 생성
-- Created: 2025-12-22
-- =====================================================

-- 환불 테이블 생성
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  coins INTEGER NOT NULL CHECK (coins > 0),
  reason TEXT,
  refunded_by UUID REFERENCES profiles(id),  -- 관리자 환불 시 처리자
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at DESC);

-- RLS 활성화
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view own refunds" ON refunds;
DROP POLICY IF EXISTS "Admins can manage all refunds" ON refunds;
DROP POLICY IF EXISTS "Service role can manage refunds" ON refunds;

-- RLS 정책: 사용자는 본인 환불 내역만 조회 가능
CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 관리자는 모든 환불 내역 조회/생성 가능
CREATE POLICY "Admins can manage all refunds"
  ON refunds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 서비스 역할은 모든 작업 가능 (Webhook 등)
CREATE POLICY "Service role can manage refunds"
  ON refunds FOR ALL
  USING (auth.role() = 'service_role');

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_refunds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_refunds_updated_at();

-- 환불 처리 RPC 함수 (관리자용)
CREATE OR REPLACE FUNCTION process_refund(
  p_order_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  refund_id UUID,
  coins_deducted INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_refund_id UUID;
  v_current_coins INTEGER;
BEGIN
  -- 주문 조회 (락)
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Order not found'::TEXT;
    RETURN;
  END IF;

  -- 이미 환불된 주문인지 확인
  IF v_order.status = 'refunded' THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Order already refunded'::TEXT;
    RETURN;
  END IF;

  -- 완료된 주문만 환불 가능
  IF v_order.status != 'completed' THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 'Only completed orders can be refunded'::TEXT;
    RETURN;
  END IF;

  -- 사용자 코인 확인
  SELECT coins INTO v_current_coins
  FROM profiles
  WHERE id = v_order.user_id
  FOR UPDATE;

  -- 코인 부족 시에도 환불은 진행 (음수 허용 또는 0으로 설정)
  UPDATE profiles
  SET coins = GREATEST(0, coins - v_order.coins)
  WHERE id = v_order.user_id;

  -- 주문 상태 업데이트
  UPDATE orders
  SET status = 'refunded',
      canceled_at = now()
  WHERE id = p_order_id;

  -- 환불 기록 생성
  INSERT INTO refunds (order_id, user_id, amount, coins, reason, refunded_by)
  VALUES (p_order_id, v_order.user_id, v_order.amount, v_order.coins, p_reason, p_admin_id)
  RETURNING id INTO v_refund_id;

  -- 크레딧 히스토리 기록
  INSERT INTO credit_history (user_id, amount, type, description, order_id)
  VALUES (v_order.user_id, -v_order.coins, 'REFUND', COALESCE(p_reason, '환불 처리'), v_order.order_id);

  RETURN QUERY SELECT true, v_refund_id, v_order.coins, NULL::TEXT;
END;
$$;

COMMENT ON TABLE refunds IS '환불 내역 테이블';
COMMENT ON COLUMN refunds.order_id IS '환불된 주문 ID';
COMMENT ON COLUMN refunds.refunded_by IS '환불 처리한 관리자 ID (Webhook 환불은 NULL)';
