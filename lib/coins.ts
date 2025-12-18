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
    .single();

  if (error) {
    console.error('Error fetching coins:', error);
    return 0;
  }

  return data?.coins ?? INITIAL_COINS;
}

/**
 * Deduct coins in DB
 * Returns new balance if successful, null if insufficient
 */
export async function deductCoinsFromDB(userId: string, amount: number): Promise<number | null> {
  // First get current balance
  const currentBalance = await getCoinsFromDB(userId);

  if (currentBalance < amount) {
    return null; // Insufficient balance
  }

  const newBalance = currentBalance - amount;

  const { error } = await supabase
    .from('profiles')
    .update({
      coins: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error deducting coins:', error);
    return null;
  }

  return newBalance;
}

/**
 * Add coins in DB
 * Returns new balance
 */
export async function addCoinsToDb(userId: string, amount: number): Promise<number | null> {
  const currentBalance = await getCoinsFromDB(userId);
  const newBalance = currentBalance + amount;

  const { error } = await supabase
    .from('profiles')
    .update({
      coins: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error adding coins:', error);
    return null;
  }

  return newBalance;
}

/**
 * Check if user has enough coins in DB
 */
export async function hasEnoughCoinsInDB(userId: string, amount: number): Promise<boolean> {
  const balance = await getCoinsFromDB(userId);
  return balance >= amount;
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
