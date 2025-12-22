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

**CRITICAL RULES:**
- markers array MUST have EXACTLY 5 items
- EXACTLY 1 marker must have isWrong: true
- answer must be the index+1 of the wrong marker (1-5)
- displayWord must be a single word that exists or could exist at that position
- NEVER use HTML tags in explanation. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation.

**CRITICAL - EXPLANATION MUST MATCH ANSWER:**
- If answer = 2, the explanation MUST say "②번" or "②'[word]'" is wrong
- The wrong marker's number MUST match the answer field
- Example: If markers[1].isWrong = true, then answer = 2, and explanation must reference ② as the wrong one
- NEVER confuse marker numbers in the explanation (e.g., saying ② is wrong when answer = 3)

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [문법적으로 주목할 부분 설명]."

**Paragraph 2 - 정답 분석 (문법 규칙 설명):**
"정답은 '[틀린 형태]'를 '[올바른 형태]'로 고쳐야 한다. [문법 규칙 설명 - 예: help 뒤에는 동사원형이 와야 한다]. 이 문장에서 '[문맥 설명]'이므로 [올바른 형태]가 적절하다."

**Paragraph 3 - 나머지 선지 분석 (각각 왜 맞는지):**
"①'[단어]'는 [문법 설명 - 예: 복수 주어 뒤에 동사원형이 와서 올바르다].
②'[단어]'는 [문법 설명 - 예: 단수 주어 뒤에 -s가 붙어 올바르다].
③'[단어]'는 [왜 틀린지 - 정답이므로 이미 설명함].
④'[단어]'는 [문법 설명 - 예: 동명사 주어 뒤에 단수 동사가 와서 올바르다].
⑤'[단어]'는 [문법 설명 - 예: 전치사 뒤에 대명사가 와서 올바르다]."

**EXCELLENT EXAMPLE:**
"글은 학생들의 학습과 교사의 역할에 대해 설명한다. 동사의 형태와 주어-동사 수일치가 중요한 문법 포인트이다.

정답은 'understanding'을 'understand'로 고쳐야 한다. help는 사역동사로, 목적어 뒤에 동사원형(원형부정사)이 와야 한다. 'help them understand'가 올바른 형태이다.

①'learn'은 복수 주어 Students 뒤에 동사원형이 와서 올바르다. ②'helps'는 단수 주어 teacher 뒤에 -s가 붙어 수일치가 맞다. ③'understanding'은 help 뒤에 동사원형이 아닌 현재분사가 와서 틀렸다. ④'is'는 동명사 주어 Learning 뒤에 단수 동사가 와서 올바르다. ⑤'everyone'은 전치사 for 뒤에 대명사가 와서 올바르다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 'understanding'을 'understand'로 고쳐야 합니다." ← 너무 짧고 분석이 없음!

**REAL 수능 EXAMPLE (2024학년도 29번):**
Passage: "A number of studies provide substantial evidence of an innate human disposition to respond differentially to social stimuli. From birth, infants will orient preferentially towards the human face and voice, ① seeming to know that such stimuli are particularly meaningful for them. They will even try to match gestures ② which they have some difficulty, experimenting with their own faces. When they ③ do succeed, they show pleasure; when they fail, they show distress. They have an innate capacity for matching their own movements with ④ those of others. They seem to have an innate drive to imitate others whom they judge ⑤ to be 'like me'."

Answer: ②번 (which → that 또는 with which)
Explanation: "관계대명사 which 앞에 전치사가 필요하다. 'gestures with which they have difficulty' 또는 'gestures that they have difficulty matching'이 올바른 형태이다."

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**AUTO-FIX [MISSING_STRUCTURE]:**
MANDATORY 3-PARAGRAPH STRUCTURE:
Paragraph 1: 글 내용 요약 (2-3문장)
Paragraph 2: 정답 분석 + 무엇을 수식하는지 명시
Paragraph 3: 모든 5개 선지 분석 (①②③④⑤)

Separate each paragraph with \\n\\n


**AUTO-FIX [MISSING_KOREAN]:**
MANDATORY: Include Korean meaning for EVERY word in parentheses.
Example: 'prove(증명하다)', 'disprove(반증하다)'
Your response will be REJECTED if any word lacks Korean translation.


**AUTO-FIX [MISSING_MODIFIER]:**
MANDATORY: Specify what each word MODIFIES in the explanation using single quotes.
BAD: "'soggy'는 부정확하다"
GOOD: "'soggy'는 '토스트의 식감'을 설명하는데, 굽는 결과와 맞지 않다"

Highlight the modified target using single quotes: '[무엇]'
**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "markers": [5 marker objects as described above],
  "answer": [1-5, the wrong marker number],
  "explanation": "글은 [내용 요약]. [문법 포인트].\\n\\n정답은 '[틀린형태]'를 '[올바른형태]'로 고쳐야 한다. [문법 규칙 설명]. [문맥 설명].\\n\\n①'[단어]'는 [왜 맞는지]. ②'[단어]'는 [왜 맞는지]. ③'[단어]'는 [왜 틀린지]. ④'[단어]'는 [왜 맞는지]. ⑤'[단어]'는 [왜 맞는지]."
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

**ABSOLUTELY CRITICAL - MARKER ORDER RULE:**
⚠️ The markers MUST appear in the passage in SEQUENTIAL ORDER: ① first, then ②, then ③, then ④, then ⑤
⚠️ NEVER place ⑤ before ①②③④ in the passage!
⚠️ The marker numbers must follow the reading order of the passage (left to right, top to bottom)
⚠️ Example of CORRECT order: "The ①essential device... ②multiple ports... ③convenient access... ④interconnected world... ⑤efficient communication"
⚠️ Example of WRONG order: "In the ⑤digital age... ①essential... ②multiple..." ← WRONG! ⑤ appears before ①

