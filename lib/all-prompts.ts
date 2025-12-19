/**
 * 13가지 문제 유형별 프롬프트 템플릿
 * ENG-SPARK 전체 기능 구현
 */

/**
 * ========================================
 * GLOBAL RULES FOR ALL QUESTION TYPES
 * ========================================
 *
 * 1. **CHOICES ARRAY MUST NEVER INCLUDE ANSWER INDICATORS**
 *    - WRONG: ["peaceful (정답)", "hostile (오답)", ...]
 *    - WRONG: ["단순한 단 성분 (오답)", "건강에 해로운 주범 (정답)", ...]
 *    - CORRECT: ["peaceful", "hostile", "chaotic", "isolated", "harsh"]
 *
 * 2. **NEVER USE HTML TAGS IN EXPLANATION FIELD**
 *    - Use single quotes '...' for emphasis
 *    - Use \\n\\n for paragraph breaks
 *
 * 3. **ANSWER FIELD MUST MATCH THE EXPLANATION**
 *    - If explanation says "정답은 ③번", answer must be 3
 */

// ============================================
// 1. 문법형 (어법상 틀린 것)
// ============================================
export const GRAMMAR_INCORRECT_PROMPT = `
You are creating a Korean SAT (수능) grammar question.

TASK: Select EXACTLY 5 words from the passage for grammar marking. ONE must be WRONG, FOUR must be CORRECT.

**Passage:**
{passage}

**INSTRUCTIONS:**
1. Find 5 words to mark for grammar checking (verbs, pronouns, prepositions, articles, etc.)
2. For 4 words: keep them CORRECT (original form)
3. For 1 word: change it to WRONG form (create a grammatical error)
4. Return the positions where markers should be inserted

**RESPONSE FORMAT:**
Return a JSON with markers array. Each marker object must have:
- "position": the exact word AFTER which to place the marker (must exist in passage)
- "displayWord": the word to show (either original word if correct, or changed wrong form)
- "isWrong": true if this is the wrong answer, false if correct
- "originalWord": the original word from the passage (only needed if isWrong is true)
- "grammarNote": brief grammar explanation

**Example:**
For passage: "Students learn every day. The teacher helps them understand."

{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "markers": [
    {"position": "Students", "displayWord": "learn", "isWrong": false, "grammarNote": "plural subject + base verb"},
    {"position": "The teacher", "displayWord": "helps", "isWrong": false, "grammarNote": "singular subject + -s"},
    {"position": "helps them", "displayWord": "understanding", "isWrong": true, "originalWord": "understand", "grammarNote": "should be infinitive after help"},
    {"position": "Learning", "displayWord": "is", "isWrong": false, "grammarNote": "gerund subject + singular verb"},
    {"position": "important for", "displayWord": "everyone", "isWrong": false, "grammarNote": "correct pronoun"}
  ],
  "answer": 3,
  "explanation": "정답은 ③번입니다. 'understanding' → 'understand'로 고쳐야 합니다. help 뒤에는 동사원형이 와야 합니다."
}

**CRITICAL RULES:**
- markers array MUST have EXACTLY 5 items
- EXACTLY 1 marker must have isWrong: true
- answer must be the index+1 of the wrong marker (1-5)
- displayWord must be a single word that exists or could exist at that position
- **NEVER use HTML tags in explanation. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "markers": [5 marker objects as described above],
  "answer": [1-5, the wrong marker number],
  "explanation": "정답은 [N]번입니다. '[틀린형태]' → '[올바른형태]'로 고쳐야 합니다. [문법 설명]"
}
`;

