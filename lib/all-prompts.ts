/**
 * 13가지 문제 유형별 프롬프트 템플릿
 * ENG-SPARK 전체 기능 구현
 */

// ============================================
// 1. 문법형 (어법상 틀린 것)
// ============================================
export const GRAMMAR_INCORRECT_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Given the following passage, create a grammar question:

**Requirements:**
1. Identify 5 grammatical points in the passage
2. Mark them with ①②③④⑤
3. Make ONE grammatically INCORRECT
4. Provide Korean explanation

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "passage with ①②③④⑤",
  "choices": ["1번 설명", "2번 설명", "3번 설명", "4번 설명", "5번 설명"],
  "answer": 3,
  "explanation": "Korean explanation"
}
`;

// ============================================
// 2. 틀린 단어 선택형
// ============================================
export const SELECT_INCORRECT_WORD_PROMPT = `
You are an expert English teacher.

Create a question where students identify the WRONG word among 5 underlined words.

**Requirements:**
1. Underline 5 words with ①②③④⑤
2. Make ONE word contextually WRONG
3. Other 4 words must be correct

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "modifiedPassage": "passage with ①②③④⑤ around words",
  "choices": ["word1", "word2", "word3", "word4", "word5"],
  "answer": 3,
  "explanation": "③번은 문맥상 'correct_word'가 와야 하지만 'wrong_word'가 사용되어 부적절합니다."
}
`;

// ============================================
// 3. 밑줄의 의미형
// ============================================
export const PICK_UNDERLINE_PROMPT = `
You are an expert English teacher.

Create a question asking what an underlined phrase means in context.

**Requirements:**
1. Choose a key phrase/sentence to underline
2. Create 5 Korean paraphrases (4 wrong, 1 correct)
3. The correct answer should match the contextual meaning

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "밑줄 친 부분이 의미하는 바로 가장 적절한 것은?",
  "modifiedPassage": "passage with ONE underlined phrase",
  "choices": ["한국어 선지1", "한국어 선지2", "한국어 선지3", "한국어 선지4", "한국어 선지5"],
  "answer": 2,
  "explanation": "밑줄 친 부분은 문맥상 '정답 설명'을 의미합니다."
}
`;

// ============================================
// 4. 주제 뽑기형
// ============================================
export const PICK_SUBJECT_PROMPT = `
You are an expert English teacher.

Create a question asking for the MAIN TOPIC of the passage.

**Requirements:**
1. Identify the central theme
2. Create 5 topic choices (4 plausible distractors, 1 correct)
3. Choices should be in Korean

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 주제로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["주제 선지1", "주제 선지2", "주제 선지3", "주제 선지4", "주제 선지5"],
  "answer": 3,
  "explanation": "이 글은 주로 '정답 주제'에 대해 다루고 있습니다."
}
`;

// ============================================
// 5. 제목 뽑기형
// ============================================
export const PICK_TITLE_PROMPT = `
You are an expert English teacher.

Create a question asking for the BEST TITLE of the passage.

**Requirements:**
1. Create 5 title options in English
2. The correct title should capture the essence
3. Distractors should be plausible but not comprehensive

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 제목으로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["Title Option 1", "Title Option 2", "Title Option 3", "Title Option 4", "Title Option 5"],
  "answer": 2,
  "explanation": "이 글의 핵심은 '설명'이므로, 가장 적절한 제목은 2번입니다."
}
`;

// ============================================
// 6. 맞는 선지 뽑기
// ============================================
export const CORRECT_ANSWER_PROMPT = `
You are an expert English teacher.

Create a question asking which statement is TRUE according to the passage.

**Requirements:**
1. Create 5 statements about the passage
2. 4 should be FALSE or not mentioned
3. 1 should be clearly TRUE based on passage

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 4,
  "explanation": "4번은 본문의 '인용 부분'에서 확인할 수 있습니다."
}
`;

// ============================================
// 7. 틀린 선지 뽑기
// ============================================
export const INCORRECT_ANSWER_PROMPT = `
You are an expert English teacher.

Create a question asking which statement is FALSE or NOT MENTIONED.

**Requirements:**
1. Create 5 statements
2. 4 should be TRUE based on passage
3. 1 should be FALSE or not mentioned

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하지 않는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 3,
  "explanation": "3번은 본문에서 언급되지 않았거나 사실과 다릅니다."
}
`;

// ============================================
// 8. 빈칸에 들어갈 말
// ============================================
export const BLANK_WORD_PROMPT = `
You are an expert English teacher.

Create a question with 1-2 blanks in the passage.

