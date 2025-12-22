/**
 * HTML Sanitization Utility
 * XSS 공격 방지를 위한 HTML 정화 유틸리티
 *
 * 허용된 태그만 통과시키고 모든 이벤트 핸들러와 스크립트를 제거합니다.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * 문제 지문(passage)에서 허용되는 HTML 태그
 * - <u>: 밑줄 (GRAMMAR_INCORRECT, SELECT_INCORRECT_WORD 등에서 사용)
 * - <mark>: 하이라이트 (향후 사용 가능)
 * - <br>: 줄바꿈
 */
const ALLOWED_TAGS_PASSAGE = ['u', 'mark', 'br'];

/**
 * 해설(explanation)에서 허용되는 HTML 태그
 * - 기본적으로 HTML 태그 사용 금지 (순수 텍스트만)
 */
const ALLOWED_TAGS_EXPLANATION: string[] = [];

/**
 * 지문(modifiedPassage) HTML을 정화합니다.
 * AI가 생성한 지문에서 허용된 태그만 남기고 모든 위험 요소를 제거합니다.
 *
 * @param html - 정화할 HTML 문자열
 * @returns 안전한 HTML 문자열
 *
 * @example
 * sanitizePassageHtml('<u>word</u><script>alert("xss")</script>')
 * // Returns: '<u>word</u>'
 */
export function sanitizePassageHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ALLOWED_TAGS_PASSAGE,
    ALLOWED_ATTR: [], // 모든 속성 제거 (onclick, onerror 등 차단)
    KEEP_CONTENT: true, // 허용되지 않은 태그의 텍스트 콘텐츠는 유지
  });
}

/**
 * 해설(explanation) HTML을 정화합니다.
 * 모든 HTML 태그를 제거하고 순수 텍스트만 반환합니다.
 *
 * @param html - 정화할 HTML 문자열
 * @returns 순수 텍스트 문자열
 *
 * @example
 * sanitizeExplanationHtml('<b>important</b><script>evil()</script>')
 * // Returns: 'important'
 */
export function sanitizeExplanationHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ALLOWED_TAGS_EXPLANATION,
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * 일반 HTML을 정화합니다.
 * 커스텀 허용 태그 목록을 지정할 수 있습니다.
 *
 * @param html - 정화할 HTML 문자열
 * @param allowedTags - 허용할 태그 목록 (기본값: ['u', 'mark', 'br', 'b', 'i', 'em', 'strong'])
 * @returns 안전한 HTML 문자열
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = ['u', 'mark', 'br', 'b', 'i', 'em', 'strong']
): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * HTML이 안전한지 검사합니다.
 * 정화 전후의 HTML이 동일하면 안전한 것으로 판단합니다.
 *
 * @param html - 검사할 HTML 문자열
 * @returns 안전 여부
 */
export function isHtmlSafe(html: string): boolean {
  if (!html) return true;

  const sanitized = sanitizePassageHtml(html);
  return html === sanitized;
}
