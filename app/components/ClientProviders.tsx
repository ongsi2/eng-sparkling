'use client';

/**
 * 클라이언트 사이드 Provider 래퍼
 * AuthProvider, NetworkStatusProvider, MobileNav를 함께 제공
 */

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { NetworkStatusProvider } from './NetworkStatus';
import { MobileNav, MobileNavSpacer } from './MobileNav';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <NetworkStatusProvider>
        {children}
        <MobileNavSpacer />
        <MobileNav />
      </NetworkStatusProvider>
    </AuthProvider>
  );
}
