-- ============================================================================
-- Migration: 008_atomic_coin_operations.sql
-- Description: 코인 추가/차감을 원자적으로 처리하는 RPC 함수들
--              Race Condition 방지를 위한 데이터베이스 레벨 잠금 사용
-- ============================================================================

-- ============================================================================
-- 1. 주문 완료 및 코인 추가 (원자적 처리)
-- ============================================================================
CREATE OR REPLACE FUNCTION complete_order_with_coins(
  p_order_id TEXT,
  p_payment_key TEXT,
  p_user_id UUID,
  p_coins INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status TEXT;
  v_current_coins INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 트랜잭션 시작 시 행 잠금 (FOR UPDATE)
  SELECT status INTO v_order_status
  FROM orders
  WHERE order_id = p_order_id
  FOR UPDATE;

  -- 주문이 없는 경우
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Order not found'::TEXT;
    RETURN;
  END IF;

  -- 이미 완료된 주문인 경우
  IF v_order_status = 'completed' THEN
    RETURN QUERY SELECT FALSE, 0, 'Order already completed'::TEXT;
    RETURN;
  END IF;

  -- 주문 상태를 completed로 업데이트
  UPDATE orders
  SET
    status = 'completed',
    payment_key = p_payment_key,
    completed_at = NOW()
  WHERE order_id = p_order_id;

  -- 사용자 프로필 잠금 및 코인 추가
  SELECT coins INTO v_current_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- 프로필이 없으면 롤백 (주문은 완료됐지만 코인 추가 실패)
    RETURN QUERY SELECT FALSE, 0, 'User profile not found'::TEXT;
    RETURN;
  END IF;

  v_new_balance := COALESCE(v_current_coins, 0) + p_coins;

  UPDATE profiles
  SET
    coins = v_new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- ============================================================================
-- 2. 코인 차감 (원자적 처리, 잔액 검증 포함)
-- ============================================================================
CREATE OR REPLACE FUNCTION deduct_coins_atomic(
  p_user_id UUID,
  p_coins INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_coins INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 사용자 프로필 잠금
  SELECT coins INTO v_current_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User profile not found'::TEXT;
    RETURN;
  END IF;

  v_current_coins := COALESCE(v_current_coins, 0);

  -- 잔액 부족 체크
  IF v_current_coins < p_coins THEN
    RETURN QUERY SELECT FALSE, v_current_coins, 'Insufficient coins'::TEXT;
    RETURN;
  END IF;

  v_new_balance := v_current_coins - p_coins;

  UPDATE profiles
  SET
    coins = v_new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- ============================================================================
-- 3. 코인 추가 (단순 추가, 관리자용)
-- ============================================================================
CREATE OR REPLACE FUNCTION add_coins_atomic(
  p_user_id UUID,
  p_coins INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_coins INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 사용자 프로필 잠금
  SELECT coins INTO v_current_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User profile not found'::TEXT;
    RETURN;
  END IF;

  v_new_balance := COALESCE(v_current_coins, 0) + p_coins;

  UPDATE profiles
  SET
    coins = v_new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- ============================================================================
-- 4. 환불 처리 (주문 취소 + 코인 복구)
-- ============================================================================
CREATE OR REPLACE FUNCTION process_refund(
  p_order_id TEXT,
  p_user_id UUID,
  p_refunded_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  refund_id UUID,
  coins_refunded INTEGER,
  new_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_current_coins INTEGER;
  v_new_balance INTEGER;
  v_refund_id UUID;
BEGIN
  -- 주문 조회 및 잠금
  SELECT * INTO v_order
  FROM orders
  WHERE order_id = p_order_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0, 0, 'Order not found'::TEXT;
    RETURN;
  END IF;

  -- 완료된 주문만 환불 가능
  IF v_order.status != 'completed' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0, 0, 'Order is not completed'::TEXT;
    RETURN;
  END IF;

  -- 주문 상태를 refunded로 변경
  UPDATE orders
  SET
    status = 'refunded',
    updated_at = NOW()
  WHERE order_id = p_order_id;

  -- 코인 복구
  SELECT coins INTO v_current_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  v_new_balance := COALESCE(v_current_coins, 0) + v_order.coins;

  UPDATE profiles
  SET
    coins = v_new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 환불 기록 생성 (refunds 테이블이 있는 경우)
  -- 테이블이 없으면 이 부분 주석 처리
  /*
  INSERT INTO refunds (order_id, user_id, amount, coins, reason, refunded_by)
  VALUES (v_order.id, p_user_id, v_order.amount, v_order.coins, p_reason, p_refunded_by)
  RETURNING id INTO v_refund_id;
  */

  v_refund_id := gen_random_uuid(); -- 임시 ID

  RETURN QUERY SELECT TRUE, v_refund_id, v_order.coins, v_new_balance, NULL::TEXT;
END;
$$;

-- ============================================================================
-- 권한 설정 (service_role만 실행 가능)
-- ============================================================================
REVOKE ALL ON FUNCTION complete_order_with_coins FROM PUBLIC;
REVOKE ALL ON FUNCTION deduct_coins_atomic FROM PUBLIC;
REVOKE ALL ON FUNCTION add_coins_atomic FROM PUBLIC;
REVOKE ALL ON FUNCTION process_refund FROM PUBLIC;

-- 서비스 역할에만 실행 권한 부여
GRANT EXECUTE ON FUNCTION complete_order_with_coins TO service_role;
GRANT EXECUTE ON FUNCTION deduct_coins_atomic TO service_role;
GRANT EXECUTE ON FUNCTION add_coins_atomic TO service_role;
GRANT EXECUTE ON FUNCTION process_refund TO service_role;