// ============================================
// 2. 틀린 단어 선택형
// ============================================
export const SELECT_INCORRECT_WORD_PROMPT = `
You are creating a Korean SAT (수능) vocabulary-in-context question.

TASK: Create a question where students identify ONE contextually WRONG word among 5 underlined words.

**Passage:**
{passage}

**WHAT YOU MUST DO:**
1. Pick 5 meaningful words from the passage
2. For 4 words: Keep them as-is (CORRECT words)
3. For 1 word: REPLACE it with a WRONG word that looks plausible but doesn't fit the context
4. The WRONG word will be shown in the passage, and students must identify it

**CRITICAL FIELD DEFINITIONS:**
- "originalWord": The word that EXISTS in the original passage (what you're replacing)
- "displayWord": The word to SHOW in the modified passage
  - If isWrong=false: displayWord = originalWord (keep the same)
  - If isWrong=true: displayWord = the NEW WRONG word (different from originalWord)
- "correctWord": Only for isWrong=true, same as originalWord (the correct answer)

**Example:**
Original passage: "The scientist conducted a careful experiment to prove his theory."

For the WRONG marker (isWrong=true):
- originalWord: "prove" (exists in original passage)
- displayWord: "disprove" (WRONG word to show - this replaces "prove")
- correctWord: "prove" (the correct word = originalWord)
- Result: Passage shows "disprove" but correct answer is "prove"

{
  "question": "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "markers": [
    {"originalWord": "careful", "displayWord": "careful", "isWrong": false, "contextNote": "careful fits"},
    {"originalWord": "experiment", "displayWord": "experiment", "isWrong": false, "contextNote": "experiment fits"},
    {"originalWord": "prove", "displayWord": "disprove", "isWrong": true, "correctWord": "prove", "contextNote": "disprove doesn't fit - scientist wants to validate, not invalidate"},
    {"originalWord": "his", "displayWord": "his", "isWrong": false, "contextNote": "his fits"},
    {"originalWord": "theory", "displayWord": "theory", "isWrong": false, "contextNote": "theory fits"}
  ],
  "answer": 3,
  "explanation": "정답은 ③번입니다. 'disprove(반증하다)'는 문맥상 'prove(증명하다)'가 와야 합니다. 과학자는 자신의 이론을 증명하려는 것이지 반증하려는 것이 아닙니다."
}

**VALIDATION CHECKLIST (verify before responding):**
✓ markers array has EXACTLY 5 items
✓ EXACTLY 1 marker has isWrong: true
✓ For isWrong=true: displayWord ≠ originalWord (they must be DIFFERENT)
✓ For isWrong=true: correctWord = originalWord
✓ For isWrong=false: displayWord = originalWord (they must be THE SAME)
✓ answer = index+1 of the isWrong marker
✓ explanation mentions displayWord as wrong and correctWord as the answer
✓ **NEVER use HTML tags (<u>, <b>, etc.) in explanation - use single quotes '...' instead**

**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "markers": [5 marker objects],
  "answer": [1-5],
  "explanation": "정답은 [N]번입니다. '[displayWord]'는 문맥상 '[correctWord]'가 와야 합니다. [이유]"
}
`;

// ============================================
// 3. 밑줄의 의미형
// ============================================
export const PICK_UNDERLINE_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking what an underlined phrase/expression means in context.

**CRITICAL - DIFFICULTY REQUIREMENTS:**
DO NOT choose simple words that can be directly translated!
- BAD: "fight" → "싸우다" (too easy, 1:1 translation)
- BAD: "love" → "사랑하다" (too obvious)
- BAD: "run" → "달리다" (direct translation)
- BAD: Foreign words/transliterations like "yangchi", "kimchi", "hanbok" → These are just translations of Korean words, NOT expressions with deeper meaning!
- BAD: Technical terms or proper nouns that simply name something

GOOD choices require CONTEXTUAL INTERPRETATION:
- GOOD: "break the ice" → requires understanding it means "ease awkwardness"
- GOOD: "a double-edged sword" → requires understanding it means "something with both benefits and drawbacks"
- GOOD: "take a backseat" → requires understanding it means "become less important"
- GOOD: "weather the storm" → requires understanding it means "survive difficult times"
- GOOD: Multi-word phrases with contextual meaning that differs from literal meaning

**IMPORTANT: If the passage does not contain any idiomatic expressions, metaphors, or phrases with non-literal meaning, respond with:**
{
  "error": "NO_SUITABLE_EXPRESSION",
  "message": "This passage does not contain suitable expressions for this question type. The passage is too straightforward/literal."
}

**Requirements:**
1. Choose ONE key phrase, idiom, metaphor, or multi-word expression that CANNOT be directly translated
2. The phrase must require understanding the CONTEXT to interpret correctly
3. Mark the underlined part using <u>...</u> HTML tags in the modifiedPassage ONLY
4. Create 5 Korean interpretation options (4 wrong, 1 correct)
5. **THE CORRECT ANSWER MUST BE THE CONTEXTUAL/FIGURATIVE MEANING, NEVER THE LITERAL TRANSLATION**
6. **THE LITERAL TRANSLATION MUST BE INCLUDED AS ONE OF THE WRONG ANSWERS (distractor)**
7. All 5 choices must be SEMANTICALLY DISTINCT - no two choices can mean the same thing
8. Korean translations must sound natural
9. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**

**Passage:**
{passage}

**CRITICAL RULES (MUST FOLLOW):**
1. NEVER choose single common words (fight, run, love, help, etc.)
2. Choose phrases of 2+ words OR single words with non-literal contextual meaning
3. **THE CORRECT ANSWER MUST NEVER BE A LITERAL/DIRECT TRANSLATION!**
   - BAD ANSWER: "maintaining the human touch" → "인간의 접촉을 유지하다" (literal translation)
   - GOOD ANSWER: "maintaining the human touch" → "인간적인 감성을 유지하다" (contextual meaning)
4. **ONE OF THE DISTRACTORS MUST BE THE LITERAL TRANSLATION (as a wrong answer)**
5. **ABSOLUTELY FORBIDDEN: NEVER EVER use HTML tags (<u>, <b>, etc.) in the "explanation" field. Use single quotes '...' for emphasis instead.**
6. Each choice must have a clearly different meaning from all other choices
7. The "answer" field number MUST match the choice referenced in "explanation"
8. **USE \\n\\n (double newline) to separate paragraphs in explanation. DO NOT use single \\ or \\n.**

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must be structured with clear paragraphs:

