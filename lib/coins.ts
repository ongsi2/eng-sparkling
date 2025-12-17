/**
 * Coin Management System
 * Uses localStorage for persistence (will migrate to DB later)
 */

const STORAGE_KEY = 'eng-sparkling-coins';
const INITIAL_COINS = 100;

export interface CoinState {
  balance: number;
  lastUpdated: string;
}

// Coin costs for each action
export const COIN_COSTS = {
  GENERATE_ARTICLE: 1,
  GENERATE_QUESTION: 1,
} as const;

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
