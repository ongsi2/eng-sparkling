'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorCode = searchParams.get('code') || 'UNKNOWN_ERROR';
  const errorMessage = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-4">
          {decodeURIComponent(errorMessage)}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          오류 코드: {errorCode}
        </p>

        {/* Common error explanations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm">
          <p className="font-semibold text-gray-700 mb-2">자주 발생하는 원인:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>결제 창에서 취소 버튼을 누른 경우</li>
            <li>카드 한도 초과</li>
            <li>잔액 부족</li>
            <li>네트워크 연결 문제</li>
          </ul>
        </div>

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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
}
