# ENG-SPARK (잉스팤) 서비스 분석 문서

> **목적**: Claude Code에서 유사 서비스 개발 시 참조용 기술 스펙 문서
> **분석일**: 2024-12-16
> **서비스 URL**: https://eng-spark.com

---

## 1. 서비스 개요

### 1.1 비즈니스 설명
- **서비스명**: ENG-SPARK (잉스팤)
- **운영사**: 주식회사 비에프에이아이 (BFAI)
- **서비스 유형**: AI 기반 영어 문제 자동 생성 에듀테크 B2C SaaS
- **타겟 사용자**: 영어 교사, 학원 강사, 문제 출제 저자

### 1.2 핵심 기능
```
[지문 입력] → [문제 유형 선택] → [AI 문제 생성] → [검수/편집] → [저장] → [조회/다운로드]
```

### 1.3 수익 모델
- 월 구독: 9,000원/월 (첫 달 무료)
- 크레딧 시스템: 동료 초대 시 50크레딧 지급
- 정기결제/구독 관리

---

## 2. 기술 스택

### 2.1 Frontend

```yaml
Framework:
  - Next.js 14+ (App Router, Server Components, API Routes)
  - React 18+
  - TypeScript

State Management:
  - Zustand (전역 상태)
  - TanStack Query (서버 상태, 캐싱)

Form & Validation:
  - React Hook Form
  - Zod (스키마 검증)

Styling:
  - Tailwind CSS
  - CVA (Class Variance Authority)
  - Framer Motion (애니메이션)
  - tailwindcss-animate
  - tailwind-merge

UI Pattern:
  - Atomic Design (Atoms/Molecules/Organisms)

Routing:
  - Next.js App Router (주)
  - React Router DOM (부분적)

Utilities:
  - Axios (API 클라이언트, 인터셉터 기반 토큰 주입)
  - React Markdown (remark-gfm, rehype-raw)
  - React Helmet Async (SEO)
  - Swiper (캐러셀)

i18n:
  - react-i18next
  - 메시지 파일: /messages/ko.json, /messages/en.json

Build Tools:
  - Vite / Turbopack (개발환경)
  - npm
  - env-cmd (환경변수)

Code Quality:
  - ESLint
  - Prettier
  - Husky
  - lint-staged

Documentation:
  - Storybook

Deployment:
  - Vercel (Primary)
  - AWS Amplify (Alternative)
```

### 2.2 Backend

```yaml
Runtime:
  - Java 17+
  - Spring Boot 3.x

Database:
  - PostgreSQL (Primary, RDB)
  - Firebase Firestore (NoSQL, 실시간 데이터)

Caching:
  - Redis 또는 유사 캐싱 솔루션

Authentication:
  - Firebase Authentication
  - JWT
  - OAuth2 (Google, Apple)

API:
  - RESTful API
  - Swagger / SpringDoc OpenAPI (문서 자동화)

AI Integration:
  - OpenAI API
  - Azure OpenAI API
  - Perplexity API

Payment:
  - Toss Payments (정기결제/구독)

Data Processing:
  - CSV/Excel 파싱
  - 배치 작업
  - 스케줄러

External APIs:
  - 공공 데이터 (Open API, DART 등)
```

### 2.3 Infrastructure

```yaml
Cloud Provider:
  - AWS

Compute:
  - AWS App Runner (컨테이너 서비스)
  
Container:
  - Docker
  - Docker Compose
  - AWS ECR (컨테이너 레지스트리)

Monitoring:
  - AWS CloudWatch

Analytics:
  - Google Analytics (G-36DM92571R)

Region:
  - ap-northeast-1 (Tokyo)
```

---

## 3. API 설계

### 3.1 확인된 엔드포인트

```
Base URL: https://xgpjruv2hp.ap-northeast-1.awsapprunner.com
```

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/payment/plans` | 결제 플랜 목록 조회 | No |
| POST | `/groups` | 그룹 생성/관리 | Yes |
| POST | `/study/create` | 문제 생성 요청 | Yes |

### 3.2 추정 API 구조

```
# 인증
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
DELETE /auth/logout

# 사용자
GET    /users/me
PUT    /users/me
DELETE /users/me

# 문제 생성
POST   /questions/generate
GET    /questions/{id}
PUT    /questions/{id}
DELETE /questions/{id}
GET    /questions/history

# 그룹 관리
GET    /groups
POST   /groups
GET    /groups/{id}
PUT    /groups/{id}
DELETE /groups/{id}

# 결제/구독
GET    /payment/plans
POST   /payment/subscribe
POST   /payment/cancel
GET    /payment/history
POST   /payment/webhook (Toss callback)

# 크레딧
GET    /credits/balance
POST   /credits/use
GET    /credits/history
```

---

## 4. 문제 유형 (Question Types)

### 4.1 지원 유형 (13가지)

```typescript
enum QuestionType {
  // 문법/어휘
  GRAMMAR_INCORRECT = 'GRAMMAR_INCORRECT',           // 문법형 (어법상 틀린 것)
  SELECT_INCORRECT_WORD = 'SELECT_INCORRECT_WORD',   // 틀린 단어 선택형
  