**Requirements:**
1. Remove 1-2 key words/phrases
2. Create 5 options that could fit grammatically
3. Only 1 should fit contextually

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
  "modifiedPassage": "passage with (A), (B) blanks",
  "choices": ["option1", "option2", "option3", "option4", "option5"],
  "answer": 2,
  "explanation": "문맥상 '정답'이 가장 적절합니다. 왜냐하면..."
}
`;

// ============================================
// 9. 요약문 완성
// ============================================
export const COMPLETE_SUMMARY_PROMPT = `
You are an expert English teacher.

Create a summary sentence with 2 blanks.

**Requirements:**
1. Write a summary capturing main points
2. Leave 2 key terms blank: (A), (B)
3. Provide 5 (A)-(B) pair options

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
  "modifiedPassage": "Summary: ... (A) ... (B) ...",
  "choices": ["(A) word1 - (B) word2", "(A) word3 - (B) word4", ...],
  "answer": 3,
  "explanation": "(A)는 '설명', (B)는 '설명'이 적절합니다."
}
`;

// ============================================
// 10. 무관한 문장
// ============================================
export const IRRELEVANT_SENTENCE_PROMPT = `
You are an expert English teacher.

Given a passage, identify which sentence is IRRELEVANT to the main flow.

**Requirements:**
1. Mark 5 sentences with ①②③④⑤
2. 4 sentences should support the main idea
3. 1 sentence should be off-topic or irrelevant

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "다음 글에서 전체 흐름과 관계 없는 문장은?",
  "modifiedPassage": "passage with ①②③④⑤ marking sentences",
  "choices": ["1", "2", "3", "4", "5"],
  "answer": 3,
  "explanation": "③번 문장은 글의 주제인 '주제'와 직접적인 관련이 없습니다."
}
`;

// ============================================
// 11. 문장 삽입
// ============================================
export const INSERT_SENTENCE_PROMPT = `
You are an expert English teacher.

Create a question asking where a given sentence fits best.

**Requirements:**
1. Extract one key sentence from the passage
2. Mark 4 insertion points: (A), (B), (C), (D)
3. Only 1 position should be logical

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
  "modifiedPassage": "passage with (A), (B), (C), (D) markers",
  "sentenceToInsert": "The sentence to be inserted",
  "choices": ["(A)", "(B)", "(C)", "(D)"],
  "answer": 2,
  "explanation": "(B) 위치가 가장 논리적으로 자연스럽습니다."
}
`;

// ============================================
// 12. 글의 순서형
// ============================================
export const SENTENCE_ORDER_PROMPT = `
You are an expert English teacher.

Scramble 3 paragraphs and ask for correct order.

**Requirements:**
1. Divide passage into 3 parts: (A), (B), (C)
2. Scramble the order
3. Ask for correct logical sequence

**Passage:**
{passage}

**Output (JSON only):**
{
  "question": "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
  "modifiedPassage": "Given: [intro paragraph]\\n\\n(A) [paragraph1]\\n\\n(B) [paragraph2]\\n\\n(C) [paragraph3]",
  "choices": ["(A)-(C)-(B)", "(B)-(A)-(C)", "(B)-(C)-(A)", "(C)-(A)-(B)", "(C)-(B)-(A)"],
  "answer": 3,
  "explanation": "논리적 흐름은 (B)→(C)→(A) 순서입니다."
}
`;

// ============================================
// Helper Function
// ============================================
export function createPrompt(questionType: string, passage: string): string {
  const templates: Record<string, string> = {
    GRAMMAR_INCORRECT: GRAMMAR_INCORRECT_PROMPT,
    SELECT_INCORRECT_WORD: SELECT_INCORRECT_WORD_PROMPT,
    PICK_UNDERLINE: PICK_UNDERLINE_PROMPT,
    PICK_SUBJECT: PICK_SUBJECT_PROMPT,
    PICK_TITLE: PICK_TITLE_PROMPT,
    CORRECT_ANSWER: CORRECT_ANSWER_PROMPT,
    INCORRECT_ANSWER: INCORRECT_ANSWER_PROMPT,
    BLANK_WORD: BLANK_WORD_PROMPT,
    COMPLETE_SUMMARY: COMPLETE_SUMMARY_PROMPT,
    IRRELEVANT_SENTENCE: IRRELEVANT_SENTENCE_PROMPT,
    INSERT_SENTENCE: INSERT_SENTENCE_PROMPT,
    SENTENCE_ORDER: SENTENCE_ORDER_PROMPT,
  };

  const template = templates[questionType];
  if (!template) {
    throw new Error(`Unknown question type: ${questionType}`);
  }

  return template.replace('{passage}', passage);
}