**VALIDATION CHECKLIST (verify before responding):**
✓ markers array has EXACTLY 5 items
✓ EXACTLY 1 marker has isWrong: true
✓ For isWrong=true: displayWord ≠ originalWord (they must be DIFFERENT)
✓ For isWrong=true: correctWord = originalWord
✓ For isWrong=false: displayWord = originalWord (they must be THE SAME)
✓ answer = index+1 of the isWrong marker
✓ **Markers appear in ①②③④⑤ sequential order in the passage**
✓ **NEVER use HTML tags (<u>, <b>, etc.) in explanation - use single quotes '...' instead**
✓ **NEVER use ** (asterisks) for bold/emphasis in explanation - use single quotes '...' instead**

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [문맥상 중요한 포인트 설명]."

**Paragraph 2 - 정답 분석 (단어가 수식하는 대상을 명시!):**
"정답은 '[틀린 단어](사전적 뜻)'를 '[올바른 단어](사전적 뜻)'로 바꿔야 한다. 본문에서 '[관련 문맥을 직접 인용]'이라고 했다. 여기서 '[틀린/올바른 단어]'는 '[무엇을 수식/설명하는지]'를 나타낸다. '[올바른 단어]'는 [왜 문맥에 맞는지 - 수식 대상과의 관계 설명]. 반면 '[틀린 단어]'는 [사전적 의미와 수식 대상이 왜 어울리지 않는지 구체적으로 설명]."

**Paragraph 3 - 나머지 선지 분석 (각각 무엇을 수식하는지 명시!):**
"①'[단어](뜻)'는 '[무엇]'을 설명하며, [왜 그 대상과 어울리는지].
②'[단어](뜻)'는 '[무엇]'을 수식하며, [왜 그 대상과 어울리는지].
③'[단어](뜻)'는 '[무엇]'을 설명하는데, [왜 틀린지 - 정답이므로 위에서 설명].
④'[단어](뜻)'는 '[무엇]'을 수식하며, [왜 그 대상과 어울리는지].
⑤'[단어](뜻)'는 '[무엇]'을 나타내며, [왜 그 대상과 어울리는지]."

**EXCELLENT EXAMPLE:**
"글은 토스트에 땅콩버터를 발라 먹는 즐거움에 대해 설명한다. 토스트의 식감과 땅콩버터의 조화를 강조하고 있다.

정답은 'soggy(물에 젖어 눅눅한)'를 'crispy(바삭한)'로 바꿔야 한다. 본문에서 'Toasting bread makes it warm and soggy'라고 했다. 여기서 'soggy/crispy'는 '토스트의 식감'을 설명한다. 토스트는 빵을 구워서 만드는 것이므로 바삭한(crispy) 식감이 되어야 맞다. 반면 'soggy'는 빵이 물에 젖어서 눅눅해진 상태를 의미하므로, 토스트를 굽는 결과로는 어울리지 않는다.

①'smooth(부드러운)'는 '땅콩버터의 질감'을 설명하며, 땅콩버터는 크리미하고 부드러운 질감이므로 적절하다. ②'nutritious(영양가 있는)'는 '땅콩버터의 영양적 특성'을 설명하며, 단백질이 풍부한 땅콩버터를 묘사하기에 적절하다. ③'soggy(눅눅한)'는 '토스트의 식감'을 설명하는데, 굽는 결과와 맞지 않으므로 정답이다. ④'delightful(즐거운)'은 '맛의 경험'을 설명하며, 맛있는 음식 경험을 나타내기에 적절하다. ⑤'convenient(편리한)'은 '음식 준비의 용이성'을 설명하며, 간편하게 만들 수 있다는 맥락에 적절하다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 'soggy'는 'crispy'가 와야 합니다." ← 뜻도 없고 무엇을 수식하는지도 없음!
"'soggy(흐물흐물한)'는 부정확한 표현이므로 정답이다." ← 왜 부정확한지 설명이 없음!

**REAL 수능 EXAMPLE (2024학년도 30번):**
Passage: "Bazaar economies feature an apparently flexible price-setting mechanism that sits atop more enduring ties of shared culture. Both the buyer and seller are aware of each other's ① restrictions. In Delhi's bazaars, buyers and sellers can ② assess to a large extent the financial constraints. In the case of electronic products like video games, they are not a ③ necessity at the same level as food items. So, the seller is careful not to directly ask for very ④ low prices for video games because at no point will the buyer see possession of them as an absolute necessity. Access to this type of knowledge establishes a price consensus by relating to each other's preferences and limitations of belonging to a ⑤ similar cultural and economic universe."

Answer: ④번 (low → high)
Why: 비디오 게임은 필수품이 아니므로 판매자가 '높은' 가격을 요구해도 됨. 낮은(low) 가격은 논리에 맞지 않음.

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**MANDATORY CHECKLIST (your response will be REJECTED if you fail any of these):**
□ Explanation has EXACTLY 3 paragraphs separated by \\n\\n
□ Every word in EXPLANATION has Korean meaning in parentheses: 'word(한국어뜻)'
□ Paragraph 2 explains what the wrong word MODIFIES (e.g., "토스트의 식감을 설명한다")
□ Paragraph 3 analyzes ALL 5 choices with pattern: ①'word(뜻)'는 [무엇]을 설명하며...
□ Never say "부정확한 표현이므로" without explaining WHY it's incorrect
□ **NEVER use asterisks (*) for emphasis in explanation - only use single quotes**
□ **Markers in passage MUST be in ①②③④⑤ sequential order**

**CRITICAL - CHOICES FORMAT:**
The "choices" array must contain ONLY the English words - NO Korean translations!
- CORRECT: ["essential", "multiple", "convenient", "interconnected", "efficient"]
- WRONG: ["essential(필수적인)", "multiple(다수의)", ...] ← NO KOREAN IN CHOICES!
Korean translations should ONLY appear in the "explanation" field.

