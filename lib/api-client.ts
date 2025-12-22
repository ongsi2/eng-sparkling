/**
 * API Client with CSRF Protection
 *
 * 모든 상태 변경 API 호출에 자동으로 CSRF 토큰을 포함시키는 클라이언트
 */

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

/**
 * CSRF 토큰 가져오기 (캐시 사용)
 */
async function getCsrfToken(): Promise<string> {
  // 이미 토큰이 있으면 반환
  if (csrfToken) {
    return csrfToken;
  }

  // 이미 토큰을 가져오는 중이면 대기
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // 새 토큰 요청
  csrfTokenPromise = fetchNewCsrfToken();
  csrfToken = await csrfTokenPromise;
  csrfTokenPromise = null;

  return csrfToken;
}

/**
 * 서버에서 새 CSRF 토큰 가져오기
 */
async function fetchNewCsrfToken(): Promise<string> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const response = await fetch(`${basePath}/api/csrf`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token');
  }

  const data = await response.json();
  return data.csrfToken;
}

/**
 * CSRF 토큰 초기화 (로그인/로그아웃 시 호출)
 */
export function resetCsrfToken(): void {
  csrfToken = null;
  csrfTokenPromise = null;
}

/**
 * CSRF 보호가 포함된 fetch 래퍼
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const fullUrl = url.startsWith('/') ? `${basePath}${url}` : url;

  // GET, HEAD, OPTIONS는 CSRF 토큰 불필요
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return fetch(fullUrl, {
      ...options,
      credentials: 'include',
    });
  }

  // 상태 변경 메서드에는 CSRF 토큰 포함
  const token = await getCsrfToken();

  const headers = new Headers(options.headers);
  headers.set('x-csrf-token', token);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  // CSRF 토큰이 만료된 경우 (403) 토큰 갱신 후 재시도
  if (response.status === 403) {
    const errorData = await response.clone().json().catch(() => ({}));

    if (errorData.error === 'CSRF validation failed') {
      // 토큰 갱신
      csrfToken = null;
      const newToken = await getCsrfToken();

      headers.set('x-csrf-token', newToken);

      // 재시도
      return fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}

/**
 * 편의 메서드들
 */
export const apiClient = {
  get: (url: string, options?: RequestInit) =>
    fetchWithCsrf(url, { ...options, method: 'GET' }),

  post: (url: string, data?: unknown, options?: RequestInit) =>
    fetchWithCsrf(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (url: string, data?: unknown, options?: RequestInit) =>
    fetchWithCsrf(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: (url: string, data?: unknown, options?: RequestInit) =>
    fetchWithCsrf(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (url: string, options?: RequestInit) =>
    fetchWithCsrf(url, { ...options, method: 'DELETE' }),
};
