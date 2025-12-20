/**
 * API Route: /api/admin/stats
 * Get admin dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isUserAdminServer, getAdminStats, getPeriodStats } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isUserAdminServer(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [stats, periodStats] = await Promise.all([
      getAdminStats(),
      getPeriodStats(),
    ]);

    return NextResponse.json({ ...stats, periodStats });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
