/**
 * Coin Products Definition
 * Available coin packages for purchase
 */

export interface CoinProduct {
  id: string;
  name: string;
  coins: number;
  price: number;      // KRW
  popular?: boolean;  // Featured product badge
  bonus?: number;     // Bonus coins (e.g., 10% extra)
}

export const COIN_PRODUCTS: CoinProduct[] = [
  {
    id: 'coins_10',
    name: '10 코인',
    coins: 10,
    price: 1000,      // 100원/코인
  },
  {
    id: 'coins_50',
    name: '50 코인',
    coins: 50,
    price: 4000,      // 80원/코인
    popular: true,
    bonus: 5,         // +5 보너스
  },
  {
    id: 'coins_100',
    name: '100 코인',
    coins: 100,
    price: 7000,      // 70원/코인
    bonus: 15,        // +15 보너스
  },
];

/**
 * Get product by ID
 */
export function getProductById(productId: string): CoinProduct | undefined {
  return COIN_PRODUCTS.find(p => p.id === productId);
}

/**
 * Calculate total coins including bonus
 */
export function getTotalCoins(product: CoinProduct): number {
  return product.coins + (product.bonus || 0);
}

/**
 * Format price in Korean Won
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}
