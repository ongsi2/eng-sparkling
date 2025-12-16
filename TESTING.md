# ENG-MVP 테스트 가이드

## 🎯 구현 완료 기능

### ✅ 완료된 작업
1. **문법 문제 프롬프트 보강**
   - Few-shot 예시 추가
   - 5개의 문법 포인트 (①②③④⑤) 명시적으로 요구
   - 더 명확한 지시사항

2. **아티클 생성 기능**
   - 키워드 입력 → 영어 지문 생성
   - 난이도 선택: 중학생, 고1, 고2, 고3
   - 단어 수 선택: 100-800단어
   - API: `/api/generate-article`

3. **2단계 워크플로우 UI**
   - Step 1: 키워드 → 아티클 생성
   - Step 2: 아티클 → 문제 생성
   - 단계별 진행 표시

4. **13가지 문제 유형 지원**
   - 문법형 (어법상 틀린 것)
   - 틀린 단어 선택형
   - 밑줄의 의미형
   - 주제 뽑기형
   - 제목 뽑기형
   - 맞는 선지 뽑기
   - 틀린 선지 뽑기
   - 빈칸에 들어갈 말
   - 요약문 완성
   - 무관한 문장
   - 문장 삽입
   - 글의 순서형

---

## 🧪 테스트 시나리오

### 1. 기본 페이지 테스트 (localhost:3000)
- [ ] 메인 페이지 로드 확인
- [ ] "2단계 워크플로우" 버튼 확인
- [ ] 지문 입력 후 문제 생성 테스트
- [ ] 생성된 문제에 ①②③④⑤가 모두 표시되는지 확인

### 2. 2단계 워크플로우 테스트 (localhost:3000/workflow)

#### Step 1: 아티클 생성
테스트 케이스:

**케이스 1: AI & Healthcare (고3 난이도)**
```
키워드: artificial intelligence, healthcare, diagnosis
난이도: 고3
단어 수: 300
```

**케이스 2: 중학생 난이도**
```
키워드: soccer, teamwork, exercise
난이도: 중학생
단어 수: 200
```

**케이스 3: 긴 지문**
```
키워드: climate change, global warming, renewable energy
난이도: 고2
단어 수: 500
```

테스트 체크리스트:
- [ ] 키워드 입력 정상 작동
- [ ] 난이도 선택 버튼 정상 작동
- [ ] 단어 수 슬라이더 정상 작동
- [ ] "아티클 생성하기" 버튼 클릭 시 로딩 표시
- [ ] 생성된 아티클에 모든 키워드 포함 여부
- [ ] 아티클 제목, 본문, 단어 수, 난이도 정상 표시

#### Step 2: 문제 생성
- [ ] 13가지 문제 유형 드롭다운 정상 작동
- [ ] 각 문제 유형별로 문제 생성 테스트

**필수 테스트 유형:**
1. **문법형 (GRAMMAR_INCORRECT)**
   - ①②③④⑤가 지문에 모두 표시되는지 확인 (중요!)
   - 하나만 틀리고 나머지는 맞는지 확인

2. **틀린 단어 선택형 (SELECT_INCORRECT_WORD)**
   - 단어에 ①②③④⑤ 표시 확인

3. **빈칸에 들어갈 말 (BLANK_WORD)**
   - (A), (B) 빈칸 확인

4. **문장 삽입 (INSERT_SENTENCE)**
   - "주어진 문장" 별도 표시 확인
   - (A), (B), (C), (D) 위치 확인

5. **글의 순서형 (SENTENCE_ORDER)**
   - (A), (B), (C) 문단 구분 확인

---

## 🚀 빠른 테스트 방법

### 1. 서버 실행 확인
```bash
cd eng-mvp
npm run dev
```

서버 주소: http://localhost:3000

### 2. 메인 페이지 테스트
1. http://localhost:3000 접속
2. 샘플 지문 입력:
```
Faker is one of the most famous players in League of Legends. He is known for his great skill and long career. Many fans see him as a legend who helped make the game popular around the world.
```
3. "문법 문제 생성하기" 클릭
4. 결과 확인: ①②③④⑤ 모두 표시되어야 함

### 3. 워크플로우 페이지 테스트
1. http://localhost:3000/workflow 접속
2. 키워드 입력: `technology, innovation, future`
3. 난이도: 고3
4. 단어 수: 300
5. "아티클 생성하기" 클릭
6. 생성된 아티클 확인
7. 문제 유형 선택: "문법형 (어법상 틀린 것)"
8. "문제 생성하기" 클릭
9. ①②③④⑤가 모두 표시되는지 확인

---

## 🐛 알려진 이슈 및 해결 방법

### 1. OpenAI API Key 에러
**증상:** 401 Unauthorized 에러
**해결:**
```bash
# .env.local 파일 확인
cat .env.local

# API 키가 올바른지 확인
# 서버 재시작
```

### 2. Port 3000 사용 중
**증상:** Port already in use
**해결:**
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### 3. JSON 파싱 에러
**증상:** Failed to parse AI response
**해결:** 일시적인 OpenAI 응답 오류. 다시 시도하면 대부분 해결됨

---

## 📊 API 엔드포인트

### POST /api/generate-article
키워드로 영어 아티클 생성

**Request:**
```json
{
  "keywords": ["keyword1", "keyword2"],
  "difficulty": "고3",
  "wordCount": 300
}
```

**Response:**
```json
{
  "article": "The complete article text...",
  "title": "Article Title",
  "wordCount": 298,
  "keywords": ["keyword1", "keyword2"],
  "difficulty": "고3"
}
```

### POST /api/generate
아티클로 문제 생성

**Request:**
```json
{
  "passage": "The article text...",
  "questionType": "GRAMMAR_INCORRECT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "question": "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
  "modifiedPassage": "passage with ①②③④⑤",
  "choices": ["choice1", "choice2", "choice3", "choice4", "choice5"],
  "answer": 1,
  "explanation": "Korean explanation",
  "createdAt": "2025-12-16T12:00:00.000Z"
}
```

---

## ✨ 주요 개선 사항

### Before (기존 문제)
- ❌ 문법 문제에서 ① 만 표시됨
- ❌ 키워드로 아티클 생성 기능 없음
- ❌ 문제 유형이 문법만 지원
- ❌ 난이도/길이 선택 불가

### After (개선 후)
- ✅ ①②③④⑤ 모두 표시
- ✅ 키워드 → 아티클 생성 기능
- ✅ 13가지 문제 유형 지원
- ✅ 난이도 4단계 선택 (중학생/고1/고2/고3)
- ✅ 단어 수 100-800 범위 선택
- ✅ 2단계 워크플로우 UI
- ✅ ENG-SPARK 스타일 구현

---

## 🎉 완료!

모든 요청사항 구현 완료:
1. ✅ 문법 문제 프롬프트 보강
2. ✅ 아티클 생성 프롬프트 및 API
3. ✅ 2단계 워크플로우 UI
4. ✅ 난이도/길이 선택 UI
5. ✅ 13가지 문제 유형 선택 드롭다운
6. ✅ 전체 통합

**테스트 URL:**
- 메인 페이지: http://localhost:3000
- 워크플로우: http://localhost:3000/workflow

**참고:**
- OpenAI API 비용: ~2원/문제 (GPT-4o-mini)
- 생성 시간: 아티클 10-20초, 문제 10-20초
- ENG-SPARK 방식: 키워드 → 아티클 → 문제 (2단계)
