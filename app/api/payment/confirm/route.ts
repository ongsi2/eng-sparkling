/**
 * API Route: /api/payment/confirm
 * Confirms payment with Toss Payments and adds coins to user
 *
 * Race Condition 방지를 위해 Supabase RPC 함수로 원자적 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { checkRateLimit, getClientIP, API_RATE_LIMITS } from '@/lib/rate-limit';
import { logPurchase } from '@/lib/activity-logger';

const tossSecretKey = process.env.TOSS_SECRET_KEY!;

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
  // ... other fields
}

interface TossErrorResponse {
  code: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 체크
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `payment:${clientIP}`,
      API_RATE_LIMITS.payment
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429 }
      );
    }

    const { paymentKey, orderId, amount } = await request.json();

    // Validate input
    if (!paymentKey || !orderId || amount === undefined) {
      return NextResponse.json(
        { error: 'paymentKey, orderId, and amount are required' },
        { status: 400 }
      );
    }

    // 1. Get order from DB and verify
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is already completed
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Order already completed' },
        { status: 400 }
      );
    }

    // Verify amount matches (prevent manipulation)
    if (order.amount !== amount) {
      console.error(`Amount mismatch: order=${order.amount}, request=${amount}`);
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // 2. Call Toss Payments confirm API
    const authHeader = Buffer.from(`${tossSecretKey}:`).toString('base64');

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      const errorData = tossData as TossErrorResponse;
      console.error('Toss payment confirm failed:', errorData);

      // Update order status to failed
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          payment_key: paymentKey,
        })
        .eq('order_id', orderId);

      return NextResponse.json(
        {
          error: 'Payment confirmation failed',
          code: errorData.code,
          message: errorData.message,
        },
        { status: 400 }
      );
    }

    const paymentData = tossData as TossPaymentResponse;

    // 3. 원자적으로 주문 완료 처리 및 코인 추가 (Race Condition 방지)
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('complete_order_with_coins', {
        p_order_id: orderId,
        p_payment_key: paymentKey,
        p_user_id: order.user_id,
        p_coins: order.coins,
      });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      // RPC 실패 시 fallback으로 기존 로직 시도
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'completed',
          payment_key: paymentKey,
          completed_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Fallback order update error:', updateError);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment completed but coin addition may have failed. Please contact support.',
        orderId,
        coins: order.coins,
      });
    }

    // RPC 결과 확인
    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;

    if (!result?.success) {
      console.error('RPC returned failure:', result?.error_message);
      return NextResponse.json({
        success: true,
        message: result?.error_message || 'Payment completed but coin addition failed. Please contact support.',
        orderId,
        coins: order.coins,
      });
    }

    const newBalance = result.new_balance;

    // 5. Log purchase activity (non-blocking)
    logPurchase(request, order.user_id, orderId, amount, order.coins).catch(err => {
      console.error('Failed to log purchase activity:', err);
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      orderId,
      coins: order.coins,
      newBalance,
      paymentKey,
      approvedAt: paymentData.approvedAt,
    });
  } catch (error: any) {
    console.error('Error in payment confirm:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
