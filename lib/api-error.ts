/**
 * API Error Handling Utilities
 *
 * 표준화된 API 에러 응답 및 Correlation ID 관리
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// ============ Correlation ID ============

/**
 * Generate a unique correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

/**
 * Get correlation ID from request headers or generate new one
 */
export function getCorrelationId(request?: NextRequest): string {
  if (request) {
    const existingId = request.headers.get('x-correlation-id');
    if (existingId) return existingId;
  }
  return generateCorrelationId();
}

// ============ Error Codes ============

export const ERROR_CODES = {
  // Auth errors (1xxx)
  UNAUTHORIZED: 'ERR_1001',
  INVALID_TOKEN: 'ERR_1002',
  SESSION_EXPIRED: 'ERR_1003',
  FORBIDDEN: 'ERR_1004',

  // Validation errors (2xxx)
  VALIDATION_ERROR: 'ERR_2001',
  MISSING_FIELD: 'ERR_2002',
  INVALID_FORMAT: 'ERR_2003',
  INVALID_INPUT: 'ERR_2004',

  // Resource errors (3xxx)
  NOT_FOUND: 'ERR_3001',
  ALREADY_EXISTS: 'ERR_3002',
  RESOURCE_CONFLICT: 'ERR_3003',

  // Business logic errors (4xxx)
  INSUFFICIENT_COINS: 'ERR_4001',
  DEMO_LIMIT_EXCEEDED: 'ERR_4002',
  RATE_LIMIT_EXCEEDED: 'ERR_4003',
  ORDER_ALREADY_COMPLETED: 'ERR_4004',
  PAYMENT_FAILED: 'ERR_4005',

  // External service errors (5xxx)
  OPENAI_ERROR: 'ERR_5001',
  TOSS_PAYMENT_ERROR: 'ERR_5002',
  SUPABASE_ERROR: 'ERR_5003',
  EXTERNAL_SERVICE_ERROR: 'ERR_5099',

  // Server errors (9xxx)
  INTERNAL_ERROR: 'ERR_9001',
  DATABASE_ERROR: 'ERR_9002',
  UNKNOWN_ERROR: 'ERR_9999',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============ Error Response Interface ============

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: string;
    correlationId: string;
    timestamp: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  correlationId: string;
}

// ============ API Error Class ============

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  // Factory methods for common errors
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(ERROR_CODES.UNAUTHORIZED, message, 401);
  }

  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(ERROR_CODES.FORBIDDEN, message, 403);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404);
  }

  static validation(message: string, details?: string): ApiError {
    return new ApiError(ERROR_CODES.VALIDATION_ERROR, message, 400, details);
  }

  static insufficientCoins(required: number, current: number): ApiError {
    return new ApiError(
      ERROR_CODES.INSUFFICIENT_COINS,
      'Insufficient coins',
      402,
      `Required: ${required}, Available: ${current}`
    );
  }

  static demoLimitExceeded(): ApiError {
    return new ApiError(
      ERROR_CODES.DEMO_LIMIT_EXCEEDED,
      'Demo usage limit exceeded',
      429
    );
  }

  static rateLimit(retryAfter?: number): ApiError {
    return new ApiError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      429,
      retryAfter ? `Retry after ${retryAfter} seconds` : undefined
    );
  }

  static externalService(service: string, originalError?: string): ApiError {
    return new ApiError(
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}`,
      502,
      originalError
    );
  }

  static internal(details?: string): ApiError {
    return new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      'Internal server error',
      500,
      details
    );
  }
}

// ============ Response Helpers ============

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: ApiError | Error,
  correlationId?: string
): NextResponse<ApiErrorResponse> {
  const corrId = correlationId || generateCorrelationId();
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    // Log error with correlation ID
    console.error(`[${corrId}] API Error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          correlationId: corrId,
          timestamp,
        },
      },
      {
        status: error.statusCode,
        headers: { 'x-correlation-id': corrId },
      }
    );
  }

  // Unknown error - wrap as internal error
  console.error(`[${corrId}] Unexpected Error:`, error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        correlationId: corrId,
        timestamp,
      },
    },
    {
      status: 500,
      headers: { 'x-correlation-id': corrId },
    }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  correlationId?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const corrId = correlationId || generateCorrelationId();

  return NextResponse.json(
    {
      success: true,
      data,
      correlationId: corrId,
    },
    {
      status,
      headers: { 'x-correlation-id': corrId },
    }
  );
}

// ============ API Handler Wrapper ============

type ApiHandler = (
  request: NextRequest,
  context: { correlationId: string }
) => Promise<NextResponse>;

/**
 * Wrap API handler with error handling and correlation ID
 */
export function withErrorHandling(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const correlationId = getCorrelationId(request);

    try {
      const response = await handler(request, { correlationId });

      // Add correlation ID to response if not already present
      if (!response.headers.get('x-correlation-id')) {
        response.headers.set('x-correlation-id', correlationId);
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        return errorResponse(error, correlationId);
      }

      // Log and wrap unknown errors
      console.error(`[${correlationId}] Unhandled error:`, error);
      return errorResponse(
        error instanceof Error ? error : new Error(String(error)),
        correlationId
      );
    }
  };
}

// ============ Validation Helpers ============

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[]
): void {
  const missing: string[] = [];

  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(String(field));
    }
  }

  if (missing.length > 0) {
    throw new ApiError(
      ERROR_CODES.MISSING_FIELD,
      `Missing required fields: ${missing.join(', ')}`,
      400
    );
  }
}

/**
 * Parse and validate JSON body
 */
export async function parseBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw ApiError.validation('Invalid JSON body');
  }
}
