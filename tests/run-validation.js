/**
 * Question Generation Validation Test (Node.js)
 * Run with: node tests/run-validation.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

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

  // Check for underline in PICK_UNDERLINE type
  if (questionType === 'PICK_UNDERLINE') {
    details.hasUnderline = question.modifiedPassage.includes('<u>') && question.modifiedPassage.includes('</u>');
    if (!details.hasUnderline) {
      errors.push('PICK_UNDERLINE question is missing <u> tags in modifiedPassage');
    }
  }

  // Check for all 5 markers in GRAMMAR_INCORRECT type
  if (questionType === 'GRAMMAR_INCORRECT' || questionType === 'SELECT_INCORRECT_WORD') {
    const markers = ['①', '②', '③', '④', '⑤'];
    const missingMarkers = markers.filter(m => !question.modifiedPassage.includes(m));
    details.hasAllMarkers = missingMarkers.length === 0;
    if (!details.hasAllMarkers) {
      errors.push(`Missing markers in passage: ${missingMarkers.join(', ')}`);
    }
    // Check each marker appears exactly once
    const duplicateMarkers = markers.filter(m => {
      const count = (question.modifiedPassage.match(new RegExp(m, 'g')) || []).length;
      return count > 1;
    });
    if (duplicateMarkers.length > 0) {
      errors.push(`Duplicate markers found: ${duplicateMarkers.join(', ')}`);
    }
  }

  // Check if answer is valid
  const maxChoices = questionType === 'INSERT_SENTENCE' ? 4 : 5;
  if (question.answer < 1 || question.answer > maxChoices) {
    errors.push(`Answer ${question.answer} is out of valid range (1-${maxChoices})`);
  }

  // Check if explanation mentions the answer number or related content
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

  // CRITICAL: Check if explanation mentions a DIFFERENT answer number (mismatch)
  const allSymbols = ['①', '②', '③', '④', '⑤'];
  const wrongSymbols = allSymbols.filter((s, i) => i !== question.answer - 1);
  const mentionsWrongAnswer = wrongSymbols.some(symbol => {
    // Check if wrong symbol appears in context of "정답" or as answer reference
    const wrongPattern = new RegExp(`['"]?${symbol}[^①②③④⑤]*?(을|를|이|가|은|는)`);
    return wrongPattern.test(question.explanation);
  });
  if (mentionsWrongAnswer) {
    errors.push(`CRITICAL: Explanation references a different answer number than ${correctSymbol}!`);
  }

  // Check if explanation content relates to the correct answer
  const correctChoice = question.choices[question.answer - 1];
  if (correctChoice) {
    const choiceWords = correctChoice.split(/\s+/).filter(w => w.length > 2);
    const explanationLower = question.explanation.toLowerCase();
    const matchingWords = choiceWords.filter(w => explanationLower.includes(w.toLowerCase()));
    details.answerMatchesExplanation = matchingWords.length >= Math.min(2, Math.ceil(choiceWords.length / 2));

    if (!details.answerMatchesExplanation) {
      warnings.push(`Explanation may not match the correct answer: "${correctChoice}"`);
    }
  }

  // Check distinct choices
  const uniqueChoices = new Set(question.choices);
  details.choicesAreDistinct = uniqueChoices.size === question.choices.length;
  if (!details.choicesAreDistinct) {
    errors.push('Some choices are duplicated');
  }

  // Check for semantically similar choices (basic keyword overlap check)
  const checkSemanticSimilarity = (choices) => {
    const similar = [];
    for (let i = 0; i < choices.length; i++) {
      for (let j = i + 1; j < choices.length; j++) {
        const words1 = choices[i].split(/\s+/).filter(w => w.length > 1);
        const words2 = choices[j].split(/\s+/).filter(w => w.length > 1);
        const overlap = words1.filter(w => words2.includes(w));
        // If more than 50% words overlap, flag as potentially similar
        if (overlap.length > Math.min(words1.length, words2.length) * 0.5 && overlap.length >= 2) {
          similar.push(`Choice ${i+1} and ${j+1} may be semantically similar`);
        }
      }
    }
    return similar;
  };
  const similarWarnings = checkSemanticSimilarity(question.choices);
  if (similarWarnings.length > 0) {
    warnings.push(...similarWarnings);
  }

  // Check if explanation contains <u> tags (should not)
  if (question.explanation.includes('<u>') || question.explanation.includes('</u>')) {
    errors.push('Explanation contains HTML <u> tags which should not be visible');
  }

  return {
    questionType,
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
    question: question.question,
    answer: question.answer,
    correctChoice,
    explanation: question.explanation,
  };
}

async function runSingleTest(keywords, questionType) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${questionType} with keywords [${keywords.join(', ')}]`);
  console.log('='.repeat(60));

  try {
    // Generate article
    console.log('\n1. Generating article...');
    const article = await generateArticle(keywords, '고3', 250);
    console.log(`   Title: ${article.title}`);
    console.log(`   Words: ${article.wordCount}`);
    console.log(`   Preview: ${article.article.substring(0, 150)}...`);

    // Generate question
    console.log(`\n2. Generating ${questionType} question...`);
    const question = await generateQuestion(article.article, questionType);

    console.log(`\n3. Generated Question:`);
    console.log(`   Q: ${question.question}`);

    if (questionType === 'PICK_UNDERLINE') {
      const underlineMatch = question.modifiedPassage.match(/<u>(.*?)<\/u>/);
      if (underlineMatch) {
        console.log(`   Underlined: "${underlineMatch[1]}"`);
      } else {
        console.log(`   WARNING: No underline found!`);
      }
    }

    console.log(`\n   Choices:`);
    question.choices.forEach((choice, i) => {
      const marker = (i + 1) === question.answer ? ' ✓' : '';
      console.log(`     ${i + 1}. ${choice}${marker}`);
    });

    console.log(`\n   Answer: ${question.answer} - ${question.choices[question.answer - 1]}`);
    console.log(`   Explanation: ${question.explanation}`);

    // Validate
    console.log(`\n4. Validation:`);
    const validation = validateQuestion(question, questionType);

    if (validation.errors.length > 0) {
      console.log(`   ERRORS:`);
      validation.errors.forEach(e => console.log(`     - ${e}`));
    }

    if (validation.warnings.length > 0) {
      console.log(`   WARNINGS:`);
      validation.warnings.forEach(w => console.log(`     - ${w}`));
    }

    console.log(`   Details:`, JSON.stringify(validation.details, null, 2).split('\n').map((l, i) => i === 0 ? l : '   ' + l).join('\n'));
    console.log(`\n   RESULT: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);

    return validation;
  } catch (error) {
    console.log(`\n   ERROR: ${error.message}`);
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
  console.log('\n' + '='.repeat(60));
  console.log('  QUESTION GENERATION VALIDATION TEST');
  console.log('='.repeat(60));

  const testCases = [
    { keywords: ['artificial intelligence', 'healthcare'], types: ['GRAMMAR_INCORRECT'] },
    { keywords: ['climate change', 'technology'], types: ['GRAMMAR_INCORRECT'] },
    { keywords: ['education', 'digital learning'], types: ['GRAMMAR_INCORRECT'] },
  ];

  const results = [];

  for (const testCase of testCases) {
    for (const type of testCase.types) {
      const result = await runSingleTest(testCase.keywords, type);
      results.push({ ...result, keywords: testCase.keywords });
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));

  const valid = results.filter(r => r.isValid).length;
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Valid: ${valid}`);
  console.log(`Invalid: ${results.length - valid}`);

  if (results.length - valid > 0) {
    console.log(`\nFailed tests:`);
    results.filter(r => !r.isValid).forEach(r => {
      console.log(`  - ${r.questionType} [${r.keywords?.join(', ')}]: ${r.errors.join(', ')}`);
    });
  }

  return results;
}

// Run tests
runAllTests().catch(console.error);