  // 독해 - 의미 파악
  PICK_UNDERLINE = 'PICK_UNDERLINE',                 // 밑줄의 의미형
  PICK_SUBJECT = 'PICK_SUBJECT',                     // 주제 뽑기형
  PICK_TITLE = 'PICK_TITLE',                         // 제목 뽑기형
  
  // 독해 - 선지 판단
  CORRECT_ANSWER = 'CORRECT_ANSWER',                 // 맞는 선지 뽑기
  INCORRECT_ANSWER = 'INCORRECT_ANSWER',             // 틀린 선지 뽑기
  
  // 독해 - 빈칸/요약
  BLANK_WORD = 'BLANK_WORD',                         // 빈칸에 들어갈 말 형
  COMPLETE_SUMMARY = 'COMPLETE_SUMMARY',             // 요약문 완성
  
  // 독해 - 구조 파악
  IRRELEVANT_SENTENCE = 'IRRELEVANT_SENTENCE',       // 무관한 문장
  INSERT_SENTENCE = 'INSERT_SENTENCE',               // 문장 삽입
  SENTENCE_ORDER = 'SENTENCE_ORDER',                 // 글의 순서형
}
```

### 4.2 문제 생성 요청 스키마 (추정)

```typescript
interface GenerateQuestionRequest {
  passage: string;              // 영어 지문
  questionType: QuestionType;   // 문제 유형
  difficulty?: 'easy' | 'medium' | 'hard';  // 난이도
  options?: {
    includeExplanation: boolean;  // 해설 포함 여부
    formatStyle: 'suneung';       // 서식 스타일 (수능형)
  };
}

interface GenerateQuestionResponse {
  id: string;
  questionType: QuestionType;
  question: string;             // 문제 본문
  passage: string;              // 가공된 지문 (밑줄, 번호 등)
  choices: string[];            // 선택지 (5지선다)
  answer: number;               // 정답 번호 (1-5)
  explanation: string;          // 해설
  createdAt: string;
}
```

---

## 5. 페이지 구조

### 5.1 라우팅

```
/                           # 랜딩 페이지
/login                      # 로그인/회원가입
/study/create               # 문제 생성 (메인 기능)
/study_1/edit_1             # 문제 편집/미리보기 (데모)
/legal/privacy-policy       # 개인정보처리방침
/legal/terms-of-service     # 이용약관
/legal/refund-policy        # 환불정책
```

### 5.2 UI 컴포넌트 구조 (추정)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── Badge/
│   ├── molecules/
│   │   ├── QuestionTypeCard/
│   │   ├── PassageInput/
│   │   ├── ChoiceList/
│   │   └── ExplanationBox/
│   └── organisms/
│       ├── Header/
│       ├── Sidebar/
│       ├── QuestionGenerator/
│       ├── QuestionPreview/
│       └── Footer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── study/
│   │   └── create/
│   └── legal/
├── hooks/
│   ├── useAuth.ts
│   ├── useQuestions.ts
│   └── usePayment.ts
├── stores/
│   ├── authStore.ts
│   └── questionStore.ts
├── lib/
│   ├── api.ts
│   ├── firebase.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## 6. 인증 플로우

### 6.1 Firebase OAuth 플로우

```
1. 사용자가 Google/Apple 로그인 버튼 클릭
2. Firebase Auth SDK가 OAuth 프로세스 시작
3. 사용자가 Google/Apple에서 인증
4. Firebase가 ID Token 발급
5. 프론트엔드가 ID Token을 백엔드로 전송
6. 백엔드가 Firebase Admin SDK로 토큰 검증
7. 백엔드가 자체 JWT 발급 (또는 Firebase 토큰 그대로 사용)
8. 프론트엔드가 Axios 인터셉터로 모든 요청에 토큰 주입
```

### 6.2 Axios 인터셉터 예시

```typescript
// lib/api.ts
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 또는 로그아웃 처리
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 7. AI 문제 생성 파이프라인

### 7.1 처리 흐름

```
[Input]
    │
    ▼
┌─────────────────┐
│   지문 전처리    │  - 길이 검증
│                 │  - 언어 감지
│                 │  - 특수문자 정규화
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  프롬프트 구성   │  - 문제 유형별 템플릿
│                 │  - Few-shot 예시
│                 │  - 출력 형식 지정
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LLM API 호출  │  - OpenAI / Azure OpenAI
│                 │  - Streaming 응답
│                 │  - 재시도 로직
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   후처리/검증    │  - JSON 파싱
│                 │  - 선지 개수 확인
│                 │  - 수능 서식 적용
└────────┬────────┘
         │
         ▼
[Output: 문제 + 해설]
```

