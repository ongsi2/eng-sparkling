/**
 * API 응답 유틸리티
 * 일관된 에러 응답 및 사용자 친화적 메시지
 */

import { NextResponse } from 'next/server';

/**
 * 에러 코드별 사용자 친화적 메시지
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 인증 관련
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',

  // 입력 검증
  INVALID_INPUT: '입력값이 올바르지 않습니다.',
  MISSING_FIELD: '필수 항목이 누락되었습니다.',
  INVALID_FORMAT: '형식이 올바르지 않습니다.',

  // Rate Limiting
  RATE_LIMITED: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',

  // 코인 관련
  INSUFFICIENT_COINS: '코인이 부족합니다. 충전 후 이용해주세요.',

  // 결제 관련
  PAYMENT_FAILED: '결제에 실패했습니다.',
  ORDER_NOT_FOUND: '주문 정보를 찾을 수 없습니다.',
  AMOUNT_MISMATCH: '결제 금액이 일치하지 않습니다.',

  // AI 관련
  AI_ERROR: 'AI 문제 생성에 실패했습니다. 다시 시도해주세요.',
  AI_QUOTA_EXCEEDED: 'AI 서비스 이용량을 초과했습니다.',
  AI_INVALID_RESPONSE: 'AI 응답을 처리할 수 없습니다. 다시 시도해주세요.',

  // 서버 에러
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVICE_UNAVAILABLE: '서비스가 일시적으로 이용 불가합니다.',

  // 기타
  NOT_FOUND: '요청하신 리소스를 찾을 수 없습니다.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
};

/**
 * HTTP 상태 코드별 기본 에러 코드
 */
const STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: 'INVALID_INPUT',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

interface ApiErrorOptions {
  code?: string;
  details?: string;
  field?: string;
}

/**
 * API 에러 응답 생성
 */
export function apiError(
  status: number,
  message?: string,
  options: ApiErrorOptions = {}
) {
  const errorCode = options.code || STATUS_TO_ERROR_CODE[status] || 'UNKNOWN';
  const userMessage = message || ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN;

  const responseBody: Record<string, unknown> = {
    error: userMessage,
    code: errorCode,
  };

  if (options.field) {
    responseBody.field = options.field;
  }

  // 개발 환경에서만 상세 정보 포함
  if (process.env.NODE_ENV !== 'production' && options.details) {
    responseBody.details = options.details;
  }

  return NextResponse.json(responseBody, { status });
}

/**
 * 성공 응답 생성
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * 일반적인 에러 핸들러
 * try-catch에서 사용
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // OpenAI 에러
  if (error instanceof Error) {
    if (error.message.includes('quota')) {
      return apiError(429, ERROR_MESSAGES.AI_QUOTA_EXCEEDED, {
        code: 'AI_QUOTA_EXCEEDED',
      });
    }

    if (error.message.includes('API key')) {
      return apiError(500, 'API 설정 오류가 발생했습니다.', {
        code: 'CONFIG_ERROR',
        details: error.message,
      });
    }

    // JSON 파싱 에러
    if (error.message.includes('JSON')) {
      return apiError(500, ERROR_MESSAGES.AI_INVALID_RESPONSE, {
        code: 'AI_INVALID_RESPONSE',
        details: error.message,
      });
    }
  }

  // 기본 서버 에러
  return apiError(500, undefined, {
    details: error instanceof Error ? error.message : 'Unknown error',
  });
}

/**
 * 검증 에러 응답
 */
export function validationError(message: string, field?: string) {
  return apiError(400, message, {
    code: 'INVALID_INPUT',
    field,
  });
}

/**
 * Rate Limit 에러 응답
 */
export function rateLimitError(retryAfterSeconds?: number) {
  const message = retryAfterSeconds
    ? `요청이 너무 많습니다. ${retryAfterSeconds}초 후에 다시 시도해주세요.`
    : ERROR_MESSAGES.RATE_LIMITED;

  const response = apiError(429, message, { code: 'RATE_LIMITED' });

  if (retryAfterSeconds) {
    response.headers.set('Retry-After', retryAfterSeconds.toString());
  }

  return response;
}

/**
 * 코인 부족 에러 응답
 */
export function insufficientCoinsError(required: number, current: number) {
  return apiError(
    402,
    `코인이 부족합니다. (필요: ${required}개, 보유: ${current}개)`,
    { code: 'INSUFFICIENT_COINS' }
  );
}
