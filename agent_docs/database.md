# 데이터베이스 가이드

## Supabase 설정

- **프로젝트**: eng-sparkling
- **클라이언트**: `lib/supabase.ts`

## 테이블 구조

| 테이블 | 용도 |
|--------|------|
| `users` | 사용자 정보 (coins, subscription) |
| `orders` | 결제 주문 내역 |
| `credit_history` | 코인 사용/충전 내역 |
| `generated_questions` | 생성된 문제 저장 |

## RLS (Row Level Security)

모든 테이블에 RLS 적용됨:
- `users`: 본인 데이터만 접근
- `orders`: 본인 주문만 조회
- `credit_history`: 본인 내역만 조회

## 마이그레이션

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_credit_history.sql
├── ...
└── 008_atomic_coin_operations.sql  # 원자적 코인 연산 (Race Condition 방지)
```

## RPC 함수

- `complete_order_with_coins`: 결제 완료 + 코인 지급 (트랜잭션)
- `use_coins_atomic`: 코인 사용 (락 기반)
