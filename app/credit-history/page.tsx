'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { CreditHistoryItem } from '@/lib/coins';

const transactionTypeLabels: Record<string, { label: string; color: string }> = {
  purchase: { label: '구매', color: 'text-green-600 bg-green-50' },
  usage: { label: '사용', color: 'text-red-600 bg-red-50' },
  bonus: { label: '보너스', color: 'text-blue-600 bg-blue-50' },
  refund: { label: '환불', color: 'text-orange-600 bg-orange-50' },
  admin_add: { label: '관리자', color: 'text-purple-600 bg-purple-50' },
};

export default function CreditHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<CreditHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [balance, setBalance] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    checkAuthAndFetch();
  }, [currentPage]);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    await fetchHistory(session.access_token);
    await fetchBalance(session.user.id);
  };

  const fetchBalance = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();

    if (data) {
      setBalance(data.coins);
    }
  };

  const fetchHistory = async (token: string) => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/credit-history?limit=${itemsPerPage}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setHistory(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-cream-dark)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>
            <h1 className="text-lg font-bold text-[var(--color-text)]">코인 사용 내역</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] rounded-2xl p-6 text-white mb-6">
          <p className="text-sm opacity-80 mb-1">현재 보유 코인</p>
          <p className="text-3xl font-bold">{balance.toLocaleString()} 코인</p>
        </div>

        {/* History List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-cream-dark)]">
            <h2 className="font-semibold text-[var(--color-text)]">거래 내역</h2>
            <p className="text-sm text-[var(--color-text-muted)]">총 {total}건</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--color-text-muted)]">
              <div className="inline-block w-8 h-8 border-4 border-[var(--color-spark)]/20 border-t-[var(--color-spark)] rounded-full animate-spin mb-4" />
              <p>로딩 중...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-text-muted)]">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>거래 내역이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-cream)]">
              {history.map((item) => {
                const typeInfo = transactionTypeLabels[item.transaction_type] || { label: item.transaction_type, color: 'text-gray-600 bg-gray-50' };
                const isPositive = item.amount > 0;

                return (
                  <div key={item.id} className="px-6 py-4 hover:bg-[var(--color-cream)]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            {item.description || (isPositive ? '코인 충전' : '코인 사용')}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{item.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          잔액 {item.balance_after.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--color-cream-dark)] flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-[var(--color-cream-dark)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-cream)] transition-colors"
              >
                이전
              </button>
              <span className="px-4 py-1 text-sm text-[var(--color-text-muted)]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-[var(--color-cream-dark)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-cream)] transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/payment')}
            className="flex-1 py-3 bg-[var(--color-spark)] text-white rounded-xl font-medium hover:bg-[var(--color-spark-deep)] transition-colors"
          >
            코인 충전하기
          </button>
          <button
            onClick={() => router.push('/workflow')}
            className="flex-1 py-3 border-2 border-[var(--color-spark)] text-[var(--color-spark)] rounded-xl font-medium hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            문제 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
