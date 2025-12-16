# ENG-MVP 개발 내역

## 개요
ENG-SPARK 서비스의 MVP 버전 개발 로그입니다.

---

## 2024-12-16 메인 페이지 리팩토링

### 작업 내용

#### 1. 데모 데이터 생성 (`data/demo-questions.ts`)
- **목적**: AI 없이 고정 지문과 미리 생성된 문제를 표시하기 위한 데이터
- **포함 내용**:
  - `DEMO_PASSAGE`: 2025학년도 수능 영어 20번 지문
  - `QUESTION_TYPES`: 12개 문제 유형 정보 (라벨, 아이콘, 설명)
  - `DEMO_QUESTIONS`: 각 유형별 미리 생성된 문제 (질문, 지문, 선택지, 정답, 해설)

```typescript
// 지원 문제 유형 (12가지)
- GRAMMAR_INCORRECT: 문법형 (어법상 틀린 것)
- SELECT_INCORRECT_WORD: 틀린 단어 선택형
- PICK_UNDERLINE: 밑줄의 의미형
- PICK_SUBJECT: 주제 뽑기형
- PICK_TITLE: 제목 뽑기형
- CORRECT_ANSWER: 맞는 선지 뽑기
- INCORRECT_ANSWER: 틀린 선지 뽑기
- BLANK_WORD: 빈칸에 들어갈 말
- COMPLETE_SUMMARY: 요약문 완성
- IRRELEVANT_SENTENCE: 무관한 문장
- INSERT_SENTENCE: 문장 삽입
- SENTENCE_ORDER: 글의 순서형
```

#### 2. 메인 페이지 리팩토링 (`app/page.tsx`)
- **참고**: ENG-SPARK 실제 서비스 디자인 (eng-spark-mainpage.pdf)
- **구성**:
  - Header: 로고 + 로그인 버튼
  - Hero Section: 타이틀 + 가입 유도 문구
  - Demo Passage: 고정 수능 지문 표시
  - Feature Buttons: 12개 문제 유형 버튼 (접기/펼치기)
  - Question Display: 선택한 유형의 문제 표시
  - Why Section: 서비스 장점 3가지
  - CTA Section: 가입 유도
  - Footer

#### 3. 로그인 페이지 생성 (`app/login/page.tsx`)
- **상태**: 플레이스홀더 (실제 인증 미연동)
- **구성**:
  - Google 로그인 버튼 (클릭 시 안내 메시지)
  - Apple 로그인 버튼 (비활성화)
  - 이메일 로그인 (비활성화)
  - 메인으로 돌아가기 링크

---

## 파일 구조

```
eng-mvp/
├── app/
│   ├── page.tsx          # 메인 페이지 (리팩토링됨)
│   ├── login/
│   │   └── page.tsx      # 로그인 페이지 (NEW)
│   ├── workflow/
│   │   └── page.tsx      # 2단계 워크플로우 (기존)
│   ├── api/
│   │   ├── generate/
│   │   └── generate-article/
│   └── components/
│       ├── PassageInput.tsx
│       ├── QuestionDisplay.tsx
│       └── History.tsx
├── data/
│   └── demo-questions.ts  # 데모 데이터 (NEW)
├── lib/
│   └── storage.ts
└── types/
    └── index.ts
```

---

## TODO (향후 작업)

### 인증 (OAuth2)
- [ ] NextAuth.js 또는 Firebase Auth 설정
- [ ] Google OAuth 클라이언트 ID 발급
- [ ] 로그인 상태 관리 (Context/Zustand)
- [ ] Protected Routes 구현

### 데이터베이스
- [ ] PostgreSQL 또는 Supabase 연결
- [ ] 사용자 테이블 생성
- [ ] 생성 기록 저장 (localStorage → DB 마이그레이션)

### 기능 확장
- [ ] URL에서 아티클 가져오기 기능
- [ ] 직접 지문 입력 + AI 생성 통합
- [ ] 크레딧 시스템 구현

---

## 기술 스택

| 영역 | 기술 |
|-----|-----|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| State | React useState (로컬) |
| AI | OpenAI API (workflow 페이지) |
| Auth | 미구현 (NextAuth.js 예정) |
| DB | 미구현 (localStorage 사용 중) |

---

## 실행 방법

```bash
cd eng-mvp
npm install
npm run dev
```

- 메인 페이지: http://localhost:3000
- 로그인 페이지: http://localhost:3000/login
- 워크플로우: http://localhost:3000/workflow
