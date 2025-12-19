# ENG-SPARKLING 작업 핸드오프

---

## 📅 2025-12-19 (목) 세션

### ✅ 완료된 주요 기능
- Google OAuth 로그인 (Supabase Auth)
- 코인 시스템 DB 연동 (Supabase profiles 테이블)
- 결제 시스템 (Toss Payments)
- 관리자 대시보드
- 데모 시스템 (IP 기반 2회 무료)

### 📝 작업 내역

#### [2025-12-19 오후] CLAUDE.md 핸드오프 규칙 추가
- 변경된 파일: `CLAUDE.md`
- 세션 간 작업 인수인계 규칙 추가
- TODO 목록 업데이트 (완료 항목 체크)

### 🔜 다음 작업
- [ ] URL에서 아티클 가져오기 기능
- [ ] 메인 페이지 "무료 체험" 버튼 추가
- [ ] 관리자 페이지 최종 테스트

### 알려진 이슈
- 없음

---

## 📅 2024-12-19 (이전 세션)

### 📋 완료된 작업
1. **관리자 페이지** (`app/admin/`)
   - 대시보드: 전체 유저, 활성 유저, 결제 건수, 매출액, 코인, 문제 생성 수 표시
   - 유저 관리: 코인 수정, 관리자 권한 부여/해제
   - 결제 내역 페이지
   - 생성 로그 페이지

2. **관리자 API** (`app/api/admin/`)
   - `/api/admin/stats` - 통계 조회
   - `/api/admin/users` - 유저 조회/수정
   - `/api/admin/orders` - 결제 내역
   - `/api/admin/logs` - 문제 생성 로그

3. **데모 시스템** (`lib/demo.ts`)
   - IP 주소 기반 사용량 추적
   - 최대 2회 무료 생성 제한
   - `/api/demo/status` - 데모 사용 현황 조회

4. **workflow 페이지 데모 모드**
   - 비로그인 사용자 접근 허용
   - 데모 사용 현황 표시
   - 저장 버튼 비활성화 (데모 모드)

### 📝 세션 작업 내역

#### 1. Supabase 스키마 수정
- `profiles` 테이블에 `is_admin` 컬럼 추가
- `ongsya@gmail.com` 계정에 관리자 권한 부여

#### 2. workflow 페이지 데모 모드 구현 (`app/workflow/page.tsx`)
- **비로그인 사용자 접근 허용**: 로그인 리다이렉트 제거
- **데모 사용 현황 조회**: `/api/demo/status` 호출하여 남은 횟수 표시
- **헤더 UI 분기**:
  - 로그인 유저: 코인 표시, 저장함/충전 버튼
  - 데모 유저: "데모 모드 (N회 남음)" 표시, 로그인 버튼
- **아티클 생성 버튼**: 데모 모드일 때 "데모 N회 남음" 표시
- **문제 생성 버튼**: 데모 모드일 때 남은 횟수 표시
- **저장 버튼 비활성화**: 데모 모드에서는 "로그인하여 저장" 링크로 대체
- **데모 안내 메시지**: 데모 사용자에게 로그인 유도 메시지 표시

#### 3. API 수정 확인 (`app/api/generate/route.ts`)
- `demo: true` 파라미터로 데모 모드 지원 (이미 구현됨)
- 데모 한도 초과 시 `DEMO_LIMIT_EXCEEDED` 에러 반환

### ✅ 완료된 기능 요약
1. 비로그인 사용자도 `/workflow` 페이지 접근 가능
2. IP 기반으로 최대 2회 무료 문제 생성
3. 데모 사용 현황 실시간 표시
4. 저장 기능은 로그인 유저만 가능
5. PDF 내보내기는 모든 사용자 가능

### 🔜 다음 작업 제안
- [ ] 메인 페이지에서 "무료 체험" 버튼 클릭 시 workflow로 이동
- [ ] 데모 횟수 소진 시 로그인 유도 모달
- [ ] 관리자 페이지 테스트 및 마무리

---

## 📅 2024-12-18 (수) - 이전 기록

### 현재 상태: Google 로그인 버튼 추가 완료, Supabase Google Provider 활성화 필요

---

## 프로젝트 위치
```
C:\develop\eng-sparkling
```

## 실행 방법
```bash
cd "C:/develop/eng-sparkling"
npm run dev
# http://localhost:3000
```

