/**
 * CSRF Protection Utility
 *
 * Double Submit Cookie 패턴을 사용한 CSRF 보호
 * - 서버에서 암호화된 토큰 생성
 * - 클라이언트는 쿠키와 헤더 모두에 토큰 포함
 * - 서버에서 두 값이 일치하는지 확인
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = '__csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * 새 CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * CSRF 토큰을 쿠키에 설정
 */
export async function setCsrfCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * 쿠키에서 CSRF 토큰 가져오기
 */
export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * 요청 헤더에서 CSRF 토큰 가져오기
 */
export function getCsrfTokenFromHeader(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}

/**
 * CSRF 토큰 검증
 * 쿠키의 토큰과 헤더의 토큰이 일치하는지 확인
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieToken = await getCsrfTokenFromCookie();
  const headerToken = getCsrfTokenFromHeader(request);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // 타이밍 공격 방지를 위한 상수 시간 비교
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * CSRF 보호가 필요한 HTTP 메서드인지 확인
 */
export function requiresCsrfProtection(method: string): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(method.toUpperCase());
}

/**
 * CSRF 검증 오류 응답 생성
 */
export function csrfErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token'
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Origin/Referer 헤더 검증 (추가 보안 레이어)
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://thmm.kr',
  ].filter(Boolean);

  // Origin 헤더 확인
  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed as string));
  }

  // Referer 헤더 확인 (Origin이 없는 경우)
  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed as string));
  }

  // 둘 다 없는 경우 (same-origin 요청일 수 있음)
  return false;
}
