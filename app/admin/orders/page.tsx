'use client';

import { useEffect, useState, useRef } from 'react';
import { CoinIcon } from '@/app/components/CoinDisplay';
import { supabase } from '@/lib/supabase';

interface AdminOrder {
  id: string;
  order_id: string;
  user_id: string;
  user_email?: string;
  amount: number;
  coins: number;
  status: string;
  payment_key?: string;
  created_at: string;
  completed_at?: string;
}

interface RefundModalProps {
  order: AdminOrder;
  onClose: () => void;
  onRefund: (orderId: string, amount: number, coins: number, reason: string) => Promise<void>;
}

function RefundModal({ order, onClose, onRefund }: RefundModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onRefund(order.id, order.amount, order.coins, reason);
      onClose();
    } catch (error) {
      console.error('Refund error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-4">환불 처리</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">주문 정보</p>
              <p className="font-mono text-sm">{order.order_id}</p>
              <div className="flex justify-between mt-2">
                <span className="text-gray-600">결제 금액:</span>
                <span className="font-semibold">₩{order.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">지급 코인:</span>
                <span className="font-semibold text-amber-600">{order.coins}개</span>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              환불 시 사용자의 코인 {order.coins}개가 차감됩니다.
              <br />Toss에서 직접 환불 처리 후 이 기록을 저장하세요.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                환불 사유
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="환불 사유를 입력하세요..."
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? '처리중...' : '환불 기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Refund modal state
  const [refundOrder, setRefundOrder] = useState<AdminOrder | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      accessTokenRef.current = session?.access_token || null;
      fetchOrders();
    }
    init();
  }, [page, statusFilter, startDate, endDate]);

  async function fetchOrders() {
    if (!accessTokenRef.current) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${basePath}/api/admin/orders?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    fetchOrders();
  }

  function handleResetFilters() {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  async function handleRefund(orderId: string, amount: number, coins: number, reason: string) {
    if (!accessTokenRef.current) return;

    const response = await fetch(`${basePath}/api/admin/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessTokenRef.current}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, amount, coins, reason }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '환불 처리 실패');
    }

    // Refresh orders list
    fetchOrders();
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            완료
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            대기중
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            실패
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            환불됨
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  }

  // Calculate totals
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalCoins = completedOrders.reduce((sum, o) => sum + o.coins, 0);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
        <h3 className="font-semibold mb-2">오류 발생</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">총 결제 건수</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">총 매출액</p>
          <p className="text-2xl font-bold text-green-600">₩{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">총 발급 코인</p>
          <div className="flex items-center gap-2">
            <CoinIcon className="w-6 h-6" />
            <p className="text-2xl font-bold text-amber-600">{totalCoins}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">상태:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="pending">대기중</option>
              <option value="failed">실패</option>
              <option value="refunded">환불됨</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">시작일:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">종료일:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
            />
          </div>
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            필터 초기화
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ml-auto"
            title="새로고침"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문번호
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유저 ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  코인
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문일시
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  완료일시
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    결제 내역이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        {order.order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="font-mono">{order.user_id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ₩{order.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <CoinIcon className="w-4 h-4" />
                        <span className="font-semibold text-amber-700">{order.coins}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.completed_at ? formatDate(order.completed_at) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'completed' && (
                        <button
                          onClick={() => setRefundOrder(order)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          환불
                        </button>
                      )}
                      {order.status === 'refunded' && (
                        <span className="text-xs text-gray-400">환불 완료</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              이전
            </button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages} 페이지
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}
