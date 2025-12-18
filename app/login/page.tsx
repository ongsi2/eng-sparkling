'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';

// Sparkling Logo Component - Premium Design
const SparklingLogo = () => (
  <div className="relative">
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      <defs>
        <linearGradient id="logoGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="shineGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
        <filter id="glowLogin">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Main circle with gradient border */}
      <circle cx="40" cy="40" r="36" fill="none" stroke="url(#logoGradLogin)" strokeWidth="3" />
      {/* Inner glow effect */}
      <circle cx="40" cy="40" r="30" fill="url(#logoGradLogin)" fillOpacity="0.08" />
      {/* Stylized 'E' mark */}
      <g transform="translate(22, 20)">
        <path
          d="M0 0 L30 0 L30 6 L8 6 L8 16 L26 16 L26 22 L8 22 L8 34 L30 34 L30 40 L0 40 Z"
          fill="url(#logoGradLogin)"
          className="drop-shadow-sm"
        />
      </g>
      {/* Sparkle effects */}
      <g filter="url(#glowLogin)">
        <circle cx="68" cy="18" r="3" fill="#22d3ee" className="animate-sparkle" />
        <circle cx="14" cy="64" r="2.5" fill="#10b981" className="animate-sparkle delay-300" />
        <path d="M70 44 L72 49 L77 50 L72 51 L70 56 L68 51 L63 50 L68 49 Z" fill="#67e8f9" className="animate-twinkle delay-200" />
      </g>
      {/* Shine overlay */}
      <circle cx="40" cy="40" r="36" fill="url(#shineGradLogin)" />
    </svg>
  </div>
);

export default function LoginPage() {
  const { user, loading, signInWithGitHub, signInWithGoogle } = useAuth();
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
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          홈으로
        </Link>
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

            {/* Google Login Button */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors cursor-pointer mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={signInWithGitHub}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-ink)] text-white rounded-xl font-medium hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer"
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
            <Link
              href="/"
              className="block w-full px-6 py-3 border border-[var(--color-spark)]/20 text-[var(--color-text)] rounded-xl font-medium hover:bg-[var(--color-cream-dark)] transition-colors cursor-pointer"
            >
              로그인 없이 데모 체험
            </Link>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
            로그인하면 문제 생성, 문제 저장 등<br />
            모든 기능을 이용할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
