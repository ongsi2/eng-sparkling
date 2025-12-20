/**
 * API Route: /api/admin/refunds
 * Get refund history and create new refunds
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isUserAdminServer, getRefunds, createRefund } from '@/lib/admin';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const filters = { startDate, endDate };
    const result = await getRefunds(page, pageSize, filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isUserAdminServer(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, amount, coins, reason, tossRefundKey } = body;

    if (!orderId || amount === undefined || coins === undefined) {
      return NextResponse.json(
        { error: 'orderId, amount, coins are required' },
        { status: 400 }
      );
    }

    const result = await createRefund({
      orderId,
      amount,
      coins,
      reason,
      tossRefundKey,
      adminId: user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, refund: result.refund });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
