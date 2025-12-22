# ENG-SPARKLING

AI 기반 영어 문제 자동 생성 서비스

## 스택

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (Auth, DB), OpenAI API
- **Payment**: Toss Payments

## 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run test:run     # 테스트 실행
npx tsc --noEmit     # 타입 체크
```

## 검증

변경 후 반드시 실행:
```bash
npm run test:run && npm run build
```

## 핵심 디렉토리

| 경로 | 용도 |
|------|------|
| `app/` | Next.js App Router (페이지, API) |
| `lib/` | 유틸리티 (prompts, supabase, encryption) |
| `types/` | TypeScript 타입 정의 |
| `tests/` | Vitest 테스트 |
| `supabase/migrations/` | DB 마이그레이션 |

## 보안 필수사항

- XSS: `lib/sanitize-html.ts` 사용
- CSRF: `lib/api-client.ts`의 `apiClient` 사용
- 암호화: `lib/encryption.ts` 사용

## 세션 핸드오프

1. 세션 시작: `HANDOFF.md` 먼저 읽기
2. 작업 완료: `HANDOFF.md`에 기록
3. 세션 종료: 진행상황 업데이트

## 상세 문서

| 파일 | 설명 | 필요 시점 |
|------|------|----------|
| `agent_docs/project_structure.md` | 프로젝트 구조 | 파일 탐색 |
| `agent_docs/question_types.md` | 12가지 문제 유형 | 문제 생성 |
| `agent_docs/testing.md` | 테스트 가이드 | 테스트 작성 |
| `agent_docs/database.md` | DB 스키마/RPC | DB 작업 |
| `docs/eng-spark.md` | 서비스 전체 스펙 | 기획 확인 |
