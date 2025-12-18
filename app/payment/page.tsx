'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { useAuth } from '../components/AuthProvider';
import CoinDisplay, { CoinIcon } from '../components/CoinDisplay';
import AuthButton from '../components/AuthButton';
import { COIN_PRODUCTS, CoinProduct, formatPrice, getTotalCoins } from '@/lib/coin-products';

// Sparkling Logo Component - Premium Design
const SparklingLogo = () => (
  <div className="relative group">
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <defs>
        <linearGradient id="logoGradPayment" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="shineGradPayment" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glowPayment">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGradPayment)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="15" fill="url(#logoGradPayment)" fillOpacity="0.08" />
      <g transform="translate(11, 10)">
        <path
          d="M0 0 L15 0 L15 3 L4 3 L4 8 L13 8 L13 11 L4 11 L4 17 L15 17 L15 20 L0 20 Z"
          fill="url(#logoGradPayment)"
          className="drop-shadow-sm"
        />
      </g>
      <g filter="url(#glowPayment)">
        <circle cx="34" cy="9" r="2" fill="#22d3ee" className="animate-sparkle" />
        <circle cx="7" cy="32" r="1.5" fill="#10b981" className="animate-sparkle delay-300" />
        <path d="M35 22 L36 25 L39 26 L36 27 L35 30 L34 27 L31 26 L34 25 Z" fill="#67e8f9" className="animate-twinkle delay-200" />
      </g>
      <circle cx="20" cy="20" r="18" fill="url(#shineGradPayment)" />
    </svg>
  </div>
);

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handlePurchase = async () => {
    if (!selectedProduct || !user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create order in DB first
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const orderResponse = await fetch(`${basePath}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          userId: user.id,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || '주문 생성에 실패했습니다.');
      }

      const { orderId, amount, orderName } = await orderResponse.json();

      // 2. Initialize Toss Payments
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: user.id });

      // 3. Request payment
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user.email || undefined,
        customerName: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-cream)]/90 border-b border-[var(--color-spark)]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <SparklingLogo />
            <span className="text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              ENG-SPARKLING
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/workflow" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
              ← 문제 생성
            </Link>
            <div className="h-6 w-px bg-[var(--color-spark)]/20" />
            <CoinDisplay showLabel />
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CoinIcon className="w-10 h-10" />
            <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">코인 충전</h1>
          </div>
          <p className="text-[var(--color-text-muted)]">
            코인을 충전하여 AI 문제 생성 서비스를 이용하세요
          </p>
        </div>

        {/* Product Selection */}
        <div className="space-y-4 mb-8">
          {COIN_PRODUCTS.map((product) => {
            const totalCoins = getTotalCoins(product);
            const isSelected = selectedProduct?.id === product.id;

            return (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`cursor-pointer w-full p-6 rounded-xl border-2 transition-all duration-200 text-left relative ${
                  isSelected
                    ? 'border-[var(--color-spark)] bg-[var(--color-spark)]/5 shadow-lg'
                    : 'border-[var(--color-spark)]/20 bg-white hover:border-[var(--color-spark)]/50 hover:shadow-md'
                }`}
              >
                {/* Popular badge */}
                {product.popular && (
                  <span className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white text-xs font-bold rounded-full shadow-md">
                    인기
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CoinIcon className="w-8 h-8" />
                      <span className="text-2xl font-bold text-[var(--color-ink)]">
                        {product.coins}
                      </span>
                    </div>

                    {product.bonus && (
                      <span className="px-2 py-1 bg-[var(--color-mint)]/10 text-[var(--color-mint)] text-sm font-semibold rounded-lg">
                        +{product.bonus} 보너스
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--color-ink)]">
                      {formatPrice(product.price)}
                    </div>
                    {product.bonus && (
                      <div className="text-sm text-[var(--color-text-muted)]">
                        총 {totalCoins}코인
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-[var(--color-spark)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl">
            <p className="text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {/* Purchase button */}
        <button
          onClick={handlePurchase}
          disabled={!selectedProduct || isProcessing}
          className={`cursor-pointer w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            selectedProduct && !isProcessing
              ? 'bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white hover:shadow-lg hover:shadow-[var(--color-spark)]/30'
              : 'bg-[var(--color-cream-dark)] text-[var(--color-text-light)] cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리 중...
            </span>
          ) : selectedProduct ? (
            `${formatPrice(selectedProduct.price)} 결제하기`
          ) : (
            '상품을 선택하세요'
          )}
        </button>

        {/* Info */}
        <div className="mt-8 p-5 bg-[var(--color-cream-dark)]/50 rounded-xl text-sm text-[var(--color-text-muted)]">
          <p className="font-semibold mb-2 text-[var(--color-ink)]">안내사항</p>
          <ul className="list-disc list-inside space-y-1">
            <li>결제 완료 후 즉시 코인이 충전됩니다</li>
            <li>코인은 AI 문제 생성 시 사용됩니다</li>
            <li>결제 관련 문의: support@eng-sparkling.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
