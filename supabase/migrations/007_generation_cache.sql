-- Generation Cache 테이블
-- 동일한 입력에 대한 생성 결과를 캐싱하여 API 비용 절감

CREATE TABLE IF NOT EXISTS generation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 캐시 키: 입력값들의 해시
  cache_key TEXT UNIQUE NOT NULL,

  -- 캐시 타입: 'article' 또는 'question'
  cache_type TEXT NOT NULL CHECK (cache_type IN ('article', 'question')),

  -- 입력값 저장 (디버깅/분석용)
  input_data JSONB NOT NULL,

  -- 생성된 결과
  output_data JSONB NOT NULL,

  -- 통계
  hit_count INT DEFAULT 0,
  last_hit_at TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_generation_cache_key ON generation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_generation_cache_type ON generation_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_generation_cache_expires ON generation_cache(expires_at);

-- RLS 정책 (서버에서만 접근)
ALTER TABLE generation_cache ENABLE ROW LEVEL SECURITY;

-- 서비스 역할만 접근 가능 (일반 사용자는 접근 불가)
CREATE POLICY "Service role full access on generation_cache"
  ON generation_cache
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 캐시 히트 업데이트 함수
CREATE OR REPLACE FUNCTION update_cache_hit(p_cache_key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE generation_cache
  SET hit_count = hit_count + 1,
      last_hit_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 만료된 캐시 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM generation_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- pg_cron 작업 추가 (매일 새벽 4시에 만료된 캐시 삭제)
-- 이미 pg_cron이 활성화되어 있다면:
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 4 * * *',
  $$SELECT cleanup_expired_cache()$$
);