**Output (JSON only):**
{
  "question": "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
  "markers": [5 marker objects],
  "answer": [1-5],
  "explanation": "글은 [내용 요약]. [문맥 포인트].\\n\\n정답은 '[틀린단어](뜻)'를 '[올바른단어](뜻)'로 바꿔야 한다. 본문에서 '[인용]'이라고 했는데, [왜 올바른 단어가 맞는지]. '[틀린단어]'는 [왜 안 맞는지].\\n\\n①'[단어](뜻)'는 [왜 맞는지]. ②'[단어](뜻)'는 [왜 맞는지]. ③'[단어](뜻)'는 [왜 틀린지]. ④'[단어](뜻)'는 [왜 맞는지]. ⑤'[단어](뜻)'는 [왜 맞는지]."
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
5. **ABSOLUTELY FORBIDDEN: NEVER use HTML tags in explanation. Use single quotes '...' for emphasis instead.**
6. **ABSOLUTELY FORBIDDEN: NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes**
7. Each choice must have a clearly different meaning from all other choices
8. **CRITICAL - ANSWER/EXPLANATION CONSISTENCY (READ CAREFULLY):**
   - The "answer" field is a 1-indexed number (1, 2, 3, 4, or 5)
   - choices[0] = choice ①, choices[1] = choice ②, choices[2] = choice ③, etc.
   - If answer = 2, then the correct choice is choices[1], and explanation MUST say "정답은 ②번 '[choices[1] text]'"
   - BEFORE responding, VERIFY: Does choices[answer-1] match the text you wrote in the explanation?
   - COMMON ERROR TO AVOID: Saying "정답은 ②번" but the actual content matches choices[2] (③번)
9. **USE \\n\\n (double newline) to separate paragraphs in explanation. DO NOT use single \\ or \\n.**

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [밑줄 친 표현이 등장하는 맥락 설명]."

**Paragraph 2 - 정답 분석 (비유적 의미 설명):**
"정답은 '[정답 선지]'이다. 본문에서 '[밑줄 친 표현 포함 문장 인용]'이라고 했는데, [왜 이 해석이 문맥에 맞는지]. '[표현]'은 문자 그대로 '[직역]'이 아니라 '[비유적 의미]'를 뜻한다."

**Paragraph 3 - 오답 분석 (각각 왜 틀린지):**
"①'[선지]'는 [왜 틀린지 - 예: 문자 그대로의 해석이라 비유적 의미를 놓쳤다].
②'[선지]'는 [왜 정답인지].
③'[선지]'는 [왜 틀린지 - 예: 문맥과 관련 없는 해석이다].
④'[선지]'는 [왜 틀린지 - 예: 표현의 일부만 해석한 것이다].
⑤'[선지]'는 [왜 틀린지 - 예: 반대되는 의미이다]."

**EXCELLENT EXAMPLE:**
"글은 회의 시작 시 분위기를 부드럽게 만들기 위한 매니저의 행동을 설명한다. 처음 만난 사람들 사이의 어색함을 해소하는 상황이다.

정답은 '어색한 분위기를 깨다'이다. 본문에서 'At the beginning of the meeting, the manager told a joke to break the ice'라고 했는데, 회의 시작 시 농담을 한 이유는 처음 만난 사람들 사이의 긴장감을 풀기 위함이다. 'break the ice'는 문자 그대로 '얼음을 깨다'가 아니라 '어색한 분위기를 완화하다'라는 비유적 의미로 사용되었다.

①'얼음을 깨다'는 문자 그대로의 직역으로, 관용적 표현의 비유적 의미를 놓쳤다. ②'어색한 분위기를 깨다'는 처음 만난 사람들 사이의 긴장을 푸는 문맥과 정확히 일치한다. ③'관계를 단절하다'는 분위기를 좋게 하려는 맥락과 반대된다. ④'냉정함을 유지하다'는 농담을 하는 따뜻한 행동과 맞지 않다. ⑤'침묵을 지키다'는 농담을 하는 상황과 모순된다."

**BAD EXAMPLE (DO NOT DO THIS):**
"밑줄 친 부분은 문맥상 '② 어색한 분위기를 깨다'를 의미합니다." ← 너무 짧고 분석이 없음!
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
4. The explanation MUST follow the DETAILED STRUCTURE below
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**

**Passage:**
{passage}

**DISTRACTOR DESIGN (each wrong answer should have a specific flaw):**
- Type A: 과장/단정 (Exaggeration) - 글의 내용을 넘어서는 단정적 주장
- Type B: 부분만 강조 (Too Narrow) - 한 측면만 강조해 전체 흐름을 좁힘
- Type C: 관점 변경 (Shifted Focus) - 글의 성격과 다른 방향으로 시각을 바꿈
- Type D: 본문 미언급 (Not Mentioned) - 본문에서 중심적으로 다루지 않은 내용

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글쓴이가 무엇을 설명/주장하는지 간결하게 요약]. [글의 흐름이나 핵심 논점 설명]."

**Paragraph 2 - 정답 분석 (핵심어 중심):**
"정답은 [핵심 개념/키워드]를 주제에 담으면서, [또 다른 핵심 요소]라는 측면을 함께 포괄한다. 이 핵심어들(예: AI, 의료, 진단)이 글의 중심을 간결하게 드러낸다."

**Paragraph 3 - 오답 분석 (각각 왜 틀린지):**
"①은 [구체적 이유 - 예: 글의 범위를 넘어선 과장된 주장이다].
②는 [구체적 이유 - 예: 한 측면만 강조해 전체 흐름을 지나치게 좁힌다].
③은 [구체적 이유 - 예: 글의 설명적 성격과 다른 제안/주장으로 시각을 바꾼다].
④는 [구체적 이유 - 예: 본문에서 중심적으로 다루지 않은 내용이다].
⑤은 [왜 정답인지 - 예: 글이 다룬 핵심 개념과 논점을 모두 반영해 주제로 가장 적절하다]."

**EXCELLENT EXAMPLE:**
"글은 인공지능이 의료 분야에서 환자 데이터를 분석하고 X-ray에서 이상을 감지하는 방식을 설명한다. AI 기술의 정확성과 효율성이 의료 진단에 가져오는 변화를 중심으로 서술한다.

정답은 인공지능(AI)이라는 핵심 기술과 의료 분야 적용이라는 두 축을 함께 포괄한다. 'AI', '의료', '진단'이라는 핵심어가 글의 중심을 간결하게 드러낸다.

