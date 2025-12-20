'use client';

import { useEffect, useState } from 'react';
import { CoinIcon } from '@/app/components/CoinDisplay';
import { supabase } from '@/lib/supabase';

interface PeriodStat {
  users: number;
  revenue: number;
  questions: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalOrders: number;
  totalRevenue: number;
  totalCoinsIssued: number;
  totalQuestionsGenerated: number;
  periodStats?: {
    today: PeriodStat;
    week: PeriodStat;
    month: PeriodStat;
  };
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${basePath}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
        <h3 className="font-semibold mb-2">오류 발생</h3>
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: '전체 유저',
      value: stats?.totalUsers ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: '오늘 활성 유저',
      value: stats?.activeUsersToday ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: '총 결제 건수',
      value: stats?.totalOrders ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: '총 매출액',
      value: `₩${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      label: '총 발급 코인',
      value: stats?.totalCoinsIssued ?? 0,
      icon: <CoinIcon className="w-6 h-6" />,
      color: 'amber',
    },
    {
      label: '총 생성 문제',
      value: stats?.totalQuestionsGenerated ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'cyan',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-700' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', text: 'text-cyan-700' },
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const colors = colorClasses[card.color];
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <div className={colors.icon}>{card.icon}</div>
                </div>
              </div>
              <p className={`text-3xl font-bold ${colors.text}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Period Stats */}
      {stats?.periodStats && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기간별 통계</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">기간</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">신규 가입</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">매출</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">생성 문제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">오늘</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{stats.periodStats.today.users}명</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">₩{stats.periodStats.today.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">{stats.periodStats.today.questions}개</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">이번 주</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{stats.periodStats.week.users}명</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">₩{stats.periodStats.week.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">{stats.periodStats.week.questions}개</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">이번 달</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{stats.periodStats.month.users}명</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">₩{stats.periodStats.month.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-600 font-semibold">{stats.periodStats.month.questions}개</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 관리</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">유저 관리</p>
              <p className="text-sm text-gray-500">코인 지급, 권한 변경</p>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">결제 내역</p>
              <p className="text-sm text-gray-500">결제 기록 조회</p>
            </div>
          </a>

          <a
            href="/admin/logs"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">생성 로그</p>
              <p className="text-sm text-gray-500">문제 생성 기록</p>
            </div>
          </a>

          <a
            href="/admin/demo"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">데모 관리</p>
              <p className="text-sm text-gray-500">무료 체험 관리</p>
            </div>
          </a>

          <a
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">요금제 관리</p>
              <p className="text-sm text-gray-500">코인 상품 설정</p>
            </div>
          </a>

          <a
            href="/"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors"
          >
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">사이트 보기</p>
              <p className="text-sm text-gray-500">메인 사이트 이동</p>
            </div>
          </a>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-[var(--color-spark)]/10 to-[var(--color-mint)]/10 rounded-xl p-6 border border-[var(--color-spark)]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <svg className="w-6 h-6 text-[var(--color-spark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">관리자 안내</h3>
            <p className="text-sm text-gray-600">
              이 페이지에서 ENG-SPARKLING 서비스의 전반적인 현황을 확인하고 관리할 수 있습니다.
              유저 관리에서 코인을 직접 지급하거나, 결제 내역과 문제 생성 로그를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
