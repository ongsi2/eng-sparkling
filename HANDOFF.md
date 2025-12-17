# ENG-SPARKLING 작업 핸드오프 (2024-12-17)

## 현재 상태: 프롬프트 해설 품질 개선 완료, 커밋 대기

---

## 프로젝트 위치
```
C:\springboot\eng-sparkling
```

## 실행 방법
```bash
cd "C:/springboot/eng-sparkling"
npm run dev
# http://localhost:3000
```

## 환경 설정
- `.env.local` 파일에 OpenAI API 키 필요
- `.env.example` 참고하여 생성

---

## 오늘(12/17) 완료된 작업

### 1. 전체 프롬프트 테스트 및 검증
- `tests/full-validation.js` 생성 - 12개 문제 유형 자동 테스트
- 결과: 12/12 (100%) 통과

### 2. GRAMMAR_INCORRECT & SELECT_INCORRECT_WORD 수정
- **문제**: AI가 마커 ①②③④⑤ 중 일부만 생성하거나 중복 생성
- **해결**: 구조화된 `markers` 배열 방식으로 변경
  - AI가 위치와 단어 정보만 반환
  - 서버에서 마커를 프로그래밍 방식으로 삽입
- **파일**: `lib/all-prompts.ts`, `app/api/generate/route.ts`

### 3. IRRELEVANT_SENTENCE 수정
- **문제**: 해설에서 "③번 문장은 글의 주제인 '주제'와 관련이 없습니다" 출력
- **해결**:
  - 실제로 무관한 문장을 생성하여 삽입하도록 프롬프트 수정
  - 해설에 실제 주제명 포함 필수
- **테스트**: `tests/test-irrelevant.js`

### 4. 드롭다운 버튼 클릭 문제 수정
- **문제**: 지문이 길어 옵션창이 위로 뜰 때 버튼 클릭 안 됨
- **해결**: 네이티브 `<select>` → 커스텀 드롭다운 (z-index: 50)
- **파일**: `app/workflow/page.tsx`

### 5. 아티클 문단 포맷팅 수정
- **문제**: 생성된 아티클 문단이 합쳐져서 표시됨
- **해결**: 프롬프트에 "Separate paragraphs with double newlines (\\n\\n)" 추가
- **파일**: `lib/article-prompts.ts`

### 6. 아카이브 기능 추가
- 생성한 문제를 localStorage에 저장 (최대 50개)
- `/archive` 페이지에서 저장된 문제 확인/삭제 가능
- **파일**:
  - `app/archive/page.tsx` (신규)
  - `app/workflow/page.tsx` (저장 버튼 추가)

### 7. 코인 시스템 구현
- 아티클 생성: 1코인, 문제 생성: 1코인
- 초기 코인: 100개 (테스트용으로 넉넉히)
- **파일**:
  - `lib/coins.ts` (신규)
  - `app/components/CoinDisplay.tsx` (신규)

### 8. 해설 품질 개선 (모든 프롬프트)
- **문제**: "정답은 ③번입니다. 문맥상 적절합니다." 같은 부실한 해설
- **해결**: 모든 프롬프트에 EXPLANATION REQUIREMENTS 섹션 추가
  - 본문 인용 필수
  - 왜 정답인지 구체적 설명 필수
  - GOOD EXAMPLE / BAD EXAMPLE 포함
- **수정된 프롬프트**:
  - BLANK_WORD
  - CORRECT_ANSWER
  - INCORRECT_ANSWER
  - COMPLETE_SUMMARY
  - INSERT_SENTENCE
  - SENTENCE_ORDER
  - PICK_SUBJECT
  - PICK_TITLE
  - PICK_UNDERLINE

### 9. 메인 페이지 가격 문구 수정
- Before: "월 9,000원으로 무제한 문제 생성"
- After: "월 9,000원 구독으로 프리미엄 기능 이용"
- **파일**: `app/page.tsx:426`

---

## 파일 구조 (업데이트)
```
eng-sparkling/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── workflow/page.tsx     # AI 문제 생성 워크플로우
│   ├── archive/page.tsx      # 저장된 문제 보기 (NEW)
│   ├── api/
│   │   ├── generate/route.ts # 문제 생성 API (마커 로직 추가)
│   │   └── generate-article/ # 아티클 생성 API
│   └── components/
│       ├── CoinDisplay.tsx   # 코인 표시 컴포넌트 (NEW)
│       └── QuestionDisplay.tsx
├── lib/
│   ├── all-prompts.ts        # 12개 문제 유형 프롬프트 (해설 개선)
│   ├── article-prompts.ts    # 아티클 생성 프롬프트
│   ├── coins.ts              # 코인 관리 시스템 (NEW)
│   └── openai.ts
├── tests/                    # 테스트 스크립트 (NEW)
│   ├── full-validation.js    # 전체 프롬프트 검증
│   └── test-irrelevant.js    # IRRELEVANT_SENTENCE 테스트
├── data/
│   └── demo-questions.ts     # 데모용 고정 문제
└── types/
    └── index.ts
```

---

## 커밋 대기 중인 변경사항

### Staged (이미 add됨)
- `img.png`, `img_1.png`, `img_2.png` (스크린샷)

### Modified (add 필요)
- `app/api/generate/route.ts` - 마커 처리 로직
- `app/components/QuestionDisplay.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx` - 가격 문구
- `app/workflow/page.tsx` - 드롭다운, 아카이브 연동
- `data/demo-questions.ts`
- `lib/all-prompts.ts` - 해설 품질 개선
- `lib/article-prompts.ts` - 문단 포맷팅
- `package-lock.json`

### Untracked (add 필요)
- `app/archive/` - 아카이브 페이지
- `app/components/CoinDisplay.tsx` - 코인 컴포넌트
- `lib/coins.ts` - 코인 시스템
- `tests/` - 테스트 스크립트

### 커밋 안 해도 됨
- `.claude/` - Claude 설정
- `.idea/` - IDE 설정
- `docs/TESTING-SKILLS.md` - 내부 문서

---

## 알려진 이슈 / TODO

### 남은 작업
1. **OAuth2 로그인** - NextAuth.js로 Google 로그인 구현
2. **DB 연결** - PostgreSQL/Supabase로 사용자 데이터 영구 저장
3. **결제 시스템** - Toss Payments 연동
4. **코인 충전** - 결제 후 코인 추가 기능

### 확인 필요
- 테스트는 로컬에서만 수행됨, 실제 배포 환경 테스트 필요
- localStorage 기반이라 브라우저/기기 간 데이터 공유 안 됨

---

## 테스트 방법

### 전체 프롬프트 테스트
```bash
cd tests
node full-validation.js
```
- 서버가 localhost:3001에서 실행 중이어야 함
- 모든 12개 유형 자동 테스트

### IRRELEVANT_SENTENCE 개별 테스트
```bash
cd tests
node test-irrelevant.js
```

---

## 다음 세션 시작할 때

1. 이 파일(HANDOFF.md) 읽기
2. git status로 현재 상태 확인
3. 커밋이 필요하면 먼저 커밋
4. `npm run dev`로 서버 실행
5. 남은 작업 중 하나 선택하여 진행

---

## 참고 문서
- `CLAUDE.md` - 프로젝트 개요, 기술 스택
- `DEV-LOG.md` - 개발 히스토리
- `docs/eng-spark.md` - ENG-SPARK 서비스 스펙