①은 AI가 인간 의사를 대체할 것이라는 글에 없는 단정적 주장이다. ②는 X-ray 분석이라는 한 예시만 강조해 전체 활용 범위를 좁힌다. ③은 AI 도입을 위한 정책 제안 방향으로 시각을 바꿔 글의 설명적 성격과 어긋난다. ④는 AI 개발 역사를 다루는데, 본문의 중심 내용이 아니다. ⑤는 글이 설명한 AI의 의료 진단 활용을 정확히 반영해 주제로 가장 적절하다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 이 글은 인공지능에 대해 다루고 있습니다." ← 너무 짧고 분석이 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "다음 글의 주제로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["주제 선지1", "주제 선지2", "주제 선지3", "주제 선지4", "주제 선지5"],
  "answer": 5,
  "explanation": "글은 [내용 요약]. [핵심 논점 설명].\\n\\n정답은 [핵심 키워드]를 주제에 담으면서, [다른 핵심 요소]를 함께 포괄한다. [핵심어들]이 글의 중심을 간결하게 드러낸다.\\n\\n①은 [왜 틀린지]. ②는 [왜 틀린지]. ③은 [왜 틀린지]. ④는 [왜 틀린지]. ⑤은 [왜 정답인지 - 주제로 가장 적절하다]."
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
3. Distractors should be plausible but flawed in specific ways (see below)
4. The explanation MUST follow the DETAILED STRUCTURE below
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**

**Passage:**
{passage}

**DISTRACTOR DESIGN (each wrong answer should have a specific flaw):**
- Type A: 과장/단정 (Exaggeration) - 글의 내용을 넘어서는 단정적 주장
- Type B: 부분만 강조 (Too Narrow) - 한 측면만 강조해 전체 흐름을 좁힘
- Type C: 관점 변경 (Shifted Focus) - 서술적 성격과 다른 방향으로 시각을 바꿈
- Type D: 본문 미언급 (Not Mentioned) - 본문에서 중심적으로 다루지 않은 내용

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [화자/글쓴이가 무엇을 서술하는지 간결하게 요약]. [글의 흐름이나 구조 설명]."

**Paragraph 2 - 정답 분석 (핵심어 중심):**
"정답은 [핵심 성격/키워드]을 제목에 담으면서, [또 다른 핵심 요소]라는 [두 번째 축]을 함께 포괄한다. 이 [핵심어들](예: screening, technical, team fit)이 글의 중심을 간결하게 드러낸다."

**Paragraph 3 - 오답 분석 (각각 왜 틀린지):**
"①은 [구체적 이유 - 예: 글의 중요성을 과장해 글의 기술적 설명을 넘어선 단정에 이른다].
②는 [구체적 이유 - 예: 한 측면만 강조해 전체 흐름을 지나치게 좁힌다].
③은 [구체적 이유 - 예: 문제 해결/제안 방향으로 시각을 바꿔 글의 서술적 성격과 어긋난다].
④는 [구체적 이유 - 예: 특정 부분만 부각시켜 글이 중심적으로 다룬 폭과 형식을 놓친다].
⑤은 [왜 정답인지 - 예: 글이 보여 준 핵심 성격과 평가 축을 모두 반영해 중심과 가장 잘 맞는다]."

**EXCELLENT EXAMPLE:**
"글은 화자가 경험한 초기 면접의 진행 과정을 서술한다. 질문 범위와 화면 공유로 코드와 프로젝트를 보여 준 점, 그리고 다음 라운드로 이어지기 위한 합의로 마무리된 흐름을 제시한다.

정답은 면접의 핵심 성격인 screening을 제목에 담으면서, Zoom 환경에서 동시 평가된 technical 역량과 team 적합성이라는 두 축을 함께 포괄한다. 이 세 가지 핵심어(Zoom, screening, technical, team)가 글의 중심을 간결하게 드러낸다.

①은 면접의 중요성을 과장해 글의 기술적·상호작용적 설명을 넘어선 단정에 이른다. ②는 코드 시연이라는 한 측면만 강조해 전체 흐름을 지나치게 좁힌다. ③은 문제 해결을 위한 제안이나 개선 방안을 다루는 방향으로 시각을 바꿔 글의 서술적 성격과 어긋난다. ④는 면접 중의 압박감만 부각시켜 글이 중심적으로 다룬 평가의 폭과 형식을 놓친다. ⑤은 글이 보여 준 초기 화상 screening의 성격과 두 가지 평가 축을 모두 반영해 중심과 가장 잘 맞는다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ⑤번입니다. 이 글의 핵심은 면접입니다." ← 너무 짧고 분석이 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "다음 글의 제목으로 가장 적절한 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["Title Option 1", "Title Option 2", "Title Option 3", "Title Option 4", "Title Option 5"],
  "answer": 5,
  "explanation": "글은 [내용 요약]. [흐름 설명].\\n\\n정답은 [핵심 키워드]을 제목에 담으면서, [다른 핵심 요소]를 함께 포괄한다. [핵심어들]이 글의 중심을 간결하게 드러낸다.\\n\\n①은 [왜 틀린지]. ②는 [왜 틀린지]. ③은 [왜 틀린지]. ④는 [왜 틀린지]. ⑤은 [왜 정답인지 - 중심과 가장 잘 맞는다]."
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
4. The explanation MUST follow the DETAILED STRUCTURE below
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**

**⚠️ CRITICAL - PASSAGE MUST STAY IN ENGLISH:**
- The modifiedPassage field MUST contain the ORIGINAL ENGLISH passage
- NEVER translate the passage to Korean!
- Only the "choices" (선택지) should be in Korean

**Passage:**
{passage}

**DISTRACTOR DESIGN (each wrong answer should have a specific flaw):**
- Type A: 반대 (Opposite) - 본문 내용과 반대되는 진술
- Type B: 과장 (Exaggeration) - 본문 내용을 과장하거나 단정짓는 진술
- Type C: 미언급 (Not Mentioned) - 본문에서 언급하지 않은 내용
- Type D: 혼동 (Confusion) - 본문의 다른 내용과 혼동하게 만드는 진술

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [주요 사실이나 정보 나열]."

**Paragraph 2 - 정답 분석 (근거 인용):**
"정답은 [정답 선지 내용]이다. 본문에서 '[관련 영어 문장 정확히 인용]'이라고 명시되어 있어 이를 확인할 수 있다."