Paragraph 1: State the answer
"정답은 ③번 '[정답 선지]'입니다."

Paragraph 2: Quote and analyze the context
"본문에서 '[관련 문장 인용]'이라고 했는데, [문맥 분석]."

Paragraph 3: Explain why this interpretation fits
"따라서 '[영어 표현]'은 문자 그대로의 의미가 아니라 [비유적/문맥적 의미 설명]."

Paragraph 4: Why other choices are wrong (optional but recommended)
"①번 '[오답]'은 [왜 틀린지], ②번은 [왜 틀린지]."

**GOOD EXAMPLE 1 (NO HTML TAGS, USE \\n\\n FOR PARAGRAPH BREAKS):**
"정답은 ②번 '어색한 분위기를 깨다'입니다.\\n\\n본문에서 'At the beginning of the meeting, the manager told a joke to break the ice'라고 했는데, 회의 시작 시 농담을 한 이유는 처음 만난 사람들 사이의 어색함을 없애기 위함입니다.\\n\\n따라서 'break the ice'는 문자 그대로 '얼음을 깨다'가 아니라, 어색하거나 불편한 상황을 완화시킨다는 비유적 의미로 사용되었습니다.\\n\\n①번 '얼음을 깨다'는 문자 그대로의 해석이라 오답입니다."

**GOOD EXAMPLE 2 (maintaining the human touch):**
For "maintaining the human touch" in context of AI and healthcare:
- CORRECT ANSWER: "인간적인 감성을 유지하다" or "인간다운 배려를 유지하다" (contextual meaning)
- WRONG ANSWER (DISTRACTOR): "인간의 접촉을 유지하다" (literal translation - MUST be included as a wrong choice!)
- Other distractors: "기술의 발전을 막다", "인간의 우월성을 주장하다", etc.

**BAD EXAMPLE (DO NOT DO THIS):**
"밑줄 친 부분은 문맥상 '② 어색한 분위기를 깨다'를 의미합니다." ← 너무 짧고 설명이 없음!
Using literal translation as the correct answer ← ABSOLUTELY WRONG!

**CRITICAL WARNING ABOUT CHOICES:**
The choices array must ONLY contain the actual Korean interpretation options.
- WRONG: ["문자 그대로의 직역 (오답)", "문맥적 의미 (정답)", ...]
- CORRECT: ["문자 그대로의 직역", "문맥적 의미", "관련 없는 오답1", ...]

**Output (JSON only):**
{
  "question": "밑줄 친 부분이 의미하는 바로 가장 적절한 것은?",
  "modifiedPassage": "passage with <u>underlined phrase</u> using HTML tags",
  "choices": [
    "얼음을 깨다",
    "어색한 분위기를 깨다",
    "관계를 단절하다",
    "냉정함을 유지하다",
    "침묵을 지키다"
  ],
  "answer": 2,
  "explanation": "정답은 ②번 '어색한 분위기를 깨다'입니다.\\n\\n본문에서 '[인용]'이라고 했는데, [분석].\\n\\n따라서 'break the ice'는 문자 그대로 '얼음을 깨다'가 아니라 [비유적/문맥적 의미 설명].\\n\\n①번 '얼음을 깨다'는 문자 그대로의 해석이라 오답입니다."
}
`;

// ============================================
// 4. 주제 뽑기형
// ============================================
export const PICK_SUBJECT_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking for the MAIN TOPIC of the passage.

**Requirements:**
1. Identify the central theme accurately
2. Create 5 topic choices in Korean (4 plausible distractors, 1 correct)
3. The correct answer must capture the main idea, not just a minor detail
4. The explanation MUST be detailed with specific evidence from the passage
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage. Keep all line breaks (\\n\\n) between paragraphs exactly as they appear in the original passage.**

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and the correct topic choice text
2. Quote 1-2 key sentences from the passage that reveal the main topic
3. Explain WHY this topic captures the main idea
4. Briefly explain why other distractors are insufficient (too narrow/broad/off-topic)
5. Do NOT just say "이 글은 ~에 대해 다루고 있습니다" without evidence

**GOOD EXAMPLE:**
"정답은 ③번 '인공지능의 의료 분야 활용'입니다. 본문에서 'AI systems can analyze patient data with remarkable accuracy'와 'Machine learning algorithms can spot subtle anomalies in X-rays'라고 했는데, 이는 인공지능이 의료 진단에 활용되는 구체적인 방식을 설명합니다. 글 전체가 AI의 의료 분야 적용에 초점을 맞추고 있어 ③번이 주제를 가장 잘 포괄합니다. ①, ②번은 지엽적인 내용이고, ④, ⑤번은 본문에서 다루지 않는 내용입니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 이 글은 인공지능에 대해 다루고 있습니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글의 주제로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["주제 선지1", "주제 선지2", "주제 선지3", "주제 선지4", "주제 선지5"],
  "answer": 3,
  "explanation": "정답은 ③번 '[정답 주제]'입니다. 본문에서 '[핵심 문장 인용]'이라고 했는데, 이는 [주제와의 연관성 설명]. 글 전체가 [주제 요약]에 초점을 맞추고 있어 ③번이 가장 적절합니다."
}
`;

