/**
 * Vitest Test Setup
 */

import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
// NODE_ENV is set by vitest automatically

// Global setup
beforeAll(() => {
  // Setup code before all tests
});

afterAll(() => {
  // Cleanup code after all tests
});

afterEach(() => {
  // Cleanup code after each test
});
