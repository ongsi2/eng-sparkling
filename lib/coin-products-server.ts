/**
 * Coin Products - Server-side functions
 * DB 조회 기능 (서버 전용)
 */

import { supabaseAdmin } from './supabase-server';
import { CoinProduct, COIN_PRODUCTS } from './coin-products';

/**
 * Get product by ID from Database (서버 전용)
 */
export async function getProductByIdFromDB(productId: string): Promise<CoinProduct | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('coin_products')
      .select('*')
      .eq('id', productId)
      .eq('active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as CoinProduct;
  } catch {
    return null;
  }
}

/**
 * Get all active products from Database (서버 전용)
 */
export async function getActiveProductsFromDB(): Promise<CoinProduct[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('coin_products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return COIN_PRODUCTS; // fallback
    }

    return data as CoinProduct[];
  } catch {
    return COIN_PRODUCTS; // fallback
  }
}
