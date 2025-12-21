# ENG-SPARKLING 작업 핸드오프

> 세션 시작 시 이 파일을 먼저 읽으세요.
> 오래된 기록은 `archives/` 폴더에 있습니다.

---

## 현재 상태 (2025-12-20)

### ✅ 완료된 주요 기능
| 기능 | 상태 | 파일 |
|-----|------|-----|
| Google OAuth 로그인 | ✅ | `app/login/page.tsx` |
| 코인 시스템 (DB) | ✅ | `lib/coins.ts` |
| 결제 시스템 (Toss) | ✅ | `app/payment/` |
| 관리자 대시보드 | ✅ | `app/admin/` |
| 데모 시스템 (IP 2회) | ✅ | `lib/demo.ts` |
| 지문 직접 입력 | ✅ | `app/workflow/page.tsx` |
| 12개 문제 유형 | ✅ | `lib/all-prompts.ts` |
| DB 기반 요금제 | ✅ | `coin_products` 테이블, `lib/coin-products-server.ts` |
| 소프트 삭제 | ✅ | `profiles.deleted_at`, `app/admin/users/` |
| 활동 로그 | ✅ | `user_activity_logs` 테이블, `lib/activity-logger.ts` |
| 자동 저장 | ✅ | `app/workflow/page.tsx` |
| 저장함 필터링 | ✅ | `app/archive/page.tsx` |
| 상세 해설 프롬프트 | ✅ | `lib/all-prompts.ts` (12개 유형 전체) |
| PDF 스마트 페이지 | ✅ | `lib/pdf-export.ts` |
| 크레딧 사용 내역 | ✅ | `app/credit-history/`, `lib/coins.ts` |
| 개인정보 암호화 | ✅ | `lib/encryption.ts`, `lib/activity-logger.ts` |
| RLS 정책 보강 | ✅ | `supabase/migrations/005_rls_enhancement.sql` |
| 이용약관 페이지 | ✅ | `app/terms/page.tsx` |
| 개인정보처리방침 | ✅ | `app/privacy/page.tsx` |
| 환불 관리 | ✅ | `app/admin/orders/page.tsx`, `app/api/admin/refunds/` |
| API 캐싱 시스템 | ✅ | `lib/generation-cache.ts`, `007_generation_cache.sql` |
| 헤더 드롭다운 | ✅ | `UserAvatar.tsx`, 각 페이지 헤더 |

### 🔧 최근 수정 (2025-12-21) - 전체 점검 세션

#### TypeScript 오류 수정
- **`app/api/generate/route.ts`**: `logGenerate` 함수 인자 순서 수정
- **`lib/generation-cache.ts`**: Supabase RPC Promise 처리 수정
- **결과**: `npx tsc --noEmit` 0 errors

#### 12개 문제 유형 전체 테스트
- **테스트 스크립트**: `scripts/test-question-generation.ts`
- **결과**: 12/12 통과
- **개선**:
  - `FULL` 파라미터로 전체 테스트
  - 유형별 검증 로직 세분화

#### 수능 기출 데이터 수집
- **출처**: peshare.com, legendstudy.com
- **수집 유형**: 20번(주제), 21번(밑줄), 29번(어법), 30번(어휘), 31번(빈칸), 35번(무관), 36번(순서), 38번(삽입)
- **생성 파일**: `data/suneung-reference.md`

#### 프롬프트 Few-shot 예시 추가
- **`lib/all-prompts.ts`**:
  - GRAMMAR_INCORRECT: 2024 수능 29번 예시
  - SELECT_INCORRECT_WORD: 2024 수능 30번 예시

#### 검증 스킬 개선
- **`.claude/commands/validate-question.md`**: 유형별 체크리스트, 수능 기출 예시 추가

#### 세션 리포트
- **`SESSION-REPORT-2025-12-21.md`**: 전체 작업 내역 정리

---

### 🔧 이전 수정 (2025-12-20)

#### 마커 순서 정렬 버그 수정
- **문제**: SELECT_INCORRECT_WORD, GRAMMAR_INCORRECT에서 ①②③④⑤가 지문 순서대로 안 나옴
- **수정 파일**: `app/api/generate/route.ts`
- **수정 내용**:
  - `buildModifiedPassageFromMarkers()` 함수 전면 재작성
  - 마커를 지문 위치 기준으로 정렬 후 번호 할당
  - 정렬에 따라 정답 번호도 자동 조정
  - `stripKorean()` 함수 추가: AI가 반환한 한국어 번역 제거 (예: "contains(포함하다)" → "contains")
  - `BuildResult` 인터페이스로 modifiedPassage + newAnswerIndex + sortedMarkers 반환