**Paragraph 3 - 오답 분석 (각각 왜 틀린지):**
"①은 [구체적 이유 - 예: 본문에서 '~'라고 했으므로 반대되는 내용이다].
②는 [구체적 이유 - 예: 본문에서 언급되지 않은 내용이다].
③은 [구체적 이유 - 예: 본문의 '~' 내용을 과장한 것이다].
④는 [왜 정답인지 - 예: 본문 내용과 정확히 일치한다].
⑤은 [구체적 이유 - 예: 본문의 다른 부분과 혼동한 진술이다]."

**EXCELLENT EXAMPLE:**
"글은 코카콜라의 역사를 설명한다. 1886년 애틀랜타의 약사가 처음 만들었고, 원래 의료용 강장제로 개발되었다가 이후 음료로 대중화되었다는 내용을 담고 있다.

정답은 '콜라는 1800년대 후반에 처음 만들어졌다'이다. 본문에서 'Coca-Cola was first created in 1886 by a pharmacist in Atlanta'라고 명시되어 있어 1800년대 후반(1886년)에 처음 만들어졌음을 확인할 수 있다.

①은 '콜라는 20세기 초에 발명되었다'라고 했는데, 1886년은 19세기 후반이므로 본문과 반대된다. ②는 '콜라는 처음부터 청량음료로 개발되었다'라고 했는데, 본문에서 의료용 강장제로 개발되었다고 했으므로 틀린 내용이다. ③은 '콜라의 발명가는 유럽 출신이었다'라고 했는데, 본문에서 언급되지 않은 내용이다. ④는 본문 내용과 정확히 일치한다. ⑤은 '콜라는 뉴욕에서 처음 만들어졌다'라고 했는데, 애틀랜타와 혼동한 진술이다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ④번입니다. 본문에서 확인할 수 있습니다." ← 너무 짧고 분석이 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 4,
  "explanation": "글은 [내용 요약]. [주요 사실 나열].\\n\\n정답은 '[정답 선지 내용]'이다. 본문에서 '[영어 문장 인용]'이라고 명시되어 있어 이를 확인할 수 있다.\\n\\n①은 [왜 틀린지]. ②는 [왜 틀린지]. ③은 [왜 틀린지]. ④는 [왜 정답인지]. ⑤은 [왜 틀린지]."
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
4. The explanation MUST follow the DETAILED STRUCTURE below
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**

**⚠️ CRITICAL - PASSAGE MUST STAY IN ENGLISH:**
- The modifiedPassage field MUST contain the ORIGINAL ENGLISH passage
- NEVER translate the passage to Korean!
- Only the "choices" (선택지) should be in Korean
- WRONG: modifiedPassage = "디지털 시대에, 기기를 연결하는 것은..." ← DO NOT DO THIS!
- CORRECT: modifiedPassage = "In the digital age, connecting devices has become..."

**Passage:**
{passage}

**WRONG ANSWER TYPES (for the ONE incorrect statement):**
- Type A: 반대 (Opposite) - 본문 내용과 정반대되는 진술
- Type B: 미언급 (Not Mentioned) - 본문에서 전혀 다루지 않은 내용
- Type C: 과장/축소 (Distortion) - 본문 내용을 과장하거나 축소한 진술
- Type D: 혼동 (Confusion) - 본문의 다른 내용과 뒤섞어 왜곡한 진술

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [본문에서 다루는 주요 사실들 나열]."

**Paragraph 2 - 정답(틀린 선지) 분석:**
"정답은 '[틀린 선지 내용]'이다. 본문에서 '[관련 영어 문장 인용]'이라고 했는데, 이는 [선지 내용]과 [반대/다름/관련없음]을 보여준다. [왜 이 선지가 틀린지 구체적 설명]."

**Paragraph 3 - 나머지 선지 분석 (각각 왜 맞는지):**
"①은 본문에서 '[인용]'이라고 했으므로 일치한다.
②는 본문에서 '[인용]'이라고 했으므로 일치한다.
③은 [왜 틀린지 - 정답이므로 이미 설명함].
④는 본문에서 '[인용]'이라고 했으므로 일치한다.
⑤은 본문에서 '[인용]'이라고 했으므로 일치한다."

**EXCELLENT EXAMPLE (FALSE - 반대):**
"글은 코카콜라의 역사를 설명한다. 1886년 애틀랜타의 약사가 처음 만들었고, 원래 의료용 강장제로 개발되었다가 이후 음료로 대중화되었다.

정답은 '콜라는 원래 의료 목적으로 개발되지 않았다'이다. 본문에서 'It was originally developed as a medicinal tonic'라고 명시되어 있어, 콜라가 원래 의료 목적(강장제)으로 개발되었음을 알 수 있다. 이 선지는 본문 내용과 정반대되는 진술이다.

①은 '콜라는 1800년대에 만들어졌다'인데, 본문에서 1886년이라고 했으므로 일치한다. ②는 '콜라는 미국에서 발명되었다'인데, 애틀랜타에서 만들어졌다고 했으므로 일치한다. ③은 본문과 반대되므로 정답이다. ④는 '콜라의 발명가는 약사였다'인데, 본문에서 'pharmacist'라고 했으므로 일치한다. ⑤은 '콜라는 이후 음료로 대중화되었다'인데, 본문 내용과 일치한다."

**EXCELLENT EXAMPLE (NOT MENTIONED - 미언급):**
"글은 코카콜라의 미국 내 발명과 초기 역사를 설명한다. 애틀랜타에서의 탄생과 의료용 강장제로 시작된 배경을 다룬다.

정답은 '콜라는 아시아에서 처음 인기를 얻었다'이다. 본문은 콜라의 발명 과정과 미국 내 초기 판매에 대해서만 다루고 있으며, 아시아 시장이나 해외 확장에 대한 내용은 전혀 언급되지 않았다.

①은 '콜라는 약사가 만들었다'인데, 본문에서 'pharmacist'라고 했으므로 일치한다. ②는 본문에서 언급되지 않았으므로 정답이다. ③은 '콜라는 강장제로 개발되었다'인데, 본문 내용과 일치한다. ④는 '콜라는 1886년에 만들어졌다'인데, 본문에서 명시했으므로 일치한다. ⑤은 '콜라는 애틀랜타에서 시작되었다'인데, 본문 내용과 일치한다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 본문에서 언급되지 않았습니다." ← 너무 짧고 분석이 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis - only use single quotes '...'
- Use \\n\\n for paragraph breaks.
- modifiedPassage MUST be in ENGLISH (original passage), NOT Korean!

