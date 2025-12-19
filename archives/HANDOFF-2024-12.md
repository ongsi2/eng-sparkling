# ENG-SPARKLING 작업 기록 (2024년 12월)

> 이 파일은 오래된 작업 기록을 보관합니다.

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

---

## 📅 2024-12-18 (수)

### Google 로그인 버튼 추가
- **파일**: `app/login/page.tsx`
- `signInWithGoogle` 함수 연결
- Google 컬러 로고 SVG 버튼 추가

---

## 📅 2024-12-17 (화)

### 1. 복수 문제 유형 선택 기능
- 드롭다운 → 칩/태그 UI로 복수 선택 가능
- 전체선택/선택해제 버튼 추가

### 2. Toast 알림 시스템
- alert() → react-hot-toast로 변경

### 3. 개별 문제 저장 기능
- 각 문제별 개별 저장 버튼

### 4. Supabase 연동 (GitHub OAuth + DB)
- `lib/supabase.ts` - Supabase 클라이언트
- `app/components/AuthProvider.tsx` - 인증 Context
- `app/auth/callback/route.ts` - OAuth 콜백 핸들러

### 5. 마커 생성 안정성 개선
- MAX_RETRIES: 3 → 5로 증가
- 마커 빌드 로직 개선

### 6. 무관한 문장 프롬프트 개선
- 수능 스타일로 변경 (SUBTLY off-topic)

---

## Supabase DB 트리거 (참고용)
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
