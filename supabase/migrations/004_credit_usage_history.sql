-- =====================================================
-- Migration: 크레딧 사용 내역 추적
-- 설명: 코인 사용 내역 기록 및 FIFO 로직 지원
-- 참고: ddalggak.md 8장
-- =====================================================

-- 크레딧 사용 내역 테이블
CREATE TABLE IF NOT EXISTS credit_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,               -- 사용/충전 금액 (양수: 충전, 음수: 사용)
  balance_after INTEGER NOT NULL,        -- 거래 후 잔액
  transaction_type TEXT NOT NULL,        -- 'purchase', 'usage', 'bonus', 'refund', 'admin_add'
  reference_id TEXT,                     -- 관련 ID (order_id, question_id 등)
  description TEXT,                      -- 설명
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_credit_history_user ON credit_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_history_type ON credit_usage_history(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_history_created ON credit_usage_history(created_at);

-- RLS 활성화
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 내역만 조회 가능
CREATE POLICY "Users can view own credit history"
  ON credit_usage_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS 정책: 관리자는 모든 내역 조회 가능
CREATE POLICY "Admins can view all credit history"
  ON credit_usage_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS 정책: 서비스만 내역 삽입 가능
CREATE POLICY "Service can insert credit history"
  ON credit_usage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 크레딧 사용 기록 함수
-- =====================================================

CREATE OR REPLACE FUNCTION record_credit_usage(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_record_id UUID;
BEGIN
  -- 현재 잔액 조회
  SELECT coins INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- 새 잔액 계산
  v_new_balance := v_current_balance + p_amount;

  -- 잔액 부족 체크 (사용인 경우)
  IF p_amount < 0 AND v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 잔액 업데이트
  UPDATE profiles
  SET coins = v_new_balance,
      updated_at = now()
  WHERE id = p_user_id;

  -- 내역 기록
  INSERT INTO credit_usage_history (user_id, amount, balance_after, transaction_type, reference_id, description)
  VALUES (p_user_id, p_amount, v_new_balance, p_type, p_reference_id, p_description)
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
