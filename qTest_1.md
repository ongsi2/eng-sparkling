PS C:\develop\eng-sparkling> npm run test:quality

> eng-mvp@0.1.0 test:quality
> npx ts-node scripts/quality-evaluator.ts

🔍 문제 품질 평가 시작

============================================================

[1/10] 테스트 케이스 실행...

📝 생성 중: SELECT_INCORRECT_WORD (중학생) - 키워드: coffee, morning, energy
(node:29872) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///C:/develop/eng-sparkling/scripts/quality-evaluator.ts is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to C:\develop\eng-sparkling\package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
평가 중...

📊 결과:
- 제목: "How Coffee Can Transform Your Mornings"
- 아티클 점수: 8/10
- 문제 점수: 6/10
- 해설 점수: 5/10
- 종합: 6/10
- 요약: 기사의 어휘 수준이 약간 쉬우며, 문제 설정에서 'consume'의 오용을 제대로 설명하지 못하였습니다. 설명 부분에서 한국어 뜻을 제공하지 않았고, 모든 선택지를 적절히 분석하지 않았습니다.
- 이슈: Vocabulary might be too simple for a high-level exam, The question is based on a misinterpretation of the word 'consume' as 'depend', Does not explain why 'consume' is incorrect

[2/10] 테스트 케이스 실행...

📝 생성 중: SELECT_INCORRECT_WORD (고1) - 키워드: technology, education, future
평가 중...

📊 결과:
- 제목: "How Technology Shapes Education in the 21st Century"
- 아티클 점수: 9/10
- 문제 점수: 8/10
- 해설 점수: 6/10
- 종합: 8/10
- 요약: 문제가 답의 정확성에서 약간의 논란이 있음. 설명은 구조적 및 특정한 명확성이 부족함.
- 이슈: Answer Correctness, Structure, Specificity

[3/10] 테스트 케이스 실행...

📝 생성 중: PICK_TITLE (고2) - 키워드: climate, ocean, ecosystem
평가 중...

📊 결과:
- 제목: "The Fragile Balance of Our Ocean Ecosystems"
- 아티클 점수: 9/10
- 문제 점수: 10/10
- 해설 점수: 6/10
- 종합: 8/10
- 요약: 기사는 전반적으로 잘 작성되었으나, 해설에서 모든 선택지에 대한 분석이 부족하고 한국어 의미 제공이 없습니다.
- 이슈: Not all choices analyzed, No Korean meanings provided

[4/10] 테스트 케이스 실행...

📝 생성 중: PICK_SUBJECT (고3) - 키워드: psychology, decision, bias
평가 중...

📊 결과:
- 제목: "Navigating Secrets of the Mind: A Closer Look at Decision-Making Biases"
- 아티클 점수: 10/10
- 문제 점수: 9/10
- 해설 점수: 7/10
- 종합: 8.67/10
- 요약: 제시된 글은 구조 및 내용 측면에서 높은 점수를 받았으며, 문법 및 어휘도 적절합니다. 질문은 명확하고 답변은 정확하지만, 설명에서 모든 선택지를 철저히 분석하지 못하고 있으며 한국어로 의미를 제공하지 않았습니다.
- 이슈: Doesn't fully analyze all choices, Doesn't provide Korean meanings for terms

[5/10] 테스트 케이스 실행...

📝 생성 중: SELECT_INCORRECT_WORD (고1) - 키워드: music, brain, memory
평가 중...

📊 결과:
- 제목: "The Connection Between Music and Our Minds"
- 아티클 점수: 10/10
- 문제 점수: 9/10
- 해설 점수: 6/10
- 종합: 8.33/10
- 요약: 기사 내용은 흠잡을 데 없이 훌륭하지만, 설명에서 한국어 해석이 없고 모든 선택지를 분석하지 않아 점수가 더 낮습니다.
- 이슈: missing Korean meanings, incomplete choice analysis

[6/10] 테스트 케이스 실행...

