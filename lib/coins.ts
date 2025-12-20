/**
 * Coin Management System
 * Uses Supabase for persistence (DB-based)
 */

import { supabase } from './supabase';

const STORAGE_KEY = 'eng-sparkling-coins';
const INITIAL_COINS = 10;  // 신규 가입자 무료 지급

export interface CoinState {
  balance: number;
  lastUpdated: string;
}

// Coin costs for each action
export const COIN_COSTS = {
  GENERATE_ARTICLE: 1,
  GENERATE_QUESTION: 1,
} as const;

// ============================================
// Supabase DB Functions (Primary)
// ============================================

/**
 * Get coin balance from DB for current user
 */
export async function getCoinsFromDB(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .maybeSingle();  // single() 대신 maybeSingle() 사용 - 없어도 에러 안 남

  if (error) {
    console.error('Error fetching coins:', JSON.stringify(error, null, 2));
    console.error('User ID:', userId);
    return 0;
  }

  // 프로필이 없으면 기본 코인 반환
  if (!data) {
    console.log('No profile found for user:', userId);
    return INITIAL_COINS;
  }

  return data.coins ?? INITIAL_COINS;
}

/**
 * Deduct coins in DB with usage history recording
 * Returns new balance if successful, null if insufficient
 */
export async function deductCoinsFromDB(
  userId: string,
  amount: number,
  referenceId?: string,
  description?: string
): Promise<number | null> {
  // Use the record_credit_usage function for atomic operation
  const { data, error } = await supabase
    .rpc('record_credit_usage', {
      p_user_id: userId,
      p_amount: -amount,  // 사용은 음수
      p_type: 'usage',
      p_reference_id: referenceId || null,
      p_description: description || '문제 생성'
    });

  if (error) {
    if (error.message === 'Insufficient balance') {
      return null; // 잔액 부족
    }
    console.error('Error deducting coins:', error);
    return null;
  }

  // 새 잔액 조회
  return await getCoinsFromDB(userId);
}

/**
 * Add coins in DB with usage history recording
 * Returns new balance
 */
export async function addCoinsToDb(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund' | 'admin_add' = 'purchase',
  referenceId?: string,
  description?: string
): Promise<number | null> {
  // Use the record_credit_usage function for atomic operation
  const { data, error } = await supabase
    .rpc('record_credit_usage', {
      p_user_id: userId,
      p_amount: amount,  // 충전은 양수
      p_type: type,
      p_reference_id: referenceId || null,
      p_description: description || (type === 'purchase' ? '코인 구매' : '코인 충전')
    });

  if (error) {
    console.error('Error adding coins:', error);
    return null;
  }

  // 새 잔액 조회
  return await getCoinsFromDB(userId);
}

/**
 * Check if user has enough coins in DB
 */
export async function hasEnoughCoinsInDB(userId: string, amount: number): Promise<boolean> {
  const balance = await getCoinsFromDB(userId);
  return balance >= amount;
}

// ============================================
// Credit Usage History Functions
// ============================================

export interface CreditHistoryItem {
  id: string;
  amount: number;
  balance_after: number;
  transaction_type: 'purchase' | 'usage' | 'bonus' | 'refund' | 'admin_add';
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

/**
 * Get credit usage history for a user
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: CreditHistoryItem[]; total: number }> {
  // Get total count
  const { count } = await supabase
    .from('credit_usage_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get paginated data
  const { data, error } = await supabase
    .from('credit_usage_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching credit history:', error);
    return { data: [], total: 0 };
  }

  return {
    data: data as CreditHistoryItem[],
    total: count || 0
  };
}

// ============================================
// LocalStorage Functions (Fallback/Legacy)
// ============================================

/**
 * Initialize coins for new users
 */
export function initializeCoins(): CoinState {
  const state: CoinState = {
    balance: INITIAL_COINS,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  return state;
}

/**
 * Get current coin balance
 */
export function getCoins(): CoinState {
  if (typeof window === 'undefined') {
    return { balance: INITIAL_COINS, lastUpdated: new Date().toISOString() };
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return initializeCoins();
  }

  try {
    return JSON.parse(stored) as CoinState;
  } catch {
    return initializeCoins();
  }
}

/**
 * Deduct coins for an action
 * Returns true if successful, false if insufficient balance
 */
export function deductCoins(amount: number): boolean {
  const state = getCoins();

  if (state.balance < amount) {
    return false;
  }

  const newState: CoinState = {
    balance: state.balance - amount,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  return true;
}

/**
 * Add coins (for purchases, rewards, etc.)
 */
export function addCoins(amount: number): CoinState {
  const state = getCoins();

  const newState: CoinState = {
    balance: state.balance + amount,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  return newState;
}

/**
 * Check if user has enough coins
 */
export function hasEnoughCoins(amount: number): boolean {
  const state = getCoins();
  return state.balance >= amount;
}

/**
 * Reset coins (for testing)
 */
export function resetCoins(): CoinState {
  return initializeCoins();
}