**Output (JSON only):**
{
  "question": "다음 글의 내용과 일치하지 않는 것은?",
  "modifiedPassage": "{passage}",
  "choices": ["진술1", "진술2", "진술3", "진술4", "진술5"],
  "answer": 3,
  "explanation": "글은 [내용 요약]. [주요 사실 나열].\\n\\n정답은 '[틀린 선지 내용]'이다. 본문에서 '[영어 문장 인용]'이라고 했는데, 이는 [왜 틀린지 설명].\\n\\n①은 [왜 맞는지]. ②는 [왜 맞는지]. ③은 [정답이므로 틀린 이유]. ④는 [왜 맞는지]. ⑤은 [왜 맞는지]."
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
4. The explanation MUST follow the DETAILED STRUCTURE below
5. **CRITICAL: Preserve the original paragraph structure in modifiedPassage.**
6. **ABSOLUTELY FORBIDDEN: NEVER include "(정답)", "(오답)", "(correct)", "(wrong)" in choices!**

**Passage:**
{passage}

**DISTRACTOR DESIGN (each wrong answer should have a specific flaw):**
- Type A: 반의어 (Opposite) - 문맥과 반대되는 의미의 단어
- Type B: 유사하지만 부적절 (Similar but Wrong) - 비슷해 보이지만 문맥에 안 맞는 단어
- Type C: 관련 주제지만 부적절 (Related but Wrong) - 같은 주제 영역이지만 문맥에 안 맞는 단어
- Type D: 문법적으로 맞지만 의미상 부적절 (Grammatical but Wrong) - 문법상 가능하지만 의미가 안 맞는 단어

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [빈칸이 있는 문장의 맥락 설명]."

**Paragraph 2 - 정답 분석 (어휘 뜻 포함):**
"정답은 '[정답 단어](한글 뜻)'이다. 본문에서 '[빈칸 포함 문장 인용]'이라고 했는데, [왜 이 단어가 문맥에 맞는지 설명]. 이 단어의 핵심 의미인 '[핵심 뜻]'이 글의 흐름과 정확히 일치한다."

**Paragraph 3 - 오답 분석 (각각 왜 틀린지, 어휘 뜻 포함):**
"①'[단어](뜻)'은 [구체적 이유 - 예: 문맥과 반대되는 의미이다].
②'[단어](뜻)'는 [구체적 이유 - 예: 비슷해 보이지만 글의 논지와 맞지 않다].
③'[단어](뜻)'은 [왜 정답인지].
④'[단어](뜻)'는 [구체적 이유 - 예: 문법적으로는 가능하지만 의미상 어울리지 않는다].
⑤'[단어](뜻)'은 [구체적 이유 - 예: 관련 주제이지만 이 문맥에는 적합하지 않다]."

**EXCELLENT EXAMPLE:**
"글은 사람들 사이의 사랑과 협력이 어떤 환경을 만드는지 설명한다. 서로 사랑하는 관계에서는 함께 노력하여 긍정적인 환경을 조성한다는 내용이다.

정답은 'peaceful(평화로운)'이다. 본문에서 'When people love one another, they often work together to create a ______ environment'라고 했는데, 사랑이 있는 관계에서 협력하여 만드는 환경은 평화롭고 조화로운 것이 자연스럽다. 'peaceful'의 핵심 의미인 '갈등 없이 조화로운'이 글의 흐름과 정확히 일치한다.

①'hostile(적대적인)'은 사랑과 협력의 결과로 나오기엔 문맥과 정반대되는 부정적 의미이다. ②'chaotic(혼란스러운)'는 무질서함을 뜻하여 협력의 결과물로 적합하지 않다. ③'peaceful(평화로운)'은 사랑하는 관계의 협력이 만드는 환경을 정확히 표현한다. ④'isolated(고립된)'는 함께 협력한다는 맥락과 어울리지 않는다. ⑤'harsh(가혹한)'은 사랑이라는 긍정적 관계와 상충되는 부정적 의미이다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번 'peaceful'입니다. 문맥상 적절합니다." ← 뜻도 없고 분석도 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.
**VOCABULARY: ALWAYS include Korean meanings in parentheses: 'peaceful(평화로운)'**

**Output (JSON only):**
{
  "question": "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
  "modifiedPassage": "passage with ______ blank",
  "choices": ["peaceful", "hostile", "chaotic", "isolated", "harsh"],
  "answer": 1,
  "explanation": "글은 [내용 요약]. [빈칸 문맥 설명].\\n\\n정답은 '[정답](뜻)'이다. 본문에서 '[인용]'이라고 했는데, [왜 맞는지]. '[핵심 의미]'가 글의 흐름과 일치한다.\\n\\n①'[단어](뜻)'은 [왜 틀린지]. ②'[단어](뜻)'는 [왜 틀린지]. ③'[단어](뜻)'은 [왜 정답인지]. ④'[단어](뜻)'는 [왜 틀린지]. ⑤'[단어](뜻)'은 [왜 틀린지]."
}

**CRITICAL REMINDER:**
- choices array contains ONLY the words: ["peaceful", "hostile", "chaotic", "isolated", "harsh"]
- NEVER include: ["peaceful (정답)", "hostile (오답)", ...] ← WRONG!
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

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글 내용 요약:**
"글은 [글의 핵심 내용을 간결하게 요약]. [요약문이 담아야 할 핵심 포인트 설명]."

**Paragraph 2 - (A) 정답 분석 (어휘 뜻 포함):**
"(A)에는 '[정답A](한글뜻)'가 적절하다. 본문에서 '[A 관련 영어 문장 인용]'이라고 했는데, 이는 [왜 이 단어가 맞는지 설명]을 나타낸다."

**Paragraph 3 - (B) 정답 분석 (어휘 뜻 포함):**
"(B)에는 '[정답B](한글뜻)'가 적절하다. 본문에서 '[B 관련 영어 문장 인용]'이라고 했는데, 이는 [왜 이 단어가 맞는지 설명]을 나타낸다."

**Paragraph 4 - 오답 분석 (어휘 뜻 포함):**
"①'(A) [단어](뜻) - (B) [단어](뜻)'는 [왜 틀린지].
②'(A) [단어](뜻) - (B) [단어](뜻)'는 [왜 틀린지].
③'(A) [단어](뜻) - (B) [단어](뜻)'는 [왜 정답인지].
④'(A) [단어](뜻) - (B) [단어](뜻)'는 [왜 틀린지].
⑤'(A) [단어](뜻) - (B) [단어](뜻)'는 [왜 틀린지]."

**EXCELLENT EXAMPLE:**
"글은 콜라 음료의 특성과 세계적인 성공을 설명한다. 단맛이 소비자에게 어필하고 전 세계적으로 사랑받는 음료가 되었다는 핵심 내용을 담고 있다.

(A)에는 'sweet(달콤한)'가 적절하다. 본문에서 'its sugary taste appeals to many consumers'라고 했는데, 이는 설탕의 단맛이 소비자를 끌어들인다는 것을 나타낸다.

(B)에는 'popularity(인기)'가 적절하다. 본문에서 'it became one of the most consumed beverages worldwide'라고 했는데, 이는 전 세계적인 인기와 소비량을 나타낸다.

①'(A) bitter(쓴) - (B) decline(쇠퇴)'는 sugary taste가 단맛이므로 bitter와 맞지 않고, 세계적으로 사랑받았으므로 decline도 틀리다. ②'(A) sour(신) - (B) growth(성장)'는 A가 문맥과 맞지 않다. ③'(A) sweet(달콤한) - (B) popularity(인기)'는 본문의 핵심 내용과 정확히 일치한다. ④'(A) sweet(달콤한) - (B) criticism(비판)'는 B가 문맥과 반대된다. ⑤'(A) mild(순한) - (B) popularity(인기)'는 A가 sugary와 맞지 않다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. (A)에는 sweet이, (B)에는 popularity가 적절합니다." ← 뜻도 없고 분석도 없음!

**VOCABULARY: ALWAYS include Korean meanings in parentheses: 'sweet(달콤한)'**

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags (<u>, <b>, etc.) in explanation field. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

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

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글의 구체적 논지:**
"글은 '[구체적이고 명확한 논지]'에 대해 논한다. [글의 흐름과 논리 구조 설명]."

**Paragraph 2 - 정답(무관한 문장) 분석:**
"③번은 [같은 주제 영역]에 대한 내용이지만, '[구체적 논지]'와 직접적인 관련이 없다. [왜 무관한지 구체적 설명 - 예: 다른 세부 주제를 다루거나, 논지와 반대되거나, 논지를 지원하지 않는다]."

**Paragraph 3 - 나머지 문장 분석 (각각 왜 글의 흐름에 맞는지):**
"①번은 [어떤 내용]으로 글의 [역할 - 예: 도입부/주제 제시]를 한다.
②번은 [어떤 내용]으로 [논지를 어떻게 뒷받침하는지].
③번은 [왜 무관한지 - 정답이므로 이미 설명함].
④번은 [어떤 내용]으로 [논지를 어떻게 뒷받침하는지].
⑤번은 [어떤 내용]으로 [글의 마무리/결론 역할]을 한다."

**EXCELLENT EXAMPLE:**
"글은 '개가 주인에게 정서적 지지를 제공하는 방법'에 대해 논한다. 개의 충성심, 감정 인식 능력, 스트레스 감소 효과, 옥시토신 분비 등 정서적 유대의 다양한 측면을 설명한다.

③번은 '안내견 훈련 기간'에 대한 내용으로, 개라는 같은 주제이지만 '정서적 지지'라는 구체적 논지와 직접적인 관련이 없다. 안내견 훈련은 실용적/기능적 측면이지 정서적 유대와는 다른 세부 주제이다.

①번은 '개는 충성스러운 동반자'라는 내용으로 정서적 유대의 기반을 제시한다. ②번은 '개가 주인의 감정을 인식한다'는 내용으로 정서적 연결을 뒷받침한다. ③번은 안내견 훈련에 관한 내용으로 정서적 지지 논지와 무관하다. ④번은 '개 주인의 스트레스 수준이 낮다'는 연구 결과로 정서적 효과를 입증한다. ⑤번은 '옥시토신 분비'로 정서적 유대의 과학적 근거를 제시한다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 이 글은 개에 대한 글입니다. ③번은 흐름과 맞지 않습니다." ← 구체적 논지도 없고 분석도 없음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "다음 글에서 전체 흐름과 관계 없는 문장은?",
  "modifiedPassage": "①First sentence. ②Second sentence. ③Third sentence (irrelevant). ④Fourth sentence. ⑤Fifth sentence.",
  "choices": ["①", "②", "③", "④", "⑤"],
  "answer": 3,
  "explanation": "글은 '[구체적 논지]'에 대해 논한다. [흐름 설명].\\n\\n③번은 [같은 주제]에 대한 내용이지만, '[논지]'와 직접적인 관련이 없다. [왜 무관한지].\\n\\n①번은 [역할]. ②번은 [역할]. ③번은 [무관한 이유]. ④번은 [역할]. ⑤번은 [역할]."
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

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 글의 흐름 파악:**
"글은 [글의 전체 흐름을 간결하게 설명]. 주어진 문장 '[삽입 문장]'은 [이 문장의 역할 - 예: 반론/예시/결과/원인 제시]를 한다."

**Paragraph 2 - 정답 위치 분석 (앞뒤 문장 연결):**
"(B) 앞 문장에서 '[앞 문장 내용 인용]'이라고 했고, 주어진 문장은 [어떻게 연결되는지 - 예: 이에 대한 반론을 제시한다]. 그리고 (B) 뒤 문장 '[뒤 문장 내용]'은 [어떻게 이어지는지 - 예: 그 결과를 설명한다]. [담화 표지어나 대명사가 있다면 언급]."

**Paragraph 3 - 다른 위치가 안 되는 이유:**
"(A)에 넣으면 [왜 안 맞는지].
(B)에 넣으면 [왜 정답인지 - 앞뒤 문장과 논리적으로 연결된다].
(C)에 넣으면 [왜 안 맞는지].
(D)에 넣으면 [왜 안 맞는지]."

**EXCELLENT EXAMPLE:**
"글은 과학자들이 새로운 방법을 발견했지만 한계가 있어 대안을 찾게 된 과정을 설명한다. 주어진 문장 'However, this approach had limitations'은 앞서 언급된 방법의 한계를 지적하는 역할을 한다.

(B) 앞 문장에서 'Scientists discovered a new method'라고 새로운 방법의 발견을 언급했고, 주어진 문장은 'However'로 시작하여 그 방법의 한계를 설명한다. 그리고 (B) 뒤 문장 'Therefore, they sought alternatives'는 한계 때문에 대안을 찾게 되었음을 설명한다. 'However'라는 역접 연결어가 앞 문장의 긍정적 발견과 한계라는 부정적 측면을 연결하고, 'Therefore'가 그 결과를 이끌어낸다.

(A)에 넣으면 아직 방법이 언급되기 전이라 'this approach'가 가리킬 대상이 없다. (B)에 넣으면 방법 발견 → 한계 → 대안 탐색이라는 논리적 흐름이 완성된다. (C)에 넣으면 이미 대안을 찾은 후라 시간 순서가 맞지 않다. (D)에 넣으면 결론 부분에 한계를 언급하는 것이 어색하다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ②번 (B)입니다. 이 위치가 가장 자연스럽습니다." ← 이유 없이 너무 짧음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
  "modifiedPassage": "passage with (A), (B), (C), (D) markers",
  "sentenceToInsert": "The sentence to be inserted",
  "choices": ["(A)", "(B)", "(C)", "(D)"],
  "answer": 2,
  "explanation": "글은 [전체 흐름]. 주어진 문장 '[삽입 문장]'은 [역할].\\n\\n(B) 앞 문장에서 '[앞 문장]'이라고 했고, 주어진 문장은 [연결]. (B) 뒤 문장 '[뒤 문장]'은 [연결]. [담화 표지어 설명].\\n\\n(A)에 넣으면 [이유]. (B)에 넣으면 [정답 이유]. (C)에 넣으면 [이유]. (D)에 넣으면 [이유]."
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

**EXPLANATION STRUCTURE (MUST FOLLOW THIS EXACTLY):**

**Paragraph 1 - 주어진 글과 첫 번째 단락 연결:**
"주어진 글에서 '[주어진 글 핵심 내용]'을 언급했다. (B)는 '[첫 문장/핵심 내용]'으로 시작하는데, '[담화 표지어/대명사]'가 주어진 글의 [무엇]을 가리키므로 주어진 글 바로 다음에 와야 한다."

**Paragraph 2 - 두 번째, 세 번째 단락 연결:**
"(C)는 '[연결 표현]'으로 시작하여 (B)의 내용에 대한 [역할 - 예: 반론/보충/예시]를 제시한다. (A)는 '[연결 표현]'으로 시작하여 [역할 - 예: 결론/요약]을 내리므로 가장 마지막에 와야 한다."

**Paragraph 3 - 다른 순서가 안 되는 이유:**
"(A)-(C)-(B)는 [왜 안 되는지 - 예: 결론이 먼저 나와서 논리 순서가 맞지 않다].
(B)-(A)-(C)는 [왜 안 되는지].
(B)-(C)-(A)는 [왜 정답인지 - 논리적 흐름이 완성된다].
(C)-(A)-(B)는 [왜 안 되는지].
(C)-(B)-(A)는 [왜 안 되는지]."

**EXCELLENT EXAMPLE:**
"주어진 글에서 '새로운 기술의 등장'을 언급했다. (B)는 'This technology has revolutionized...'로 시작하는데, 'This technology'가 주어진 글에서 언급한 기술을 직접 가리키므로 주어진 글 바로 다음에 와야 한다.

(C)는 'However'로 시작하여 (B)에서 설명한 기술의 장점에 대한 반론(한계점)을 제시한다. (A)는 'Therefore'로 시작하여 장단점을 종합한 결론을 내리므로 가장 마지막에 와야 한다.

(A)-(C)-(B)는 결론(A)이 먼저 나와서 논리 순서가 맞지 않다. (B)-(A)-(C)는 결론(A) 다음에 반론(C)이 나와서 흐름이 어색하다. (B)-(C)-(A)는 기술 설명 → 한계 → 결론이라는 논리적 흐름이 완성된다. (C)-(A)-(B)는 반론이 먼저 나오는데 무엇에 대한 반론인지 불분명하다. (C)-(B)-(A)는 반론이 기술 설명보다 앞서 나와서 어색하다."

**BAD EXAMPLE (DO NOT DO THIS):**
"정답은 ③번입니다. 논리적 흐름상 자연스럽습니다." ← 이유 없이 너무 짧음!

**CRITICAL FORMATTING RULES:**
- NEVER use HTML tags. Use single quotes '...' for emphasis.
- NEVER use ** (asterisks) for bold/emphasis in explanation - only use single quotes '...'
- Use \\n\\n for paragraph breaks.

**Output (JSON only):**
{
  "question": "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
  "modifiedPassage": "Given: [intro paragraph]\\n\\n(A) [paragraph A content]\\n\\n(B) [paragraph B content]\\n\\n(C) [paragraph C content]",
  "choices": ["(A)-(C)-(B)", "(B)-(A)-(C)", "(B)-(C)-(A)", "(C)-(A)-(B)", "(C)-(B)-(A)"],
  "answer": 3,
  "explanation": "주어진 글에서 '[내용]'을 언급했다. (B)는 '[내용]'으로 시작하는데, '[표지어]'가 [연결].\\n\\n(C)는 '[표지어]'로 시작하여 [역할]. (A)는 '[표지어]'로 시작하여 [역할].\\n\\n(A)-(C)-(B)는 [이유]. (B)-(A)-(C)는 [이유]. (B)-(C)-(A)는 [정답 이유]. (C)-(A)-(B)는 [이유]. (C)-(B)-(A)는 [이유]."
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
