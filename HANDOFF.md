# ENG-SPARKLING 작업 핸드오프

> 세션 시작 시 이 파일을 먼저 읽으세요.
> 오래된 기록은 `archives/` 폴더에 있습니다.

---

## 현재 상태 (2025-12-19)

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

### 🔧 최근 수정 (2025-12-19)

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
- [ ] 밑줄 렌더링 테스트 (문법형, 틀린단어 선택형)
- [ ] 메인 페이지 개선 (무료 체험 버튼)
- [ ] 모바일 UI 점검

---

## 알려진 이슈
- 없음

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
```

---

## 참고 문서
- `CLAUDE.md` - 프로젝트 개요, 기술 스택, 핸드오프 규칙
- `archives/HANDOFF-2024-12.md` - 과거 작업 기록
- `docs/eng-spark.md` - ENG-SPARK 서비스 스펙
