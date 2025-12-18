/**
 * API Route: /api/payment/create-order
 * Creates a payment order in DB before redirecting to Toss Payments
 * This prevents amount manipulation attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getProductById, getTotalCoins } from '@/lib/coin-products';

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json();

    // Validate input
    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'productId and userId are required' },
        { status: 400 }
      );
    }

    // Get product info
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const timestamp = Date.now();
    const userIdShort = userId.slice(0, 8);
    const orderId = `order_${timestamp}_${userIdShort}`;

    // Calculate total coins (base + bonus)
    const totalCoins = getTotalCoins(product);

    // Create order in DB
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        order_id: orderId,
        product_id: productId,
        amount: product.price,
        coins: totalCoins,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      amount: product.price,
      orderName: product.name,
      coins: totalCoins,
    });
  } catch (error: any) {
    console.error('Error in create-order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