// ============================================
// 5. 제목 뽑기형
// ============================================
export const PICK_TITLE_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking for the BEST TITLE of the passage.

**Requirements:**
1. Create 5 title options in English
2. The correct title should capture the main message comprehensively
3. Distractors should be plausible but incomplete or focus on minor details
4. The explanation MUST be detailed with specific reasoning
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage. Keep all line breaks (\\n\\n) between paragraphs exactly as they appear in the original passage.**

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and the correct title
2. Quote the key sentence(s) that capture the main message
3. Explain WHY this title best represents the passage's core message
4. Explain why at least 1-2 distractors are NOT the best choice
5. Do NOT just say "이 글의 핵심은 ~입니다" without evidence

**GOOD EXAMPLE:**
"정답은 ②번 'The Power of Music in Healing'입니다. 본문에서 'Music therapy has shown remarkable effects on patients with various conditions'와 'the rhythm and melody can stimulate brain regions associated with healing'이라고 했는데, 글 전체가 음악의 치료 효과에 초점을 맞추고 있습니다. ①번 'Music History'는 역사가 아닌 치료 효과를 다루므로 부적절하고, ④번 'Brain Science'는 너무 광범위합니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ②번입니다. 이 글의 핵심은 음악입니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글의 제목으로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["Title Option 1", "Title Option 2", "Title Option 3", "Title Option 4", "Title Option 5"],
  "answer": 2,
  "explanation": "정답은 ②번 '[정답 제목]'입니다. 본문에서 '[핵심 문장 인용]'이라고 했는데, 글 전체가 [주제 요약]에 초점을 맞추고 있습니다. [오답 분석도 포함]."
}
`;

// ============================================
// 6. 맞는 선지 뽑기
// ============================================
export const CORRECT_ANSWER_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking which statement is TRUE according to the passage.

**Requirements:**
1. Create 5 statements about the passage in Korean
2. 4 should be FALSE or not mentioned in the passage
3. 1 should be clearly TRUE based on specific evidence in the passage
4. **CRITICAL: Preserve the original paragraph structure in modifiedPassage. Keep all line breaks (\\n\\n) between paragraphs exactly as they appear in the original passage.**

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and the correct statement text
2. Quote the EXACT sentence or phrase from the passage that proves it
3. Explain how the passage supports this statement
4. Do NOT just say "본문에서 확인할 수 있습니다" without quoting evidence

**GOOD EXAMPLE:**
"정답은 ④번 '콜라는 1800년대 후반에 처음 만들어졌다'입니다. 본문에서 'Coca-Cola was first created in 1886 by a pharmacist in Atlanta'라고 명시되어 있어, 1800년대 후반(1886년)에 처음 만들어졌음을 확인할 수 있습니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ④번입니다. 본문에서 확인할 수 있습니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 4,
  "explanation": "정답은 ④번 '[정답 선지 내용]'입니다. 본문에서 '[관련 영어 문장 인용]'이라고 했는데, 이는 [선지 내용과의 연관성 설명]을 뜻합니다."
}
`;

// ============================================
// 7. 틀린 선지 뽑기
// ============================================
export const INCORRECT_ANSWER_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking which statement is FALSE or NOT MENTIONED.

**Requirements:**
1. Create 5 statements about the passage in Korean
2. 4 should be TRUE based on evidence in the passage
3. 1 should be FALSE (contradicts the passage) or NOT MENTIONED (not in passage)
4. **CRITICAL: Preserve the original paragraph structure in modifiedPassage. Keep all line breaks (\\n\\n) between paragraphs exactly as they appear in the original passage.**

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and the incorrect statement text
2. Explain WHETHER it's false OR not mentioned
3. If FALSE: Quote what the passage ACTUALLY says and explain the contradiction
4. If NOT MENTIONED: Explain what topics the passage covers and why this isn't included
5. Do NOT just say "언급되지 않았습니다" - explain specifically

**GOOD EXAMPLE (FALSE):**
"정답은 ③번 '콜라는 원래 의료 목적으로 개발되지 않았다'입니다. 본문에서 'It was originally developed as a medicinal tonic'라고 명시되어 있어, 콜라가 원래 의료 목적(강장제)으로 개발되었음을 알 수 있습니다. 따라서 ③번 진술은 본문 내용과 반대됩니다."

