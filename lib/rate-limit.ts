/**
 * Simple in-memory rate limiter
 * 프로덕션에서는 Redis 사용 권장
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (서버 재시작 시 초기화됨)
const rateLimitStore = new Map<string, RateLimitRecord>();

// 기본 설정
const DEFAULT_WINDOW_MS = 60 * 1000; // 1분
const DEFAULT_MAX_REQUESTS = 10; // 1분당 10회

interface RateLimitConfig {
  windowMs?: number;
  maxRequests?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

/**
 * Rate limit 체크
 * @param identifier - IP 주소 또는 사용자 ID
 * @param config - Rate limit 설정
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const windowMs = config.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = config.maxRequests || DEFAULT_MAX_REQUESTS;
  const now = Date.now();

  // 기존 기록 조회
  const record = rateLimitStore.get(identifier);

  // 기록이 없거나 윈도우가 지났으면 새로 시작
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // 제한 초과 체크
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      error: `요청이 너무 많습니다. ${retryAfter}초 후에 다시 시도해주세요.`,
    };
  }

  // 카운트 증가
  record.count++;
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * API별 Rate Limit 설정
 */
export const API_RATE_LIMITS = {
  // AI 생성 API - 비용이 많이 드므로 엄격하게
  generateArticle: { windowMs: 60 * 1000, maxRequests: 5 },  // 1분당 5회
  generateQuestion: { windowMs: 60 * 1000, maxRequests: 20 }, // 1분당 20회

  // 결제 API - 중간 정도
  payment: { windowMs: 60 * 1000, maxRequests: 10 }, // 1분당 10회

  // 일반 API - 느슨하게
  default: { windowMs: 60 * 1000, maxRequests: 60 }, // 1분당 60회
};

/**
 * Request에서 IP 주소 추출
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// 주기적으로 오래된 기록 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // 1분마다 정리
