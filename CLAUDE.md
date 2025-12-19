# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ENG-MVP** - AI 기반 영어 문제 자동 생성 서비스의 MVP 버전입니다.
ENG-SPARK 서비스를 참고하여 개발 중입니다.

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React useState (로컬), 추후 Zustand 예정

### Backend (예정)
- **Auth**: NextAuth.js 또는 Firebase Auth (OAuth2)
- **DB**: PostgreSQL 또는 Supabase
- **AI**: OpenAI API (GPT-4o-mini)

## Project Structure

```
eng-mvp/
├── app/
│   ├── page.tsx              # 메인 페이지 (데모)
│   ├── login/page.tsx        # 로그인 (플레이스홀더)
│   ├── workflow/page.tsx     # AI 문제 생성 워크플로우
│   ├── api/
│   │   ├── generate/         # 문제 생성 API
│   │   └── generate-article/ # 아티클 생성 API
│   └── components/
├── data/
│   └── demo-questions.ts     # 데모용 고정 문제 데이터
├── lib/
│   ├── openai.ts
│   ├── prompts.ts
│   └── storage.ts            # localStorage 헬퍼
├── types/
│   └── index.ts              # 타입 정의
├── docs/                     # 참고 문서
│   ├── eng-spark.md          # ENG-SPARK 서비스 스펙
│   ├── bfai_jd.pdf           # 기술 스택 참고
│   └── eng-spark-mainpage.pdf
├── DEV-LOG.md                # 개발 내역
└── HANDOFF.md                # 작업 핸드오프 문서
```

## Key Features

### 메인 페이지 (데모)
- 고정 지문 (2025 수능 영어 20번)
- 12개 문제 유형 버튼
- 버튼 클릭 시 미리 저장된 문제 표시 (AI 호출 없음)

### 문제 유형 (12가지)
1. GRAMMAR_INCORRECT - 문법형 (어법상 틀린 것)
2. SELECT_INCORRECT_WORD - 틀린 단어 선택형
3. PICK_UNDERLINE - 밑줄의 의미형
4. PICK_SUBJECT - 주제 뽑기형
5. PICK_TITLE - 제목 뽑기형
6. CORRECT_ANSWER - 맞는 선지 뽑기
7. INCORRECT_ANSWER - 틀린 선지 뽑기
8. BLANK_WORD - 빈칸에 들어갈 말
9. COMPLETE_SUMMARY - 요약문 완성
10. IRRELEVANT_SENTENCE - 무관한 문장
11. INSERT_SENTENCE - 문장 삽입
12. SENTENCE_ORDER - 글의 순서형

## Development Commands

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npx tsc --noEmit

# 빌드
npm run build
```

## TODO (향후 작업)

- [x] OAuth2 Google 로그인 (Supabase Auth)
- [x] 데이터베이스 연결 (Supabase)
- [x] 크레딧(코인) 시스템 DB 연동
- [x] 결제 연동 (Toss Payments)

## Handoff Rules (세션 간 작업 인수인계)

**중요: 모든 세션에서 이 규칙을 따라야 합니다.**

### 세션 시작 시
1. `HANDOFF.md` 파일을 먼저 읽어서 이전 작업 상태 파악
2. 마지막 세션에서 진행 중이던 작업 확인
3. 남은 TODO 항목 확인

### 작업 완료 시
1. 하나의 기능/작업이 완료될 때마다 `HANDOFF.md`에 즉시 기록
2. 기록 형식:
   ```
   #### [YYYY-MM-DD HH:MM] 작업명
   - 변경된 파일: `파일경로`
   - 작업 내용 요약
   - 주의사항 (있다면)
   ```

### 세션 종료 시
1. 진행 중인 작업 상태 기록
2. 다음에 해야 할 작업 목록 업데이트
3. 알려진 이슈나 버그 기록

### HANDOFF.md 구조
```markdown
# 최신 세션 (맨 위에)
## [날짜] 세션
### 완료된 작업
### 진행 중인 작업
### 다음 작업
### 알려진 이슈

# 이전 세션들 (아래로)
---
## [이전 날짜] 세션
...
```

## Reference Documents

- `docs/eng-spark.md` - ENG-SPARK 서비스 전체 스펙 (한국어)
- `docs/bfai_jd.pdf` - BFAI 채용 공고 (기술 스택 참고)
- `HANDOFF.md` - 작업 이어받기용 문서
- `DEV-LOG.md` - 개발 히스토리