**GOOD EXAMPLE (NOT MENTIONED):**
"정답은 ②번 '콜라는 아시아에서 처음 인기를 얻었다'입니다. 본문은 콜라의 발명 과정과 미국 내 초기 판매에 대해서만 다루고 있으며, 아시아 시장에 대한 내용은 전혀 언급되지 않았습니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 본문에서 언급되지 않았습니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하지 않는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 3,
  "explanation": "정답은 ③번 '[오답 선지 내용]'입니다. 본문에서 '[관련 내용]'이라고 했는데, 이는 [왜 틀렸는지/왜 언급되지 않았는지 설명]."
}
`;

// ============================================
// 8. 빈칸에 들어갈 말
// ============================================
export const BLANK_WORD_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question with 1 blank in the passage.

**Requirements:**
1. Remove 1 key word/phrase and replace with ______
2. Create 5 options that could fit grammatically
3. Only 1 should fit contextually
4. The explanation MUST be DETAILED and CONTEXTUAL
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage. Keep all line breaks (\\n\\n) between paragraphs exactly as they appear in the original passage.**
6. **ABSOLUTELY FORBIDDEN: NEVER include "(정답)", "(오답)", "(correct)", "(wrong)" or any answer indicators in the choices array! Choices must ONLY contain the actual word/phrase options, nothing else!**

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must be structured with clear paragraphs AND include vocabulary help:

Paragraph 1: State the answer with Korean meaning
"정답은 ③번 'peaceful(평화로운)'입니다."

Paragraph 2: Quote and analyze the context
"본문에서 'When people love one another, they often work together to create a ______ environment'라고 했는데, 사랑이 있는 관계에서는 서로 협력하여 평화로운 환경을 만드는 것이 일반적입니다."

Paragraph 3: Explain why this fits and others don't
"따라서 '평화로운(peaceful)'이 문맥에 가장 잘 맞습니다. 다른 선택지인 'hostile(적대적인)', 'chaotic(혼란스러운)', 'isolated(고립된)', 'harsh(가혹한)'는 모두 부정적인 의미를 가지고 있어 사랑이 있는 환경을 설명하기에는 적합하지 않습니다."

**VOCABULARY IN EXPLANATION (CRITICAL):**
When choices are English words, ALWAYS include Korean meanings in parentheses:
- "peaceful(평화로운)"
- "hostile(적대적인)"
- "chaotic(혼란스러운)"
- "isolated(고립된)"
- "harsh(가혹한)"

**GOOD EXAMPLE:**
"정답은 ③번 'peaceful(평화로운)'입니다.

본문에서 'When people love one another, they often work together to create a ______ environment'라고 했는데, 사랑이 있는 관계에서는 서로 협력하여 평화로운 환경을 만드는 것이 일반적입니다.

따라서 '평화로운(peaceful)'이 문맥에 가장 잘 맞습니다. 다른 선택지인 'hostile(적대적인)', 'chaotic(혼란스러운)', 'isolated(고립된)', 'harsh(가혹한)'는 모두 부정적인 의미를 가지고 있어 사랑이 있는 환경을 설명하기에는 적합하지 않습니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번 'peaceful'입니다. 문맥상 'peaceful'가 적절하기 때문입니다." ← 뜻도 없고 설명도 없음!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis. Use \\n\\n for paragraph breaks.**

**Output (JSON only):**
{
  "question": "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
  "modifiedPassage": "passage with ______ blank",
  "choices": [
    "peaceful",
    "hostile",
    "chaotic",
    "isolated",
    "harsh"
  ],
  "answer": 1,
  "explanation": "정답은 ①번 'peaceful(평화로운)'입니다.\\n\\n본문에서 '[관련 문장 인용]'이라고 했는데, [문맥 분석].\\n\\n따라서 'peaceful(평화로운)'이 가장 적합합니다. 다른 선택지인 'hostile(적대적인)', 'chaotic(혼란스러운)', 'isolated(고립된)', 'harsh(가혹한)'는 [왜 안 맞는지]."
}

**CRITICAL REMINDER:**
- choices array contains ONLY the words: ["peaceful", "hostile", "chaotic", "isolated", "harsh"]
- NEVER include: ["peaceful (정답)", "hostile (오답)", ...] ← WRONG!
- NEVER include: ["단순한 단 성분 (오답)", "건강에 해로운 주범 (정답)", ...] ← WRONG!
`;

// ============================================
// 9. 요약문 완성
// ============================================
export const COMPLETE_SUMMARY_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a summary sentence with 2 blanks.

**Requirements:**
1. The modifiedPassage MUST contain BOTH the original passage AND the summary below it
2. Write a summary in English capturing the main points of the passage
3. Leave 2 key terms blank: (A), (B)
4. Provide 5 (A)-(B) pair options
5. The explanation MUST be detailed and contextual

**Passage:**
{passage}

