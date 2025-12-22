/**
 * HTML Sanitization Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizePassageHtml,
  sanitizeExplanationHtml,
  sanitizeHtml,
  isHtmlSafe,
} from '@/lib/sanitize-html';

describe('HTML Sanitization', () => {
  describe('sanitizePassageHtml', () => {
    it('should allow <u> tags', () => {
      const html = '<u>underlined text</u>';
      expect(sanitizePassageHtml(html)).toBe('<u>underlined text</u>');
    });

    it('should allow <mark> tags', () => {
      const html = '<mark>highlighted</mark>';
      expect(sanitizePassageHtml(html)).toBe('<mark>highlighted</mark>');
    });

    it('should allow <br> tags', () => {
      const html = 'line1<br>line2';
      expect(sanitizePassageHtml(html)).toBe('line1<br>line2');
    });

    it('should remove <script> tags', () => {
      const html = '<u>safe</u><script>alert("xss")</script>';
      expect(sanitizePassageHtml(html)).toBe('<u>safe</u>');
    });

    it('should remove onclick attributes', () => {
      const html = '<u onclick="alert(1)">text</u>';
      expect(sanitizePassageHtml(html)).toBe('<u>text</u>');
    });

    it('should remove onerror attributes', () => {
      const html = '<img src="x" onerror="alert(1)">';
      expect(sanitizePassageHtml(html)).toBe('');
    });

    it('should keep text content from disallowed tags', () => {
      const html = '<div><b>bold</b> and <i>italic</i></div>';
      expect(sanitizePassageHtml(html)).toBe('bold and italic');
    });

    it('should handle empty input', () => {
      expect(sanitizePassageHtml('')).toBe('');
    });

    it('should handle null-like input', () => {
      expect(sanitizePassageHtml(null as unknown as string)).toBe('');
      expect(sanitizePassageHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('sanitizeExplanationHtml', () => {
    it('should remove all HTML tags', () => {
      const html = '<b>bold</b> and <i>italic</i>';
      expect(sanitizeExplanationHtml(html)).toBe('bold and italic');
    });

    it('should remove script tags', () => {
      const html = 'safe<script>evil()</script>';
      expect(sanitizeExplanationHtml(html)).toBe('safe');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeExplanationHtml('')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should allow custom tags', () => {
      const html = '<b>bold</b><i>italic</i>';
      const result = sanitizeHtml(html, ['b']);
      expect(result).toBe('<b>bold</b>italic');
    });

    it('should use default tags when not specified', () => {
      const html = '<b>bold</b><strong>strong</strong><em>em</em>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<b>bold</b>');
      expect(result).toContain('<strong>strong</strong>');
      expect(result).toContain('<em>em</em>');
    });
  });

  describe('isHtmlSafe', () => {
    it('should return true for safe HTML', () => {
      expect(isHtmlSafe('<u>safe</u>')).toBe(true);
    });

    it('should return false for unsafe HTML', () => {
      expect(isHtmlSafe('<script>evil()</script>')).toBe(false);
    });

    it('should return false for HTML with event handlers', () => {
      expect(isHtmlSafe('<u onclick="evil()">text</u>')).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isHtmlSafe('')).toBe(true);
    });
  });
});
