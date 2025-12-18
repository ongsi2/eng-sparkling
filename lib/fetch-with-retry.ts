/**
 * 재시도 로직이 포함된 fetch wrapper
 * 네트워크 에러 발생 시 자동으로 재시도
 */

interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number; // ms
  retryOn?: number[]; // 재시도할 HTTP 상태 코드
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * 네트워크 에러인지 확인
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network');
  }
  return false;
}

/**
 * 지연 함수
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 지수 백오프 계산 (2^attempt * baseDelay)
 */
function getExponentialBackoff(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // 최대 30초
}

/**
 * 재시도 로직이 포함된 fetch
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryOn = [408, 429, 500, 502, 503, 504], // 재시도할 상태 코드
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // 재시도 대상 상태 코드 체크
      if (!response.ok && retryOn.includes(response.status)) {
        if (attempt < maxRetries) {
          const waitTime = getExponentialBackoff(attempt, retryDelay);

          // Rate limiting (429)의 경우 Retry-After 헤더 사용
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) {
              const waitSeconds = parseInt(retryAfter, 10);
              if (!isNaN(waitSeconds)) {
                await delay(waitSeconds * 1000);
                continue;
              }
            }
          }

          onRetry?.(attempt + 1, new Error(`HTTP ${response.status}`));
          await delay(waitTime);
          continue;
        }
      }

      // 응답 처리
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FetchError(
          errorData.error || `HTTP error ${response.status}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 네트워크 에러일 경우 재시도
      if (isNetworkError(error) && attempt < maxRetries) {
        const waitTime = getExponentialBackoff(attempt, retryDelay);
        onRetry?.(attempt + 1, lastError);
        await delay(waitTime);
        continue;
      }

      // 재시도 불가능한 에러
      if (error instanceof FetchError) {
        throw error;
      }

      // 마지막 시도에서도 실패
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Custom Fetch Error
 */
export class FetchError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.code = code;
  }
}

/**
 * 에러 메시지 변환 (사용자 친화적)
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    switch (error.code) {
      case 'RATE_LIMITED':
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      case 'INSUFFICIENT_COINS':
        return '코인이 부족합니다. 충전 후 이용해주세요.';
      case 'UNAUTHORIZED':
        return '로그인이 필요합니다.';
      case 'AI_ERROR':
        return 'AI 서비스에 문제가 발생했습니다. 다시 시도해주세요.';
      default:
        return error.message;
    }
  }

  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * API 요청 헬퍼 (basePath 자동 적용)
 */
export function createApiClient(basePath: string = '') {
  const normalizedBasePath = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath;

  return {
    get: <T>(endpoint: string, options?: FetchWithRetryOptions) =>
      fetchWithRetry<T>(`${normalizedBasePath}${endpoint}`, {
        method: 'GET',
        ...options,
      }),

    post: <T>(endpoint: string, data: unknown, options?: FetchWithRetryOptions) =>
      fetchWithRetry<T>(`${normalizedBasePath}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
        ...options,
      }),

    put: <T>(endpoint: string, data: unknown, options?: FetchWithRetryOptions) =>
      fetchWithRetry<T>(`${normalizedBasePath}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
        ...options,
      }),

    delete: <T>(endpoint: string, options?: FetchWithRetryOptions) =>
      fetchWithRetry<T>(`${normalizedBasePath}${endpoint}`, {
        method: 'DELETE',
        ...options,
      }),
  };
}