#### API 비용 절감 캐싱 시스템 구현
- **Migration 파일**: `supabase/migrations/007_generation_cache.sql`
- **캐시 유틸**: `lib/generation-cache.ts`
- **적용 API**:
  - `/api/generate-article` - 아티클 생성 캐시
  - `/api/generate` - 문제 생성 캐시
- **캐시 전략**: Exact Match (동일 입력 = 동일 결과)
- **캐시 키**: SHA256 해시 (지문 + 문제유형 조합)
- **TTL**: 7일
- **자동 정리**: pg_cron (Pro 플랜만) 또는 수동 `SELECT cleanup_expired_cache()`
- **RLS**: service_role만 접근 가능
- **주의**: 무료 티어에서는 pg_cron 미지원, 수동 정리 필요

#### 헤더 UI 개선 (드롭다운 메뉴)
- **수정 파일**:
  - `app/page.tsx`
  - `app/workflow/page.tsx`
  - `app/payment/page.tsx`
  - `app/archive/page.tsx`
- **변경 내용**:
  - 나열된 메뉴 → 드롭다운 메뉴로 통합
  - 드롭다운 메뉴: 저장함, 크레딧 내역, 코인 충전, 관리자, 로그아웃
  - "문제 생성" 버튼 CTA로 강조 (그라데이션)
  - 외부 클릭 시 드롭다운 자동 닫힘
- **새 컴포넌트**: `app/components/UserAvatar.tsx`
  - Google 프로필 사진 표시 (없으면 2글자 이니셜)
  - size 옵션: sm, md, lg
- **AuthButton 수정**: `compact` prop 추가 (드롭다운 내부용)
- **글로벌 커서 스타일**: `app/globals.css`에 버튼/링크 cursor:pointer 추가

#### 이용약관 & 개인정보처리방침 공식 문서 스타일 재디자인
- **수정 파일**: `app/terms/page.tsx`, `app/privacy/page.tsx`
- **디자인 요소**:
  - 상단 다크 헤더 (bg-slate-900, ENG-SPARKLING 로고, 돌아가기 버튼)
  - 문서 메타데이터 (문서번호, 시행일, 버전)
  - 왼쪽 고정 사이드바 (목차, 관련 문서 링크)
  - Intersection Observer로 현재 섹션 하이라이트
  - 조항 번호 배지 (원형, 기본 색상)
  - X.Y 형식의 조항 번호 체계
  - 표 (보유기간, 처리위탁 업체)
  - 하단 저작권 정보
- **테스트 완료**: Playwright MCP로 렌더링 확인

#### 환불 관리 기능 구현
- **DB 마이그레이션**: `add_refunds_table`
  - `refunds` 테이블 생성 (order_id, user_id, amount, coins, reason, refunded_by 등)
  - `orders.status`에 'refunded' 상태 추가
  - RLS 정책: 사용자 본인 조회, 관리자 전체 관리
- **API**: `/api/admin/refunds` (GET: 목록 조회, POST: 환불 기록 생성)
- **라이브러리**: `lib/admin.ts`에 `getRefunds()`, `createRefund()` 함수 추가
- **관리자 UI**: `app/admin/orders/page.tsx`
  - 완료된 주문에 "환불" 버튼 추가
  - 환불 모달 (주문 정보, 사유 입력)
  - 상태 필터에 "환불됨" 옵션 추가
- **처리 흐름**:
  1. Toss에서 직접 환불 처리
  2. 관리자 페이지에서 환불 기록 저장
  3. 사용자 코인 자동 차감
  4. 주문 상태 'refunded'로 변경
  5. 크레딧 사용 내역에 환불 기록

#### MCP 도구 활용 개선 작업
- **Supabase MCP 활용**:
  - `is_admin()` SECURITY DEFINER 함수 생성 - RLS 무한 재귀 버그 해결
  - RLS 정책 업데이트 완료
  - pg_cron 확장 활성화 및 크론 작업 설정
    - 작업명: `cleanup-old-activity-logs`
    - 스케줄: 매일 새벽 3시 (`0 3 * * *`)
    - 동작: 90일 지난 `user_activity_logs` 자동 삭제

- **Playwright MCP 활용**:
  - 밑줄 렌더링 테스트 완료 (문법형, 틀린 단어 선택형)
    - `①`, `②`, `③`, `④`, `⑤` 밑줄 정상 표시
  - 모바일 UI 점검 완료 (375x812, iPhone X 크기)
    - 메인 페이지: 반응형 레이아웃 정상
    - workflow 페이지: 반응형 레이아웃 정상
    - 하단 네비게이션 바 정상 표시

