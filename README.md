# ENG-MVP

AI 기반 영어 문법 문제 자동 생성 서비스 (Minimum Viable Product)

## 🎯 프로젝트 소개

ENG-SPARK 서비스를 참고하여 하루 만에 개발한 MVP입니다. 영어 지문을 입력하면 AI가 수능형 문법 문제를 자동으로 생성합니다.

### 주요 기능

- ✅ 영어 지문 입력
- ✅ AI 문법 문제 자동 생성 (5지선다)
- ✅ 생성된 문제 표시 (정답 + 해설)
- ✅ 로컬 히스토리 저장 (최대 10개)
- ✅ 반응형 디자인

### 기술 스택

**Frontend:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS

**Backend:**
- Next.js API Routes
- OpenAI API (GPT-4o-mini)

**Storage:**
- localStorage (클라이언트)

## 🚀 시작하기

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:

```bash
OPENAI_API_KEY=sk-proj-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

> OpenAI API 키는 https://platform.openai.com/api-keys 에서 발급받을 수 있습니다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 확인하세요.

## 📁 프로젝트 구조

```
eng-mvp/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI 문제 생성 API
│   ├── components/
│   │   ├── PassageInput.tsx      # 지문 입력 컴포넌트
│   │   ├── QuestionDisplay.tsx   # 문제 표시 컴포넌트
│   │   └── History.tsx           # 히스토리 컴포넌트
│   └── page.tsx                  # 메인 페이지
├── lib/
│   ├── openai.ts                 # OpenAI 클라이언트 설정
│   ├── prompts.ts                # 프롬프트 템플릿
│   └── storage.ts                # localStorage 헬퍼
├── types/
│   └── index.ts                  # TypeScript 타입 정의
└── .env.local                    # 환경변수 (직접 생성)
```

## 🎨 사용 방법

1. **지문 입력**: 영어 지문을 입력하세요 (최소 50자)
2. **문제 생성**: "문법 문제 생성하기" 버튼 클릭
3. **결과 확인**: 생성된 5지선다 문제와 해설 확인
4. **히스토리**: 생성 기록에서 이전 문제 다시 보기

## 💡 API 사용법

### POST /api/generate

**Request:**
```json
{
  "passage": "영어 지문...",
  "questionType": "GRAMMAR_INCORRECT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "questionType": "GRAMMAR_INCORRECT",
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "passage": "원본 지문",
  "modifiedPassage": "①②③④⑤ 표시된 지문",
  "choices": ["선지1", "선지2", ...],
  "answer": 3,
  "explanation": "해설 (한국어)",
  "createdAt": "2024-12-16T10:00:00.000Z"
}
```

## 🛠 개발 가이드

### 빌드

```bash
npm run build
```

### 배포 (Vercel)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 추가
vercel env add OPENAI_API_KEY
```

## 📊 비용 정보

- **OpenAI API (GPT-4o-mini)**: 문제 100개 생성 시 약 $0.5
- **Vercel 호스팅**: Free tier 사용 가능
- **총 비용**: 거의 무료 (API 사용량에 따라 변동)

## 🔮 향후 계획

- [ ] 13가지 문제 유형 지원
- [ ] Firebase Authentication 추가
- [ ] PostgreSQL 데이터베이스 연동
- [ ] Toss Payments 구독 기능
- [ ] Spring Boot 백엔드 분리

## 📝 라이선스

MIT License

## 🙏 Credits

- 참고 서비스: [ENG-SPARK](https://eng-spark.com)
- Powered by [OpenAI](https://openai.com)
- Built with [Next.js](https://nextjs.org)
