-- =====================================================
-- Migration: profiles 개인정보 암호화
-- 설명: email, full_name 암호화 컬럼 추가
-- 검색은 해시로, 표시는 암호화된 값 복호화
-- =====================================================

-- 암호화 관련 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_hash TEXT,
ADD COLUMN IF NOT EXISTS email_encrypted TEXT,
ADD COLUMN IF NOT EXISTS full_name_encrypted TEXT;

-- email_hash 인덱스 (검색용)
CREATE INDEX IF NOT EXISTS idx_profiles_email_hash ON profiles(email_hash);

-- 기존 데이터 마이그레이션은 애플리케이션 레벨에서 처리
-- (암호화 키가 서버에만 있으므로)

-- =====================================================
-- 참고: 암호화 적용 후 기존 email, full_name 컬럼은
-- 점진적으로 NULL 처리하거나 유지할 수 있음
-- =====================================================
