'use client';

import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface DemoUsageRecord {
  id: string;
  ip_address: string;
  usage_count: number;
  max_usage: number;
  created_at: string;
  last_used_at: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function DemoPage() {
  const [usages, setUsages] = useState<DemoUsageRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [selectedUsage, setSelectedUsage] = useState<DemoUsageRecord | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reset' | 'delete'>('reset');

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      accessTokenRef.current = session?.access_token || null;
      fetchUsages();
    }
    init();
  }, [page, search]);

  async function fetchUsages() {
    if (!accessTokenRef.current) return;
    setLoading(true);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${basePath}/api/admin/demo?page=${page}&pageSize=${pageSize}${searchParam}`, {
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch demo usages');
      }
      const data = await response.json();
      setUsages(data.usages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleRefresh() {
    fetchUsages();
  }

  async function handleAction() {
    if (!selectedUsage || !accessTokenRef.current) return;

    try {
      const response = await fetch(`${basePath}/api/admin/demo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify({
          ipAddress: selectedUsage.ip_address,
          action: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} demo usage`);
      }

      const message = actionType === 'reset'
        ? `${selectedUsage.ip_address}의 사용량이 초기화되었습니다`
        : `${selectedUsage.ip_address}의 기록이 삭제되었습니다`;

      toast.success(message);
      setConfirmModalOpen(false);
      setSelectedUsage(null);
      fetchUsages();
    } catch (err: any) {
      toast.error(err.message);
    }
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

  function getUsageColor(usage: number, max: number): string {
    const ratio = usage / max;
    if (ratio >= 1) return 'text-red-600 bg-red-50';
    if (ratio >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
        <h3 className="font-semibold mb-2">오류 발생</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">데모 사용량 관리</h2>
            <p className="text-sm text-gray-500">총 {total}개의 IP 기록{search && ` (검색: "${search}")`}</p>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="IP 주소 검색..."
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent w-40"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-spark)] hover:bg-[var(--color-spark-deep)] rounded-lg transition-colors cursor-pointer"
              >
                검색
              </button>
            </form>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="새로고침"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">총 IP 기록</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">한도 도달</p>
            <p className="text-2xl font-bold text-red-600">
              {usages.filter(u => u.usage_count >= u.max_usage).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">기본 한도</p>
            <p className="text-2xl font-bold text-blue-600">3회</p>
          </div>
        </div>

        {/* Usages Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 주소
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용량
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최대
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    첫 사용
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    마지막 사용
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : usages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      데모 사용 기록이 없습니다
                    </td>
                  </tr>
                ) : (
                  usages.map((usage) => (
                    <tr key={usage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {usage.ip_address}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUsageColor(usage.usage_count, usage.max_usage)}`}>
                          {usage.usage_count}회
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {usage.max_usage}회
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(usage.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(usage.last_used_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUsage(usage);
                              setActionType('reset');
                              setConfirmModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            초기화
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUsage(usage);
                              setActionType('delete');
                              setConfirmModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            삭제
                          </button>
                        </div>
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

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">데모 사용량 안내</h3>
              <p className="text-sm text-gray-600">
                비로그인 사용자는 IP 주소 기준으로 최대 3회까지 무료로 문제 생성을 체험할 수 있습니다.
                한도에 도달한 IP의 사용량을 초기화하거나, 기록을 완전히 삭제할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModalOpen && selectedUsage && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setConfirmModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'reset' ? '사용량 초기화' : '기록 삭제'}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                IP: <span className="font-mono font-semibold">{selectedUsage.ip_address}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {actionType === 'reset'
                  ? '이 IP의 사용량을 0으로 초기화하시겠습니까? 다시 무료 체험이 가능해집니다.'
                  : '이 IP의 기록을 완전히 삭제하시겠습니까? 삭제 후 다시 방문하면 새 기록이 생성됩니다.'}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                    actionType === 'reset'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'reset' ? '초기화' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