#### 해설 프롬프트 3단락 구조 개선 (12개 유형 전체)
- **수정 파일**: `lib/all-prompts.ts`
- **적용된 유형**: 12개 전체
  - `GRAMMAR_INCORRECT_PROMPT` - 문법형
  - `SELECT_INCORRECT_WORD_PROMPT` - 틀린 단어 선택형
  - `PICK_UNDERLINE_PROMPT` - 밑줄의 의미형
  - `PICK_SUBJECT_PROMPT` - 주제 뽑기형
  - `PICK_TITLE_PROMPT` - 제목 뽑기형
  - `CORRECT_ANSWER_PROMPT` - 맞는 선지 뽑기
  - `INCORRECT_ANSWER_PROMPT` - 틀린 선지 뽑기
  - `BLANK_WORD_PROMPT` - 빈칸에 들어갈 말
  - `COMPLETE_SUMMARY_PROMPT` - 요약문 완성
  - `IRRELEVANT_SENTENCE_PROMPT` - 무관한 문장
  - `INSERT_SENTENCE_PROMPT` - 문장 삽입
  - `SENTENCE_ORDER_PROMPT` - 글의 순서형
- **구조**:
  - 1단락: 글 내용 요약
  - 2단락: 정답 분석 (핵심어 중심)
  - 3단락: 오답 분석 (각 선지별 왜 틀린지)
- **오답 유형 분류**: 과장, 부분강조, 관점변경, 미언급 등

#### PDF 스마트 페이지 처리
- **수정 파일**: `lib/pdf-export.ts`
- **기능**: 해설 섹션이 페이지 경계에서 잘리면 다음 페이지로 자동 이동
- **구현 방식**:
  - 문제와 해설을 개별 섹션으로 분리
  - 해설 섹션의 높이를 계산하여 현재 페이지에 안 들어가면 새 페이지 시작
  - `createSmartPDF()` 함수로 스마트 페이지 처리

#### 자동 저장 기능
- **수정 파일**: `app/workflow/page.tsx`
- 로그인 사용자는 문제 생성 후 자동 저장
- UI에 "자동 저장됨" 표시

#### 저장함 필터링 기능
- **수정 파일**: `app/archive/page.tsx`
- 문제 유형별 필터 (드롭다운)
- 난이도별 필터 (중학생, 고1, 고2, 고3)
- 난이도 배지 표시

#### 결제 페이지 UI 개선
- **수정 파일**: `app/payment/page.tsx`
- 상품 카드 크기 확대 및 헤더 밴드 추가
- 할인율 표시, 인기 상품 강조
- 히어로 섹션 간소화

#### DB 기반 요금제 시스템
- **Migration 파일**: `supabase/migrations/001_coin_products.sql`
- **API**: `/api/products` - 활성 상품 조회
- **서버 유틸**: `lib/coin-products-server.ts` - DB 상품 조회
- **클라이언트 유틸**: `lib/coin-products.ts` - 타입/포맷 함수
- **결제 페이지**: `app/payment/page.tsx` - DB 상품 연동, 가로 그리드 레이아웃

#### 소프트 삭제 시스템
- **Migration 파일**: `supabase/migrations/002_soft_delete.sql`
- **profiles 테이블**: `deleted_at` 컬럼 추가
- **admin.ts**: `softDeleteUser()`, `restoreUser()` 함수 추가
- **API**: `/api/admin/users` - softDelete, restore 액션 추가
- **UI**: `app/admin/users/page.tsx` - 탭 기반 활성/탈퇴 회원 관리

#### 활동 로그 시스템
- **Migration 파일**: `supabase/migrations/003_activity_logs.sql`
- **로거 유틸**: `lib/activity-logger.ts` - 통합 로깅 함수
- **로그인 로깅**: `app/auth/callback/route.ts` - 로그인 이벤트 기록
- **문제 생성 로깅**: `app/api/generate/route.ts` - 생성 이벤트 기록
- **결제 로깅**: `app/api/payment/confirm/route.ts` - 구매 이벤트 기록

#### 크레딧 사용 내역 추적
- **수정 파일**: `lib/coins.ts`
  - `deductCoinsFromDB()` - `record_credit_usage` RPC 함수 호출
  - `addCoinsToDb()` - `record_credit_usage` RPC 함수 호출
  - `getCreditHistory()` - 내역 조회 함수 추가
- **API**: `app/api/credit-history/route.ts` - 내역 조회 API
- **UI**: `app/credit-history/page.tsx` - 내역 조회 페이지
- **CoinDisplay 수정**: `app/components/CoinDisplay.tsx` - 클릭하면 내역 페이지로 이동