### 7.2 프롬프트 템플릿 예시 (문법형)

```typescript
const GRAMMAR_PROMPT = `
You are an expert English teacher specializing in Korean college entrance exam (수능) questions.

Given the following English passage, create a grammar question in the style of Korean 수능 영어 어법 문제.

Requirements:
1. Identify 5 grammatical points in the passage
2. Underline them with numbers ①②③④⑤
3. Make one of them grammatically incorrect
4. Provide detailed explanation in Korean

Passage:
{passage}

Output format (JSON):
{
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "passage with ①②③④⑤ markers",
  "answer": 5,
  "explanation": "detailed explanation in Korean"
}
`;
```

---

## 8. 데이터베이스 스키마 (추정)

### 8.1 PostgreSQL ERD

```sql
-- 사용자
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 구독
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- active, cancelled, expired
    toss_billing_key VARCHAR(255),
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 결제 이력
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    toss_payment_key VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 문제
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    question_type VARCHAR(50) NOT NULL,
    passage TEXT NOT NULL,
    modified_passage TEXT,
    question_text TEXT NOT NULL,
    choices JSONB, -- ["선지1", "선지2", ...]
    answer INTEGER,
    explanation TEXT,
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 그룹 (문제집/학생그룹)
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20), -- question_set, student_group
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 그룹-문제 연결
CREATE TABLE group_questions (
    group_id UUID REFERENCES groups(id),
    question_id UUID REFERENCES questions(id),
    order_index INTEGER,
    PRIMARY KEY (group_id, question_id)
);

-- 크레딧 이력
CREATE TABLE credit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL, -- 양수: 충전, 음수: 사용
    reason VARCHAR(50), -- subscription, referral, usage
    reference_id UUID, -- 관련 ID (subscription_id, question_id 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

---

## 9. 환경변수 설정

### 9.1 Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.eng-spark.com
NEXT_PUBLIC_APP_URL=https://eng-spark.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Analytics
NEXT_PUBLIC_GA_ID=G-36DM92571R

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
```

### 9.2 Backend (application.yml)

```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
  
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

# Firebase
firebase:
  credentials-path: ${FIREBASE_CREDENTIALS_PATH}
  
# OpenAI
openai:
  api-key: ${OPENAI_API_KEY}
  model: gpt-4-turbo-preview
  
# Toss Payments
toss:
  secret-key: ${TOSS_SECRET_KEY}
  
# Redis (캐싱)
redis:
  host: ${REDIS_HOST}
  port: ${REDIS_PORT}
```

---

## 10. 개발 시작 가이드

### 10.1 프로젝트 초기화

```bash
# Frontend
npx create-next-app@latest eng-spark-clone --typescript --tailwind --eslint --app
cd eng-spark-clone

# 필수 패키지 설치
npm install zustand @tanstack/react-query axios zod react-hook-form
npm install framer-motion class-variance-authority tailwind-merge
npm install firebase
npm install -D @types/node

# Backend
mkdir eng-spark-api && cd eng-spark-api
# Spring Initializr로 프로젝트 생성
# Dependencies: Spring Web, Spring Data JPA, PostgreSQL Driver, 
#              Spring Security, Validation, Lombok
```

### 10.2 주요 구현 체크리스트

```markdown
## Frontend
- [ ] Next.js App Router 설정
- [ ] Tailwind CSS + 다크모드 설정
- [ ] Firebase Auth 연동 (Google, Apple)
- [ ] Zustand 스토어 설정 (auth, question)
- [ ] TanStack Query Provider 설정
- [ ] Axios 인터셉터 설정
- [ ] 랜딩 페이지
- [ ] 로그인 페이지
- [ ] 문제 생성 페이지 (메인)
- [ ] 문제 유형 선택 UI
- [ ] 지문 입력 폼
- [ ] 생성된 문제 미리보기
- [ ] 결제/구독 페이지
- [ ] 반응형 디자인

## Backend
- [ ] Spring Boot 3.x 프로젝트 설정
- [ ] PostgreSQL 연동
- [ ] Firebase Admin SDK 설정
- [ ] JWT 인증 필터
- [ ] 사용자 API
- [ ] 문제 생성 API
- [ ] OpenAI API 연동
- [ ] Toss Payments 연동
- [ ] 크레딧 시스템
- [ ] Swagger 문서화

## Infrastructure
- [ ] Docker 설정
- [ ] AWS App Runner 배포
- [ ] CloudWatch 모니터링
- [ ] CI/CD 파이프라인
```

---

## 11. 참고 자료

- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Spring Boot 3](https://docs.spring.io/spring-boot/docs/3.0.0/reference/html/)
- [Toss Payments](https://docs.tosspayments.com/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [AWS App Runner](https://docs.aws.amazon.com/apprunner/)

---

*이 문서는 ENG-SPARK 서비스를 외부에서 분석한 결과물입니다. 실제 구현과 다를 수 있습니다.*