## 환경 설정
`.env.local` 파일 필요:
```env
OPENAI_API_KEY=sk-xxx
DEFAULT_MODEL=gpt-4o-mini

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 오늘(12/18) 작업 내용

### 1. Google 로그인 버튼 추가
- **파일**: `app/login/page.tsx`
- `signInWithGoogle` 함수 연결
- Google 컬러 로고 SVG 버튼 추가
- GitHub 버튼 위에 배치

### 2. Supabase Google Provider 활성화 필요 (TODO)
- **현재 상태**: 버튼 클릭 시 에러 발생
  ```
  {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
  ```
- **해결 방법**:
  1. Supabase Dashboard → Authentication → Providers → Google
  2. Enable 토글 ON
  3. Google Cloud Console에서 OAuth 클라이언트 ID/Secret 발급
  4. 승인된 리디렉션 URI 추가: `https://qpbwmagotftvpcxndbpm.supabase.co/auth/v1/callback`
  5. Supabase에 Client ID, Client Secret 입력

### 참고: AuthProvider에 signInWithGoogle 함수는 이미 구현됨
- **파일**: `app/components/AuthProvider.tsx` (59-66줄)

---

## 이전(12/17) 완료된 작업

### 1. 복수 문제 유형 선택 기능
- **변경**: 드롭다운 → 칩/태그 UI로 복수 선택 가능
- 전체선택/선택해제 버튼 추가
- 선택된 개수에 따라 코인 비용 동적 표시
- Promise.all로 병렬 API 호출
- **파일**: `app/workflow/page.tsx`

### 2. Toast 알림 시스템
- alert() → react-hot-toast로 변경
- 성공/에러/로딩 상태 표시
- **패키지**: `react-hot-toast`
- **파일**: `app/workflow/page.tsx`, `app/layout.tsx`

### 3. 개별 문제 저장 기능
- "전체 저장" → 각 문제별 개별 저장 버튼
- 저장된 문제는 버튼 비활성화 표시
- **파일**: `app/workflow/page.tsx`

### 4. Supabase 연동 (GitHub OAuth + DB)
- **설치**: `@supabase/supabase-js`
- **생성된 파일**:
  - `lib/supabase.ts` - Supabase 클라이언트
  - `app/components/AuthProvider.tsx` - 인증 Context
  - `app/components/AuthButton.tsx` - 로그인/로그아웃 버튼
  - `app/login/page.tsx` - 로그인 페이지
  - `app/auth/callback/route.ts` - OAuth 콜백 핸들러
- **DB 스키마** (Supabase에서 실행 완료):
  - `profiles` 테이블 (user_id, username, email, avatar_url, coins)
  - `archived_questions` 테이블 (저장된 문제)
  - RLS 정책 설정 완료
  - 자동 프로필 생성 트리거 (SECURITY DEFINER)

### 5. 로그인 필수화
- `/workflow` 페이지 접근 시 로그인 체크
- 비로그인 시 `/login`으로 리다이렉트
- **파일**: `app/workflow/page.tsx`

### 6. 헤더 레이아웃 정리
- 네비게이션 그룹 | 구분선 | 유저 영역으로 정리
- 로고, 코인, 홈/아카이브 버튼 배치 개선
- **파일**: `app/workflow/page.tsx`

### 7. 마커 생성 안정성 개선
- MAX_RETRIES: 3 → 5로 증가
- 마커 빌드 로직 개선 (다중 검색 전략 + fallback)
- **파일**: `app/api/generate/route.ts`

### 8. 무관한 문장(IRRELEVANT_SENTENCE) 프롬프트 개선
- **문제**: "에베레스트 산" 같은 뜬금없는 문장 생성
- **해결**: 수능 스타일로 변경
  - "COMPLETELY OFF-TOPIC" → "SUBTLY off-topic"
  - 같은 주제 영역 내에서 논리적 흐름만 벗어나도록
  - 표면적으로 관련되어 보이지만 핵심 논지 지원 안 함
- **파일**: `lib/all-prompts.ts`

---

## 파일 구조 (업데이트)
```
eng-sparkling/
├── app/
│   ├── page.tsx              # 메인 페이지 (데모)
│   ├── login/page.tsx        # 로그인 페이지 (NEW)
│   ├── workflow/page.tsx     # AI 문제 생성 (복수선택, 인증)
│   ├── archive/page.tsx      # 저장된 문제 보기
│   ├── auth/
│   │   └── callback/route.ts # OAuth 콜백 (NEW)
│   ├── api/
│   │   ├── generate/route.ts # 문제 생성 API (마커 개선)
│   │   └── generate-article/ # 아티클 생성 API
│   └── components/
│       ├── AuthProvider.tsx  # 인증 Context (NEW)
│       ├── AuthButton.tsx    # 로그인 버튼 (NEW)
│       ├── CoinDisplay.tsx   # 코인 표시
│       └── QuestionDisplay.tsx
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트 (NEW)
│   ├── all-prompts.ts        # 12개 문제 프롬프트 (무관한문장 개선)
│   ├── article-prompts.ts    # 아티클 생성 프롬프트
│   ├── coins.ts              # 코인 관리 (localStorage)
│   └── openai.ts
├── tests/                    # 테스트 스크립트
└── types/
    └── index.ts
```

---

## Supabase 설정 정보

### GitHub OAuth
- Supabase Dashboard > Authentication > Providers > GitHub
- Client ID/Secret 설정 완료
- Callback URL: `https://[project].supabase.co/auth/v1/callback`

### DB 트리거 (프로필 자동 생성)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, avatar_url, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'name', 'user'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    100
  );
  RETURN NEW;
END;
$$;
```

---

## 알려진 이슈 / TODO

### 남은 작업
1. **코인 DB 연동** - 현재 localStorage, DB로 이전 필요
2. **저장 문제 DB 연동** - archived_questions 테이블 활용
3. **결제 시스템** - Toss Payments 연동
4. **코인 충전** - 결제 후 코인 추가 기능

### 확인 필요
- Supabase RLS 정책 실제 동작 테스트
- 프로필 자동 생성 트리거 동작 확인
- 무관한 문장 프롬프트 개선 결과 품질 테스트

---

## 다음 세션 시작할 때

1. 이 파일(HANDOFF.md) 읽기
2. `npm run dev`로 서버 실행
3. **Supabase Google Provider 활성화** (위 TODO 참고)
4. Google 로그인 테스트
5. 남은 작업 중 하나 선택하여 진행

---

## 참고 문서
- `CLAUDE.md` - 프로젝트 개요, 기술 스택
- `DEV-LOG.md` - 개발 히스토리
- `docs/eng-spark.md` - ENG-SPARK 서비스 스펙
