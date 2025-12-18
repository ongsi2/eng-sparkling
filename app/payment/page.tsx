'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { useAuth } from '../components/AuthProvider';
import { CoinIcon } from '../components/CoinDisplay';
import { COIN_PRODUCTS, CoinProduct, formatPrice, getTotalCoins } from '@/lib/coin-products';

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
      const orderResponse = await fetch('/api/payment/create-order', {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CoinIcon className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-gray-900">코인 충전</h1>
          </div>
          <p className="text-gray-600">
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
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Popular badge */}
                {product.popular && (
                  <span className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-md">
                    인기
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CoinIcon className="w-8 h-8" />
                      <span className="text-2xl font-bold text-gray-900">
                        {product.coins}
                      </span>
                    </div>

                    {product.bonus && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-lg">
                        +{product.bonus} 보너스
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                    {product.bonus && (
                      <div className="text-sm text-gray-500">
                        총 {totalCoins}코인
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Purchase button */}
        <button
          onClick={handlePurchase}
          disabled={!selectedProduct || isProcessing}
          className={`cursor-pointer w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            selectedProduct && !isProcessing
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="cursor-pointer w-full mt-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 돌아가기
        </button>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">안내사항</p>
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
