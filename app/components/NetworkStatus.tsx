'use client';

/**
 * 네트워크 상태 감지 및 알림 컴포넌트
 */

import { useEffect, useState, useCallback } from 'react';

interface NetworkStatusProps {
  children: React.ReactNode;
}

/**
 * 네트워크 상태 표시 배너
 */
function OfflineBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 shadow-lg animate-slide-down">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="font-medium">
            인터넷 연결이 끊겼습니다. 연결 상태를 확인해주세요.
          </span>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

/**
 * 온라인 복구 토스트
 */
function OnlineToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-left flex items-center gap-3">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
      <span className="font-medium">인터넷에 다시 연결되었습니다!</span>
    </div>
  );
}

/**
 * 네트워크 상태 Provider
 */
export function NetworkStatusProvider({ children }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (wasOffline) {
      setShowOnlineToast(true);
    }
    setWasOffline(false);
  }, [wasOffline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  const handleRetry = useCallback(() => {
    // 간단한 네트워크 테스트
    fetch('/api/health', { method: 'HEAD' })
      .then(() => {
        setIsOnline(true);
        setShowOnlineToast(true);
        setWasOffline(false);
      })
      .catch(() => {
        // 여전히 오프라인
      });
  }, []);

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return (
    <>
      {!isOnline && <OfflineBanner onRetry={handleRetry} />}
      {showOnlineToast && (
        <OnlineToast onClose={() => setShowOnlineToast(false)} />
      )}
      <div className={!isOnline ? 'pt-14' : ''}>{children}</div>
    </>
  );
}

/**
 * 네트워크 상태 Hook
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
