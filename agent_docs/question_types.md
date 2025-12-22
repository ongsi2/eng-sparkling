# 문제 유형 (12가지)

## 유형 목록

| ID | 이름 | 설명 |
|----|------|------|
| GRAMMAR_INCORRECT | 문법형 | 어법상 틀린 것 찾기 |
| SELECT_INCORRECT_WORD | 틀린 단어 선택형 | 문맥상 틀린 단어 찾기 |
| PICK_UNDERLINE | 밑줄의 의미형 | 밑줄 친 부분의 의미 파악 |
| PICK_SUBJECT | 주제 뽑기형 | 글의 주제 파악 |
| PICK_TITLE | 제목 뽑기형 | 적절한 제목 선택 |
| CORRECT_ANSWER | 맞는 선지 뽑기 | 내용과 일치하는 것 |
| INCORRECT_ANSWER | 틀린 선지 뽑기 | 내용과 불일치하는 것 |
| BLANK_WORD | 빈칸에 들어갈 말 | 빈칸 추론 |
| COMPLETE_SUMMARY | 요약문 완성 | 요약문의 빈칸 채우기 |
| IRRELEVANT_SENTENCE | 무관한 문장 | 흐름과 관계없는 문장 |
| INSERT_SENTENCE | 문장 삽입 | 주어진 문장 위치 찾기 |
| SENTENCE_ORDER | 글의 순서형 | 문단 순서 배열 |

## 프롬프트 위치

- 기본 프롬프트: `lib/prompts.ts`
- 프롬프트 검증: `scripts/validate-prompts.ts`
- 품질 평가: `scripts/quality-evaluator.ts`
