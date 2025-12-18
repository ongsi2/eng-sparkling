'use client';

/**
 * 모바일 네비게이션 컴포넌트
 * 하단 탭 바 형식의 모바일 친화적 네비게이션
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: '홈',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/workflow',
    label: '문제 생성',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
    authRequired: true,
  },
  {
    href: '/archive',
    label: '보관함',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    authRequired: true,
  },
  {
    href: '/payment',
    label: '충전',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    authRequired: true,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 스크롤 방향에 따라 네비게이션 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isNearBottom =
        window.innerHeight + currentScrollY >= document.body.offsetHeight - 100;

      // 맨 아래 근처이면 항상 표시
      if (isNearBottom) {
        setIsVisible(true);
      } else if (currentScrollY < 50) {
        // 상단에서는 항상 표시
        setIsVisible(true);
      } else {
        setIsVisible(!isScrollingDown);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const filteredItems = navItems.filter(
    (item) => !item.authRequired || user
  );

  // 현재 경로와 매칭 확인 (basePath 고려)
  const isActive = (href: string) => {
    const fullPath = basePath + href;
    if (href === '/') {
      return pathname === '/' || pathname === basePath || pathname === basePath + '/';
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-cream-dark)] transition-transform duration-300 md:hidden mobile-safe-bottom ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`${basePath}${item.href}`}
              className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-lg transition-colors ${
                active
                  ? 'text-[var(--color-spark)] bg-[var(--color-spark)]/10'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-spark)]'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* 로그인/프로필 */}
        {user ? (
          <Link
            href={`${basePath}/profile`}
            className="flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-spark)] to-[var(--color-mint)] flex items-center justify-center text-white text-xs font-bold">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs mt-1 font-medium">내 정보</span>
          </Link>
        ) : (
          <Link
            href={`${basePath}/login`}
            className="flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-xs mt-1 font-medium">로그인</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

/**
 * 모바일 네비게이션 높이만큼 하단 여백 추가
 */
export function MobileNavSpacer() {
  return <div className="h-[72px] md:hidden" />;
}
