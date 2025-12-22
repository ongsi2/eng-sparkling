# 테스트 가이드

## 테스트 프레임워크

- **Vitest**: 단위 테스트
- **Testing Library**: React 컴포넌트 테스트

## 명령어

```bash
npm run test           # Watch 모드
npm run test:run       # 단일 실행
npm run test:coverage  # 커버리지 리포트
```

## 테스트 파일 구조

```
tests/
├── setup.ts                    # 테스트 설정
└── lib/
    ├── csrf.test.ts            # CSRF 테스트 (10)
    ├── sanitize-html.test.ts   # XSS 방지 테스트 (18)
    └── encryption.test.ts      # 암호화 테스트 (14)
```

## 테스트 작성 규칙

1. 파일명: `*.test.ts` 또는 `*.spec.ts`
2. 위치: `tests/` 디렉토리 하위
3. 커버리지 목표: 80% 이상

## 검증 스크립트

```bash
npm run validate:prompts    # 프롬프트 검증
npm run test:questions      # 문제 생성 테스트
npm run test:quality        # 품질 평가
```
