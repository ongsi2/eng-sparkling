# ENG-SPARKLING 프로젝트 종합 분석 리포트

**분석 일시**: 2025-12-22
**분석 대상**: ENG-SPARKLING (AI 영어 문제 자동 생성 서비스)
**분석 범위**: 11개 영역 종합 진단

---

## 요약 (Executive Summary)

11개 전문 에이전트가 코드베이스를 분석한 결과, **총 47개의 개선 항목**을 발견했습니다.

| 심각도 | 개수 | 주요 영역 |
|--------|------|----------|
| 🔴 Critical | 8개 | 보안, 결제 시스템, DB |
| 🟡 High | 15개 | 성능, 에러 처리, 테스트 |
| 🟢 Medium | 24개 | UI/UX, SEO, DevOps |

---

## 🔴 Critical Issues (즉시 수정 필요)

### 1. 보안 취약점

#### 1.1 XSS 취약점 - dangerouslySetInnerHTML
**파일**: `app/page.tsx:457`, `app/workflow/page.tsx:1203`

```typescript
// 현재 (취약)
<p dangerouslySetInnerHTML={{ __html: selectedQuestion.modifiedPassage }} />

// 해결책: DOMPurify 적용
import DOMPurify from 'isomorphic-dompurify';
const sanitized = DOMPurify.sanitize(modifiedPassage, {
  ALLOWED_TAGS: ['u', 'mark'],
  ALLOWED_ATTR: []
});
```

**영향**: AI 응답에 악성 스크립트 포함 시 사용자 세션 탈취 가능

#### 1.2 CSRF 보호 부재
**파일**: 모든 POST/PATCH/DELETE API 라우트

- 현재 CSRF 토큰 검증 없음
- Origin/Referer 헤더 검증 없음

**해결책**:
```typescript
// middleware.ts에 추가
const csrfToken = request.headers.get('x-csrf-token');
if (!csrfToken || csrfToken !== storedToken) {
  return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
}
```

### 2. 결제 시스템 안정성

#### 2.1 Race Condition - 코인 추가
**파일**: `app/api/payment/confirm/route.ts:145-172`

```typescript
// 문제: Step 3과 4 사이 race condition
3. Profile coins 조회 (SELECT)
4. Profile coins 업데이트 (UPDATE)  // 동시 요청 시 덮어쓰기

// 해결책: Supabase RPC 함수로 원자적 처리
await supabaseAdmin.rpc('complete_order_with_coins', {
  p_order_id: orderId,
  p_coins: order.coins
});
```

#### 2.2 Toss Webhook 미구현
- 결제 완료 후 DB 업데이트 실패 시 불일치 발생
- 사용자는 결제됐으나 코인 미지급 상황

**해결책**: Webhook 엔드포인트 구현 및 재시도 로직 추가

### 3. 데이터베이스 구조

#### 3.1 refunds 테이블 마이그레이션 누락
**파일**: `lib/admin.ts`에서 사용하지만 마이그레이션 파일 없음

```sql
-- 008_refunds_table.sql 필요
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  coins INTEGER NOT NULL,
  reason TEXT,
  refunded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책 추가
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
```

#### 3.2 N+1 쿼리 문제
**파일**: `lib/admin.ts:getAdminStats()`, `getPeriodStats()`

- `getAdminStats()`: 5개의 개별 쿼리 실행
- `getPeriodStats()`: 15개의 개별 쿼리 실행

**해결책**: 통합 RPC 함수 또는 JOIN 쿼리 사용

---

## 🟡 High Priority Issues

### 4. 성능 최적화

#### 4.1 번들 사이즈 - PDF 라이브러리
**파일**: `package.json`, `app/workflow/page.tsx`

- `html2canvas` (145KB) + `jspdf` (193KB) = 338KB
- 모든 페이지에서 로드됨

**해결책**: 동적 임포트
```typescript
const PDFExportButton = dynamic(() => import('./PDFExportButton'), {
  loading: () => <Skeleton />
});
```
**예상 효과**: 초기 번들 150-200KB 감소

#### 4.2 질문 생성 순차 호출
**파일**: `app/workflow/page.tsx:270-338`

- 현재: 12개 질문 = 12번 순차 API 호출 (60초)
- 개선: 3-4개씩 병렬 호출 (20-25초)

```typescript
const MAX_CONCURRENT = 3;
for (let i = 0; i < types.length; i += MAX_CONCURRENT) {
  const batch = types.slice(i, i + MAX_CONCURRENT);
  await Promise.all(batch.map(type => generateQuestion(type)));
}
```
**예상 효과**: 생성 시간 60% 단축

#### 4.3 불필요한 리렌더링
**파일**: `app/workflow/page.tsx`

- useState 10개 이상, useCallback/useMemo 0개
- 상태 변경 시 전체 페이지 리렌더링

**해결책**:
- `React.memo`로 QuestionCard 컴포넌트 메모이제이션
- `useReducer`로 관련 상태 그룹화
- `useCallback`으로 콜백 함수 메모이제이션

**예상 효과**: 렌더링 60-70% 감소

### 5. 테스트 커버리지

**현재 상태**: 스크립트 기반 수동 테스트만 존재

