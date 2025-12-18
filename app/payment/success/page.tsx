'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoinIcon, triggerCoinUpdate } from '../../components/CoinDisplay';

interface ConfirmResult {
  success: boolean;
  orderId?: string;
  coins?: number;
  newBalance?: number;
  message?: string;
  error?: string;
  code?: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<ConfirmResult | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setResult({ success: false, error: '결제 정보가 누락되었습니다.' });
        return;
      }

      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/api/payment/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setResult(data);
          // Trigger coin update in header
          triggerCoinUpdate();
        } else {
          setStatus('error');
          setResult(data);
        }
      } catch (error: any) {
        setStatus('error');
        setResult({
          success: false,
          error: '결제 확인 중 오류가 발생했습니다.',
        });
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 중...</h1>
          <p className="text-gray-600">잠시만 기다려 주세요</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="max-w-md w-full text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 처리 실패</h1>
          <p className="text-gray-600 mb-6">
            {result?.error || '결제 처리 중 문제가 발생했습니다.'}
          </p>

          {result?.code && (
            <p className="text-sm text-gray-500 mb-6">
              오류 코드: {result.code}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/payment')}
              className="cursor-pointer w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              다시 시도하기
            </button>
            <button
              onClick={() => router.push('/')}
              className="cursor-pointer w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
        <p className="text-gray-600 mb-6">
          코인이 성공적으로 충전되었습니다
        </p>

        {/* Coin Info */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CoinIcon className="w-12 h-12" />
            <span className="text-4xl font-bold text-amber-700">
              +{result?.coins}
            </span>
          </div>
          {result?.newBalance !== undefined && (
            <p className="text-amber-600">
              현재 잔액: <span className="font-semibold">{result.newBalance}</span> 코인
            </p>
          )}
        </div>

        {/* Order Info */}
        <div className="text-sm text-gray-500 mb-8">
          <p>주문번호: {result?.orderId}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/workflow')}
            className="cursor-pointer w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            문제 생성하러 가기
          </button>
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
