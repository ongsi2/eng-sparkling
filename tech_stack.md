# 목표 기술 스택 & 구현 우선순위

> 포트폴리오 목적: 면접 대비용 프로젝트
> 참고: 해당 회사 서비스에서 사용하는 기술 스택 기준

---

## Frontend 기술 스택

| 기술 | 설명 | 현재 상태 | 우선순위 |
|------|------|----------|---------|
| **Next.js** | App Router, Server Components, API Routes | ✅ 구현됨 | - |
| **React + TypeScript** | 타입 안전한 React 개발 | ✅ 구현됨 | - |
| **Tailwind CSS** | 유틸리티 기반 스타일링 | ✅ 구현됨 | - |
| **Zustand** | 경량 상태 관리 | ⬜ 미구현 | 🔴 높음 |
| **TanStack Query** | 서버 상태 관리, 캐싱 | ⬜ 미구현 | 🟡 중간 |
| **React Hook Form + Zod** | 폼 검증 | ⬜ 미구현 | 🟡 중간 |
| **Framer Motion** | 애니메이션 | ⬜ 미구현 | 🟢 낮음 |
| **CVA** | Class Variance Authority | ⬜ 미구현 | 🟢 낮음 |
| **Axios** | HTTP 클라이언트 (인터셉터 기반 토큰 주입) | ⬜ 미구현 | 🟡 중간 |

### 기타 Frontend
- Vite, npm ✅
- React Router DOM (Next.js App Router로 대체) ✅
- React Markdown (remark-gfm, rehype-raw)
- React Helmet Async (SEO)
- Swiper (캐러셀)
- Turbopack (개발환경) ✅
- ESLint, Prettier, Husky, lint-staged
- Storybook
- **배포**: Vercel / AWS Amplify

---

## Backend/Infra 기술 스택

| 기술 | 설명 | 현재 상태 | 우선순위 |
|------|------|----------|---------|
| **OAuth2 / JWT** | 인증/인가 (NextAuth.js 활용) | ⬜ 미구현 | 🔴 **1순위** |
| **PostgreSQL** | 관계형 DB (Supabase 활용 가능) | ⬜ 미구현 | 🔴 **2순위** |
| **OpenAI API** | LLM API 연동 | ✅ 구현됨 | - |
| **Toss Payments** | 결제/구독 PG 연동 | ⬜ 미구현 | 🟡 **3순위** |
| **Docker** | 컨테이너화 | ⬜ 미구현 | 🟢 낮음 |
| **AWS** | App Runner, ECR, CloudWatch | ⬜ 미구현 | 🟢 낮음 |

### 기타 Backend/Infra
- Java 17+ / Spring Boot 3.x (현재는 Next.js API Routes로 대체)
- Firebase Firestore (NoSQL)
- Swagger / SpringDoc OpenAPI
- 대규모 데이터 처리 (CSV/Excel, 배치, 스케줄러)
- 공공 데이터 API 연동

---

## 구현 우선순위 (권장 순서)

### 🔴 1순위: OAuth2 로그인 (NextAuth.js)
**이유:**
- 거의 모든 서비스의 기본 기능
- 기술 스택에 "인증/인가 심화 경험" 명시
- DB 연결의 전제 조건 (사용자 식별 필요)
- Google 로그인만으로도 충분히 어필 가능

**구현 범위:**
- NextAuth.js 설정
- Google OAuth 연동
- 세션 관리
- 보호된 라우트 구현

---

### 🔴 2순위: 데이터베이스 연결 (PostgreSQL/Supabase)
**이유:**
- "Relational DB 기반 데이터 모델링" 명시
- 현재 localStorage는 데모용일 뿐
- 사용자별 데이터 영구 저장 필요

**구현 범위:**
- Supabase 프로젝트 생성 (PostgreSQL)
- 사용자, 문제, 아카이브 테이블 설계
- Prisma ORM 연동
- 기존 localStorage 로직 마이그레이션

---

### 🟡 3순위: Toss Payments 결제
**이유:**
- "결제/구독 PG 연동 경험" 명시
- 코인 충전 기능에 필요
- 인증/DB가 선행되어야 의미 있음

**구현 범위:**
- Toss Payments SDK 연동
- 코인 충전 결제 플로우
- 결제 내역 저장
- (선택) 정기 구독

---

### 🟡 4순위: 상태 관리 개선 (Zustand)
**이유:**
- 기술 스택에 Zustand 명시
- 현재 useState만 사용 중
- 규모가 커지면 필요

**구현 범위:**
- 전역 상태 스토어 구성 (사용자, 코인, 설정)
- 로컬스토리지 persist 미들웨어

---

### 🟡 5순위: 서버 상태 관리 (TanStack Query)
**이유:**
- API 호출 캐싱, 로딩/에러 상태 관리
- 기술 스택에 명시됨

**구현 범위:**
- API 호출을 useQuery/useMutation으로 전환
- 캐싱 전략 적용

---

### 🟢 6순위 이후 (시간 여유 시)
- **React Hook Form + Zod**: 폼 검증 강화
- **Framer Motion**: 애니메이션 개선
- **Axios + 인터셉터**: 토큰 자동 주입
- **Docker**: 컨테이너화
- **Storybook**: 컴포넌트 문서화

---

## 현재 프로젝트 완성도

```
[■■■■■■□□□□] 60% 완성

✅ 완료:
- Next.js + TypeScript + Tailwind CSS
- OpenAI API 연동 (12가지 문제 유형)
- 아티클/문제 생성 워크플로우
- 코인 시스템 (localStorage)
- 아카이브 저장 기능
- Toast 알림 (react-hot-toast)
- 반응형 UI

⬜ 미완료:
- 사용자 인증 (OAuth2)
- 데이터베이스 연결
- 결제 시스템
- 상태 관리 (Zustand)
```

---

## 면접 어필 포인트

1. **OpenAI API 연동** - 12가지 문제 유형 프롬프트 설계
2. **OAuth2 인증** (구현 예정) - NextAuth.js 활용
3. **PostgreSQL 데이터 모델링** (구현 예정) - Prisma ORM
4. **결제 연동** (구현 예정) - Toss Payments
5. **Next.js App Router** - 서버 컴포넌트, API Routes 활용
6. **TypeScript** - 타입 안전한 코드베이스
