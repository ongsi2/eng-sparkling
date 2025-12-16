/**
 * Prompt Templates for Question Generation
 */

export const GRAMMAR_PROMPT_TEMPLATE = `
You are an expert English teacher specializing in Korean SAT (수능) style grammar questions.

**Task:** Create a grammar question where students identify the ONE grammatically INCORRECT part among 5 underlined portions.

**Step-by-step instructions:**

1. **Read the passage carefully** and identify 5 distinct grammatical structures (verb forms, subject-verb agreement, articles, prepositions, relative pronouns, etc.)

2. **Choose ONE grammatical point to make INCORRECT**
   - The error should be a clear grammatical mistake (not stylistic)
   - Common errors: subject-verb disagreement, wrong verb tense, incorrect preposition, article error, pronoun error
   - Example: "have been" → "has been" (subject-verb disagreement)

3. **Modify the passage and mark ALL 5 grammatical points:**
   - Mark EXACTLY 5 grammatical points with ①②③④⑤
   - Keep 4 grammatical points CORRECT (as they are in original)
   - Change 1 grammatical point to be CLEARLY WRONG
   - ALL 5 NUMBERS (①②③④⑤) MUST APPEAR IN THE PASSAGE
   - Example: "Scientists ①has warned us for decades, but many ②fail to ③take the threat ④seriously because of ⑤their busy lives."

4. **Create descriptive choices** that explain what each circled part represents (NOT just "첫 번째 부분")
   - Example: "have been warning (현재완료 진행형)"

5. **Write a Korean explanation:**
   - State which number is wrong
   - Explain WHY it's wrong
   - Provide the CORRECT form
   - Example: "③번은 주어 'ice caps'가 복수이므로 'melt'가 아니라 'melts'가 와야 합니다."

**Original Passage:**
{passage}

**Output JSON format:**
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "MUST contain ALL FIVE numbers ①②③④⑤ marking different grammatical points. Example: 'Scientists ①has warned us about climate change for decades, but many people still ②fail to ③take the threat ④seriously. The ⑤rising temperatures are dangerous.'",
  "choices": [
    "has warned (현재완료)",
    "fail (동사 원형)",
    "take (동사 원형)",
    "seriously (부사)",
    "rising (현재분사)"
  ],
  "answer": 1,
  "explanation": "①번은 주어 'Scientists'가 복수이므로 'has'가 아니라 'have'가 와야 합니다. 올바른 형태는 'have warned'입니다."
}

**Critical Rules:**
- MUST mark EXACTLY 5 grammatical points with ①②③④⑤
- ONE and ONLY ONE grammatical point must be WRONG
- The other 4 MUST be grammatically CORRECT
- All 5 numbers MUST appear in modifiedPassage
- The choices array must describe all 5 marked points
- The error must be an actual grammar mistake, not a preference
- Return ONLY valid JSON, no markdown, no code blocks

**Few-Shot Examples:**

Example 1:
Original: "Scientists have warned us about climate change for decades, but many people still fail to take the threat seriously."
Modified: "Scientists ①has warned us about climate change for decades, but many people still ②fail to ③take the threat ④seriously. Climate change ⑤is a major issue."
Output:
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "Scientists ①has warned us about climate change for decades, but many people still ②fail to ③take the threat ④seriously. Climate change ⑤is a major issue.",
  "choices": ["has warned (현재완료)", "fail (동사 원형)", "take (동사 원형)", "seriously (부사)", "is (be동사)"],
  "answer": 1,
  "explanation": "①번은 주어 'Scientists'가 복수이므로 'has'가 아니라 'have'가 와야 합니다. 올바른 형태는 'Scientists have warned'입니다."
}

Example 2:
Original: "The book on the table belongs to my sister. She bought it last week."
Modified: "The book on the table ①belong to my sister. She ②bought ③it last week and ④has been reading ⑤them every day."
Output:
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "The book on the table ①belong to my sister. She ②bought ③it last week and ④has been reading ⑤them every day.",
  "choices": ["belong (동사)", "bought (과거형)", "it (대명사)", "has been reading (현재완료 진행형)", "them (대명사)"],
  "answer": 1,
  "explanation": "①번은 주어 'The book'이 단수이므로 'belong'이 아니라 'belongs'가 와야 합니다."
}

Now create a similar question for the passage below:
`;

export function createGrammarPrompt(passage: string): string {
  return GRAMMAR_PROMPT_TEMPLATE.replace('{passage}', passage);
}
