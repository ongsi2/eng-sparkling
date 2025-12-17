/**
 * Full Question Generation Validation Test
 * Tests ALL 12 question types
 * Run with: node tests/full-validation.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

// All 12 question types
const ALL_QUESTION_TYPES = [
  'GRAMMAR_INCORRECT',      // 1. 문법형 (어법상 틀린 것)
  'SELECT_INCORRECT_WORD',  // 2. 틀린 단어 선택형
  'PICK_UNDERLINE',         // 3. 밑줄의 의미형
  'PICK_SUBJECT',           // 4. 주제 뽑기형
  'PICK_TITLE',             // 5. 제목 뽑기형
  'CORRECT_ANSWER',         // 6. 맞는 선지 뽑기
  'INCORRECT_ANSWER',       // 7. 틀린 선지 뽑기
  'BLANK_WORD',             // 8. 빈칸에 들어갈 말
  'COMPLETE_SUMMARY',       // 9. 요약문 완성
  'IRRELEVANT_SENTENCE',    // 10. 무관한 문장
  'INSERT_SENTENCE',        // 11. 문장 삽입
  'SENTENCE_ORDER',         // 12. 글의 순서형
];

async function generateArticle(keywords, difficulty, wordCount) {
  const response = await fetch(`${API_BASE}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, difficulty, wordCount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Article generation failed: ${error.error || error.details}`);
  }

  return response.json();
}

async function generateQuestion(passage, questionType) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage, questionType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Question generation failed: ${error.error || error.details}`);
  }

  return response.json();
}

function validateQuestion(question, questionType) {
  const errors = [];
  const warnings = [];
  const details = {};

  // 1. Check for underline in PICK_UNDERLINE type
  if (questionType === 'PICK_UNDERLINE') {
    details.hasUnderline = question.modifiedPassage.includes('<u>') && question.modifiedPassage.includes('</u>');
    if (!details.hasUnderline) {
      errors.push('PICK_UNDERLINE: Missing <u> tags in modifiedPassage');
    }
  }

  // 2. Check for all 5 markers in GRAMMAR_INCORRECT and SELECT_INCORRECT_WORD
  if (questionType === 'GRAMMAR_INCORRECT' || questionType === 'SELECT_INCORRECT_WORD') {
    const markers = ['①', '②', '③', '④', '⑤'];
    const missingMarkers = markers.filter(m => !question.modifiedPassage.includes(m));
    details.hasAllMarkers = missingMarkers.length === 0;
    if (!details.hasAllMarkers) {
      errors.push(`Missing markers: ${missingMarkers.join(', ')}`);
    }
    // Check each marker appears exactly once
    const duplicateMarkers = markers.filter(m => {
      const count = (question.modifiedPassage.match(new RegExp(m, 'g')) || []).length;
      return count > 1;
    });
    if (duplicateMarkers.length > 0) {
      errors.push(`Duplicate markers: ${duplicateMarkers.join(', ')}`);
    }
  }

  // 3. Check for sentence markers in IRRELEVANT_SENTENCE
  if (questionType === 'IRRELEVANT_SENTENCE') {
    const markers = ['①', '②', '③', '④', '⑤'];
    const missingMarkers = markers.filter(m => !question.modifiedPassage.includes(m));
    details.hasAllMarkers = missingMarkers.length === 0;
    if (!details.hasAllMarkers) {
      warnings.push(`IRRELEVANT_SENTENCE: Missing sentence markers: ${missingMarkers.join(', ')}`);
    }
  }

  // 4. Check for insertion points in INSERT_SENTENCE
  if (questionType === 'INSERT_SENTENCE') {
    const insertMarkers = ['(A)', '(B)', '(C)', '(D)'];
    const missingInsert = insertMarkers.filter(m => !question.modifiedPassage.includes(m));
    details.hasInsertionPoints = missingInsert.length === 0;
    if (!details.hasInsertionPoints) {
      errors.push(`INSERT_SENTENCE: Missing insertion points: ${missingInsert.join(', ')}`);
    }
    // Check sentenceToInsert exists
    if (!question.sentenceToInsert) {
      errors.push('INSERT_SENTENCE: Missing sentenceToInsert field');
    }
  }

  // 5. Check for paragraph markers in SENTENCE_ORDER
  if (questionType === 'SENTENCE_ORDER') {
    const orderMarkers = ['(A)', '(B)', '(C)'];
    const missingOrder = orderMarkers.filter(m => !question.modifiedPassage.includes(m));
    details.hasOrderMarkers = missingOrder.length === 0;
    if (!details.hasOrderMarkers) {
      errors.push(`SENTENCE_ORDER: Missing paragraph markers: ${missingOrder.join(', ')}`);
    }
  }

  // 6. Check for blanks in BLANK_WORD and COMPLETE_SUMMARY
  if (questionType === 'BLANK_WORD' || questionType === 'COMPLETE_SUMMARY') {
    const hasBlankA = question.modifiedPassage.includes('(A)');
    const hasBlankB = question.modifiedPassage.includes('(B)');
    details.hasBlanks = hasBlankA || hasBlankB;
    if (!details.hasBlanks) {
      warnings.push(`${questionType}: No (A) or (B) blanks found in passage`);
    }
  }

  // 7. Check if answer is valid
  const maxChoices = questionType === 'INSERT_SENTENCE' ? 4 : 5;
  if (question.answer < 1 || question.answer > maxChoices) {
    errors.push(`Answer ${question.answer} is out of valid range (1-${maxChoices})`);
  }

  // 8. Check if explanation mentions the answer number
  const correctSymbol = ['①', '②', '③', '④', '⑤'][question.answer - 1];
  const answerPatterns = [
    `${question.answer}번`,
    correctSymbol,
    new RegExp(`정답.*${question.answer}`),
  ];
  details.explanationMentionsAnswer = answerPatterns.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(question.explanation);
    }
    return question.explanation.includes(pattern);
  });

  if (!details.explanationMentionsAnswer) {
    warnings.push('Explanation does not explicitly mention the answer number');
  }

  // 9. Check for answer/explanation mismatch
  const allSymbols = ['①', '②', '③', '④', '⑤'];
  const wrongSymbols = allSymbols.filter((s, i) => i !== question.answer - 1);
  const mentionsWrongAnswer = wrongSymbols.some(symbol => {
    const wrongPattern = new RegExp(`정답[은는이가]?\\s*${symbol}`);
    return wrongPattern.test(question.explanation);
  });
  if (mentionsWrongAnswer) {
    errors.push(`CRITICAL: Explanation references different answer than ${correctSymbol}!`);
  }

  // 10. Check distinct choices
  const uniqueChoices = new Set(question.choices);
  details.choicesAreDistinct = uniqueChoices.size === question.choices.length;
  if (!details.choicesAreDistinct) {
    errors.push('Some choices are duplicated');
  }

  // 11. Check if explanation contains <u> tags (should not)
  if (question.explanation.includes('<u>') || question.explanation.includes('</u>')) {
    errors.push('Explanation contains HTML <u> tags');
  }

  // 12. Check choices count
  details.correctChoiceCount = question.choices.length === maxChoices;
  if (!details.correctChoiceCount) {
    errors.push(`Expected ${maxChoices} choices, got ${question.choices.length}`);
  }

  return {
    questionType,
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
    question: question.question,
    answer: question.answer,
    correctChoice: question.choices[question.answer - 1],
    explanation: question.explanation.substring(0, 100) + '...',
  };
}

async function runSingleTest(article, questionType) {
  console.log(`\n  Testing: ${questionType}`);
  console.log(`  ${'─'.repeat(50)}`);

  try {
    const startTime = Date.now();
    const question = await generateQuestion(article.article, questionType);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`  ⏱  Generated in ${duration}s`);
    console.log(`  Q: ${question.question.substring(0, 50)}...`);
    console.log(`  Answer: ${question.answer} - ${(question.choices[question.answer - 1] || '').substring(0, 30)}...`);

    // Validate
    const validation = validateQuestion(question, questionType);

    if (validation.errors.length > 0) {
      console.log(`  ❌ ERRORS:`);
      validation.errors.forEach(e => console.log(`     - ${e}`));
    }

    if (validation.warnings.length > 0) {
      console.log(`  ⚠  WARNINGS:`);
      validation.warnings.forEach(w => console.log(`     - ${w}`));
    }

    console.log(`  Result: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);

    return validation;
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    return {
      questionType,
      isValid: false,
      errors: [error.message],
      warnings: [],
      details: {},
    };
  }
}

async function runAllTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('  FULL QUESTION GENERATION VALIDATION TEST');
  console.log('  Testing all 12 question types');
  console.log('═'.repeat(60));

  // Generate one article to use for all tests
  console.log('\n📝 Generating test article...');
  let article;
  try {
    article = await generateArticle(['technology', 'innovation', 'society'], '고3', 300);
    console.log(`   Title: ${article.title}`);
    console.log(`   Words: ${article.wordCount}`);
    console.log(`   Preview: ${article.article.substring(0, 100)}...`);
  } catch (error) {
    console.error(`\n❌ Failed to generate article: ${error.message}`);
    process.exit(1);
  }

  const results = [];

  console.log('\n' + '─'.repeat(60));
  console.log('  Running tests for each question type...');
  console.log('─'.repeat(60));

  for (const questionType of ALL_QUESTION_TYPES) {
    const result = await runSingleTest(article, questionType);
    results.push({ ...result, questionType });
  }

  // Summary
  console.log('\n\n' + '═'.repeat(60));
  console.log('  SUMMARY');
  console.log('═'.repeat(60));

  const valid = results.filter(r => r.isValid).length;
  const invalid = results.filter(r => !r.isValid).length;
  const withWarnings = results.filter(r => r.warnings.length > 0).length;

  console.log(`\n  Total:    ${results.length} tests`);
  console.log(`  ✅ Valid:   ${valid}`);
  console.log(`  ❌ Invalid: ${invalid}`);
  console.log(`  ⚠  Warnings: ${withWarnings}`);

  // List results by status
  console.log('\n  Results by type:');
  console.log('  ' + '─'.repeat(50));

  results.forEach(r => {
    const status = r.isValid ? '✅' : '❌';
    const warn = r.warnings.length > 0 ? ` ⚠(${r.warnings.length})` : '';
    console.log(`  ${status} ${r.questionType}${warn}`);
  });

  if (invalid > 0) {
    console.log('\n  ❌ Failed tests details:');
    console.log('  ' + '─'.repeat(50));
    results.filter(r => !r.isValid).forEach(r => {
      console.log(`\n  ${r.questionType}:`);
      r.errors.forEach(e => console.log(`    - ${e}`));
    });
  }

  if (withWarnings > 0) {
    console.log('\n  ⚠  Tests with warnings:');
    console.log('  ' + '─'.repeat(50));
    results.filter(r => r.warnings.length > 0).forEach(r => {
      console.log(`\n  ${r.questionType}:`);
      r.warnings.forEach(w => console.log(`    - ${w}`));
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  Final Score: ${valid}/${results.length} (${Math.round(valid/results.length*100)}%)`);
  console.log('═'.repeat(60) + '\n');

  return results;
}

// Run tests
runAllTests().catch(console.error);
