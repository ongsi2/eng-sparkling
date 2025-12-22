# 프로젝트 구조

## 디렉토리 구조

```
eng-sparkling/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 메인 페이지 (데모)
│   ├── login/                # 로그인 페이지
│   ├── workflow/             # AI 문제 생성 워크플로우
│   ├── payment/              # 결제 관련 페이지
│   ├── admin/                # 관리자 페이지
│   ├── api/                  # API Routes
│   │   ├── generate/         # 문제 생성 API
│   │   ├── payment/          # 결제 API
│   │   ├── csrf/             # CSRF 토큰 API
│   │   └── admin/            # 관리자 API
│   └── components/           # React 컴포넌트
├── lib/                      # 유틸리티 라이브러리
│   ├── openai.ts             # OpenAI 클라이언트
│   ├── prompts.ts            # AI 프롬프트
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── encryption.ts         # 암호화 유틸
│   ├── csrf.ts               # CSRF 보호
│   ├── sanitize-html.ts      # XSS 방지
│   └── pdf-export.ts         # PDF 내보내기
├── types/                    # TypeScript 타입 정의
├── data/                     # 정적 데이터
├── supabase/                 # Supabase 설정
│   └── migrations/           # DB 마이그레이션
├── tests/                    # 테스트 파일
└── docs/                     # 참고 문서
```

## 핵심 파일 설명

| 파일 | 역할 |
|------|------|
| `lib/prompts.ts` | 12개 문제 유형별 AI 프롬프트 정의 |
| `lib/supabase.ts` | Supabase 클라이언트 (서버/클라이언트) |
| `middleware.ts` | CSRF 검증 및 보안 헤더 |
| `types/index.ts` | 전역 타입 정의 |
