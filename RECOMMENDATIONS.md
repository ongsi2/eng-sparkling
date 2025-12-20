# ENG-SPARKLING 보완 및 개선 사항

> `ddalggak.md` (딸각 스튜디오 기술 백서) 분석을 바탕으로 정리한 서비스 개선 권장사항

## 현재 구현 상태 vs 권장사항

| 기능 | 현재 상태 | 권장 수준 | 우선순위 |
|------|----------|----------|---------|
| 소셜 로그인 | O (Google) | O | - |
| 코인 시스템 | O | O | - |
| 결제 연동 | O (Toss) | O | - |
| 관리자 대시보드 | O | O | - |
| 소프트 삭제 | X | O | **높음** |
| 활동 로그 | X | O | **높음** |
| 크레딧 사용 내역 | X | O | 중간 |
| 개인정보 암호화 | X | O | 중간 |
| RLS 정책 보강 | 부분 | O | 중간 |
| 로그 자동 삭제 | X | O | 낮음 |

---

## 1. 소프트 삭제 (Soft Delete) - 우선순위: 높음

### 필요성
- 사용자 실수로 인한 계정 복구 요청 대응
- 법적 분쟁 시 증빙 자료 확보
- 전자상거래법상 거래 기록 5년 보관 의무 준수

### 구현 방법
```sql
-- profiles 테이블에 deleted_at 컬럼 추가
ALTER TABLE profiles
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
```

### 적용할 파일
- `supabase/migrations/002_soft_delete.sql` (생성됨)
- `lib/admin.ts` - 탈퇴/복구 함수 추가
- `app/admin/users/page.tsx` - 탈퇴 회원 관리 UI

---

## 2. 사용자 활동 로그 - 우선순위: 높음

### 필요성
- **통신비밀보호법**: 접속 기록 최소 3개월 보관 의무
- 고객 지원 및 분쟁 해결
- 서비스 사용 패턴 분석

### 기록할 활동
| 활동 | action 값 | 설명 |
|-----|----------|------|
| 로그인 | `login` | IP, User-Agent 포함 |
| 로그아웃 | `logout` | |
| 문제 생성 | `generate` | 문제 유형, 아티클 ID |
| 결제 | `purchase` | 주문 ID, 금액 |
| 코인 사용 | `use_coin` | 사용 코인 수 |

### 적용할 파일
- `supabase/migrations/003_activity_logs.sql` (생성됨)
- `lib/activity-logger.ts` (신규 생성 필요)
- `app/api/*/route.ts` - 각 API에 로깅 추가

---

## 3. 크레딧 사용 내역 추적 - 우선순위: 중간

### 필요성
- 고객 문의 대응 ("왜 코인이 줄었나요?")
- 회계적 정합성 (FIFO 선입선출)
- 환불 처리 시 근거 자료

### 거래 유형
| 유형 | transaction_type | amount |
|-----|-----------------|--------|
| 결제 충전 | `purchase` | +N |
| 문제 생성 | `usage` | -1 |
| 보너스 지급 | `bonus` | +N |
| 환불 | `refund` | -N |
| 관리자 지급 | `admin_add` | +N |

### 적용할 파일
- `supabase/migrations/004_credit_usage_history.sql` (생성됨)
- `lib/coins.ts` 또는 `lib/credit.ts` (신규 생성 필요)
- 문제 생성 API에서 사용 내역 기록

---

## 4. 개인정보 암호화 - 우선순위: 중간

### 필요성
- 데이터베이스 침해 시에도 개인정보 보호
- 개인정보보호법 준수
- 서비스 신뢰도 향상

### 암호화 대상
- 이메일 (`profiles.email`)
- 이름 (`profiles.full_name`)
- IP 주소 (`user_activity_logs.ip_address`)

### 구현 방식
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 환경변수 추가
```env
# 32바이트 (256비트) 키 생성: openssl rand -hex 32
ENCRYPTION_KEY=your_64_character_hex_key_here
```

---

## 5. RLS 정책 보강 - 우선순위: 중간

### 현재 문제점
- 관리자가 일반 사용자 데이터 조회 시 권한 문제 발생 가능
- ddalggak.md 9장의 RLS 오류 사례 참고

### 권장 정책 패턴
```sql
-- 관리자는 모든 데이터 조회 가능
CREATE POLICY "Admins can view all data"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

### 적용할 테이블
- `orders` - 결제 내역
- `archived_questions` - 생성된 문제
- `profiles` - 회원 정보
- `demo_usage` - 데모 사용 현황

---

## 6. 로그 자동 삭제 - 우선순위: 낮음

### 필요성
- 스토리지 비용 절감
- 법적 보관 기간 준수 (3개월 이후 삭제)

### 구현 방법 (pg_cron 사용)
```sql
-- Supabase Dashboard > Database > Extensions에서 pg_cron 활성화
SELECT cron.schedule(
  'cleanup-old-logs',
  '0 3 * * *',  -- 매일 새벽 3시
  $$DELETE FROM user_activity_logs
    WHERE created_at < now() - interval '90 days'$$
);
```

---

## 7. 추가 권장사항

### 7.1 결제 내역 보관 기간 명시
- 전자상거래법상 5년 보관 의무
- `orders` 테이블에서 삭제 방지 정책 적용

### 7.2 환불 관리 기능
- 현재: 없음
- 권장: 관리자 페이지에서 환불 요청 처리 UI
- Toss Payments 환불 API 연동

### 7.3 이미지/파일 저장소 (선택)
- 현재: 없음 (문제 생성 서비스라 불필요할 수 있음)
- 향후 필요 시: Cloudflare R2 연동 고려

### 7.4 에러 모니터링
- Sentry 또는 LogRocket 연동
- 프로덕션 에러 실시간 알림

---

## 구현 순서 권장

### Phase 1: 법적 필수 사항 (1주)
1. ✅ coin_products 테이블 생성
2. 소프트 삭제 구현
3. 활동 로그 시스템 구축

### Phase 2: 운영 효율화 (1-2주)
4. 크레딧 사용 내역 추적
5. RLS 정책 전면 점검
6. 관리자 페이지 기능 보강

### Phase 3: 보안 강화 (1-2주)
7. 개인정보 암호화
8. 로그 자동 삭제 설정
9. 환불 관리 기능

---

## 생성된 Migration 파일

| 파일 | 설명 | 실행 여부 |
|-----|-----|---------|
| `001_coin_products.sql` | 요금제 관리 테이블 | **Supabase에서 실행 필요** |
| `002_soft_delete.sql` | 소프트 삭제 | **Supabase에서 실행 필요** |
| `003_activity_logs.sql` | 활동 로그 | **Supabase에서 실행 필요** |
| `004_credit_usage_history.sql` | 크레딧 내역 | **Supabase에서 실행 필요** |

### 실행 방법
1. Supabase Dashboard 접속
2. SQL Editor 열기
3. 각 파일 내용 복사하여 실행

---

## 참고 자료
- `ddalggak.md` - 딸각 스튜디오 기술 백서
- Supabase 공식 문서: https://supabase.com/docs
- 전자상거래법 제6조 (거래기록 보관)
- 통신비밀보호법 제15조의2 (로그 보관)
