/**
 * API Route: /api/admin/users
 * Get and manage users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isUserAdminServer, getUsers, updateUserCoins, addUserCoins, setUserAdmin, softDeleteUser, restoreUser } from '@/lib/admin';

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
    const includeDeleted = searchParams.get('deleted') === 'true';

    const result = await getUsers(page, pageSize, search, includeDeleted);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching users:', error);
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
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    let success = false;

    let result: any = null;

    switch (action) {
      case 'updateCoins':
        if (typeof value !== 'number') {
          return NextResponse.json({ error: 'value must be a number for updateCoins' }, { status: 400 });
        }
        success = await updateUserCoins(userId, value);
        break;

      case 'addCoins':
        if (typeof value !== 'number') {
          return NextResponse.json({ error: 'value must be a number for addCoins' }, { status: 400 });
        }
        result = await addUserCoins(userId, value);
        success = result.success;
        break;

      case 'setAdmin':
        if (typeof value !== 'boolean') {
          return NextResponse.json({ error: 'value must be a boolean for setAdmin' }, { status: 400 });
        }
        success = await setUserAdmin(userId, value);
        break;

      case 'softDelete':
        success = await softDeleteUser(userId);
        break;

      case 'restore':
        success = await restoreUser(userId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...(result && { newBalance: result.newBalance }) });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
