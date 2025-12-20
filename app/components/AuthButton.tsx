'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { isAdminEmail } from '@/lib/admin-client';

// Google Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

interface AuthButtonProps {
  compact?: boolean; // 드롭다운 메뉴 안에서 사용할 때
  onAction?: () => void; // 액션 후 콜백 (메뉴 닫기 등)
}

export default function AuthButton({ compact = false, onAction }: AuthButtonProps) {
  const { user, loading, signInWithGitHub, signInWithGoogle, signOut } = useAuth();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const isAdmin = isAdminEmail(user?.email);

  const handleSignOut = () => {
    signOut();
    onAction?.();
  };

  if (loading) {
    return (
      <div className="w-20 h-8 bg-[var(--color-cream-dark)] rounded-full animate-pulse" />
    );
  }

  // 드롭다운 메뉴 안에서 사용할 때 (compact 모드)
  if (user && compact) {
    return (
      <div className="flex flex-col">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-spark)] hover:bg-[var(--color-cream)] transition-colors"
            onClick={onAction}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            관리자
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer w-full text-left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-[var(--color-text)] hidden sm:inline">
            {user.user_metadata?.user_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-1.5 text-sm text-[var(--color-spark)] hover:text-[var(--color-spark-dark)] font-medium transition-colors"
          >
            관리자
          </Link>
        )}
        <button
          onClick={signOut}
          className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowLoginOptions(!showLoginOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)] text-white rounded-full text-sm font-medium hover:bg-[var(--color-ink-light)] transition-colors cursor-pointer"
      >
        로그인
        <svg className={`w-3 h-3 transition-transform ${showLoginOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Login Options Dropdown */}
      {showLoginOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLoginOptions(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg border border-[var(--color-spark)]/10 z-50">
            <button
              onClick={() => {
                signInWithGoogle();
                setShowLoginOptions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
            >
              <GoogleIcon />
              <span className="text-sm text-[var(--color-ink)]">Google 로그인</span>
            </button>
            <button
              onClick={() => {
                signInWithGitHub();
                setShowLoginOptions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
            >
              <GitHubIcon />
              <span className="text-sm text-[var(--color-ink)]">GitHub 로그인</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
