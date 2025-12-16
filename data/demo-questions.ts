/**
 * 데모용 고정 지문 및 미리 생성된 문제들
 * 2025학년도 수능 영어 20번 지문 기반
 */

export const DEMO_PASSAGE = {
  title: "2025학년도 수능 영어평가 20번 지문",
  content: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem to offer anything meaningful to help students grow in their lives outside the games. While this may be true for many games, we are too easily ignoring a valuable tool that could be used to enhance productivity instead of derailing it. Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students. This will enable educators to take advantage of games' attention commanding capacities and allow our students to enjoy their games while learning.`,
};

export type QuestionType =
  | 'GRAMMAR_INCORRECT'
  | 'SELECT_INCORRECT_WORD'
  | 'PICK_UNDERLINE'
  | 'PICK_SUBJECT'
  | 'PICK_TITLE'
  | 'CORRECT_ANSWER'
  | 'INCORRECT_ANSWER'
  | 'BLANK_WORD'
  | 'COMPLETE_SUMMARY'
  | 'IRRELEVANT_SENTENCE'
  | 'INSERT_SENTENCE'
  | 'SENTENCE_ORDER';

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  icon: string;
  description: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { type: 'GRAMMAR_INCORRECT', label: '문법형', icon: 'A', description: '어법상 틀린 것 찾기' },
  { type: 'SELECT_INCORRECT_WORD', label: '틀린 단어 선택형', icon: '✗', description: '문맥상 틀린 단어 찾기' },
  { type: 'PICK_UNDERLINE', label: '밑줄의 의미형', icon: '✎', description: '밑줄 친 부분의 의미 파악' },
  { type: 'PICK_SUBJECT', label: '주제 뽑기형', icon: '★', description: '글의 주제 파악' },
  { type: 'COMPLETE_SUMMARY', label: '요약문 완성', icon: '≡', description: '요약문 빈칸 완성' },
  { type: 'CORRECT_ANSWER', label: '맞는 선지 뽑기', icon: '✓', description: '내용 일치 찾기' },
  { type: 'INCORRECT_ANSWER', label: '틀린 선지 뽑기', icon: '✗', description: '내용 불일치 찾기' },
  { type: 'PICK_TITLE', label: '제목 뽑기형', icon: '▲', description: '적절한 제목 찾기' },
  { type: 'BLANK_WORD', label: '빈칸에 들어갈 말', icon: '[ ]', description: '빈칸 추론' },
  { type: 'IRRELEVANT_SENTENCE', label: '무관한 문장', icon: '✕', description: '흐름과 무관한 문장 찾기' },
  { type: 'INSERT_SENTENCE', label: '문장 삽입', icon: '+', description: '주어진 문장 삽입 위치 찾기' },
  { type: 'SENTENCE_ORDER', label: '글의 순서형', icon: '↓', description: '문단 순서 배열' },
];

export interface DemoQuestion {
  question: string;
  modifiedPassage: string;
  choices: string[];
  answer: number;
  explanation: string;
  sentenceToInsert?: string;
}

