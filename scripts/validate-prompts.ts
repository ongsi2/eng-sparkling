/**
 * 문제 생성 프롬프트 검증 스크립트
 *
 * 사용법:
 *   npx ts-node scripts/validate-prompts.ts
 *   npx ts-node scripts/validate-prompts.ts GRAMMAR_INCORRECT
 */

import * as fs from 'fs';
import * as path from 'path';

// 프롬프트 파일 읽기
const promptsPath = path.join(__dirname, '../lib/all-prompts.ts');
const promptsContent = fs.readFileSync(promptsPath, 'utf-8');

// 문제 유형 목록
const QUESTION_TYPES = [
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

interface ValidationResult {
  type: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
}

function validatePrompt(type: string, content: string): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 프롬프트 추출 (대략적으로)
  const promptRegex = new RegExp(`export const ${type}_PROMPT = \`([\\s\\S]*?)\`;`, 'g');
  const match = promptRegex.exec(content);

  if (!match) {
    return { type, passed: false, issues: ['프롬프트를 찾을 수 없음'], warnings: [] };
  }

  const prompt = match[1];

  // 1. JSON 출력 형식 명시 확인
  if (!prompt.includes('Output (JSON only)') && !prompt.includes('**Output')) {
    issues.push('JSON 출력 형식 명시 없음');
  }

  // 2. 예시 포함 확인
  if (!prompt.includes('EXAMPLE') && !prompt.includes('Example')) {
    warnings.push('예시(EXAMPLE) 섹션 없음');
  }

  // 3. HTML 태그 금지 명시 확인
  if (!prompt.includes('NEVER use HTML tags') && !prompt.includes('HTML 태그')) {
    warnings.push('HTML 태그 금지 명시 없음');
  }

  // 4. answer 필드 설명 확인
  if (!prompt.includes('"answer"')) {
    issues.push('answer 필드 설명 없음');
  }

  // 5. explanation 필드 설명 확인
  if (!prompt.includes('"explanation"')) {
    issues.push('explanation 필드 설명 없음');
  }

  // 6. 마커 유형 검증
  if (type === 'GRAMMAR_INCORRECT' || type === 'SELECT_INCORRECT_WORD') {
    if (!prompt.includes('markers')) {
      issues.push('markers 배열 설명 없음 (필수)');
    }
    if (!prompt.includes('EXACTLY 5')) {
      warnings.push('마커 5개 필수 조건 명시 없음');
    }
  }

  // 7. 밑줄 유형 검증
  if (type === 'PICK_UNDERLINE') {
    if (!prompt.includes('<u>')) {
      issues.push('밑줄 태그 사용법 설명 없음');
    }
  }

  // 8. 선택지 수 확인
  if (type === 'INSERT_SENTENCE') {
    if (!prompt.includes('4') && !prompt.includes('four')) {
      warnings.push('4지선다 명시 없음');
    }
  } else {
    if (!prompt.includes('5') && !prompt.includes('five')) {
      warnings.push('5지선다 명시 없음');
    }
  }

  // 9. CONNECTOR VARIATION 확인 (따라서 반복 방지)
  if (!prompt.includes('CONNECTOR VARIATION') && !prompt.includes('따라서')) {
    warnings.push('연결어 다양화 가이드 없음');
  }

  // 10. BAD EXAMPLE 확인
  if (!prompt.includes('BAD EXAMPLE') && !prompt.includes('DO NOT DO THIS')) {
    warnings.push('잘못된 예시 없음 (학습에 도움됨)');
  }

  return {
    type,
    passed: issues.length === 0,
    issues,
    warnings,
  };
}

function main() {
  const targetType = process.argv[2];
  const typesToValidate = targetType
    ? QUESTION_TYPES.filter(t => t === targetType)
    : QUESTION_TYPES;

  if (targetType && typesToValidate.length === 0) {
    console.error(`Unknown question type: ${targetType}`);
    console.log('Available types:', QUESTION_TYPES.join(', '));
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('ENG-SPARKLING 프롬프트 검증');
  console.log('='.repeat(60));
  console.log('');

  let passedCount = 0;
  let failedCount = 0;

  for (const type of typesToValidate) {
    const result = validatePrompt(type, promptsContent);

    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${type}`);

    if (result.issues.length > 0) {
      console.log('  Issues:');
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }

    if (result.warnings.length > 0) {
      console.log('  Warnings:');
      result.warnings.forEach(warning => console.log(`    - ⚠️ ${warning}`));
    }

    console.log('');

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('='.repeat(60));
  console.log(`결과: ${passedCount} passed, ${failedCount} failed`);
  console.log('='.repeat(60));

  process.exit(failedCount > 0 ? 1 : 0);
}

main();