**CRITICAL FORMAT FOR modifiedPassage:**
The modifiedPassage MUST be structured as follows:
1. FIRST: The complete original passage (exactly as provided)
2. THEN: A blank line
3. THEN: The summary with (A) and (B) blanks

Example structure:
"[Full original passage here...]

Summary: [One sentence summary with (A) ______ and (B) ______ blanks]"

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must be structured with clear paragraphs AND include vocabulary help:

Paragraph 1: State the answer with Korean meanings
"정답은 ③번 '(A) sweet(달콤한) - (B) popularity(인기)'입니다."

Paragraph 2: Explain (A) with evidence
"본문에서 'its sugary taste appeals to many consumers'라고 했으므로 (A)에는 설탕의 맛을 나타내는 'sweet(달콤한)'이 적절합니다."

Paragraph 3: Explain (B) with evidence
"또한 'it became one of the most consumed beverages worldwide'라고 했으므로 (B)에는 전 세계적인 인기를 나타내는 'popularity(인기)'가 적절합니다."

**VOCABULARY IN EXPLANATION (CRITICAL):**
ALWAYS include Korean meanings for English words in parentheses:
- "sweet(달콤한)", "bitter(쓴)", "sour(신)"
- "popularity(인기)", "decline(쇠퇴)", "growth(성장)"

**GOOD EXAMPLE:**
"정답은 ③번 '(A) sweet(달콤한) - (B) popularity(인기)'입니다.

본문에서 'its sugary taste appeals to many consumers'라고 했으므로 (A)에는 설탕의 맛을 나타내는 'sweet(달콤한)'이 적절합니다.

또한 'it became one of the most consumed beverages worldwide'라고 했으므로 (B)에는 전 세계적인 인기를 나타내는 'popularity(인기)'가 적절합니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. (A)에는 sweet이, (B)에는 popularity가 적절합니다." ← 뜻도 없고 문단도 안 나눔!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis. Use \\n\\n for paragraph breaks.**

