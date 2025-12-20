'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCoinsFromDB } from '@/lib/coins';
import { useAuth } from './AuthProvider';

// Coin Icon SVG Component
export const CoinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fbbf24' }} />
        <stop offset="50%" style={{ stopColor: '#f59e0b' }} />
        <stop offset="100%" style={{ stopColor: '#d97706' }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="#fef3c7" strokeWidth="1" opacity="0.5" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="#78350f"
      fontSize="10"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      C
    </text>
  </svg>
);

// Small coin icon for buttons
export const CoinIconSmall = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="coinGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#fbbf24' }} />
        <stop offset="100%" style={{ stopColor: '#d97706' }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGradientSmall)" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="#78350f"
      fontSize="11"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      C
    </text>
  </svg>
);

interface CoinDisplayProps {
  className?: string;
  showLabel?: boolean;
  showChargeButton?: boolean;
}

export default function CoinDisplay({ className = "", showLabel = false, showChargeButton = false }: CoinDisplayProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCoins = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const coins = await getCoinsFromDB(user.id);
      setBalance(coins);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCoins();

    // Listen for coin updates
    const handleCoinUpdate = () => {
      fetchCoins();
    };

    window.addEventListener('coinUpdate', handleCoinUpdate);

    return () => {
      window.removeEventListener('coinUpdate', handleCoinUpdate);
    };
  }, [fetchCoins]);

  if (!user || isLoading || balance === null) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 ${className}`}>
        <CoinIcon className="w-5 h-5" />
        <span className="font-semibold text-sm text-amber-700">-</span>
      </div>
    );
  }

  const isLow = balance <= 3;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => router.push('/credit-history')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer"
        title="사용 내역 보기"
      >
        <CoinIcon className="w-5 h-5" />
        <span className={`font-semibold text-sm ${isLow ? 'text-red-600' : 'text-amber-700'}`}>
          {balance}
        </span>
        {showLabel && (
          <span className="text-xs text-amber-600/70 ml-0.5">코인</span>
        )}
      </button>
      {showChargeButton && (
        <button
          onClick={() => router.push('/payment')}
          className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
        >
          충전
        </button>
      )}
    </div>
  );
}

// Cost badge for buttons
export function CoinCost({ amount, className = "" }: { amount: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs opacity-80 ${className}`}>
      <CoinIconSmall className="w-3.5 h-3.5" />
      <span>-{amount}</span>
    </span>
  );
}

// Helper to trigger coin update event
export function triggerCoinUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('coinUpdate'));
  }
}
