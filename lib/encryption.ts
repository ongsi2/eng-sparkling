/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 *
 * Environment variable required:
 * ENCRYPTION_KEY - 32-byte hex string (generate with: openssl rand -hex 32)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * Falls back to a development key if not set (NOT for production!)
 */
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // Development fallback - generate a deterministic key for local testing
    // WARNING: This should NEVER be used in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ ENCRYPTION_KEY not set, using development fallback');
      return crypto.createHash('sha256').update('dev-key-not-for-production').digest();
    }
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string value
 * Returns format: iv:authTag:encryptedData (all in hex)
 */
export function encrypt(text: string): string {
  if (!text) return '';

  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    // Return original value if encryption fails (for dev/testing)
    if (process.env.NODE_ENV === 'development') {
      return text;
    }
    throw error;
  }
}

/**
 * Decrypt an encrypted string
 * Expects format: iv:authTag:encryptedData (all in hex)
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) return '';

  // Check if it looks like encrypted format
  const parts = encrypted.split(':');
  if (parts.length !== 3) {
    // Not encrypted, return as-is (backwards compatibility)
    return encrypted;
  }

  try {
    const [ivHex, authTagHex, data] = parts;

    // Validate hex format
    if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
      return encrypted; // Not our encrypted format
    }

    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return original value if decryption fails
    return encrypted;
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;

  const parts = value.split(':');
  if (parts.length !== 3) return false;

  const [ivHex, authTagHex] = parts;
  return ivHex.length === IV_LENGTH * 2 && authTagHex.length === AUTH_TAG_LENGTH * 2;
}

/**
 * Hash a value for searching (one-way, deterministic)
 * Use this when you need to search by encrypted field
 */
export function hashForSearch(text: string): string {
  if (!text) return '';

  const salt = process.env.ENCRYPTION_KEY || 'dev-salt';
  return crypto
    .createHmac('sha256', salt)
    .update(text.toLowerCase().trim())
    .digest('hex');
}