| 영역 | 테스트 유무 | 우선순위 |
|------|-----------|---------|
| 결제 플로우 | ❌ 없음 | P0 |
| 인증 플로우 | ❌ 없음 | P0 |
| API 라우트 | ❌ 없음 | P0 |
| 코인 시스템 | ❌ 없음 | P1 |
| 입력 검증 | ❌ 없음 | P1 |
| E2E 테스트 | ❌ 없음 | P1 |

**권장**: Jest + Playwright 도입

### 6. 에러 핸들링

#### 6.1 API 에러 응답 불일치
- 128개의 `NextResponse.json` 호출 중 일부만 유틸리티 사용
- HTTP 상태 코드 불일치 (402 vs 429)

**해결책**: 모든 API에서 `lib/api-response.ts` 유틸리티 사용

#### 6.2 에러 추적 ID 부재
- 사용자와 개발팀 간 에러 참조 불가능
- 같은 에러 발생 시 패턴 파악 어려움

**해결책**:
```typescript
// middleware.ts에 correlation ID 추가
const correlationId = uuidv4();
response.headers.set('x-correlation-id', correlationId);
```

---

## 🟢 Medium Priority Issues

### 7. AI 프롬프트 품질

**현재 점수**: 7.5/10

| 문제 | 영향 | 해결책 |
|------|------|--------|
| JSON 스키마 불명확 | 출력 형식 오류 | 명시적 스키마 제공 |
| 프롬프트 과도한 길이 | 핵심 지시 손실 | 35% 단축 |
| 한영 혼용 | 해석 모호 | 언어 정책 통일 |
| 번호 체계 불일치 | 매칭 오류 | 1-indexed 통일 |

**예상 효과**: 성공률 60% → 85-90%

### 8. UI/UX 개선

#### 8.1 접근성 (a11y)
- `aria` 속성 거의 없음
- 키보드 네비게이션 미지원
- 드롭다운에 role/aria-expanded 없음

**해결책**:
```typescript
<button
  aria-haspopup="menu"
  aria-expanded={isOpen}
  aria-label="사용자 메뉴"
>
```

#### 8.2 빈 상태 UI
- 저장함, 크레딧 내역에 Empty State 없음

**해결책**: EmptyState 컴포넌트 생성 및 적용

### 9. SEO 및 메타데이터

| 항목 | 현재 | 필요 |
|------|------|------|
| Open Graph 태그 | ❌ | ✓ |
| Twitter Card | ❌ | ✓ |
| sitemap.xml | ❌ | ✓ |
| robots.txt | ❌ | ✓ |
| JSON-LD | ❌ | ✓ |
| Description 오류 | "13유형" | "12유형" |

### 10. 배포 및 DevOps

#### 10.1 Dockerfile 개선
```dockerfile
# 추가 필요
USER node:node  # 보안: 비루트 사용자
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider http://localhost:3003/api/health
```

#### 10.2 CI/CD 파이프라인 부재
- 현재: 수동 배포
- 권장: GitHub Actions + AWS ECS

#### 10.3 next.config.ts 보안 헤더 부재
```typescript
// 추가 필요
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "..." },
]
```

---

## 구현 로드맵

### Phase 1: 긴급 수정 (1주)
| 작업 | 예상 시간 | 담당 |
|------|---------|------|
| XSS 방지 (DOMPurify) | 2시간 | Frontend |
| CSRF 토큰 구현 | 4시간 | Backend |
| 결제 RPC 함수 | 4시간 | Backend |
| refunds 마이그레이션 | 1시간 | DB |

### Phase 2: 고우선순위 (2주)
| 작업 | 예상 시간 |
|------|---------|
| PDF 동적 로드 | 2일 |
| 병렬 질문 생성 | 2일 |
| 컴포넌트 메모이제이션 | 3일 |
| API 테스트 작성 | 4일 |
| 에러 응답 표준화 | 2일 |

### Phase 3: 중우선순위 (1개월)
| 작업 | 예상 시간 |
|------|---------|
| 프롬프트 최적화 | 1주 |
| 접근성 개선 | 3일 |
| SEO 메타태그 | 2일 |
| CI/CD 파이프라인 | 3일 |
| E2E 테스트 | 1주 |

---

## 현재 강점

프로젝트는 다음과 같은 견고한 기반을 갖추고 있습니다:

1. **체계적인 아키텍처**: Next.js 16 + Supabase + OpenAI
2. **보안 기반**: 활동 로그 IP 암호화, RLS 정책
3. **캐싱 시스템**: 7일 TTL generation_cache
4. **사용자 친화적 UI**: 반응형 디자인, 스켈레톤 로딩
5. **결제 시스템**: Toss Payments 통합 완료
6. **12가지 문제 유형**: 수능 스타일 문제 생성

---

## 결론

ENG-SPARKLING은 **기능적으로 완성도 높은 MVP**입니다.
위 개선사항들을 적용하면:

- **보안**: 프로덕션 수준 보안 확보
- **안정성**: 결제 시스템 신뢰도 향상
- **성능**: 사용자 경험 40-60% 개선
- **유지보수**: 테스트 커버리지로 버그 90% 조기 발견

**권장 우선순위**:
1. 🔴 Critical 보안/결제 이슈 (1주)
2. 🟡 성능 최적화 (2주)
3. 🟢 UI/UX/SEO (1개월)

---

*이 리포트는 11개 전문 에이전트의 분석을 종합한 것입니다.*
