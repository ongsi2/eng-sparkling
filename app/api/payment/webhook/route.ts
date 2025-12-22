/**
 * API Route: /api/payment/webhook
 * Toss Payments Webhook Handler
 *
 * 결제 상태 변경 시 Toss에서 호출하는 Webhook 엔드포인트
 * - PAYMENT_STATUS_CHANGED 이벤트 처리
 * - 결제 완료 후 코인 지급 재시도 로직
 *
 * 표준화된 API 에러 응답 및 Correlation ID 적용
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { logPurchase } from '@/lib/activity-logger';
import { generateCorrelationId } from '@/lib/api-error';

// Webhook 이벤트 타입
interface WebhookEvent {
  eventType: 'PAYMENT_STATUS_CHANGED' | 'DEPOSIT_CALLBACK' | 'CANCEL_STATUS_CHANGED';
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    status: 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED';
    totalAmount?: number;
    method?: string;
    approvedAt?: string;
    cancels?: Array<{
      cancelAmount: number;
      cancelReason: string;
      canceledAt: string;
    }>;
  };
}

/**
 * Webhook Secret 검증
 * Toss에서 보낸 요청인지 확인
 */
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;

  // Webhook Secret이 설정되지 않은 경우 (테스트 환경)
  if (!webhookSecret) {
    console.warn('TOSS_WEBHOOK_SECRET not configured - skipping signature verification');
    return true;
  }

  // Toss Webhook은 Basic Auth 또는 시크릿 헤더로 검증
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const expected = `Basic ${Buffer.from(`${webhookSecret}:`).toString('base64')}`;
    return authHeader === expected;
  }

  return false;
}

/**
 * 결제 완료 처리 (DONE 상태)
 */
async function handlePaymentDone(data: WebhookEvent['data']): Promise<{ success: boolean; message: string }> {
  const { paymentKey, orderId } = data;

  // 1. 주문 조회
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (orderError || !order) {
    console.error('[Webhook] Order not found:', orderId);
    return { success: false, message: 'Order not found' };
  }

  // 2. 이미 완료된 주문인지 확인
  if (order.status === 'completed') {
    console.log('[Webhook] Order already completed:', orderId);
    return { success: true, message: 'Order already completed' };
  }

  // 3. 원자적으로 주문 완료 및 코인 지급
  const { data: rpcResult, error: rpcError } = await supabaseAdmin
    .rpc('complete_order_with_coins', {
      p_order_id: orderId,
      p_payment_key: paymentKey,
      p_user_id: order.user_id,
      p_coins: order.coins,
    });

  if (rpcError) {
    console.error('[Webhook] RPC error:', rpcError);
    return { success: false, message: `RPC error: ${rpcError.message}` };
  }

  const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;

  if (!result?.success) {
    console.error('[Webhook] RPC returned failure:', result?.error_message);
    return { success: false, message: result?.error_message || 'Unknown error' };
  }

  console.log('[Webhook] Payment completed successfully:', {
    orderId,
    coins: order.coins,
    newBalance: result.new_balance,
  });

  // 4. 활동 로그 기록 (Request 객체 없이)
  try {
    await supabaseAdmin.from('user_activity_logs').insert({
      user_id: order.user_id,
      action: 'PURCHASE',
      metadata: {
        order_id: orderId,
        amount: order.amount,
        coins: order.coins,
        source: 'webhook',
      },
    });
  } catch (logError) {
    console.error('[Webhook] Failed to log activity:', logError);
  }

  return { success: true, message: 'Payment completed' };
}

/**
 * 결제 취소 처리 (CANCELED 상태)
 */
async function handlePaymentCanceled(data: WebhookEvent['data']): Promise<{ success: boolean; message: string }> {
  const { orderId, cancels } = data;

  // 1. 주문 조회
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (orderError || !order) {
    console.error('[Webhook] Order not found for cancel:', orderId);
    return { success: false, message: 'Order not found' };
  }

  // 2. 주문 상태 업데이트
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (updateError) {
    console.error('[Webhook] Failed to update order status:', updateError);
    return { success: false, message: 'Failed to update order' };
  }

  // 3. 이미 코인이 지급된 경우 차감 처리
  if (order.status === 'completed') {
    const { error: coinError } = await supabaseAdmin
      .rpc('deduct_coins_atomic', {
        p_user_id: order.user_id,
        p_amount: order.coins,
      });

    if (coinError) {
      console.error('[Webhook] Failed to deduct coins:', coinError);
      // 코인 차감 실패 시 관리자에게 알림 필요
      return { success: false, message: 'Failed to deduct coins' };
    }

    // 환불 기록 저장
    await supabaseAdmin.from('refunds').insert({
      order_id: order.id,
      user_id: order.user_id,
      amount: order.amount,
      coins: order.coins,
      reason: cancels?.[0]?.cancelReason || 'Webhook cancel',
    });
  }

  console.log('[Webhook] Payment canceled:', orderId);
  return { success: true, message: 'Payment canceled' };
}

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();

  try {
    const body = await request.text();

    // 1. Webhook 서명 검증
    if (!verifyWebhookSignature(request, body)) {
      console.error(`[${correlationId}] [Webhook] Signature verification failed`);
      return NextResponse.json(
        { error: 'Invalid signature', correlationId },
        { status: 401, headers: { 'x-correlation-id': correlationId } }
      );
    }

    // 2. 이벤트 파싱
    const event: WebhookEvent = JSON.parse(body);
    console.log(`[${correlationId}] [Webhook] Received event:`, event.eventType, event.data.orderId);

    // 3. 이벤트 타입별 처리
    let result: { success: boolean; message: string };

    switch (event.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        if (event.data.status === 'DONE') {
          result = await handlePaymentDone(event.data);
        } else if (event.data.status === 'CANCELED' || event.data.status === 'PARTIAL_CANCELED') {
          result = await handlePaymentCanceled(event.data);
        } else {
          console.log('[Webhook] Ignoring status:', event.data.status);
          result = { success: true, message: `Status ${event.data.status} ignored` };
        }
        break;

      case 'CANCEL_STATUS_CHANGED':
        result = await handlePaymentCanceled(event.data);
        break;

      default:
        console.log('[Webhook] Unknown event type:', event.eventType);
        result = { success: true, message: 'Event type not handled' };
    }

    // 4. 응답 (10초 이내에 200 반환 필요)
    return NextResponse.json(
      {
        received: true,
        correlationId,
        ...result,
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  } catch (error: any) {
    console.error(`[${correlationId}] [Webhook] Error processing webhook:`, error);

    // Webhook은 200 응답을 보내지 않으면 재시도됨
    // 파싱 에러 등은 재시도해도 의미 없으므로 200 반환
    return NextResponse.json(
      {
        received: true,
        success: false,
        message: error.message,
        correlationId,
      },
      { headers: { 'x-correlation-id': correlationId } }
    );
  }
}

// Webhook은 GET 요청 차단
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
