/**
 * Test IRRELEVANT_SENTENCE question type
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function generateArticle(keywords) {
  const response = await fetch(`${API_BASE}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords, difficulty: '고3', wordCount: 300 }),
  });
  return response.json();
}

async function generateQuestion(passage, questionType) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage, questionType }),
  });
  return response.json();
}

async function test() {
  console.log('Testing IRRELEVANT_SENTENCE...\n');

  // Generate article
  const article = await generateArticle(['interview skills', 'job preparation']);
  console.log('Article:', article.title);
  console.log('Preview:', article.article.substring(0, 200) + '...\n');

  // Generate question
  const question = await generateQuestion(article.article, 'IRRELEVANT_SENTENCE');

  console.log('='.repeat(60));
  console.log('Question:', question.question);
  console.log('='.repeat(60));
  console.log('\nModified Passage:');
  console.log(question.modifiedPassage);
  console.log('\nChoices:', question.choices);
  console.log('Answer:', question.answer);
  console.log('\nExplanation:', question.explanation);
  console.log('='.repeat(60));

  // Validate
  const hasAllMarkers = ['①', '②', '③', '④', '⑤'].every(m => question.modifiedPassage.includes(m));
  const explanationHasActualTopic = !question.explanation.includes("'주제'");
  const mentionsAnswerNumber = question.explanation.includes(`${question.answer}번`) ||
    question.explanation.includes(['①', '②', '③', '④', '⑤'][question.answer - 1]);

  console.log('\nValidation:');
  console.log('- Has all 5 markers:', hasAllMarkers ? '✅' : '❌');
  console.log('- Explanation has actual topic (not 주제):', explanationHasActualTopic ? '✅' : '❌');
  console.log('- Mentions answer number:', mentionsAnswerNumber ? '✅' : '❌');
}

test().catch(console.error);
