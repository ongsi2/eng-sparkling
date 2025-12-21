# Question Validation Skill

Validate AI-generated English questions for Korean SAT (수능) format.

## Usage
```
/validate-question [QUESTION_TYPE]
```

Run this after generating questions to verify quality against 수능 standards.

## Validation Criteria by Type

### GRAMMAR_INCORRECT (어법)
- [ ] 5개 문법 포인트에 ①②③④⑤ 마커 있음
- [ ] 정확히 1개만 틀린 문법
- [ ] 4개는 올바른 문법
- [ ] 해설에 문법 규칙 설명 포함
- [ ] 예시: 주어-동사 수일치, 시제, 분사, 관계사 등

**수능 기출 예시 (2024 29번):**
```
... ① seeming to know... ② which they have... ③ do succeed... ④ those of others... ⑤ to be 'like me'
정답: ②번 (which → that/with which)
```

### SELECT_INCORRECT_WORD (어휘)
- [ ] 5개 단어에 ①②③④⑤ 마커 있음
- [ ] 1개 단어가 문맥상 부적절
- [ ] 해설에 각 단어의 뜻(한글) 포함
- [ ] 해설에 "무엇을 수식/설명하는지" 명시
- [ ] 틀린 단어 → 올바른 단어 제시

**수능 기출 예시 (2024 30번):**
```
... ① restrictions... ② assess... ③ necessity... ④ low... ⑤ similar
정답: ④번 (low → high)
해설: 비디오 게임은 필수품이 아니므로 판매자가 "높은" 가격을 요구
```

### PICK_UNDERLINE (밑줄 의미)
- [ ] `<u>...</u>` 태그로 밑줄 표시
- [ ] 비유적/관용적 표현 선택 (직역 불가)
- [ ] 직역은 오답으로 포함
- [ ] 문맥적 의미가 정답

**수능 기출 예시 (2024 21번):**
```
밑줄: "a nonstick frying pan"
직역(오답): 논스틱 프라이팬
정답: 더 넓은 관점에서 경험을 바라보는 것
```

### IRRELEVANT_SENTENCE (무관한 문장)
- [ ] 5개 문장에 ①②③④⑤ 번호
- [ ] 1개 문장이 흐름과 무관
- [ ] 무관한 문장은 같은 주제지만 다른 세부 주제
- [ ] 너무 뚜렷하게 다른 주제는 부적절

**수능 기출 예시 (2024 35번):**
```
주제: "빠르게 말하기의 위험성"
③ Making a good decision helps you speak faster... (논지 반대)
→ 정답: ③번 (전체 흐름과 반대되는 주장)
```

### SENTENCE_ORDER (순서)
- [ ] (A)(B)(C) 단락이 문단 앞에 위치
- [ ] 연결어(However, Therefore, This 등) 힌트
- [ ] 대명사 지시 대상 확인

### INSERT_SENTENCE (문장 삽입)
- [ ] (A)(B)(C)(D) 4개 삽입 위치
- [ ] 주어진 문장의 연결어 확인
- [ ] 앞뒤 문맥 논리적 흐름 검증

## Automated Validation

### Run Test Script
```bash
npx ts-node scripts/test-question-generation.ts FULL
```

### Run Single Type
```bash
npx ts-node scripts/test-question-generation.ts GRAMMAR_INCORRECT
```

## Quality Checklist

1. **정답 검증**
   - 해설의 정답 번호와 answer 필드 일치?
   - 정답 근거가 지문에서 확인 가능?

2. **해설 구조**
   - 3단락 구조? (요약 → 정답분석 → 오답분석)
   - 모든 선지 분석 포함?
   - 한글 뜻 괄호로 표기?

3. **형식 검증**
   - JSON 구조 올바름?
   - 필수 필드 존재?
   - HTML 태그 올바름?

## Arguments
- `$ARGUMENTS` - Question type: GRAMMAR_INCORRECT, SELECT_INCORRECT_WORD, PICK_UNDERLINE, PICK_SUBJECT, PICK_TITLE, CORRECT_ANSWER, INCORRECT_ANSWER, BLANK_WORD, COMPLETE_SUMMARY, IRRELEVANT_SENTENCE, INSERT_SENTENCE, SENTENCE_ORDER

## References
- 수능 기출 레퍼런스: `data/suneung-reference.md`
- 프롬프트 템플릿: `lib/all-prompts.ts`
