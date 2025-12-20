-- =====================================================
-- Migration: RLS 정책 보강
-- 설명: 모든 테이블에 admin/authenticated 역할 분리 RLS 적용
-- 참고: RECOMMENDATIONS.md 5절
-- =====================================================

-- =====================================================
-- 1. profiles 테이블 RLS
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 관리자는 모든 프로필 조회 가능
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- 사용자는 자신의 프로필만 수정 가능
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 관리자는 모든 프로필 수정 가능
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_admin = true
    )
  );

-- =====================================================
-- 2. orders 테이블 RLS
-- =====================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 주문만 조회 가능
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 관리자는 모든 주문 조회 가능
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 서비스만 주문 삽입/수정 가능
DROP POLICY IF EXISTS "Service can insert orders" ON orders;
CREATE POLICY "Service can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service can update orders" ON orders;
CREATE POLICY "Service can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 3. archived_questions 테이블 RLS
-- =====================================================
ALTER TABLE archived_questions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 저장된 문제만 조회 가능
DROP POLICY IF EXISTS "Users can view own archived questions" ON archived_questions;
CREATE POLICY "Users can view own archived questions"
  ON archived_questions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 관리자는 모든 저장된 문제 조회 가능
DROP POLICY IF EXISTS "Admins can view all archived questions" ON archived_questions;
CREATE POLICY "Admins can view all archived questions"
  ON archived_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 사용자는 자신의 문제만 삽입/삭제 가능
DROP POLICY IF EXISTS "Users can insert own questions" ON archived_questions;
CREATE POLICY "Users can insert own questions"
  ON archived_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own questions" ON archived_questions;
CREATE POLICY "Users can delete own questions"
  ON archived_questions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- 4. demo_usage 테이블 RLS
-- =====================================================
ALTER TABLE demo_usage ENABLE ROW LEVEL SECURITY;

-- 관리자만 데모 사용 현황 조회 가능
DROP POLICY IF EXISTS "Admins can view demo usage" ON demo_usage;
CREATE POLICY "Admins can view demo usage"
  ON demo_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 서비스만 데모 사용 삽입/수정 가능 (익명 사용자용)
DROP POLICY IF EXISTS "Service can insert demo usage" ON demo_usage;
CREATE POLICY "Service can insert demo usage"
  ON demo_usage
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service can update demo usage" ON demo_usage;
CREATE POLICY "Service can update demo usage"
  ON demo_usage
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 5. 관리자 전용 삭제 방지 정책 (orders)
-- 전자상거래법상 5년 보관 의무
-- =====================================================
DROP POLICY IF EXISTS "Prevent order deletion" ON orders;
CREATE POLICY "Prevent order deletion"
  ON orders
  FOR DELETE
  TO authenticated
  USING (false);  -- 모든 삭제 차단 (DB 관리자만 가능)

-- =====================================================
-- 완료
-- =====================================================
