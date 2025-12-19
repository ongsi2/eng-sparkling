/**
 * API Route: /api/demo/status
 * Check demo usage status for current IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDemoUsageFromRequest } from '@/lib/demo';

export async function GET(request: NextRequest) {
  try {
    const usage = await getDemoUsageFromRequest(request);
    return NextResponse.json(usage);
  } catch (error: any) {
    console.error('Error checking demo status:', error);
    return NextResponse.json(
      { error: 'Failed to check demo status', details: error.message },
      { status: 500 }
    );
  }
}
