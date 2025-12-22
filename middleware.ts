/**
 * Next.js Middleware
 *
 * CSRF 보호 및 보안 헤더 추가
 */

import { NextRequest, NextResponse } from 'next/server';

// CSRF 보호가 필요한 API 경로 패턴
const PROTECTED_API_PATHS = [
  '/api/payment/',
  '/api/generate',
  '/api/generate-article',
  '/api/admin/',
];

// CSRF 검증에서 제외할 경로
const CSRF_EXEMPT_PATHS = [
  '/api/csrf',           // CSRF 토큰 발급
  '/api/health',         // 헬스체크
  '/auth/callback',      // OAuth 콜백
  '/api/webhook',        // 외부 웹훅 (별도 인증 사용)
];

// 상태 변경 HTTP 메서드
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // API 요청이 아니면 통과
  if (!pathname.startsWith('/api/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  // CSRF 면제 경로는 통과
  if (CSRF_EXEMPT_PATHS.some(path => pathname.startsWith(path))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // GET, HEAD, OPTIONS는 CSRF 검증 불필요
  if (!STATE_CHANGING_METHODS.includes(method)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // 보호된 API 경로인지 확인
  const isProtectedPath = PROTECTED_API_PATHS.some(path =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // CSRF 토큰 검증
    const cookieToken = request.cookies.get('__csrf_token')?.value;
    const headerToken = request.headers.get('x-csrf-token');

    if (!cookieToken || !headerToken) {
      console.warn(`CSRF token missing - Path: ${pathname}, Method: ${method}`);
      return NextResponse.json(
        {
          error: 'CSRF validation failed',
          message: 'Missing CSRF token'
        },
        { status: 403 }
      );
    }

    // 타이밍 공격 방지를 위해 상수 시간 비교가 이상적이지만,
    // middleware에서는 crypto 사용이 제한적이므로 단순 비교 사용
    // (실제 보안은 httpOnly 쿠키가 제공)
    if (cookieToken !== headerToken) {
      console.warn(`CSRF token mismatch - Path: ${pathname}`);
      return NextResponse.json(
        {
          error: 'CSRF validation failed',
          message: 'Invalid CSRF token'
        },
        { status: 403 }
      );
    }

    // Origin/Referer 검증 (프로덕션 환경)
    if (process.env.NODE_ENV === 'production') {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');

      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'https://thmm.kr',
      ].filter(Boolean) as string[];

      const isValidOrigin = origin && allowedOrigins.some(allowed =>
        origin.startsWith(allowed)
      );
      const isValidReferer = referer && allowedOrigins.some(allowed =>
        referer.startsWith(allowed)
      );

      if (!isValidOrigin && !isValidReferer) {
        console.warn(`Invalid origin/referer - Path: ${pathname}, Origin: ${origin}, Referer: ${referer}`);
        return NextResponse.json(
          {
            error: 'Invalid request origin',
            message: 'Request rejected due to invalid origin'
          },
          { status: 403 }
        );
      }
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

/**
 * 보안 헤더 추가
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Clickjacking 방지
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // HTTPS 강제 (프로덕션)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Referrer 정책
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS 보호 (구형 브라우저용)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

// Middleware가 실행될 경로 설정
export const config = {
  matcher: [
    // API 라우트
    '/api/:path*',
    // 정적 파일과 이미지 제외
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
