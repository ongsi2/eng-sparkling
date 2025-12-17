/**
 * Question Generation Validation Test
 * Tests if generated questions have consistent answers and explanations
 */

interface ArticleResponse {
  title: string;
  article: string;
  keywords: string[];
  difficulty: string;
  wordCount: number;
}

interface QuestionResponse {
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

interface ValidationResult {
  articleKeywords: string[];
  questionType: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    hasUnderline?: boolean;
    answerMatchesExplanation?: boolean;
    explanationMentionsAnswer?: boolean;
    choicesAreDistinct?: boolean;
  };
}

const API_BASE = 'http://localhost:3000';

async function generateArticle(keywords: string[], difficulty: string, wordCount: number): Promise<ArticleResponse> {
  const response = await fetch(`${API_BASE}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, difficulty, wordCount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Article generation failed: ${error.error}`);
  }

  return response.json();
}

async function generateQuestion(passage: string, questionType: string): Promise<QuestionResponse> {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage, questionType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Question generation failed: ${error.error}`);
  }

  return response.json();
}

function validateQuestion(question: QuestionResponse, questionType: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: ValidationResult['details'] = {};

  // Check for underline in PICK_UNDERLINE type
  if (questionType === 'PICK_UNDERLINE') {
    details.hasUnderline = question.modifiedPassage.includes('<u>') && question.modifiedPassage.includes('</u>');
    if (!details.hasUnderline) {
      errors.push('PICK_UNDERLINE question is missing <u> tags in modifiedPassage');
    }
  }

  // Check if answer is valid (1-5 for most types, 1-4 for INSERT_SENTENCE)
  const maxChoices = questionType === 'INSERT_SENTENCE' ? 4 : 5;
  if (question.answer < 1 || question.answer > maxChoices) {
    errors.push(`Answer ${question.answer} is out of valid range (1-${maxChoices})`);
  }

  // Check if explanation mentions the answer number
  const answerPatterns = [
    `${question.answer}번`,
    `${question.answer}.`,
    `${['①', '②', '③', '④', '⑤'][question.answer - 1]}`,
    `정답.*${question.answer}`,
  ];
  details.explanationMentionsAnswer = answerPatterns.some(pattern =>
    new RegExp(pattern).test(question.explanation)
  );
  if (!details.explanationMentionsAnswer) {
    warnings.push('Explanation does not explicitly mention the answer number');
  }

  // Check if explanation contains content similar to the correct answer choice
  const correctChoice = question.choices[question.answer - 1];
  if (correctChoice) {
    // Simple check: see if any significant words from the choice appear in explanation
    const choiceWords = correctChoice.split(/\s+/).filter(w => w.length > 2);
    const explanationLower = question.explanation.toLowerCase();
    const matchingWords = choiceWords.filter(w => explanationLower.includes(w.toLowerCase()));
    details.answerMatchesExplanation = matchingWords.length >= Math.min(2, choiceWords.length);

    if (!details.answerMatchesExplanation) {
      warnings.push(`Explanation may not match the correct answer choice: "${correctChoice}"`);
    }
  }

  // Check if all choices are distinct
  const uniqueChoices = new Set(question.choices);
  details.choicesAreDistinct = uniqueChoices.size === question.choices.length;
  if (!details.choicesAreDistinct) {
    errors.push('Some choices are duplicated');
  }

  return {
    articleKeywords: [],
    questionType,
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
  };
}

async function runTests() {
  const testCases = [
    { keywords: ['artificial intelligence', 'healthcare'], difficulty: '고3', wordCount: 250 },
    { keywords: ['climate change', 'renewable energy'], difficulty: '고2', wordCount: 200 },
    { keywords: ['social media', 'mental health'], difficulty: '고3', wordCount: 300 },
  ];

  const questionTypes = [
    'PICK_UNDERLINE',
    'GRAMMAR_INCORRECT',
    'PICK_SUBJECT',
    'BLANK_WORD',
  ];

  const results: ValidationResult[] = [];

  console.log('=== Question Generation Validation Test ===\n');

  for (const testCase of testCases) {
    console.log(`\n--- Testing with keywords: ${testCase.keywords.join(', ')} ---\n`);

    try {
      // Generate article
      console.log('Generating article...');
      const article = await generateArticle(testCase.keywords, testCase.difficulty, testCase.wordCount);
      console.log(`Article generated: "${article.title}" (${article.wordCount} words)\n`);

      // Test each question type
      for (const questionType of questionTypes) {
        console.log(`Testing ${questionType}...`);

        try {
          const question = await generateQuestion(article.article, questionType);
          const validation = validateQuestion(question, questionType);
          validation.articleKeywords = testCase.keywords;
          results.push(validation);

          console.log(`  Question: ${question.question}`);
          console.log(`  Answer: ${question.answer} - ${question.choices[question.answer - 1]}`);
          console.log(`  Valid: ${validation.isValid ? 'YES' : 'NO'}`);

          if (validation.errors.length > 0) {
            console.log(`  Errors: ${validation.errors.join('; ')}`);
          }
          if (validation.warnings.length > 0) {
            console.log(`  Warnings: ${validation.warnings.join('; ')}`);
          }

          // For PICK_UNDERLINE, show if underline exists
          if (questionType === 'PICK_UNDERLINE') {
            const underlineMatch = question.modifiedPassage.match(/<u>(.*?)<\/u>/);
            if (underlineMatch) {
              console.log(`  Underlined text: "${underlineMatch[1]}"`);
            }
          }

          console.log('');
        } catch (error: any) {
          console.log(`  ERROR: ${error.message}\n`);
          results.push({
            articleKeywords: testCase.keywords,
            questionType,
            isValid: false,
            errors: [error.message],
            warnings: [],
            details: {},
          });
        }
      }
    } catch (error: any) {
      console.log(`ERROR generating article: ${error.message}\n`);
    }
  }

  // Summary
  console.log('\n=== Summary ===\n');
  const validCount = results.filter(r => r.isValid).length;
  const totalCount = results.length;
  console.log(`Total tests: ${totalCount}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${totalCount - validCount}`);

  const byType: Record<string, { valid: number; total: number }> = {};
  for (const result of results) {
    if (!byType[result.questionType]) {
      byType[result.questionType] = { valid: 0, total: 0 };
    }
    byType[result.questionType].total++;
    if (result.isValid) {
      byType[result.questionType].valid++;
    }
  }

  console.log('\nBy Question Type:');
  for (const [type, stats] of Object.entries(byType)) {
    console.log(`  ${type}: ${stats.valid}/${stats.total} valid`);
  }

  return results;
}

// Export for use as module
export { generateArticle, generateQuestion, validateQuestion, runTests };

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
