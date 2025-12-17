'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';

// Sparkling Logo Component
const SparklingLogo = () => (
  <svg viewBox="0 0 32 32" className="w-16 h-16">
    <defs>
      <linearGradient id="sparkGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#06b6d4' }} />
        <stop offset="50%" style={{ stopColor: '#22d3ee' }} />
        <stop offset="100%" style={{ stopColor: '#10b981' }} />
      </linearGradient>
      <linearGradient id="bgGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0f172a' }} />
        <stop offset="100%" style={{ stopColor: '#1e293b' }} />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#bgGradLogin)" />
    <g transform="translate(6, 7)">
      <path d="M2 0 L12 0 L12 2.5 L5 2.5 L5 7 L10 7 L10 9.5 L5 9.5 L5 15.5 L12 15.5 L12 18 L2 18 Z" fill="#f8fafc" />
      <path d="M15 4 L16 6 L18 7 L16 8 L15 10 L14 8 L12 7 L14 6 Z" fill="url(#sparkGradLogin)" />
      <circle cx="18" cy="3" r="1" fill="#22d3ee" opacity="0.9" />
      <circle cx="13" cy="12" r="0.8" fill="#10b981" opacity="0.8" />
    </g>
  </svg>
);

export default function LoginPage() {
  const { user, loading, signInWithGitHub } = useAuth();
  const router = useRouter();

  // 이미 로그인했으면 workflow로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      router.push('/workflow');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-spark)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <a href="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          홈으로
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="card-elevated p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <SparklingLogo />
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2">
              ENG-SPARKLING
            </h1>
            <p className="text-[var(--color-text-muted)] mb-8">
              AI로 만드는 실전 영어 문제
            </p>

            {/* GitHub Login Button */}
            <button
              onClick={signInWithGitHub}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-ink)] text-white rounded-xl font-medium hover:bg-[var(--color-ink-light)] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub로 로그인
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--color-spark)]/10" />
              <span className="text-xs text-[var(--color-text-muted)]">또는</span>
              <div className="flex-1 h-px bg-[var(--color-spark)]/10" />
            </div>

            {/* Demo Link */}
            <a
              href="/"
              className="block w-full px-6 py-3 border border-[var(--color-spark)]/20 text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-cream-dark)] transition-colors"
            >
              로그인 없이 데모 체험
            </a>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
            로그인하면 문제 저장, 코인 관리 등<br />
            모든 기능을 이용할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
