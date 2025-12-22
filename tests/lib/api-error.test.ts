/**
 * API Error Handling Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateCorrelationId,
  getCorrelationId,
  ApiError,
  ERROR_CODES,
  errorResponse,
  successResponse,
  withErrorHandling,
  validateRequired,
  parseBody,
} from '@/lib/api-error';

// Mock NextRequest
function createMockRequest(options: {
  headers?: Record<string, string>;
  body?: unknown;
} = {}): NextRequest {
  const { headers = {}, body } = options;

  return {
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as NextRequest;
}

describe('Correlation ID', () => {
  it('should generate unique correlation IDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('should return existing correlation ID from request', () => {
    const existingId = 'test-correlation-id';
    const request = createMockRequest({
      headers: { 'x-correlation-id': existingId },
    });

    const id = getCorrelationId(request);
    expect(id).toBe(existingId);
  });

  it('should generate new correlation ID if not in request', () => {
    const request = createMockRequest();
    const id = getCorrelationId(request);

    expect(id).toBeDefined();
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});

describe('ApiError', () => {
  it('should create error with correct properties', () => {
    const error = new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Test message', 400, 'Details');

    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBe('Details');
    expect(error.name).toBe('ApiError');
  });

  it('should create unauthorized error', () => {
    const error = ApiError.unauthorized();

    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
  });

  it('should create forbidden error', () => {
    const error = ApiError.forbidden();

    expect(error.code).toBe(ERROR_CODES.FORBIDDEN);
    expect(error.statusCode).toBe(403);
  });

  it('should create not found error', () => {
    const error = ApiError.notFound('User');

    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create validation error', () => {
    const error = ApiError.validation('Invalid email', 'Email format is incorrect');

    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.message).toBe('Invalid email');
    expect(error.details).toBe('Email format is incorrect');
    expect(error.statusCode).toBe(400);
  });

  it('should create insufficient coins error', () => {
    const error = ApiError.insufficientCoins(100, 50);

    expect(error.code).toBe(ERROR_CODES.INSUFFICIENT_COINS);
    expect(error.details).toBe('Required: 100, Available: 50');
    expect(error.statusCode).toBe(402);
  });

  it('should create demo limit exceeded error', () => {
    const error = ApiError.demoLimitExceeded();

    expect(error.code).toBe(ERROR_CODES.DEMO_LIMIT_EXCEEDED);
    expect(error.statusCode).toBe(429);
  });

  it('should create rate limit error', () => {
    const error = ApiError.rateLimit(60);

    expect(error.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    expect(error.details).toBe('Retry after 60 seconds');
    expect(error.statusCode).toBe(429);
  });

  it('should create internal error', () => {
    const error = ApiError.internal('Database connection failed');

    expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(error.details).toBe('Database connection failed');
    expect(error.statusCode).toBe(500);
  });
});

describe('errorResponse', () => {
  it('should create error response for ApiError', async () => {
    const apiError = new ApiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid input', 400);
    const response = errorResponse(apiError, 'test-id');

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(response.headers.get('x-correlation-id')).toBe('test-id');
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(body.error.message).toBe('Invalid input');
    expect(body.error.correlationId).toBe('test-id');
  });

  it('should wrap generic Error as unknown error', async () => {
    const error = new Error('Something went wrong');
    const response = errorResponse(error, 'test-id');

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
  });
});

describe('successResponse', () => {
  it('should create success response with data', async () => {
    const data = { users: [{ id: 1, name: 'Test' }] };
    const response = successResponse(data, 'test-id');

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('x-correlation-id')).toBe('test-id');
    expect(body.success).toBe(true);
    expect(body.data).toEqual(data);
    expect(body.correlationId).toBe('test-id');
  });

  it('should create success response with custom status', async () => {
    const response = successResponse({ created: true }, 'test-id', 201);

    expect(response.status).toBe(201);
  });
});

describe('validateRequired', () => {
  it('should pass when all required fields exist', () => {
    const body = { name: 'Test', email: 'test@test.com', age: 25 };

    expect(() => validateRequired(body, ['name', 'email'])).not.toThrow();
  });

  it('should throw when required fields are missing', () => {
    const body = { name: 'Test' };

    expect(() => validateRequired(body, ['name', 'email'])).toThrow(ApiError);
  });

  it('should throw with list of missing fields', () => {
    const body = { name: 'Test' };

    try {
      validateRequired(body, ['name', 'email', 'phone']);
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe(ERROR_CODES.MISSING_FIELD);
      expect((error as ApiError).message).toContain('email');
      expect((error as ApiError).message).toContain('phone');
    }
  });

  it('should treat empty string as missing', () => {
    const body = { name: '', email: 'test@test.com' };

    expect(() => validateRequired(body, ['name', 'email'])).toThrow(ApiError);
  });

  it('should treat null as missing', () => {
    const body = { name: null, email: 'test@test.com' };

    expect(() => validateRequired(body, ['name', 'email'])).toThrow(ApiError);
  });
});

describe('withErrorHandling', () => {
  it('should pass context with correlation ID to handler', async () => {
    let receivedContext: { correlationId: string } | undefined;

    const handler = withErrorHandling(async (request, context) => {
      receivedContext = context;
      return successResponse({ ok: true }, context.correlationId);
    });

    const request = createMockRequest();
    await handler(request);

    expect(receivedContext).toBeDefined();
    expect(receivedContext!.correlationId).toBeDefined();
  });

  it('should use existing correlation ID from request', async () => {
    let receivedContext: { correlationId: string } | undefined;

    const handler = withErrorHandling(async (request, context) => {
      receivedContext = context;
      return successResponse({ ok: true }, context.correlationId);
    });

    const request = createMockRequest({
      headers: { 'x-correlation-id': 'existing-id' },
    });
    await handler(request);

    expect(receivedContext!.correlationId).toBe('existing-id');
  });

  it('should catch and convert ApiError to response', async () => {
    const handler = withErrorHandling(async () => {
      throw ApiError.unauthorized();
    });

    const request = createMockRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });

  it('should catch and wrap generic errors', async () => {
    const handler = withErrorHandling(async () => {
      throw new Error('Unexpected error');
    });

    const request = createMockRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
  });

  it('should add correlation ID to successful response', async () => {
    const handler = withErrorHandling(async (request, { correlationId }) => {
      return NextResponse.json({ data: 'test' });
    });

    const request = createMockRequest({
      headers: { 'x-correlation-id': 'test-id' },
    });
    const response = await handler(request);

    expect(response.headers.get('x-correlation-id')).toBe('test-id');
  });
});

describe('parseBody', () => {
  it('should parse valid JSON body', async () => {
    const request = createMockRequest({ body: { name: 'Test' } });
    const body = await parseBody<{ name: string }>(request);

    expect(body).toEqual({ name: 'Test' });
  });

  it('should throw validation error for invalid JSON', async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    await expect(parseBody(request)).rejects.toThrow(ApiError);
  });
});
