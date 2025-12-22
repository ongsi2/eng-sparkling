/**
 * Encryption Tests
 */

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted, hashForSearch } from '@/lib/encryption';

describe('Encryption', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const original = 'Hello, World!';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const original = 'test message';
      const encrypted1 = encrypt(original);
      const encrypted2 = encrypt(original);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      expect(encrypt('')).toBe('');
      expect(decrypt('')).toBe('');
    });

    it('should handle unicode characters', () => {
      const original = '안녕하세요 🎉';
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });

    it('should handle long text', () => {
      const original = 'a'.repeat(10000);
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted values', () => {
      const encrypted = encrypt('test');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(isEncrypted('plain text')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('should return false for malformed encrypted string', () => {
      expect(isEncrypted('abc:def')).toBe(false);
      expect(isEncrypted('abc:def:ghi')).toBe(false);
    });
  });

  describe('hashForSearch', () => {
    it('should produce consistent hash for same input', () => {
      const hash1 = hashForSearch('test@example.com');
      const hash2 = hashForSearch('test@example.com');

      expect(hash1).toBe(hash2);
    });

    it('should be case-insensitive', () => {
      const hash1 = hashForSearch('Test@Example.com');
      const hash2 = hashForSearch('test@example.com');

      expect(hash1).toBe(hash2);
    });

    it('should trim whitespace', () => {
      const hash1 = hashForSearch('  test  ');
      const hash2 = hashForSearch('test');

      expect(hash1).toBe(hash2);
    });

    it('should return empty string for empty input', () => {
      expect(hashForSearch('')).toBe('');
    });

    it('should produce 64-character hex string', () => {
      const hash = hashForSearch('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