#### 개인정보 암호화 (AES-256-GCM)
- **암호화 유틸**: `lib/encryption.ts`
  - `encrypt()`, `decrypt()` - AES-256-GCM 암호화/복호화
  - `isEncrypted()` - 암호화 여부 확인
  - `hashForSearch()` - 검색용 해시
- **활동 로거 수정**: `lib/activity-logger.ts` - IP 주소 암호화 저장
- **환경변수 추가 필요**:
  ```env
  # 32바이트 키 생성: openssl rand -hex 32
  ENCRYPTION_KEY=your_64_character_hex_key
  ```

#### RLS 정책 보강
- **Migration 파일**: `supabase/migrations/005_rls_enhancement.sql`
- **적용 테이블**:
  - `profiles` - 사용자/관리자 분리
  - `orders` - 사용자/관리자 분리, 삭제 방지 (5년 보관)
  - `archived_questions` - 사용자/관리자 분리
  - `demo_usage` - 관리자만 조회, 익명 사용자 삽입 허용

#### 아티클 제목 다양화
- **수정 파일**: `lib/article-prompts.ts`
- "The Joy of...", "The Wonders of..." 등 클리셰 제목 금지
- 다양한 제목 패턴 예시 추가 (질문형, 서술형, How-to, 콜론형 등)

#### 해설 품질 강화
- **수정 파일**: `lib/all-prompts.ts` (SELECT_INCORRECT_WORD)
- "무엇을 수식하는지" 명시 필수
- MANDATORY CHECKLIST 추가 (한국어 뜻, 3단락 구조, 5선지 분석)
- BAD EXAMPLE 추가: "부정확한 표현이므로" 같은 모호한 설명 금지

#### 품질 평가 에이전트
- **추가 파일**: `scripts/quality-evaluator.ts`
- **실행**: `npm run test:quality`
- 10개 문제 자동 생성 후 품질 평가
- 평가 기준: 아티클(9점), 문제(8점), 해설(6점) 평균

#### 자동 프롬프트 개선 시스템
- **추가 파일**: `scripts/quality-improver.ts`
- **실행**: `npm run improve:prompts` (분석만) / `npm run improve:prompts -- --apply` (자동 적용)
- **기능**:
  - 빠른 품질 평가 (3개 문제)
  - 빈발 이슈 카테고리 분석
  - 프롬프트에 AUTO-FIX 블록 자동 삽입
  - `quality-report.md` 리포트 생성
- **이슈 카테고리**: MISSING_STRUCTURE, MISSING_KOREAN, MISSING_MODIFIER, ANSWER_CORRECTNESS 등

#### profiles 개인정보 암호화
- **Migration 파일**: `supabase/migrations/006_profiles_encryption.sql`
- **암호화 유틸**: `lib/profile-encryption.ts`
- **컬럼 추가**:
  - `email_hash` - 검색용 단방향 해시
  - `email_encrypted` - 표시용 AES-256-GCM 암호화
  - `full_name_encrypted` - 표시용 암호화
- **적용 위치**: `app/auth/callback/route.ts` - 로그인 시 자동 암호화

#### 이용약관 & 개인정보처리방침 페이지
- **추가 파일**:
  - `app/terms/page.tsx` - 이용약관 (11개 조항)
  - `app/privacy/page.tsx` - 개인정보처리방침 (13개 조항)
- **내용**:
  - 서비스 목적, 코인 시스템, AI 콘텐츠 면책 등
  - 수집 항목: Google OAuth (이메일, 이름), 결제 정보, IP 주소
  - 보유기간: 통신비밀보호법 (3개월), 전자상거래법 (5년)
  - 제3자 제공: Supabase, Toss Payments, OpenAI, Vercel
  - 이용자 권리: 열람권, 정정권, 삭제권, 처리정지권, 동의철회권
- **Footer 링크**: `/terms`, `/privacy` (이미 연결됨)

#### Supabase 클라이언트 세션 설정
- **수정 파일**: `lib/supabase.ts`
- 브라우저 세션 유지를 위한 옵션 추가: `persistSession`, `autoRefreshToken`, `detectSessionInUrl`

#### coins 조회 안정화
- **수정 파일**: `lib/coins.ts`
- `.single()` → `.maybeSingle()` 변경 (프로필 없어도 에러 안 남)
- 상세 에러 로깅 추가

#### RLS 무한 재귀 버그 발견
- **원인**: `005_rls_enhancement.sql`의 admin 정책이 profiles 테이블을 재조회
- **해결책**: `is_admin()` SECURITY DEFINER 함수 생성 필요
- **상태**: Supabase에서 SQL 실행 필요 (아래 참조)