**Output (JSON only):**
{
  "question": "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
  "modifiedPassage": "[FULL ORIGINAL PASSAGE HERE]\\n\\nSummary: [summary sentence with (A) ______ and (B) ______ blanks]",
  "choices": ["(A) word1 - (B) word2", "(A) word3 - (B) word4", "(A) word5 - (B) word6", "(A) word7 - (B) word8", "(A) word9 - (B) word10"],
  "answer": 3,
  "explanation": "정답은 ③번 '(A) [정답A](한글뜻) - (B) [정답B](한글뜻)'입니다.\\n\\n본문에서 '[A 관련 인용]'이라고 했으므로 (A)에는 [설명]을 나타내는 '[정답A](뜻)'이 적절합니다.\\n\\n또한 '[B 관련 인용]'이라고 했으므로 (B)에는 [설명]을 나타내는 '[정답B](뜻)'가 적절합니다."
}
`;

// ============================================
// 10. 무관한 문장 (수능 스타일)
// ============================================
export const IRRELEVANT_SENTENCE_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question where students identify which sentence is IRRELEVANT to the main logical flow.

**CRITICAL UNDERSTANDING - 수능 스타일의 무관한 문장:**
In real Korean SAT (수능), the irrelevant sentence is NOT completely off-topic. Instead, it is:
- SUBTLY off-topic: Related to the general subject area but not to the SPECIFIC ARGUMENT
- SUPERFICIALLY connected: Uses similar vocabulary or themes but doesn't advance the main point
- LOGICALLY disconnected: Breaks the cause-effect or argumentative flow OR contradicts the main point
- REQUIRES careful reading to identify: Not obviously wrong at first glance

**2024 수능 ACTUAL EXAMPLE:**
Passage: "Speaking fast is a high-risk proposition... the brain needs processing time"
- ① Brain needs time to make decisions
- ② Brain sits idle considering options
- ③ Making good decisions helps you speak faster ← IRRELEVANT (contradicts the main argument)
- ④ When brain can't keep up, you get verbal fillers
- ⑤ Um, ah are what mouth does when brain has nowhere to go

Why ③ is wrong: The passage argues "fast speech is problematic because brain needs time," but ③ says "good decisions help you speak faster" - this CONTRADICTS the main argument.

**WRONG APPROACH (DO NOT DO THIS):**
- Passage about Starbucks marketing strategy → Inserting "Starbucks has a wide range of merchandise" (this IS part of marketing strategy!)
- Passage about K-pop → Inserting a sentence about Mount Everest (too obvious!)
- Passage about climate change → Inserting a sentence about cooking recipes (too random!)

**CORRECT APPROACH (수능 스타일):**
Type 1 - Different sub-topic within same area:
- Passage about "how K-pop uses social media for global reach" → Insert "K-pop fashion trends have influenced global markets" (K-pop related, but not about social media strategy)

Type 2 - Contradicts the main argument:
- Passage about "why fast speech is problematic" → Insert "Making good decisions helps you speak faster" (contradicts the main point)

Type 3 - Related but doesn't support the specific argument:
- Passage about "negative effects of climate change on agriculture" → Insert "Renewable energy industry is growing rapidly" (environment-related, but doesn't support "negative effects on agriculture")

**Passage:**
{passage}

**STEP-BY-STEP INSTRUCTIONS:**
1. **Identify the SPECIFIC ARGUMENT** of the passage (not just the general topic)
   - Ask: "What SPECIFIC POINT is the author making?"
   - General topic: "Starbucks" → Specific argument: "how Starbucks creates customer experience through store design"
   - General topic: "K-pop" → Specific argument: "how K-pop uses social media for global success"
   - General topic: "Education" → Specific argument: "why hands-on learning is more effective than lectures"

2. **Select 5 consecutive sentences** from the passage that support this specific argument

3. **CREATE one irrelevant sentence** using one of these three types:

   **Type 1 - Different sub-topic** (most common):
   - Same general topic, but discusses a DIFFERENT specific aspect
   - Example: Passage about "Starbucks store design" → Insert "Starbucks sources coffee beans from Ethiopia"

   **Type 2 - Contradicts the argument**:
   - Makes a claim that goes AGAINST the main point
   - Example: Passage about "why fast speech is bad" → Insert "Good decisions help you speak faster"

   **Type 3 - Related but tangential**:
   - Related to the topic area but doesn't SUPPORT the specific argument
   - Example: Passage about "benefits of reading fiction" → Insert "Public libraries have faced budget cuts in recent years"

4. **Ensure the irrelevant sentence**:
   - Uses vocabulary related to the general topic (to make it deceptive)
   - Sounds natural and well-written (not obviously wrong)
   - Does NOT advance or support the specific argument
   - Could mislead careless readers into thinking it belongs

5. **REPLACE** one of the 5 sentences (preferably ②, ③, or ④) with your created irrelevant sentence

6. **Mark all 5 sentences** with ①②③④⑤

**EXAMPLE:**
Passage about "Dogs provide emotional support to their owners":
- General topic: Dogs
- Specific argument: Emotional support benefits

Original: "Dogs are loyal companions. They sense their owners' emotions. Studies show dog owners have lower stress levels. Spending time with dogs releases oxytocin."

Created irrelevant sentence: "Guide dogs are trained for about two years before being paired with their owners."

Modified: "①Dogs are loyal companions. ②They sense their owners' emotions. ③Guide dogs are trained for about two years before being paired with their owners. ④Studies show dog owners have lower stress levels. ⑤Spending time with dogs releases oxytocin."

Why ③ is irrelevant: It's about dogs (same general topic), but discusses guide dog training (different specific topic), not emotional support benefits. A careless reader might think "it's about dogs, so it fits" - but it doesn't support the main argument.

**EXPLANATION REQUIREMENTS:**
1. **State the SPECIFIC ARGUMENT** (not just "이 글은 스타벅스에 대한 글입니다")
   - BAD: "이 글은 스타벅스에 대한 글입니다"
   - GOOD: "이 글은 '스타벅스가 매장 디자인을 통해 고객 경험을 창출하는 방법'에 대해 논하고 있습니다"

2. **Explain why other sentences support this argument**
   - "①②④⑤번 문장은 모두 [구체적 논지]를 뒷받침하는 내용입니다"

3. **Explain what the irrelevant sentence discusses and why it doesn't fit**
   - Type 1 (Different sub-topic): "③번은 [같은 주제]에 대한 내용이지만 '[다른 세부 주제]'를 다루고 있어 글의 흐름과 맞지 않습니다"
   - Type 2 (Contradicts): "③번은 [구체적 논지]와 반대되는 내용으로 논리적 흐름을 해칩니다"
   - Type 3 (Tangential): "③번은 [관련 영역]에 대한 내용이지만 [구체적 논지]를 지원하지 않습니다"

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "다음 글에서 전체 흐름과 관계 없는 문장은?",
  "modifiedPassage": "①First sentence. ②Second sentence. ③Third sentence (irrelevant). ④Fourth sentence. ⑤Fifth sentence.",
  "choices": ["①", "②", "③", "④", "⑤"],
  "answer": 3,
  "explanation": "정답은 ③번입니다. 이 글은 '[구체적이고 명확한 논지]'에 대해 논하고 있습니다. ①②④⑤번 문장은 모두 [구체적 논지]를 뒷받침하는 내용인 반면, ③번 문장은 [같은 주제 영역]에 대한 내용이지만 '[왜 무관한지 구체적으로]'하여 글의 논리적 흐름과 맞지 않습니다."
}
`;

// ============================================
// 11. 문장 삽입
// ============================================
export const INSERT_SENTENCE_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Create a question asking where a given sentence fits best.

**Requirements:**
1. Extract one key sentence from the passage
2. Mark 4 insertion points: (A), (B), (C), (D)
3. Only 1 position should be logical
4. The explanation MUST be detailed with specific reasoning

