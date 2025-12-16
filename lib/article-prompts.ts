/**
 * Article Generation Prompts
 * 키워드로 영어 아티클 생성
 */

export const ARTICLE_GENERATION_PROMPT = `
You are an expert English content writer specializing in creating educational articles for Korean high school students.

**Task:** Generate an English article based on the given keywords, difficulty level, and word count.

**Requirements:**

1. **Topic & Keywords:**
   - Use ALL provided keywords naturally in the article
   - The keywords should flow naturally, not feel forced
   - Create a coherent, informative article

2. **Difficulty Level:**
   - 중학생: Use simple vocabulary (elementary level), short sentences, present tense mainly
   - 고1: Use intermediate vocabulary, mix of sentence structures
   - 고2: Use advanced vocabulary, complex sentences, various tenses
   - 고3/수능: Use college-level vocabulary, sophisticated grammar, suitable for Korean SAT

3. **Word Count:**
   - Target: {wordCount} words (±20 words is acceptable)
   - For 200-300 words: 2-3 paragraphs
   - For 300-500 words: 3-4 paragraphs

4. **Content Quality:**
   - Grammatically PERFECT (no errors)
   - Factually accurate or plausible
   - Interesting and educational
   - Suitable for exam passage

5. **Structure:**
   - Clear introduction
   - Well-developed body
   - Brief conclusion (if word count allows)

**Input:**
- Keywords: {keywords}
- Difficulty: {difficulty}
- Word Count: {wordCount}

**Output JSON format:**
{
  "article": "The complete English article text here...",
  "wordCount": 285,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "difficulty": "고3",
  "title": "Suggested title for the article"
}

**Example:**

Input:
- Keywords: ["artificial intelligence", "healthcare", "diagnosis"]
- Difficulty: 고3
- Word Count: 300

Output:
{
  "article": "Artificial intelligence is revolutionizing healthcare in ways that were unimaginable just a decade ago. One of the most promising applications is in medical diagnosis, where AI systems can analyze patient data with remarkable accuracy. These systems process thousands of medical images, lab results, and patient histories to identify patterns that might escape even experienced doctors.\\n\\nThe integration of AI in healthcare has led to earlier detection of diseases such as cancer and heart conditions. Machine learning algorithms can spot subtle anomalies in X-rays and MRI scans, often before symptoms appear. This early diagnosis capability has proven crucial in improving patient outcomes and survival rates.\\n\\nHowever, the adoption of AI in medical diagnosis also raises important questions about the role of human doctors, data privacy, and the need for regulatory frameworks. As these technologies continue to evolve, finding the right balance between automation and human expertise will be essential.",
  "wordCount": 298,
  "keywords": ["artificial intelligence", "healthcare", "diagnosis"],
  "difficulty": "고3",
  "title": "The Role of Artificial Intelligence in Modern Healthcare Diagnosis"
}

**Critical Rules:**
- Article must be grammatically PERFECT
- Use ALL keywords naturally
- Match the target word count (±20 words)
- Match the difficulty level vocabulary
- Return ONLY valid JSON, no markdown

Generate the article now:
`;

export interface ArticleRequest {
  keywords: string[];
  difficulty: '중학생' | '고1' | '고2' | '고3';
  wordCount: number;
}

export interface ArticleResponse {
  article: string;
  wordCount: number;
  keywords: string[];
  difficulty: string;
  title: string;
}

export function createArticlePrompt(request: ArticleRequest): string {
  return ARTICLE_GENERATION_PROMPT
    .replace('{keywords}', request.keywords.join(', '))
    .replace('{difficulty}', request.difficulty)
    .replace('{wordCount}', request.wordCount.toString())
    .replace('{wordCount}', request.wordCount.toString()); // 두 번 나옴
}
