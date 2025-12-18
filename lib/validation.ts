/**
 * 입력 검증 및 Sanitization 유틸리티
 */

/**
 * HTML 태그 제거 (XSS 방지)
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * 스크립트 관련 문자열 제거
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // JavaScript 이벤트 핸들러 제거
    .replace(/on\w+\s*=/gi, '')
    // javascript: 프로토콜 제거
    .replace(/javascript:/gi, '')
    // data: 프로토콜 제거
    .replace(/data:/gi, '')
    // 앞뒤 공백 정리
    .trim();
}

/**
 * 배열 입력 검증 및 sanitize
 */
export function sanitizeArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeInput(item))
    .filter(item => item.length > 0);
}

/**
 * 문자열 길이 검증
 */
export function validateLength(
  input: string,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (input.length < min) {
    return {
      valid: false,
      error: `최소 ${min}자 이상 입력해주세요. (현재: ${input.length}자)`,
    };
  }

  if (input.length > max) {
    return {
      valid: false,
      error: `최대 ${max}자까지 입력 가능합니다. (현재: ${input.length}자)`,
    };
  }

  return { valid: true };
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * UUID 형식 검증
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * SQL Injection 패턴 감지
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(';|";)/,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * 위험한 입력 감지 (로깅용)
 */
export function detectMaliciousInput(input: string): {
  isMalicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (/<script/i.test(input)) {
    reasons.push('script tag detected');
  }

  if (/javascript:/i.test(input)) {
    reasons.push('javascript protocol detected');
  }

  if (detectSqlInjection(input)) {
    reasons.push('SQL injection pattern detected');
  }

  if (/\{\{|\}\}/g.test(input)) {
    reasons.push('template injection pattern detected');
  }

  return {
    isMalicious: reasons.length > 0,
    reasons,
  };
}

/**
 * 문제 생성 요청 검증
 */
export interface GenerateValidation {
  passage: string;
  questionType: string;
}

export function validateGenerateRequest(body: unknown): {
  valid: boolean;
  data?: GenerateValidation;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '잘못된 요청 형식입니다.' };
  }

  const { passage, questionType } = body as Record<string, unknown>;

  // passage 검증
  if (!passage || typeof passage !== 'string') {
    return { valid: false, error: '지문을 입력해주세요.' };
  }

  const sanitizedPassage = sanitizeInput(passage);
  const lengthCheck = validateLength(sanitizedPassage, 50, 2000);
  if (!lengthCheck.valid) {
    return { valid: false, error: `지문: ${lengthCheck.error}` };
  }

  // questionType 검증
  if (!questionType || typeof questionType !== 'string') {
    return { valid: false, error: '문제 유형을 선택해주세요.' };
  }

  const validTypes = [
    'GRAMMAR_INCORRECT',
    'SELECT_INCORRECT_WORD',
    'PICK_UNDERLINE',
    'PICK_SUBJECT',
    'PICK_TITLE',
    'CORRECT_ANSWER',
    'INCORRECT_ANSWER',
    'BLANK_WORD',
    'COMPLETE_SUMMARY',
    'IRRELEVANT_SENTENCE',
    'INSERT_SENTENCE',
    'SENTENCE_ORDER',
  ];

  if (!validTypes.includes(questionType)) {
    return { valid: false, error: '유효하지 않은 문제 유형입니다.' };
  }

  // 악의적 입력 체크
  const maliciousCheck = detectMaliciousInput(sanitizedPassage);
  if (maliciousCheck.isMalicious) {
    console.warn('Malicious input detected:', maliciousCheck.reasons);
    return { valid: false, error: '허용되지 않는 문자가 포함되어 있습니다.' };
  }

  return {
    valid: true,
    data: {
      passage: sanitizedPassage,
      questionType,
    },
  };
}

/**
 * 아티클 생성 요청 검증
 */
export interface ArticleValidation {
  keywords: string[];
  difficulty: string;
  wordCount: number;
}

export function validateArticleRequest(body: unknown): {
  valid: boolean;
  data?: ArticleValidation;
  error?: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '잘못된 요청 형식입니다.' };
  }

  const { keywords, difficulty, wordCount } = body as Record<string, unknown>;

  // keywords 검증
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return { valid: false, error: '키워드를 입력해주세요.' };
  }

  const sanitizedKeywords = sanitizeArray(keywords);
  if (sanitizedKeywords.length === 0) {
    return { valid: false, error: '유효한 키워드를 입력해주세요.' };
  }

  if (sanitizedKeywords.length > 10) {
    return { valid: false, error: '키워드는 최대 10개까지 입력 가능합니다.' };
  }

  // difficulty 검증
  if (!difficulty || typeof difficulty !== 'string') {
    return { valid: false, error: '난이도를 선택해주세요.' };
  }

  const validDifficulties = ['중학생', '고1', '고2', '고3'];
  if (!validDifficulties.includes(difficulty)) {
    return { valid: false, error: '유효하지 않은 난이도입니다.' };
  }

  // wordCount 검증
  if (typeof wordCount !== 'number' || wordCount < 100 || wordCount > 1000) {
    return { valid: false, error: '단어 수는 100~1000 사이로 설정해주세요.' };
  }

  return {
    valid: true,
    data: {
      keywords: sanitizedKeywords,
      difficulty,
      wordCount,
    },
  };
}
