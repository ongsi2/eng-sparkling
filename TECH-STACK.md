# ENG-SPARKLING 기술 스택

> AI 기반 영어 문제 자동 생성 서비스

## 프로젝트 개요

수능/내신 영어 지문을 입력하면 AI가 12가지 유형의 문제를 자동 생성하는 웹 서비스입니다.
코인 기반 과금 시스템과 결제 연동까지 구현된 풀스택 프로젝트입니다.

---

## Frontend

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15 | React 기반 풀스택 프레임워크 (App Router) |
| **React** | 18 | UI 라이브러리 |
| **TypeScript** | 5 | 정적 타입 시스템 |
| **Tailwind CSS** | 4 | 유틸리티 기반 CSS 프레임워크 |
| **react-hot-toast** | - | 토스트 알림 UI |

### 주요 구현 사항
- App Router 기반 파일 시스템 라우팅
- Server Components / Client Components 분리
- `basePath` 설정을 통한 서브 도메인 배포
- 반응형 UI 구현

---

## Backend

| 기술 | 용도 |
|------|------|
| **Next.js API Routes** | Serverless API 엔드포인트 |
| **OpenAI API** | GPT-4o-mini 모델을 활용한 문제 생성 |

### API 엔드포인트
- `POST /api/generate-article` - AI 아티클 생성
- `POST /api/generate` - 12가지 유형 문제 생성
- `POST /api/payment/create-order` - 주문 생성
- `POST /api/payment/confirm` - 결제 승인
- `GET /auth/callback` - OAuth 콜백 처리

### AI 프롬프트 엔지니어링
- 12가지 문제 유형별 커스텀 프롬프트 설계
- JSON 응답 포맷 강제 (response_format)
- 재시도 로직 및 마커 검증 시스템

---

## Database

| 기술 | 용도 |
|------|------|
| **Supabase** | PostgreSQL 기반 BaaS |
| **Row Level Security (RLS)** | 행 단위 보안 정책 |

### 테이블 구조
```sql
-- 사용자 코인 관리
user_coins (user_id, coins, created_at, updated_at)

-- 문제 저장함
archived_questions (id, user_id, question_type, question, article, created_at)

-- 결제 주문
orders (id, user_id, order_id, payment_key, amount, coins, status, created_at)
```

### RLS 정책
- 사용자는 자신의 데이터만 조회/수정 가능
- Service Role Key를 통한 서버사이드 우회

---

## Authentication

| 기술 | 용도 |
|------|------|
| **Supabase Auth** | 인증 서비스 |
| **GitHub OAuth 2.0** | 소셜 로그인 |

### 구현 사항
- OAuth 2.0 Authorization Code Flow
- 세션 기반 인증 상태 관리
- AuthProvider Context를 통한 전역 상태 관리
- 자동 세션 갱신

---

## Payment

| 기술 | 용도 |
|------|------|
| **토스페이먼츠 SDK** | 결제 위젯 연동 |

### 결제 플로우
1. 클라이언트에서 주문 생성 API 호출
2. 토스페이먼츠 SDK로 결제창 호출
3. 결제 완료 후 서버에서 승인 API 호출
4. 성공 시 코인 충전 + 주문 상태 업데이트

### 보안
- 금액 검증 (클라이언트 ↔ DB 비교)
- Secret Key 서버 환경변수로 관리
- 중복 결제 방지 (orderId unique)

---

## DevOps / Deployment

| 기술 | 용도 |
|------|------|
| **Docker** | 컨테이너화 (Multi-stage build) |
| **Nginx** | 리버스 프록시, SSL 터미네이션 |
| **Oracle Cloud (OCI)** | 클라우드 서버 호스팅 |
| **Git / GitHub** | 버전 관리 |

### Docker 구성
```dockerfile
# Multi-stage build
# 1. Builder: npm ci → npm run build
# 2. Runner: standalone output 실행
```

### Nginx 설정
- SSL/TLS (Let's Encrypt)
- 서브 경로 라우팅 (`/eng-sparkling`)
- X-Forwarded 헤더 전달

---

## 프로젝트 구조

```
eng-sparkling/
├── app/
│   ├── page.tsx                 # 메인 (데모)
│   ├── login/page.tsx           # 로그인
│   ├── workflow/page.tsx        # 문제 생성 워크플로우
│   ├── archive/page.tsx         # 저장된 문제
│   ├── payment/                 # 결제 관련
│   ├── auth/callback/route.ts   # OAuth 콜백
│   ├── api/                     # API 라우트
│   └── components/              # React 컴포넌트
├── lib/
│   ├── openai.ts                # OpenAI 클라이언트
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── supabase-server.ts       # 서버용 (Service Role)
│   ├── coins.ts                 # 코인 로직
│   └── all-prompts.ts           # AI 프롬프트
├── types/                       # TypeScript 타입 정의
├── Dockerfile                   # Docker 설정
└── next.config.ts               # Next.js 설정
```

---

## 주요 기능

### 1. AI 문제 생성
- 키워드 기반 아티클 생성
- 12가지 수능 유형 문제 자동 생성
- 병렬 처리로 다중 문제 동시 생성

### 2. 사용자 시스템
- GitHub OAuth 로그인
- 코인 기반 사용량 관리
- 문제 저장/관리 기능

### 3. 결제 시스템
- 토스페이먼츠 연동
- 코인 패키지 구매
- 주문/결제 이력 관리

---

## 배운 점 / 트러블슈팅

### 1. Next.js basePath 배포
- 서브 경로 배포 시 `<Link>` vs `<a>` 차이
- API fetch 시 basePath 수동 추가 필요
- OAuth redirectTo URL에 basePath 포함

### 2. Docker + Next.js
- `NEXT_PUBLIC_*` 환경변수는 빌드 타임에 포함
- 일반 환경변수는 런타임에 `--env-file`로 전달
- Standalone output으로 이미지 크기 최적화

### 3. Supabase RLS
- 클라이언트 vs 서버 권한 분리
- Service Role Key로 RLS 우회 (서버 전용)

### 4. Nginx Reverse Proxy
- X-Forwarded-Host/Proto 헤더 전달
- OAuth 콜백 시 origin 올바르게 인식

---

## 기술 선택 이유

| 기술 | 선택 이유 |
|------|----------|
| Next.js | 풀스택 개발, SSR/SSG, App Router |
| Supabase | PostgreSQL + Auth + 실시간 기능 통합 |
| Tailwind | 빠른 UI 개발, 커스터마이징 용이 |
| Docker | 환경 일관성, 배포 자동화 |
| 토스페이먼츠 | 국내 결제 지원, 문서화 우수 |

---

## 향후 개선 사항

- [ ] Google OAuth 추가
- [ ] 문제 PDF 내보내기
- [ ] 학습 통계 대시보드
- [ ] 관리자 페이지
- [ ] CI/CD 파이프라인 (GitHub Actions)
