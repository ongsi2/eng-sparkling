/**
 * 문제 생성 API 테스트 스크립트
 *
 * 사용법:
 *   npm run dev  # 먼저 개발 서버 실행
 *   npx ts-node scripts/test-question-generation.ts
 *   npx ts-node scripts/test-question-generation.ts GRAMMAR_INCORRECT
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

interface GeneratedQuestion {
  id: string;
  questionType: string;
  question: string;
  passage: string;
  modifiedPassage: string;
  choices: string[];
  answer: number;
  explanation: string;
  sentenceToInsert?: string;
}

interface TestResult {
  type: string;
  passed: boolean;
  issues: string[];
  question?: GeneratedQuestion;
  error?: string;
}

// 테스트용 샘플 지문
const TEST_PASSAGES = {
  short: `The rapid advancement of artificial intelligence has transformed various industries. Machine learning algorithms now power everything from recommendation systems to autonomous vehicles. While these technologies offer unprecedented efficiency, they also raise important ethical questions about privacy and employment.`,

  medium: `Climate change represents one of the most pressing challenges of our time. Rising global temperatures have led to more frequent extreme weather events, melting ice caps, and shifting ecosystems. Scientists warn that without significant reductions in greenhouse gas emissions, these effects will only intensify.

The transition to renewable energy sources has become a critical priority for governments worldwide. Solar and wind power have become increasingly cost-competitive with fossil fuels, making the shift more economically viable. However, challenges remain in terms of energy storage and grid infrastructure.

Public awareness of environmental issues has grown substantially in recent years. Young activists have organized global movements demanding immediate action on climate policy. This grassroots pressure has influenced both corporate practices and government legislation.`,

  complex: `The relationship between technology and human connection has become increasingly complex in the digital age. While social media platforms promise to bring people closer together, research suggests they may actually contribute to feelings of isolation and anxiety. The constant stream of curated content creates unrealistic expectations and promotes comparison rather than genuine connection.

However, technology also offers unprecedented opportunities for maintaining relationships across distances. Video calls have allowed families separated by oceans to share daily moments, and online communities have provided support networks for those with rare conditions or niche interests.

The key lies in intentional use rather than passive consumption. Studies show that actively engaging with others online, rather than simply scrolling through feeds, leads to more positive outcomes. Digital literacy education is becoming essential as we navigate this new landscape of human interaction.`,
};

// 검증 함수들
function validateMarkers(modifiedPassage: string, type: string): string[] {
  const issues: string[] = [];
  const markerTypes = ['GRAMMAR_INCORRECT', 'SELECT_INCORRECT_WORD', 'IRRELEVANT_SENTENCE'];

  if (markerTypes.includes(type)) {
    const requiredMarkers = ['①', '②', '③', '④', '⑤'];
    const missingMarkers = requiredMarkers.filter(m => !modifiedPassage.includes(m));
    if (missingMarkers.length > 0) {
      issues.push(`마커 누락: ${missingMarkers.join(', ')}`);
    }
  }

  return issues;
}

function validateUnderline(modifiedPassage: string, type: string): string[] {
  const issues: string[] = [];
  const underlineTypes = ['GRAMMAR_INCORRECT', 'SELECT_INCORRECT_WORD', 'PICK_UNDERLINE'];

  if (underlineTypes.includes(type)) {
    if (!modifiedPassage.includes('<u>') || !modifiedPassage.includes('</u>')) {
      issues.push('밑줄 태그 없음');
    }
  }

  return issues;
}

function validateAnswer(question: GeneratedQuestion): string[] {
  const issues: string[] = [];

  // answer 범위 검증
  const maxChoices = question.questionType === 'INSERT_SENTENCE' ? 4 : 5;
  if (question.answer < 1 || question.answer > maxChoices) {
    issues.push(`answer 범위 오류: ${question.answer} (1-${maxChoices})`);
  }

  // explanation에 정답 번호 포함 여부
  const answerMentions = [
    `${question.answer}번`,
    `정답은 ${question.answer}`,
    `②③④⑤`.charAt(question.answer - 1),
  ];
  const hasAnswerMention = answerMentions.some(m => question.explanation.includes(m));
  if (!hasAnswerMention) {
    issues.push('해설에 정답 번호 미포함');
  }

  return issues;
}

function validateChoices(question: GeneratedQuestion): string[] {
  const issues: string[] = [];

  // 선지에 정답/오답 힌트 포함 여부
  const badPatterns = ['(정답)', '(오답)', '(correct)', '(wrong)', '(O)', '(X)'];
  for (const choice of question.choices) {
    for (const pattern of badPatterns) {
      if (choice.includes(pattern)) {
        issues.push(`선지에 힌트 포함: "${pattern}"`);
        break;
      }
    }
  }

  // 선지 중복 검사
  const uniqueChoices = new Set(question.choices.map(c => c.toLowerCase().trim()));
  if (uniqueChoices.size !== question.choices.length) {
    issues.push('중복된 선지 존재');
  }

  return issues;
}

function validateExplanation(question: GeneratedQuestion): string[] {
  const issues: string[] = [];

  // HTML 태그 검사
  if (question.explanation.includes('<u>') || question.explanation.includes('<b>')) {
    issues.push('해설에 HTML 태그 포함 (금지됨)');
  }

  // 최소 길이 검사
  if (question.explanation.length < 50) {
    issues.push(`해설이 너무 짧음 (${question.explanation.length}자)`);
  }

  return issues;
}

async function testQuestionGeneration(type: string, passage: string): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passage,
        questionType: type,
        demo: true, // 데모 모드로 테스트
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        type,
        passed: false,
        issues: [],
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const question: GeneratedQuestion = await response.json();
    const issues: string[] = [];

    // 각종 검증 실행
    issues.push(...validateMarkers(question.modifiedPassage, type));
    issues.push(...validateUnderline(question.modifiedPassage, type));
    issues.push(...validateAnswer(question));
    issues.push(...validateChoices(question));
    issues.push(...validateExplanation(question));

    return {
      type,
      passed: issues.length === 0,
      issues,
      question,
    };
  } catch (error: any) {
    return {
      type,
      passed: false,
      issues: [],
      error: error.message,
    };
  }
}

async function main() {
  const targetType = process.argv[2];

  const allTypes = [
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

  const typesToTest = targetType ? [targetType] : allTypes.slice(0, 3); // 기본은 3개만

  console.log('='.repeat(60));
  console.log('ENG-SPARKLING 문제 생성 테스트');
  console.log(`API: ${API_BASE}`);
  console.log('='.repeat(60));
  console.log('');

  let passedCount = 0;
  let failedCount = 0;

  for (const type of typesToTest) {
    console.log(`Testing ${type}...`);

    const result = await testQuestionGeneration(type, TEST_PASSAGES.medium);

    if (result.error) {
      console.log(`  ❌ ERROR: ${result.error}`);
      failedCount++;
    } else if (result.passed) {
      console.log(`  ✅ PASS`);
      console.log(`     Question: ${result.question?.question.substring(0, 50)}...`);
      passedCount++;
    } else {
      console.log(`  ❌ FAIL`);
      result.issues.forEach(issue => console.log(`     - ${issue}`));
      failedCount++;
    }

    console.log('');

    // Rate limit 고려하여 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('='.repeat(60));
  console.log(`결과: ${passedCount} passed, ${failedCount} failed`);
  console.log('='.repeat(60));

  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch(console.error);
