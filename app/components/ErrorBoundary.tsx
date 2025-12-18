'use client';

/**
 * 에러 바운더리 컴포넌트
 * React 에러를 캐치하고 사용자 친화적인 UI 표시
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 여기에 에러 로깅 서비스 연동 가능
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-[var(--color-text-muted)] mb-6">
              일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  에러 상세 정보
                </summary>
                <pre className="mt-2 overflow-auto text-red-600 whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[var(--color-cream-dark)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-cream-dark)]/80 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-[var(--color-spark)] text-white rounded-lg hover:bg-[var(--color-spark)]/90 transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 에러 메시지 컴포넌트 (단순 표시용)
 */
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = '오류 발생',
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-xl p-6 text-center ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h3 className="font-bold text-red-800 mb-1">{title}</h3>
      <p className="text-red-600 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

/**
 * 네트워크 에러 컴포넌트
 */
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <div
      className={`bg-orange-50 border border-orange-200 rounded-xl p-6 text-center ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-orange-500"
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
      </div>
      <h3 className="font-bold text-orange-800 mb-1">네트워크 연결 오류</h3>
      <p className="text-orange-600 text-sm mb-4">
        인터넷 연결을 확인하고 다시 시도해주세요.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