📝 생성 중: PICK_TITLE (중학생) - 키워드: exercise, mental, health
평가 중...

📊 결과:
- 제목: "Connecting Body and Mind Through Activity"
- 아티클 점수: 9/10
- 문제 점수: 7/10
- 해설 점수: 6/10
- 종합: 7/10
- 요약: 질문에서 답변이 글과 맞지 않습니다. 설명에서 각 선택지를 구체적으로 분석하지 않고 있습니다.
- 이슈: Answer Correctness, Completeness, Logic

[7/10] 테스트 케이스 실행...

📝 생성 중: SELECT_INCORRECT_WORD (고2) - 키워드: space, exploration, mars
평가 중...

📊 결과:
- 제목: "The Red Planet Beckons: A New Era in Martian Exploration"
- 아티클 점수: 9/10
- 문제 점수: 10/10
- 해설 점수: 6/10
- 종합: 8/10
- 요약: 기사와 질문은 훌륭하나 설명에서 단어 설명 부족 및 한국어 뜻 미제공 문제 있음
- 이슈: Word meanings not provided in Korean, Explanation does not specify what 'cactus' modifies

[8/10] 테스트 케이스 실행...

📝 생성 중: PICK_SUBJECT (고3) - 키워드: social media, youth, communication
평가 중...

📊 결과:
- 제목: "Navigating Connections in a Digital Age"
- 아티클 점수: 9/10
- 문제 점수: 5/10
- 해설 점수: 4/10
- 종합: 6/10
- 요약: 질문 내용의 선택지가 지문 주제와 명확히 일치하지 않아 답변의 신뢰성이 떨어지며, 해설이 3단락 구조를 따르지 않고 있다고 평가되었습니다.
- 이슈: The marked answer is debatable, Explanation doesn't have 3 paragraphs, Completeness lacking: Not all choices analyzed

[9/10] 테스트 케이스 실행...

📝 생성 중: SELECT_INCORRECT_WORD (고1) - 키워드: food, culture, tradition
평가 중...

📊 결과:
- 제목: "Exploring the Depths of Culinary Heritage"
- 아티클 점수: 9/10
- 문제 점수: 6/10
- 해설 점수: 6/10
- 종합: 7/10
- 요약: 질문 설명은 명확성과 정확성에서 문제가 있으며, 설명에서 모든 선택지를 철저히 분석하지 않았습니다. 문서는 전반적으로 우수합니다.
- 이슈: Answer Correctness: The explanation suggests 'molten' was used in place of 'marinated', but such a substitution was not present in the passage., Clarity: The question format could have been more explicit in identifying what was wrong with the term., Completeness: Not all choices were analyzed thoroughly.

[10/10] 테스트 케이스 실행...

📝 생성 중: PICK_TITLE (고2) - 키워드: art, creativity, innovation
평가 중...

📊 결과:
- 제목: "Where Art Meets Imagination"
- 아티클 점수: 8/10
- 문제 점수: 9/10
- 해설 점수: 6/10
- 종합: 8/10
- 요약: 설명 부분에서 모든 선택지를 분석하지 않았고, 핵심 용어에 대한 한국어 의미 설명이 부족합니다. 기사는 구조적이고 문법적으로 양호하나, 예시가 더 풍부할 수 있습니다. 질문은 명료하며 정답 선택이 적절합니다.
- 이슈: Lacks detailed analysis of each choice, No Korean meanings provided for key terms

============================================================
📈 최종 리포트

평균 점수: 7.5/10
테스트 수: 10개

카테고리별 평균:
- 아티클: 9.0/10
- 문제: 7.9/10
- 해설: 5.8/10

🔴 빈발 이슈 TOP 5:
1. (2회) No Korean meanings provided
2. (2회) Answer Correctness
3. (2회) Logic
4. (1회) Vocabulary might be too simple for a high-level exam
5. (1회) The question is based on a misinterpretation of the word 'consume' as 'depend'

✅ 클리셰 제목 없음

============================================================
품질 평가 완료!