/**
 * CSRF Protection Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { generateCsrfToken, requiresCsrfProtection } from '@/lib/csrf';

describe('CSRF Protection', () => {
  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCsrfToken();
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('requiresCsrfProtection', () => {
    it('should return true for POST', () => {
      expect(requiresCsrfProtection('POST')).toBe(true);
    });

    it('should return true for PUT', () => {
      expect(requiresCsrfProtection('PUT')).toBe(true);
    });

    it('should return true for PATCH', () => {
      expect(requiresCsrfProtection('PATCH')).toBe(true);
    });

    it('should return true for DELETE', () => {
      expect(requiresCsrfProtection('DELETE')).toBe(true);
    });

    it('should return false for GET', () => {
      expect(requiresCsrfProtection('GET')).toBe(false);
    });

    it('should return false for HEAD', () => {
      expect(requiresCsrfProtection('HEAD')).toBe(false);
    });

    it('should return false for OPTIONS', () => {
      expect(requiresCsrfProtection('OPTIONS')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(requiresCsrfProtection('post')).toBe(true);
      expect(requiresCsrfProtection('Post')).toBe(true);
    });
  });
});
