/**
 * Health Check API
 * 네트워크 상태 확인용 경량 엔드포인트
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
