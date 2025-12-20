/**
 * API Route: /api/admin/demo
 * Manage demo usage records
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isUserAdminServer, getDemoUsages, resetDemoUsage, deleteDemoUsage } from '@/lib/admin';

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
    const search = searchParams.get('search') || undefined;

    const result = await getDemoUsages(page, pageSize, search);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching demo usages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { ipAddress, action } = body;

    if (!ipAddress || !action) {
      return NextResponse.json({ error: 'ipAddress and action are required' }, { status: 400 });
    }

    let success = false;

    switch (action) {
      case 'reset':
        success = await resetDemoUsage(ipAddress);
        break;

      case 'delete':
        success = await deleteDemoUsage(ipAddress);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update demo usage' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating demo usage:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
