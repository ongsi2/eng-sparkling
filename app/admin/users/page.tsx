'use client';

import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CoinIcon } from '@/app/components/CoinDisplay';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  coins: number;
  is_admin: boolean;
  full_name?: string;
  avatar_url?: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [adminConfirmOpen, setAdminConfirmOpen] = useState(false);
  const [adminAction, setAdminAction] = useState<boolean>(false);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      accessTokenRef.current = session?.access_token || null;
      fetchUsers();
    }
    init();
  }, [page]);

  async function fetchUsers() {
    if (!accessTokenRef.current) return;
    setLoading(true);
    try {
      const response = await fetch(`${basePath}/api/admin/users?page=${page}&pageSize=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCoins() {
    if (!selectedUser || !coinAmount || !accessTokenRef.current) return;

    const amount = parseInt(coinAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('올바른 코인 수량을 입력하세요');
      return;
    }

    try {
      const response = await fetch(`${basePath}/api/admin/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'updateCoins',
          value: amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coins');
      }

      toast.success(`${selectedUser.email}의 코인이 ${amount}으로 변경되었습니다`);
      setCoinModalOpen(false);
      setCoinAmount('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleSetAdmin() {
    if (!selectedUser || !accessTokenRef.current) return;

    try {
      const response = await fetch(`${basePath}/api/admin/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'setAdmin',
          value: adminAction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      toast.success(`${selectedUser.email}의 관리자 권한이 ${adminAction ? '부여' : '해제'}되었습니다`);
      setAdminConfirmOpen(false);
      setSelectedUser(null);
      fetchUsers();
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">유저 관리</h2>
            <p className="text-sm text-gray-500">총 {total}명의 유저</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유저
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    코인
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 활동
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
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
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
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      유저가 없습니다
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-spark)] to-[var(--color-mint)] flex items-center justify-center text-white font-semibold">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt=""
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              user.email?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || user.email?.split('@')[0]}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CoinIcon className="w-5 h-5" />
                          <span className="font-semibold text-amber-700">{user.coins}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_admin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            관리자
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            일반
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setCoinAmount(String(user.coins));
                              setCoinModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            코인 수정
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setAdminAction(!user.is_admin);
                              setAdminConfirmOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {user.is_admin ? '관리자 해제' : '관리자 부여'}
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
      </div>

      {/* Coin Edit Modal */}
      {coinModalOpen && selectedUser && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setCoinModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">코인 수정</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedUser.email}의 코인 잔액을 수정합니다.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 코인 잔액
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CoinIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCoinModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateCoins}
                  className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-spark)] hover:bg-[var(--color-spark-deep)] rounded-lg transition-colors cursor-pointer"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin Confirm Modal */}
      {adminConfirmOpen && selectedUser && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setAdminConfirmOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                관리자 권한 {adminAction ? '부여' : '해제'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {selectedUser.email}의 관리자 권한을{' '}
                {adminAction ? '부여' : '해제'}하시겠습니까?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAdminConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSetAdmin}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                    adminAction
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