#### Supabase MCP 서버 설치
- **명령어**: `claude mcp add --transport http supabase https://mcp.supabase.com/mcp`
- **상태**: 설치됨, `/mcp`로 인증 필요

---

### 🔧 이전 수정 (2025-12-19)

#### 빠른 개선 4가지
- **해설 줄바꿈**: `workflow/page.tsx:1181` - `\n\n`을 `<br><br>`로 변환
- **저작권 연도**: `app/page.tsx:562` - 2024 → 2025
- **Footer 링크**: 이용약관(`/terms`), 개인정보(`/privacy`), 문의(`mailto:`)
- **데모 버튼**: 비로그인시 "로그인 없이 체험 (3회 무료)" 버튼 추가

#### 문제 생성 전용 Subagent 추가
- **추가 파일**:
  - `.claude/commands/question-gen.md` - 문제 생성 전문 에이전트
  - `scripts/validate-prompts.ts` - 프롬프트 검증 스크립트
  - `scripts/test-question-generation.ts` - API 테스트 스크립트
- **사용법**:
  - `/question-gen 분석 GRAMMAR_INCORRECT` - 특정 유형 분석
  - `/question-gen 개선 PICK_UNDERLINE` - 프롬프트 개선
  - `npm run validate:prompts` - 프롬프트 품질 검증
  - `npm run test:questions` - API 테스트

#### 밑줄 렌더링 수정
- **문제**: 문법형에서 "밑줄 친 부분"이라는데 밑줄이 없었음
- **수정 파일**:
  - `app/api/generate/route.ts` (54번 줄) - GRAMMAR_INCORRECT 밑줄 추가
  - `app/globals.css` (590번 줄) - `<u>` 태그 스타일 강제
  - `app/workflow/page.tsx` (1142번 줄) - Tailwind 제거, CSS 의존
- **결과**: `①<u>단어</u>` 형태로 생성됨
- **테스트 필요**: 새로 생성하는 문제부터 적용

---

## 🔜 다음 작업

### 완료됨 ✅
- [x] pg_cron 설정 - 90일 지난 로그 자동 삭제
- [x] 밑줄 렌더링 테스트 (문법형, 틀린단어 선택형)
- [x] 모바일 UI 점검
- [x] RLS 무한 재귀 버그 해결
- [x] 환불 관리 기능 (기록 저장 방식)
- [x] API 캐싱 시스템 - 동일 입력 재사용으로 비용 절감
- [x] 헤더 UI 개선 - 드롭다운 메뉴, UserAvatar 컴포넌트

### 낮은 우선순위
- 없음 (현재 주요 기능 완료)

### 관련 프로젝트: MATHMATCH (수학 문제 생성)
- **위치**: `C:/develop/mathmatch/`
- **분석 문서**: `ANALYSIS.md` (종합 분석)
- **시작 가이드**: `QUICK-START.md`
- **샘플 파일**:
  - `lib/math-prompts.sample.ts` - 수학 프롬프트 샘플
  - `types/index.sample.ts` - 타입 정의 샘플
  - `app/components/MathRenderer.sample.tsx` - 수식 렌더링 컴포넌트
- **예상 개발 기간**: MVP 24시간, 풀버전 40시간
- **코드 재사용률**: 57% (인증, 결제, 관리자 등)

### Supabase에서 실행 필요한 마이그레이션
| 파일 | 설명 |
|-----|------|
| `005_rls_enhancement.sql` | RLS 정책 보강 |
| `007_generation_cache.sql` | API 캐싱 테이블 + pg_cron 정리 작업 |

---

## 알려진 이슈
- ~~**RLS 무한 재귀**: profiles 테이블 admin 정책이 재귀 호출 발생~~ ✅ **해결됨 (2025-12-20)**
  - `is_admin()` SECURITY DEFINER 함수 생성 완료
  - RLS 정책 업데이트 완료 (Supabase MCP로 실행)

---

## 실행 방법
```bash
cd "C:/springboot/eng-sparkling"
npm run dev
# http://localhost:3000
```

## 환경 변수 (.env.local)
```env
OPENAI_API_KEY=sk-xxx
DEFAULT_MODEL=gpt-4o-mini
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# 개인정보 암호화 키 (32바이트 = 64자 hex)
# 생성: openssl rand -hex 32
ENCRYPTION_KEY=your_64_character_hex_key_here
```

---

## 참고 문서
- `CLAUDE.md` - 프로젝트 개요, 기술 스택, 핸드오프 규칙
- `archives/HANDOFF-2024-12.md` - 과거 작업 기록
- `docs/eng-spark.md` - ENG-SPARK 서비스 스펙
