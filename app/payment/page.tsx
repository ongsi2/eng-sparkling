'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { useAuth } from '../components/AuthProvider';
import CoinDisplay, { CoinIcon } from '../components/CoinDisplay';
import AuthButton from '../components/AuthButton';
import UserAvatar from '../components/UserAvatar';
import { CoinProduct, formatPrice, getTotalCoins } from '@/lib/coin-products';

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
  const [products, setProducts] = useState<CoinProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (authLoading || productsLoading) {
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
          <div className="flex items-center gap-2 md:gap-3">
            {/* 문제 생성 버튼 - 메인 CTA */}
            <Link
              href="/workflow"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] hover:opacity-90 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              문제 생성
            </Link>

            {/* 구분선 - 모바일에서 숨김 */}
            <div className="hidden md:block h-5 w-px bg-[var(--color-ink)]/10" />

            {/* 코인 영역 */}
            <CoinDisplay />

            {/* 사용자 드롭다운 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-cream-dark)]/50 transition-colors"
              >
                <UserAvatar user={user} size="md" />
                <svg className={`hidden md:block w-4 h-4 text-[var(--color-text-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--color-cream-dark)] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[var(--color-cream-dark)]">
                      <p className="text-xs text-[var(--color-text-muted)]">로그인 계정</p>
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/archive"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      저장함
                    </Link>
                    <Link
                      href="/credit-history"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      크레딧 내역
                    </Link>
                    <div className="border-t border-[var(--color-cream-dark)] mt-2 pt-2">
                      <AuthButton compact onAction={() => setUserMenuOpen(false)} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hero Section - Compact */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-ink)] mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)]">코인 충전</span>하고 문제 무제한 생성
          </h1>
          <p className="text-[var(--color-text-muted)] flex items-center justify-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <CoinIcon className="w-5 h-5" />
              <span className="font-medium">1코인 = 1문제</span>
            </span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>12가지 수능 유형 지원</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>유효기간 없음</span>
          </p>
        </div>

        {/* Product Selection - Large Cards */}
        <div className="mb-10">
          {products.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              현재 이용 가능한 상품이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => {
                const totalCoins = getTotalCoins(product);
                const isSelected = selectedProduct?.id === product.id;
                const isPopular = product.popular;
                // 기본 상품 대비 절약률 계산 (첫번째 상품 기준)
                const basePrice = products[0]?.price / products[0]?.coins || 100;
                const currentPrice = product.price / totalCoins;
                const savingsPercent = Math.round((1 - currentPrice / basePrice) * 100);

                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`cursor-pointer relative rounded-2xl md:rounded-3xl border-2 transition-all duration-300 text-center flex flex-col overflow-hidden ${
                      isPopular
                        ? isSelected
                          ? 'border-[var(--color-spark)] shadow-2xl shadow-[var(--color-spark)]/30 scale-[1.03] ring-2 ring-[var(--color-spark)]/40'
                          : 'border-[var(--color-spark)] shadow-xl shadow-[var(--color-spark)]/20 hover:scale-[1.02] hover:shadow-2xl'
                        : isSelected
                          ? 'border-[var(--color-spark)] bg-white shadow-xl scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-[var(--color-spark)]/50 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                  >
                    {/* Popular header band */}
                    {isPopular ? (
                      <div className="bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white py-2 md:py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-bold text-sm md:text-base">BEST 인기</span>
                        </div>
                      </div>
                    ) : savingsPercent > 0 ? (
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 md:py-3 px-4">
                        <span className="font-bold text-sm md:text-base">{savingsPercent}% 할인</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-600 py-2 md:py-3 px-4">
                        <span className="font-medium text-sm md:text-base">기본</span>
                      </div>
                    )}

                    {/* Main content */}
                    <div className={`flex-1 p-5 md:p-8 flex flex-col items-center justify-center ${
                      isPopular ? 'bg-gradient-to-b from-[var(--color-spark)]/5 to-[var(--color-mint)]/10' : 'bg-white'
                    }`}>
                      {/* Selected check */}
                      {isSelected && (
                        <div className="absolute top-14 right-3 md:top-16 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-[var(--color-spark)] rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Coin visual */}
                      <div className="relative mb-3 md:mb-4">
                        <CoinIcon className={`${isPopular ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'} drop-shadow-lg`} />
                        {isPopular && (
                          <>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[var(--color-mint)] rounded-full animate-ping delay-300" />
                          </>
                        )}
                      </div>

                      {/* Coin amount */}
                      <div className="mb-2">
                        <span className={`font-extrabold text-[var(--color-ink)] ${isPopular ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
                          {product.coins}
                        </span>
                        <span className="text-lg md:text-xl text-[var(--color-text-muted)] ml-1">코인</span>
                      </div>

                      {/* Bonus badge */}
                      {product.bonus ? (
                        <div className="flex flex-col items-center gap-1 mb-4">
                          <div className={`inline-flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold ${
                            isPopular
                              ? 'bg-gradient-to-r from-[var(--color-mint)] to-emerald-500 text-white text-sm md:text-base shadow-lg'
                              : 'bg-[var(--color-mint)]/15 text-[var(--color-mint)] text-sm'
                          }`}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            {product.bonus} 보너스
                          </div>
                          <span className={`text-xs md:text-sm font-semibold ${isPopular ? 'text-[var(--color-spark)]' : 'text-gray-500'}`}>
                            총 {totalCoins}코인 받기
                          </span>
                        </div>
                      ) : (
                        <div className="h-16 md:h-20" />
                      )}
                    </div>

                    {/* Price footer */}
                    <div className={`py-4 md:py-5 px-4 border-t ${
                      isPopular
                        ? 'bg-gradient-to-r from-[var(--color-spark)]/10 to-[var(--color-mint)]/10 border-[var(--color-spark)]/20'
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className={`font-extrabold ${isPopular ? 'text-2xl md:text-3xl text-[var(--color-ink)]' : 'text-xl md:text-2xl text-[var(--color-ink)]'}`}>
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-xs md:text-sm text-[var(--color-text-muted)] mt-1">
                        코인당 <span className={`font-semibold ${savingsPercent > 0 ? 'text-red-500' : ''}`}>
                          {formatPrice(Math.round(product.price / totalCoins))}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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

        {/* Trust & Info Bar */}
        <div className="mt-8 p-4 md:p-5 bg-gray-50 rounded-2xl">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              안전결제
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              즉시충전
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              카드/간편결제
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              7일 환불
            </span>
            <span className="text-xs text-gray-400">
              Powered by <span className="font-semibold text-blue-600">토스페이먼츠</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