export const DEMO_QUESTIONS: Record<QuestionType, DemoQuestion> = {
  GRAMMAR_INCORRECT: {
    question: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often ①what prevents a student from accomplishing their goals. Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem ②to offer anything meaningful to help students grow in their lives outside the games. While this may be true for many games, we are too easily ③ignoring a valuable tool that could be used to enhance productivity instead of derailing it. Rather, it is desirable that we ④develops games that connect to the learning outcomes we want for our students. This will enable educators to take advantage of games' attention commanding capacities and ⑤allow our students to enjoy their games while learning.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 4,
    explanation: "④ develops → develop: 'it is desirable that + 주어 + (should) + 동사원형' 구문에서 that절의 동사는 동사원형을 사용해야 합니다. 이는 당위성을 나타내는 형용사(desirable, important, necessary 등) 뒤의 that절에서 사용되는 가정법 현재 용법입니다."
  },
  SELECT_INCORRECT_WORD: {
    question: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a ①pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem to offer anything ②meaningful to help students grow in their lives outside the games. While this may be true for many games, we are too easily ③ignoring a valuable tool that could be used to ④diminish productivity instead of derailing it. Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students. This will enable educators to take advantage of games' attention commanding capacities and allow our students to ⑤enjoy their games while learning.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 4,
    explanation: "④ diminish → enhance: 문맥상 게임이 생산성을 '감소시키는' 것이 아니라 '향상시키는' 도구로 사용될 수 있다는 내용이므로, diminish(감소시키다)는 enhance(향상시키다)로 바꿔야 적절합니다."
  },
  PICK_UNDERLINE: {
    question: "밑줄 친 'derailing it'이 다음 글에서 의미하는 바로 가장 적절한 것은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem to offer anything meaningful to help students grow in their lives outside the games. While this may be true for many games, we are too easily ignoring a valuable tool that could be used to enhance productivity instead of derailing it. Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students. This will enable educators to take advantage of games' attention commanding capacities and allow our students to enjoy their games while learning.`,
    choices: [
      "학습 효과를 극대화하는 것",
      "생산성 향상을 방해하는 것",
      "게임의 장점을 활용하는 것",
      "학생들의 집중력을 높이는 것",
      "교육적 성과를 달성하는 것"
    ],
    answer: 2,
    explanation: "'derailing'은 '탈선시키다, 방해하다'라는 의미입니다. 문맥상 게임이 생산성을 향상시키는 대신(instead of) 방해할 수 있다는 내용이므로, 'derailing it'은 '생산성 향상을 방해하는 것'을 의미합니다."
  },
  PICK_SUBJECT: {
    question: "다음 글의 주제로 가장 적절한 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "비디오 게임이 학생들의 학습에 미치는 부정적 영향",
      "게임 중독을 예방하기 위한 교육적 접근 방법",
      "교육 목표와 연계된 게임 개발의 필요성",
      "학생들의 집중력 향상을 위한 다양한 방법",
      "전통적 교육 방식과 게임 기반 학습의 비교"
    ],
    answer: 3,
    explanation: "글의 핵심 내용은 게임이 학습을 방해하는 도구로만 인식되지만, 교육 목표와 연결된 게임을 개발하면 학생들이 게임을 즐기면서도 학습할 수 있다는 것입니다. 따라서 주제는 '교육 목표와 연계된 게임 개발의 필요성'입니다."
  },
  PICK_TITLE: {
    question: "다음 글의 제목으로 가장 적절한 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "Video Games: The Hidden Enemy of Education",
      "Why Students Prefer Games Over Studying",
      "Games as Educational Tools: Untapped Potential",
      "The Dark Side of Gaming Addiction",
      "Traditional vs. Modern Teaching Methods"
    ],
    answer: 3,
    explanation: "글은 게임이 학습 방해 요소로만 여겨지지만, 실제로는 교육적 도구로 활용될 수 있는 잠재력이 있다고 주장합니다. 따라서 'Games as Educational Tools: Untapped Potential(교육 도구로서의 게임: 미개발된 잠재력)'이 가장 적절한 제목입니다."
  },
  CORRECT_ANSWER: {
    question: "다음 글의 내용과 일치하는 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "비디오 게임은 학생들의 집중력을 떨어뜨린다.",
      "대부분의 게임은 학생들의 성장에 도움이 된다.",
      "게임은 학생들의 주의를 효과적으로 끌 수 있다.",
      "교육자들은 이미 게임을 교육에 활용하고 있다.",
      "모든 게임은 생산성 향상에 기여한다."
    ],
    answer: 3,
    explanation: "글에서 'Games catch and hold attention in a way that few things can'이라고 언급하며, 게임이 다른 것들과 비교할 수 없을 정도로 주의를 끌고 유지할 수 있다고 설명합니다."
  },
  INCORRECT_ANSWER: {
    question: "다음 글의 내용과 일치하지 않는 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "게임은 주의를 사로잡는 능력이 뛰어나다.",
      "많은 게임들이 학생들의 실생활 성장에 도움이 되지 않는다.",
      "게임은 생산성을 향상시키는 도구로 활용될 수 있다.",
      "현재 대부분의 교육자들은 게임의 교육적 가치를 인정한다.",
      "교육 목표와 연결된 게임 개발이 바람직하다."
    ],
    answer: 4,
    explanation: "글에서는 게임이 학습을 방해하는 것으로 '보편적으로 인식된다(universally accept)'고 하며, 게임의 교육적 가치를 '너무 쉽게 무시하고 있다(too easily ignoring)'고 언급합니다. 따라서 '현재 대부분의 교육자들은 게임의 교육적 가치를 인정한다'는 내용과 일치하지 않습니다."
  },
  BLANK_WORD: {
    question: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem to offer anything meaningful to help students grow in their lives outside the games. While this may be true for many games, we are too easily ignoring a valuable tool that could be used to _________________ instead of derailing it. Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students.`,
    choices: [
      "eliminate distractions",
      "enhance productivity",
      "reduce screen time",
      "prevent addiction",
      "replace traditional education"
    ],
    answer: 2,
    explanation: "문맥상 게임이 생산성을 '방해하는(derailing)' 대신 무언가 긍정적인 역할을 할 수 있다는 내용입니다. 뒤에서 교육 목표와 연결된 게임 개발의 필요성을 언급하므로, '생산성을 향상시키다(enhance productivity)'가 가장 적절합니다."
  },
  COMPLETE_SUMMARY: {
    question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
    modifiedPassage: `${DEMO_PASSAGE.content}

→ While video games are often seen as (A)_______ to learning, they can become valuable (B)_______ tools if designed with educational goals in mind.`,
    choices: [
      "(A) obstacles — (B) educational",
      "(A) supplements — (B) entertainment",
      "(A) alternatives — (B) assessment",
      "(A) prerequisites — (B) motivational",
      "(A) additions — (B) recreational"
    ],
    answer: 1,
    explanation: "글의 요지는 게임이 학습의 '장애물(obstacles)'로 여겨지지만, 교육 목표를 염두에 두고 설계하면 '교육적(educational)' 도구가 될 수 있다는 것입니다."
  },
  IRRELEVANT_SENTENCE: {
    question: "다음 글에서 전체 흐름과 관계 없는 문장은?",
    modifiedPassage: `①We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. ②Games catch and hold attention in a way that few things can. ③The global video game industry has grown to be worth over 200 billion dollars annually. ④While this may be true for many games, we are too easily ignoring a valuable tool that could be used to enhance productivity instead of derailing it. ⑤Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 3,
    explanation: "③번 문장은 비디오 게임 산업의 경제적 규모에 대한 내용으로, 게임의 교육적 활용 가능성을 논하는 글의 전체 흐름과 관계가 없습니다."
  },
  INSERT_SENTENCE: {
    question: "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals. ( ① ) Games catch and hold attention in a way that few things can. ( ② ) And yet once they have our focus, they rarely seem to offer anything meaningful to help students grow in their lives outside the games. ( ③ ) While this may be true for many games, we are too easily ignoring a valuable tool that could be used to enhance productivity instead of derailing it. ( ④ ) Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students. ( ⑤ ) This will enable educators to take advantage of games' attention commanding capacities and allow our students to enjoy their games while learning.`,
    sentenceToInsert: "This is precisely what makes games both appealing and potentially dangerous.",
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 2,
    explanation: "주어진 문장의 'This'는 앞 문장에서 언급된 '게임이 주의를 끌고 유지하는 능력'을 가리킵니다. 또한 'appealing and potentially dangerous'는 게임의 양면성을 설명하며, 이는 ②번 뒤에 나오는 '의미 있는 것을 제공하지 못한다'는 내용과 자연스럽게 연결됩니다."
  },
  SENTENCE_ORDER: {
    question: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
    modifiedPassage: `We almost universally accept that playing video games is at best a pleasant break from a student's learning and more often what prevents a student from accomplishing their goals.

(A) While this may be true for many games, we are too easily ignoring a valuable tool that could be used to enhance productivity instead of derailing it.

(B) Games catch and hold attention in a way that few things can. And yet once they have our focus, they rarely seem to offer anything meaningful to help students grow in their lives outside the games.

(C) Rather, it is desirable that we develop games that connect to the learning outcomes we want for our students. This will enable educators to take advantage of games' attention commanding capacities.`,
    choices: [
      "(A) - (B) - (C)",
      "(A) - (C) - (B)",
      "(B) - (A) - (C)",
      "(B) - (C) - (A)",
      "(C) - (A) - (B)"
    ],
    answer: 3,
    explanation: "주어진 문장에서 게임에 대한 부정적 인식을 언급한 후, (B)에서 게임의 특성(주의를 끄는 능력)과 한계를 설명하고, (A)에서 'While this may be true'로 반전을 시작하며, (C)에서 'Rather'로 대안을 제시합니다. 따라서 (B)-(A)-(C) 순서가 적절합니다."
  },
};
