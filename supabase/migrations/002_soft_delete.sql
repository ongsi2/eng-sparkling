-- =====================================================
-- Migration: 소프트 삭제 (Soft Delete) 구현
-- 설명: 회원 탈퇴 시 즉시 삭제 대신 논리적 삭제 처리
-- 참고: ddalggak.md 10.1절
-- =====================================================

-- profiles 테이블에 deleted_at 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 삭제된 계정 필터링을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at);

-- 소프트 삭제 함수
CREATE OR REPLACE FUNCTION soft_delete_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET deleted_at = now(),
      updated_at = now()
  WHERE id = user_id AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 계정 복구 함수
CREATE OR REPLACE FUNCTION restore_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET deleted_at = NULL,
      updated_at = now()
  WHERE id = user_id AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 활성 사용자만 조회하는 뷰
CREATE OR REPLACE VIEW active_profiles AS
SELECT * FROM profiles WHERE deleted_at IS NULL;
