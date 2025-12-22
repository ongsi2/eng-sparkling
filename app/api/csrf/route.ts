/**
 * API Route: /api/csrf
 * CSRF 토큰 발급 엔드포인트
 *
 * 클라이언트가 이 엔드포인트를 호출하면:
 * 1. 새 CSRF 토큰이 생성됨
 * 2. httpOnly 쿠키에 토큰이 저장됨
 * 3. 응답으로 토큰이 반환됨 (클라이언트가 헤더에 포함시켜 전송)
 */

import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

export async function GET() {
  const token = generateCsrfToken();

  await setCsrfCookie(token);

  return NextResponse.json({ csrfToken: token });
}
