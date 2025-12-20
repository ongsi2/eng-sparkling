/**
 * 품질 평가 결과 기반 프롬프트 자동 개선 시스템
 *
 * 1. 품질 평가 실행
 * 2. 빈발 이슈 분석
 * 3. 프롬프트 개선안 생성
 * 4. 선택적으로 자동 적용
 *
 * 실행: npm run improve:prompts
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// .env.local 직접 로드
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// 이슈 → 프롬프트 수정 매핑
// ============================================

interface IssuePattern {
  pattern: RegExp;
  category: string;
  fix: string;
  promptSection: string;
}

const ISSUE_PATTERNS: IssuePattern[] = [
  {
    pattern: /korean meaning|한국어 뜻|한국어 의미/i,
    category: 'MISSING_KOREAN',
    fix: `**MANDATORY: Include Korean meaning for EVERY word in parentheses.**
Example: 'prove(증명하다)', 'disprove(반증하다)'
Your response will be REJECTED if any word lacks Korean translation.`,
    promptSection: 'SELECT_INCORRECT_WORD',
  },
  {
    pattern: /3.?paragraph|단락 구조|three paragraph/i,
    category: 'MISSING_STRUCTURE',
    fix: `**MANDATORY 3-PARAGRAPH STRUCTURE:**
Paragraph 1: 글 내용 요약 (2-3문장)
Paragraph 2: 정답 분석 + 무엇을 수식하는지 명시
Paragraph 3: 모든 5개 선지 분석 (①②③④⑤)

Separate each paragraph with \\n\\n`,
    promptSection: 'ALL',
  },
  {
    pattern: /all choice|모든 선택지|completeness|5개 선지/i,
    category: 'INCOMPLETE_ANALYSIS',
    fix: `**MANDATORY: Analyze ALL 5 choices in Paragraph 3.**
Format: ①'word(뜻)'는 [무엇]을 설명하며, [왜 맞는지/틀린지].
MUST include all: ① ② ③ ④ ⑤`,
    promptSection: 'ALL',
  },
  {
    pattern: /answer correct|정답.*틀|debatable|오류/i,
    category: 'ANSWER_CORRECTNESS',
    fix: `**CRITICAL: Verify answer before responding.**
1. Re-read the passage carefully
2. Confirm the marked answer is DEFINITELY correct
3. Ensure distractors are CLEARLY wrong (not debatable)
4. If uncertain, choose a different word/option`,
    promptSection: 'ALL',
  },
  {
    pattern: /what.*modif|수식|설명하는지/i,
    category: 'MISSING_MODIFIER',
    fix: `**MANDATORY: Specify what each word MODIFIES.**
BAD: "'soggy'는 부정확하다"
GOOD: "'soggy'는 **토스트의 식감**을 설명하는데, 굽는 결과와 맞지 않다"

Always bold the modified target: **[무엇]**`,
    promptSection: 'SELECT_INCORRECT_WORD',
  },
];

// ============================================
// 품질 평가 실행 (간소화)
// ============================================

async function runQuickEvaluation(): Promise<{ issues: string[]; scores: any }> {
  console.log('🔍 빠른 품질 평가 실행 중...\n');

  const testCases = [
    { keywords: ['coffee', 'morning'], difficulty: '중학생', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['technology', 'future'], difficulty: '고1', type: 'PICK_TITLE' },
    { keywords: ['climate', 'ocean'], difficulty: '고2', type: 'PICK_SUBJECT' },
  ];

  const allIssues: string[] = [];
  const scores = { article: 0, question: 0, explanation: 0, count: 0 };

  for (const tc of testCases) {
    try {
      // 간단한 문제 생성
      const genResponse = await openai.chat.completions.create({
        model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate a ${tc.type} question for Korean SAT.
Keywords: ${tc.keywords.join(', ')}
Difficulty: ${tc.difficulty}

Return JSON with: title, article, question, choices, answer, explanation`
        }],
        response_format: { type: 'json_object' },
      });

      const data = JSON.parse(genResponse.choices[0].message.content || '{}');

      // 품질 평가
      const evalResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `Evaluate this Korean SAT question:
Title: ${data.title}
Question Type: ${tc.type}
Explanation: ${data.explanation}

Check for these issues:
1. Are Korean meanings provided for all key terms? (e.g., 'prove(증명하다)')
2. Does explanation have 3 paragraphs?
3. Are all 5 choices analyzed?
4. Is the answer definitely correct?
5. Does it specify what each word modifies?

Return JSON: { "issues": ["issue1", "issue2"], "scores": { "article": 8, "question": 7, "explanation": 5 } }`
        }],
        response_format: { type: 'json_object' },
      });

      const evalData = JSON.parse(evalResponse.choices[0].message.content || '{}');
      allIssues.push(...(evalData.issues || []));

      if (evalData.scores) {
        scores.article += evalData.scores.article || 0;
        scores.question += evalData.scores.question || 0;
        scores.explanation += evalData.scores.explanation || 0;
        scores.count++;
      }

      console.log(`  ✓ ${tc.type}: ${evalData.issues?.length || 0}개 이슈 발견`);

    } catch (error: any) {
      console.error(`  ✗ ${tc.type}: ${error.message}`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  return { issues: allIssues, scores };
}

// ============================================
// 이슈 분석 및 개선안 생성
// ============================================

function analyzeIssues(issues: string[]): { category: string; count: number; fix: string }[] {
  const categoryCount: Record<string, { count: number; fix: string }> = {};

  for (const issue of issues) {
    for (const pattern of ISSUE_PATTERNS) {
      if (pattern.pattern.test(issue)) {
        if (!categoryCount[pattern.category]) {
          categoryCount[pattern.category] = { count: 0, fix: pattern.fix };
        }
        categoryCount[pattern.category].count++;
        break;
      }
    }
  }

  return Object.entries(categoryCount)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.count - a.count);
}

// ============================================
// 프롬프트 파일에 개선안 적용
// ============================================

async function applyFixes(fixes: { category: string; fix: string }[]): Promise<void> {
  const promptPath = path.join(process.cwd(), 'lib', 'all-prompts.ts');
  let content = fs.readFileSync(promptPath, 'utf-8');

  // 이미 적용된 수정 건너뛰기
  const appliedFixes: string[] = [];
  const skippedFixes: string[] = [];

  for (const { category, fix } of fixes) {
    // 이미 비슷한 내용이 있는지 확인
    const keyPhrase = fix.split('\n')[0].slice(0, 50);
    if (content.includes(keyPhrase.slice(0, 30))) {
      skippedFixes.push(category);
      continue;
    }

    // SELECT_INCORRECT_WORD 프롬프트에 추가
    const marker = '**Output (JSON only):**';
    const insertPoint = content.indexOf(marker);

    if (insertPoint > 0) {
      // 마커 바로 앞에 수정사항 삽입
      const fixBlock = `\n\n**AUTO-FIX [${category}]:**\n${fix}\n`;

      // 이미 같은 카테고리의 AUTO-FIX가 있으면 건너뛰기
      if (content.includes(`AUTO-FIX [${category}]`)) {
        skippedFixes.push(category);
        continue;
      }

      content = content.slice(0, insertPoint) + fixBlock + content.slice(insertPoint);
      appliedFixes.push(category);
    }
  }

  if (appliedFixes.length > 0) {
    fs.writeFileSync(promptPath, content);
    console.log(`\n✅ 적용된 수정: ${appliedFixes.join(', ')}`);
  }

  if (skippedFixes.length > 0) {
    console.log(`⏭️ 이미 적용됨: ${skippedFixes.join(', ')}`);
  }
}

// ============================================
// 개선 리포트 생성
// ============================================

function generateReport(
  issues: string[],
  analyzed: { category: string; count: number; fix: string }[],
  scores: any
): string {
  const avgArticle = scores.count ? (scores.article / scores.count).toFixed(1) : 'N/A';
  const avgQuestion = scores.count ? (scores.question / scores.count).toFixed(1) : 'N/A';
  const avgExplanation = scores.count ? (scores.explanation / scores.count).toFixed(1) : 'N/A';

  let report = `
# 품질 평가 및 개선 리포트
생성일: ${new Date().toISOString()}

## 평균 점수
- 아티클: ${avgArticle}/10
- 문제: ${avgQuestion}/10
- 해설: ${avgExplanation}/10

## 발견된 이슈 (${issues.length}개)
${issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

## 카테고리별 분석
${analyzed.map(a => `### ${a.category} (${a.count}회)
${a.fix}
`).join('\n')}

## 권장 조치
${analyzed.length > 0 ? analyzed.map(a => `- [ ] ${a.category} 수정 적용`).join('\n') : '- 특별한 조치 필요 없음'}
`;

  return report;
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('🚀 품질 개선 시스템 시작\n');
  console.log('=' .repeat(60));

  // 1. 품질 평가
  const { issues, scores } = await runQuickEvaluation();

  // 2. 이슈 분석
  console.log('\n📊 이슈 분석 중...');
  const analyzed = analyzeIssues(issues);

  if (analyzed.length === 0) {
    console.log('\n✅ 발견된 주요 이슈 없음! 품질이 양호합니다.');
  } else {
    console.log(`\n🔴 발견된 이슈 카테고리: ${analyzed.length}개`);
    analyzed.forEach(a => {
      console.log(`   - ${a.category}: ${a.count}회`);
    });
  }

  // 3. 자동 적용 여부 확인
  const autoApply = process.argv.includes('--apply');

  if (autoApply && analyzed.length > 0) {
    console.log('\n🔧 프롬프트 자동 수정 적용 중...');
    await applyFixes(analyzed);
  } else if (analyzed.length > 0) {
    console.log('\n💡 자동 적용하려면: npm run improve:prompts -- --apply');
  }

  // 4. 리포트 저장
  const report = generateReport(issues, analyzed, scores);
  const reportPath = path.join(process.cwd(), 'quality-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 리포트 저장됨: ${reportPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('품질 개선 시스템 완료!');
}

main().catch(console.error);
