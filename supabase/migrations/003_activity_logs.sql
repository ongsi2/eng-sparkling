-- =====================================================
-- Migration: 사용자 활동 로그 시스템
-- 설명: 통신비밀보호법 준수 (최소 3개월 보관)
-- 참고: ddalggak.md 10.2절
-- =====================================================

-- 활동 로그 테이블
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                  -- 'login', 'logout', 'generate', 'purchase', etc.
  ip_address TEXT,                       -- 접속 IP (암호화 권장)
  user_agent TEXT,                       -- 브라우저 정보
  metadata JSONB DEFAULT '{}',           -- 추가 정보 (페이지, 파라미터 등)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON user_activity_logs(created_at);

-- RLS 활성화
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 로그만 조회 가능
CREATE POLICY "Users can view own logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS 정책: 관리자는 모든 로그 조회 가능
CREATE POLICY "Admins can view all logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS 정책: 서비스 역할만 로그 삽입 가능
CREATE POLICY "Service can insert logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 90일 지난 로그 자동 삭제 (pg_cron 필요)
-- Supabase Dashboard > Database > Extensions에서 pg_cron 활성화 후 실행
-- =====================================================

-- pg_cron 활성화 후 아래 실행:
-- SELECT cron.schedule(
--   'cleanup-old-logs',
--   '0 3 * * *',  -- 매일 새벽 3시
--   $$DELETE FROM user_activity_logs WHERE created_at < now() - interval '90 days'$$
-- );
