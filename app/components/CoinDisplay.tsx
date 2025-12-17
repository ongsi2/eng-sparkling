'use client';

import { useEffect, useState } from 'react';
import { getCoins, CoinState } from '@/lib/coins';

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
}

export default function CoinDisplay({ className = "", showLabel = false }: CoinDisplayProps) {
  const [coinState, setCoinState] = useState<CoinState | null>(null);

  useEffect(() => {
    setCoinState(getCoins());

    // Listen for coin updates
    const handleStorageChange = () => {
      setCoinState(getCoins());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('coinUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coinUpdate', handleStorageChange);
    };
  }, []);

  if (coinState === null) {
    return null; // SSR placeholder
  }

  const isLow = coinState.balance <= 3;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 ${className}`}
    >
      <CoinIcon className="w-5 h-5" />
      <span className={`font-semibold text-sm ${isLow ? 'text-red-600' : 'text-amber-700'}`}>
        {coinState.balance}
      </span>
      {showLabel && (
        <span className="text-xs text-amber-600/70 ml-0.5">코인</span>
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