**Passage:**
{passage}

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and position (e.g., "②번 (B)")
2. Quote the sentence BEFORE the insertion point
3. Quote the sentence AFTER the insertion point
4. Explain the logical connection: Why does the given sentence fit between these two?
5. Mention discourse markers, pronouns, or logical flow that support the answer
6. Do NOT just say "이 위치가 자연스럽습니다" - explain WHY

**GOOD EXAMPLE:**
"정답은 ②번 (B)입니다. (B) 앞 문장에서 'Scientists discovered a new method'라고 새로운 방법의 발견을 언급했고, 주어진 문장 'However, this approach had limitations'은 그 방법의 한계를 설명합니다. 그리고 (B) 뒤 문장 'Therefore, they sought alternatives'는 대안을 찾게 된 이유를 설명하므로, 주어진 문장이 (B)에 들어가야 논리적 흐름이 완성됩니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ②번 (B)입니다. 이 위치가 가장 자연스럽습니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
  "modifiedPassage": "passage with (A), (B), (C), (D) markers",
  "sentenceToInsert": "The sentence to be inserted",
  "choices": ["(A)", "(B)", "(C)", "(D)"],
  "answer": 2,
  "explanation": "정답은 ②번 (B)입니다. (B) 앞 문장에서 '[앞 문장 내용]'이라고 했고, 주어진 문장 '[삽입 문장]'은 [연결 설명]. 그리고 (B) 뒤 문장 '[뒤 문장 내용]'으로 이어지므로 논리적 흐름이 완성됩니다."
}
`;

// ============================================
// 12. 글의 순서형
// ============================================
export const SENTENCE_ORDER_PROMPT = `
You are an expert English teacher specializing in Korean SAT (수능) style questions.

Scramble 3 paragraphs and ask for correct order.

**Requirements:**
1. Divide passage into 3 parts: (A), (B), (C)
2. Scramble the order
3. Ask for correct logical sequence
4. The explanation MUST be detailed with step-by-step reasoning

**Passage:**
{passage}

**CRITICAL FORMAT FOR modifiedPassage:**
The labels (A), (B), (C) MUST come BEFORE each paragraph, NOT after!

CORRECT FORMAT:
"Given: [intro paragraph]

(A) [First sentence of paragraph A starts here...full paragraph content]

(B) [First sentence of paragraph B starts here...full paragraph content]

(C) [First sentence of paragraph C starts here...full paragraph content]"

WRONG FORMAT (DO NOT DO THIS):
"Given: [intro]

[paragraph content] (A)  ← WRONG! Label must be BEFORE the paragraph

[paragraph content] (B)  ← WRONG!"

**EXPLANATION REQUIREMENTS (CRITICAL):**
The explanation must include:
1. The answer number and the correct order (e.g., "③번 '(B)-(C)-(A)'")
2. Explain WHY the first paragraph comes first (connecting to the intro)
3. Explain WHY the second paragraph follows (connection between them)
4. Explain WHY the third paragraph comes last (conclusion/logical ending)
5. Point out specific discourse markers, pronouns, or logical links
6. Do NOT just say "논리적 흐름상 자연스럽습니다" - explain the actual connections

**GOOD EXAMPLE:**
"정답은 ③번 '(B)-(C)-(A)'입니다. 주어진 글에서 새로운 기술의 등장을 언급했으므로, 먼저 (B)가 와야 합니다. (B)에서 'This technology'라고 했는데, 이는 주어진 글의 기술을 가리킵니다. 다음으로 (C)는 'However'로 시작하여 (B)의 내용에 대한 반론을 제시합니다. 마지막으로 (A)는 'Therefore'로 시작하여 결론을 내리므로 가장 마지막에 와야 합니다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 논리적 흐름상 자연스럽습니다." ← 이런 식으로 하지 마세요!

**CRITICAL: NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.**

**Output (JSON only):**
{
  "question": "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
  "modifiedPassage": "Given: [intro paragraph]\\n\\n(A) [paragraph A content starting right after the label]\\n\\n(B) [paragraph B content starting right after the label]\\n\\n(C) [paragraph C content starting right after the label]",
  "choices": ["(A)-(C)-(B)", "(B)-(A)-(C)", "(B)-(C)-(A)", "(C)-(A)-(B)", "(C)-(B)-(A)"],
  "answer": 3,
  "explanation": "정답은 ③번 '(B)-(C)-(A)'입니다. 주어진 글에서 [주어진 글 내용]을 언급했으므로, 먼저 (B)가 와야 합니다. (B)에서 '[연결 표현]'이라고 했는데, 이는 [연결 설명]. 다음으로 (C)는 '[연결 표현]'으로 시작하여 [연결 설명]. 마지막으로 (A)는 '[연결 표현]'으로 시작하여 [결론 설명]이므로 가장 마지막에 와야 합니다."
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
