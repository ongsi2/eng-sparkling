# ENG-SPARKLING 테스트 스킬 및 도구 문서

## 개요

이 문서는 AI 문제 생성 기능을 테스트하고 검증하기 위해 만들어진 스킬, 서브에이전트, 도구들을 정리합니다.

---

## 생성된 스킬/명령어

### 1. `/validate-question`
**위치:** `.claude/commands/validate-question.md`

**용도:** AI로 생성된 문제의 품질을 검증

**검증 항목:**
- 정답과 해설의 일치 여부
- 밑줄 형식 확인 (PICK_UNDERLINE 유형)
- 선지의 유효성 및 중복 여부
- 전반적인 문제 품질

**사용법:**
```bash
# Claude Code에서
/validate-question

# 또는 직접 테스트 실행
node tests/run-validation.js
```

---

### 2. `/test-question-gen`
**위치:** `.claude/commands/test-question-gen.md`

**용도:** 여러 아티클과 문제 유형으로 자동화된 테스트 실행

**테스트 케이스:**
| 키워드 | 문제 유형 |
|--------|-----------|
| AI, healthcare | PICK_UNDERLINE |
| climate, technology | PICK_UNDERLINE, PICK_SUBJECT |
| education, digital | PICK_UNDERLINE, GRAMMAR |

---

## 테스트 스크립트

### `tests/run-validation.js`
**용도:** Node.js 기반 자동화 테스트 스크립트

**주요 기능:**
```javascript
// API 호출로 아티클 생성
generateArticle(keywords, difficulty, wordCount)

// 문제 생성
generateQuestion(passage, questionType)

// 문제 검증
validateQuestion(question, questionType)
```

**검증 상세:**
- `hasUnderline`: `<u>` 태그 존재 여부
- `explanationMentionsAnswer`: 해설에 정답 번호 언급 여부
- `answerMatchesExplanation`: 정답과 해설 내용 일치 여부
- `choicesAreDistinct`: 선지 중복 여부

**실행:**
```bash
# 서버가 localhost:3001에서 실행 중이어야 함
node tests/run-validation.js
```

---

### `tests/question-validation-test.ts`
**용도:** TypeScript 버전의 테스트 스크립트 (ts-node로 실행)

---

## Codex 연동

### Codex를 활용한 심층 검증

**사용 모델:** gpt-5-codex
**Reasoning Effort:** medium

**검증 명령어:**
```bash
echo "[문제 상세 정보]" | codex exec -m gpt-5-codex \
  --config model_reasoning_effort="medium" \
  --sandbox read-only \
  --full-auto
```

**Codex 검증 항목:**
1. 정답이 밑줄 친 표현의 의미를 정확히 나타내는가?
2. 해설이 정답을 올바르게 참조하는가?
3. 오답 선지들이 합리적이지만 명확히 틀린가?
4. 수능 스타일에 맞는 문제인가?

**결과 형식:**
- `VALID`: 문제가 모든 기준을 충족
- `INVALID`: 문제에 오류 있음 + 사유

---

## 수정된 프롬프트

### 수정 내역

| 프롬프트 | 수정 내용 |
|----------|-----------|
| `PICK_UNDERLINE_PROMPT` | `<u>` 태그 사용 명시, 해설-정답 일치 강조 |
| `PICK_SUBJECT_PROMPT` | 정답 번호와 선지 텍스트를 해설에 명시 |
| `PICK_TITLE_PROMPT` | 정답 번호와 제목을 해설에 명시 |
| `GRAMMAR_INCORRECT_PROMPT` | 선지 형식 개선, 해설에 틀린/올바른 형태 명시 |

### 프롬프트 수정 핵심

**공통 패턴:**
```
**IMPORTANT:**
- The explanation must state which number is correct AND include the exact text of that choice
- Example: "정답은 ③번 '[정답 내용]'입니다. [설명]"
```

---

## 테스트 결과 요약

### 2024-12-17 테스트 결과

| 문제 유형 | 테스트 수 | 성공 | 실패 |
|-----------|-----------|------|------|
| PICK_UNDERLINE | 3 | 3 | 0 |
| PICK_SUBJECT | 1 | 1 | 0 |
| GRAMMAR_INCORRECT | 1 | 1 | 0 |
| **합계** | **5** | **5** | **0** |

**검증 통과 항목:**
- ✅ 모든 PICK_UNDERLINE 문제에 `<u>` 태그 존재
- ✅ 모든 해설에 정답 번호 언급
- ✅ 정답과 해설 내용 일치
- ✅ 선지 중복 없음
- ✅ Codex 심층 검증 통과 (VALID)

---

## 사용 시나리오

### 1. 새 문제 유형 추가 시
```bash
# 1. 프롬프트 수정 후 테스트 실행
node tests/run-validation.js

# 2. 실패 시 프롬프트 수정 및 재테스트

# 3. Codex로 심층 검증
codex exec -m gpt-5-codex --sandbox read-only --full-auto
```

### 2. 정기 품질 검사
```bash
# 전체 테스트 스위트 실행
node tests/run-validation.js

# 결과 확인 후 필요시 프롬프트 튜닝
```

### 3. 버그 리포트 시
```bash
# 특정 문제 유형 집중 테스트
# run-validation.js의 testCases 수정 후 실행
```

---

## 파일 구조

```
eng-sparkling/
├── .claude/
│   └── commands/
│       ├── validate-question.md    # 문제 검증 스킬
│       └── test-question-gen.md    # 테스트 실행 스킬
├── tests/
│   ├── run-validation.js           # Node.js 테스트 스크립트
│   └── question-validation-test.ts # TypeScript 테스트 스크립트
├── lib/
│   └── all-prompts.ts              # 수정된 프롬프트들
└── docs/
    └── TESTING-SKILLS.md           # 이 문서
```

---

## 향후 개선 사항

- [ ] Jest/Vitest 기반 테스트 프레임워크 통합
- [ ] CI/CD 파이프라인에 자동 테스트 추가
- [ ] 더 많은 문제 유형에 대한 테스트 케이스 확장
- [ ] 한국어 번역 품질 검증 자동화
- [ ] 테스트 결과 리포트 생성 기능
