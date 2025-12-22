/**
 * API Route: /api/admin/refunds
 * Get refund history and create new refunds
 *
 * 표준화된 API 에러 응답 및 Correlation ID 적용
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, isUserAdminServer, getRefunds, createRefund } from '@/lib/admin';
import {
  withErrorHandling,
  ApiError,
  ERROR_CODES,
  successResponse,
  validateRequired,
  parseBody,
} from '@/lib/api-error';

// GET /api/admin/refunds - Get refund history
export const GET = withErrorHandling(async (request, { correlationId }) => {
  const user = await getUserFromRequest(request);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isAdmin = await isUserAdminServer(user.id);
  if (!isAdmin) {
    throw ApiError.forbidden('Admin access required');
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const filters = { startDate, endDate };
  const result = await getRefunds(page, pageSize, filters);

  return successResponse(result, correlationId);
});

// POST /api/admin/refunds - Create new refund
export const POST = withErrorHandling(async (request, { correlationId }) => {
  const user = await getUserFromRequest(request);

  if (!user) {
    throw ApiError.unauthorized();
  }

  const isAdmin = await isUserAdminServer(user.id);
  if (!isAdmin) {
    throw ApiError.forbidden('Admin access required');
  }

  const body = await parseBody<{
    orderId: string;
    amount: number;
    coins: number;
    reason?: string;
    tossRefundKey?: string;
  }>(request);

  // Validate required fields
  validateRequired(body, ['orderId', 'amount', 'coins']);

  const { orderId, amount, coins, reason, tossRefundKey } = body;

  const result = await createRefund({
    orderId,
    amount,
    coins,
    reason,
    tossRefundKey,
    adminId: user.id,
  });

  if (!result.success) {
    throw new ApiError(
      ERROR_CODES.RESOURCE_CONFLICT,
      result.error || 'Failed to create refund',
      400
    );
  }

  return successResponse({ refund: result.refund }, correlationId, 201);
});
