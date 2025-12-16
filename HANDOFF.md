# ENG-MVP 작업 핸드오프 (2024-12-16)

## 현재 상태: 메인 페이지 리팩토링 완료

---

## 프로젝트 위치
```
C:\Users\ongsy\spring\eng-mvp
```

## 실행 방법
```bash
cd "C:/Users/ongsy/spring/eng-mvp"
npm run dev
# http://localhost:3000 (또는 3001)
```

---

## 완료된 작업

### 1. 메인 페이지 리팩토링 (`app/page.tsx`)
- ENG-SPARK 실제 서비스 디자인 참고 (eng-spark-mainpage.pdf)
- 고정 지문 (2025 수능 20번) + 12개 문제 유형 버튼
- 버튼 클릭 시 미리 저장된 문제 표시 (AI 호출 없음)
- 접기/펼치기 기능

### 2. 데모 데이터 (`data/demo-questions.ts`)
- `DEMO_PASSAGE`: 고정 수능 지문
- `QUESTION_TYPES`: 12개 유형 정보 (라벨, 아이콘)
- `DEMO_QUESTIONS`: 각 유형별 미리 생성된 문제 (질문, 선택지, 정답, 해설)

### 3. 로그인 페이지 (`app/login/page.tsx`)
- 플레이스홀더 (실제 인증 미연동)
- Google 버튼 클릭 시 안내 메시지만 표시
- Apple, 이메일 로그인은 비활성화 상태

### 4. 타입 업데이트 (`types/index.ts`)
- 12개 문제 유형 모두 추가
- `sentenceToInsert` 필드 추가

---

## 파일 구조
```
eng-mvp/
├── app/
│   ├── page.tsx              # 메인 (리팩토링 완료)
│   ├── login/page.tsx        # 로그인 (플레이스홀더)
│   ├── workflow/page.tsx     # AI 생성 워크플로우 (기존)
│   └── api/generate/         # AI 문제 생성 API (기존)
├── data/
│   └── demo-questions.ts     # 데모 데이터 (NEW)
├── types/
│   └── index.ts              # 타입 정의 (업데이트)
├── DEV-LOG.md                # 개발 내역
└── HANDOFF.md                # 이 파일
```

---

## 다음 작업 후보

### A. OAuth2 Google 로그인 구현
```bash
npm install next-auth
```
- `app/api/auth/[...nextauth]/route.ts` 생성
- Google Cloud Console에서 OAuth 클라이언트 ID 발급 필요
- 참고: bfai_jd.pdf (Firebase Auth, JWT, OAuth2 사용)

### B. 데이터베이스 연결
- 현재: localStorage (브라우저 저장, 최대 10개)
- 옵션: PostgreSQL, Supabase, Firebase Firestore
- 사용자별 생성 기록 저장

### C. URL에서 아티클 가져오기 기능
- 사용자가 원했던 기능: 지문 직접 입력 OR URL 입력 선택
- 현재 workflow 페이지: 키워드 → AI 아티클 생성
- 통합 UI 필요

### D. 기타
- 크레딧 시스템
- 결제 연동 (Toss Payments)

---

## 참고 문서
- `eng-spark.md`: ENG-SPARK 서비스 전체 스펙
- `eng-spark-mainpage.pdf`: 메인 페이지 디자인 참고
- `bfai_jd.pdf`: 기술 스택 참고 (채용 공고)
- `CLAUDE.md`: 프로젝트 컨텍스트

---

## 사용자 요청 히스토리
1. "메인에 고정 지문 + 문제 버튼만 구현, AI 없이 저장된 데이터 로드"
2. "로그인 버튼은 페이지 이동만 (실제 연동 X)"
3. "OAuth2는 보통 Firebase Auth 사용" → NextAuth.js 권장

---

## 내일 시작할 때
```
이 파일(HANDOFF.md) 읽고 현재 상태 파악 후 작업 계속
```
