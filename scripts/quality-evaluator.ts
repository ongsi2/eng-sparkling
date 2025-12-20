/**
 * 문제 품질 평가 에이전트
 * 아티클, 문제, 해설 품질을 자동으로 측정
 *
 * 실행: npx ts-node scripts/quality-evaluator.ts
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
// 품질 평가 기준
// ============================================

interface QualityScore {
  score: number;  // 1-10
  issues: string[];
  suggestions: string[];
}

interface EvaluationResult {
  article: QualityScore;
  question: QualityScore;
  explanation: QualityScore;
  overall: number;
  summary: string;
}

// ============================================
// 품질 평가 프롬프트
// ============================================

const EVALUATION_PROMPT = `
You are a strict quality evaluator for Korean SAT (수능) English questions.

**TASK:** Evaluate the quality of the given article, question, and explanation.

**INPUT:**
- Article Title: {title}
- Article: {article}
- Question Type: {questionType}
- Question: {question}
- Choices: {choices}
- Answer: {answer}
- Explanation: {explanation}

**EVALUATION CRITERIA:**

## Article Quality (1-10)
- Title Diversity: NOT "The Joy of...", "The Wonders of...", "The Benefits of..." patterns? (-3 if violated)
- Grammar: Is it grammatically perfect? (-2 per error)
- Vocabulary: Appropriate for difficulty level?
- Content: Informative and coherent?
- Structure: Clear paragraphs?

## Question Quality (1-10)
- Validity: Is the question answerable from the passage?
- Answer Correctness: Is the marked answer actually correct?
- Distractor Quality: Are wrong choices plausible but clearly wrong?
- Clarity: Is the question clear and unambiguous?

## Explanation Quality (1-10)
- Structure: Does it have 3 paragraphs (summary, answer analysis, choice analysis)?
- Specificity: Does it explain WHAT the word/phrase modifies or describes?
- Word Meanings: Are Korean meanings provided in parentheses?
- Logic: Is the reasoning sound and specific (not vague)?
- Completeness: Are ALL choices analyzed?

**CRITICAL CHECKS:**
1. If explanation says "부정확한 표현이므로" without explaining WHY → -3 points
2. If explanation doesn't specify what the word modifies → -2 points
3. If title starts with cliché pattern → -3 points
4. If answer seems wrong or debatable → -5 points

**OUTPUT (JSON only):**
{
  "article": {
    "score": [1-10],
    "issues": ["issue1", "issue2"],
    "suggestions": ["suggestion1"]
  },
  "question": {
    "score": [1-10],
    "issues": ["issue1"],
    "suggestions": ["suggestion1"]
  },
  "explanation": {
    "score": [1-10],
    "issues": ["issue1", "issue2"],
    "suggestions": ["suggestion1"]
  },
  "overall": [1-10 average],
  "summary": "Brief Korean summary of main issues"
}
`;

// ============================================
// 테스트 데이터 생성
// ============================================

async function generateTestQuestion(keywords: string[], difficulty: string, questionType: string): Promise<any> {
  console.log(`\n📝 생성 중: ${questionType} (${difficulty}) - 키워드: ${keywords.join(', ')}`);

  // 1. 아티클 생성
  const articlePrompt = `
Generate an English article for Korean SAT practice.
Keywords: ${keywords.join(', ')}
Difficulty: ${difficulty}
Word Count: 250-300

CRITICAL:
- DO NOT use titles like "The Joy of...", "The Wonders of...", "The Benefits of..."
- Use creative, diverse title patterns

Return JSON:
{
  "title": "Creative title here",
  "article": "Article text with \\n\\n for paragraphs",
  "wordCount": 280
}
`;

  const articleResponse = await openai.chat.completions.create({
    model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: articlePrompt }],
    response_format: { type: 'json_object' },
  });

  const articleData = JSON.parse(articleResponse.choices[0].message.content || '{}');

  // 2. 문제 생성
  const questionPrompts: Record<string, string> = {
    'SELECT_INCORRECT_WORD': `
Create a vocabulary-in-context question where ONE word is contextually WRONG.

Article: ${articleData.article}

Requirements:
1. Pick 5 words from the passage
2. Replace 1 word with a WRONG word that doesn't fit the context
3. Explain clearly what each word MODIFIES/DESCRIBES

Return JSON:
{
  "question": "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "choices": ["word1", "word2", "word3", "word4", "word5"],
  "answer": 3,
  "wrongWord": "the wrong word shown",
  "correctWord": "what it should be",
  "explanation": "3-paragraph explanation with word meanings and what each word modifies"
}
`,
    'PICK_TITLE': `
Create a title-choosing question.

Article: ${articleData.article}

Return JSON:
{
  "question": "다음 글의 제목으로 가장 적절한 것은?",
  "choices": ["title1", "title2", "title3", "title4", "title5"],
  "answer": 2,
  "explanation": "3-paragraph explanation"
}
`,
    'PICK_SUBJECT': `
Create a main idea question.

Article: ${articleData.article}

Return JSON:
{
  "question": "다음 글의 주제로 가장 적절한 것은?",
  "choices": ["subject1", "subject2", "subject3", "subject4", "subject5"],
  "answer": 1,
  "explanation": "3-paragraph explanation"
}
`
  };

  const questionPrompt = questionPrompts[questionType] || questionPrompts['PICK_SUBJECT'];

  const questionResponse = await openai.chat.completions.create({
    model: process.env.DEFAULT_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: questionPrompt }],
    response_format: { type: 'json_object' },
  });

  const questionData = JSON.parse(questionResponse.choices[0].message.content || '{}');

  return {
    title: articleData.title,
    article: articleData.article,
    questionType,
    difficulty,
    ...questionData
  };
}

// ============================================
// 품질 평가 실행
// ============================================

async function evaluateQuality(data: any): Promise<EvaluationResult> {
  const prompt = EVALUATION_PROMPT
    .replace('{title}', data.title || '')
    .replace('{article}', data.article || '')
    .replace('{questionType}', data.questionType || '')
    .replace('{question}', data.question || '')
    .replace('{choices}', JSON.stringify(data.choices || []))
    .replace('{answer}', String(data.answer || ''))
    .replace('{explanation}', data.explanation || '');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // 평가는 더 좋은 모델 사용
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  console.log('🔍 문제 품질 평가 시작\n');
  console.log('=' .repeat(60));

  // 테스트 케이스 정의
  const testCases = [
    { keywords: ['coffee', 'morning', 'energy'], difficulty: '중학생', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['technology', 'education', 'future'], difficulty: '고1', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['climate', 'ocean', 'ecosystem'], difficulty: '고2', type: 'PICK_TITLE' },
    { keywords: ['psychology', 'decision', 'bias'], difficulty: '고3', type: 'PICK_SUBJECT' },
    { keywords: ['music', 'brain', 'memory'], difficulty: '고1', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['exercise', 'mental', 'health'], difficulty: '중학생', type: 'PICK_TITLE' },
    { keywords: ['space', 'exploration', 'mars'], difficulty: '고2', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['social media', 'youth', 'communication'], difficulty: '고3', type: 'PICK_SUBJECT' },
    { keywords: ['food', 'culture', 'tradition'], difficulty: '고1', type: 'SELECT_INCORRECT_WORD' },
    { keywords: ['art', 'creativity', 'innovation'], difficulty: '고2', type: 'PICK_TITLE' },
  ];

  const results: { data: any; evaluation: EvaluationResult }[] = [];
  let totalScore = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`\n[${ i + 1}/${testCases.length}] 테스트 케이스 실행...`);

    try {
      // 문제 생성
      const data = await generateTestQuestion(tc.keywords, tc.difficulty, tc.type);

      // 품질 평가
      console.log('   평가 중...');
      const evaluation = await evaluateQuality(data);

      results.push({ data, evaluation });
      totalScore += evaluation.overall || 0;

      // 결과 출력
      console.log(`\n   📊 결과:`);
      console.log(`   - 제목: "${data.title}"`);
      console.log(`   - 아티클 점수: ${evaluation.article?.score || 'N/A'}/10`);
      console.log(`   - 문제 점수: ${evaluation.question?.score || 'N/A'}/10`);
      console.log(`   - 해설 점수: ${evaluation.explanation?.score || 'N/A'}/10`);
      console.log(`   - 종합: ${evaluation.overall || 'N/A'}/10`);

      if (evaluation.summary) {
        console.log(`   - 요약: ${evaluation.summary}`);
      }

      // 주요 이슈 출력
      const allIssues = [
        ...(evaluation.article?.issues || []),
        ...(evaluation.question?.issues || []),
        ...(evaluation.explanation?.issues || []),
      ];
      if (allIssues.length > 0) {
        console.log(`   - 이슈: ${allIssues.slice(0, 3).join(', ')}`);
      }

    } catch (error: any) {
      console.error(`   ❌ 오류: ${error.message}`);
    }

    // API 레이트 리밋 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 최종 리포트
  console.log('\n' + '='.repeat(60));
  console.log('📈 최종 리포트\n');

  const avgScore = totalScore / results.length;
  console.log(`평균 점수: ${avgScore.toFixed(1)}/10`);
  console.log(`테스트 수: ${results.length}개`);

  // 카테고리별 평균
  const articleAvg = results.reduce((sum, r) => sum + (r.evaluation.article?.score || 0), 0) / results.length;
  const questionAvg = results.reduce((sum, r) => sum + (r.evaluation.question?.score || 0), 0) / results.length;
  const explanationAvg = results.reduce((sum, r) => sum + (r.evaluation.explanation?.score || 0), 0) / results.length;

  console.log(`\n카테고리별 평균:`);
  console.log(`- 아티클: ${articleAvg.toFixed(1)}/10`);
  console.log(`- 문제: ${questionAvg.toFixed(1)}/10`);
  console.log(`- 해설: ${explanationAvg.toFixed(1)}/10`);

  // 빈발 이슈 집계
  const issueCount: Record<string, number> = {};
  results.forEach(r => {
    [...(r.evaluation.article?.issues || []),
     ...(r.evaluation.question?.issues || []),
     ...(r.evaluation.explanation?.issues || [])
    ].forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
  });

  const topIssues = Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topIssues.length > 0) {
    console.log(`\n🔴 빈발 이슈 TOP 5:`);
    topIssues.forEach(([issue, count], i) => {
      console.log(`${i + 1}. (${count}회) ${issue}`);
    });
  }

  // 제목 패턴 체크
  const clicheTitles = results.filter(r =>
    /^The (Joy|Wonders|Benefits|Power|Magic) of/i.test(r.data.title || '')
  );
  if (clicheTitles.length > 0) {
    console.log(`\n⚠️ 클리셰 제목 발견: ${clicheTitles.length}개`);
    clicheTitles.forEach(r => console.log(`   - "${r.data.title}"`));
  } else {
    console.log(`\n✅ 클리셰 제목 없음`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('품질 평가 완료!');
}

main().catch(console.error);
