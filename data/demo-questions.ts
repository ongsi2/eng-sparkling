/**
 * 데모용 고정 지문 및 미리 생성된 문제들
 * 2024학년도 수능 영어 31번 지문 기반
 */

export const DEMO_PASSAGE = {
  title: "2024학년도 수능 영어 31번 지문",
  content: `The most obvious difference between music and language is that music does not refer to anything concrete. Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. This apparent limitation, however, is also one of music's greatest strengths. Because music lacks explicit referential meaning, it can communicate something more universal and immediate. The emotional content of a piece of music is not filtered through the mediation of language; it strikes us directly. Music bypasses the rational, analytical mind and speaks directly to our emotions. This is why music can move us so profoundly, even when we cannot articulate exactly what it is expressing. The meaning of music lies not in what it refers to but in how it makes us feel.`,
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
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything concrete. Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words ①do. This apparent limitation, however, is also one of music's greatest strengths. Because music lacks explicit referential meaning, it can communicate something ②more universal and immediate. The emotional content of a piece of music is not filtered through the mediation of language; it ③strikes us directly. Music bypasses the rational, analytical mind and speaks directly to our emotions. This is why music can move us so ④profound, even when we cannot articulate exactly what it is ⑤expressing.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 4,
    explanation: "④ profound → profoundly: 동사 'move'를 수식하는 부사가 필요합니다. 형용사 'profound'가 아닌 부사 'profoundly'가 와야 '매우 깊이 감동시키다'라는 의미가 됩니다."
  },
  SELECT_INCORRECT_WORD: {
    question: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?",
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything ①concrete. Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. This apparent ②limitation, however, is also one of music's greatest strengths. Because music lacks explicit referential meaning, it can communicate something more ③restricted and immediate. The emotional content of a piece of music is not filtered through the mediation of language; it strikes us ④directly. Music bypasses the rational, analytical mind and speaks directly to our emotions. This is why music can move us so ⑤profoundly, even when we cannot articulate exactly what it is expressing.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 3,
    explanation: "③ restricted → universal: 문맥상 음악은 명시적 의미가 없기 때문에 '더 제한적인' 것이 아니라 '더 보편적이고 즉각적인' 것을 전달할 수 있다는 내용입니다. 따라서 restricted(제한적인)는 universal(보편적인)로 바꿔야 적절합니다."
  },
  PICK_UNDERLINE: {
    question: "밑줄 친 'bypasses the rational, analytical mind'가 다음 글에서 의미하는 바로 가장 적절한 것은?",
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything concrete. Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. This apparent limitation, however, is also one of music's greatest strengths. Because music lacks explicit referential meaning, it can communicate something more universal and immediate. The emotional content of a piece of music is not filtered through the mediation of language; it strikes us directly. Music <u>bypasses the rational, analytical mind</u> and speaks directly to our emotions. This is why music can move us so profoundly, even when we cannot articulate exactly what it is expressing.`,
    choices: [
      "논리적 사고 과정을 거치지 않는다",
      "언어적 표현을 통해 전달된다",
      "구체적인 대상을 지시한다",
      "이성적 판단을 강화한다",
      "분석적 능력을 향상시킨다"
    ],
    answer: 1,
    explanation: "밑줄 친 'bypasses the rational, analytical mind'에서 'bypass'는 '우회하다, 건너뛰다'라는 의미입니다. 따라서 ① '논리적 사고 과정을 거치지 않는다'가 정답입니다. 음악이 이성적이고 분석적인 마음을 우회한다는 것은 논리적 사고 과정 없이 직접 감정에 호소한다는 의미입니다."
  },
  PICK_SUBJECT: {
    question: "다음 글의 주제로 가장 적절한 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "음악과 언어의 구조적 유사성",
      "음악이 감정에 직접 호소하는 이유",
      "언어가 음악보다 우월한 점",
      "음악 교육의 필요성과 방법",
      "감정 표현에서 언어의 역할"
    ],
    answer: 2,
    explanation: "글의 핵심 내용은 음악이 언어와 달리 구체적인 것을 지시하지 않지만, 바로 그 점 때문에 이성적 사고를 거치지 않고 감정에 직접 호소할 수 있다는 것입니다. 따라서 주제는 '음악이 감정에 직접 호소하는 이유'입니다."
  },
  PICK_TITLE: {
    question: "다음 글의 제목으로 가장 적절한 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "Music vs. Language: A Structural Analysis",
      "Why Music Speaks Directly to Our Hearts",
      "The Evolution of Musical Expression",
      "Learning Languages Through Music",
      "The Rational Basis of Musical Appreciation"
    ],
    answer: 2,
    explanation: "글은 음악이 언어와 달리 구체적 의미 없이도 감정에 직접 호소할 수 있다는 점을 강조합니다. 'Why Music Speaks Directly to Our Hearts(음악이 왜 우리 마음에 직접 말하는가)'가 이 내용을 가장 잘 담고 있습니다."
  },
  CORRECT_ANSWER: {
    question: "다음 글의 내용과 일치하는 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "음악은 언어처럼 구체적인 대상을 지시한다.",
      "음악의 의미는 언어를 통해 해석된다.",
      "음악은 이성적 분석을 거쳐 감정에 도달한다.",
      "음악은 명시적 의미 없이도 보편적으로 소통한다.",
      "음악의 감동은 정확히 말로 표현할 수 있다."
    ],
    answer: 4,
    explanation: "글에서 'Because music lacks explicit referential meaning, it can communicate something more universal and immediate'라고 언급하며, 음악이 명시적 의미가 없기 때문에 오히려 더 보편적이고 즉각적으로 소통할 수 있다고 설명합니다."
  },
  INCORRECT_ANSWER: {
    question: "다음 글의 내용과 일치하지 않는 것은?",
    modifiedPassage: DEMO_PASSAGE.content,
    choices: [
      "음악은 이미지, 감정, 연상을 불러일으킬 수 있다.",
      "음악은 언어처럼 사물이나 개념을 직접 지시하지 않는다.",
      "음악의 감정적 내용은 언어의 중재 없이 전달된다.",
      "음악은 분석적 사고를 통해 감상자에게 전달된다.",
      "음악은 표현하는 것이 무엇인지 정확히 말할 수 없어도 감동을 준다."
    ],
    answer: 4,
    explanation: "글에서 'Music bypasses the rational, analytical mind and speaks directly to our emotions'라고 명시하고 있습니다. 음악은 분석적 사고를 '우회'하여 감정에 직접 호소한다고 했으므로, '분석적 사고를 통해 전달된다'는 내용과 일치하지 않습니다."
  },
  BLANK_WORD: {
    question: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything concrete. Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. This apparent limitation, however, is also one of music's greatest strengths. Because music lacks explicit referential meaning, it can communicate something more universal and immediate. The emotional content of a piece of music is not filtered through the mediation of language; it strikes us directly. Music bypasses the rational, analytical mind and ___________________. This is why music can move us so profoundly, even when we cannot articulate exactly what it is expressing.`,
    choices: [
      "requires logical interpretation",
      "speaks directly to our emotions",
      "depends on linguistic understanding",
      "demands analytical thinking",
      "needs verbal explanation"
    ],
    answer: 2,
    explanation: "문맥상 음악은 이성적, 분석적 마음을 '우회'하고 무언가에 '직접' 말한다는 흐름입니다. 앞뒤 문맥에서 감정과 직접적인 전달을 강조하고 있으므로, 'speaks directly to our emotions(감정에 직접 말하다)'가 가장 적절합니다."
  },
  COMPLETE_SUMMARY: {
    question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
    modifiedPassage: `${DEMO_PASSAGE.content}

→ Unlike language that refers to concrete things, music's lack of (A)_______ meaning allows it to connect with our (B)_______ more directly and universally.`,
    choices: [
      "(A) explicit — (B) emotions",
      "(A) emotional — (B) intellect",
      "(A) universal — (B) thoughts",
      "(A) abstract — (B) logic",
      "(A) implicit — (B) analysis"
    ],
    answer: 1,
    explanation: "글의 요지는 음악이 '명시적(explicit)' 의미가 없기 때문에 오히려 '감정(emotions)'에 더 직접적이고 보편적으로 연결될 수 있다는 것입니다."
  },
  IRRELEVANT_SENTENCE: {
    question: "다음 글에서 전체 흐름과 관계 없는 문장은?",
    modifiedPassage: `①The most obvious difference between music and language is that music does not refer to anything concrete. ②Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. ③The music industry has generated billions of dollars in revenue through streaming services and live concerts. ④Because music lacks explicit referential meaning, it can communicate something more universal and immediate. ⑤Music bypasses the rational, analytical mind and speaks directly to our emotions.`,
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 3,
    explanation: "③번 문장은 음악 산업의 수익에 대한 내용으로, 음악이 언어와 달리 감정에 직접 호소한다는 글의 전체 흐름과 관계가 없습니다."
  },
  INSERT_SENTENCE: {
    question: "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?",
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything concrete. ( ① ) Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. ( ② ) This apparent limitation, however, is also one of music's greatest strengths. ( ③ ) Because music lacks explicit referential meaning, it can communicate something more universal and immediate. ( ④ ) Music bypasses the rational, analytical mind and speaks directly to our emotions. ( ⑤ ) This is why music can move us so profoundly, even when we cannot articulate exactly what it is expressing.`,
    sentenceToInsert: "The emotional content of a piece of music is not filtered through the mediation of language; it strikes us directly.",
    choices: ["①", "②", "③", "④", "⑤"],
    answer: 4,
    explanation: "주어진 문장은 음악의 감정적 내용이 언어의 중재 없이 직접 전달된다는 내용입니다. ③번 뒤에서 음악이 더 보편적이고 즉각적으로 소통할 수 있다는 내용이 나온 후, 이를 구체화하는 주어진 문장이 오고, ⑤번 앞에서 음악이 감정에 직접 말한다는 내용으로 연결되는 것이 자연스럽습니다."
  },
  SENTENCE_ORDER: {
    question: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
    modifiedPassage: `The most obvious difference between music and language is that music does not refer to anything concrete.

(A) Because music lacks explicit referential meaning, it can communicate something more universal and immediate. Music bypasses the rational, analytical mind and speaks directly to our emotions.

(B) Although music can evoke images, feelings, and associations, it does not directly denote objects, actions, or concepts the way words do. This apparent limitation, however, is also one of music's greatest strengths.

(C) This is why music can move us so profoundly, even when we cannot articulate exactly what it is expressing. The meaning of music lies not in what it refers to but in how it makes us feel.`,
    choices: [
      "(A) - (B) - (C)",
      "(A) - (C) - (B)",
      "(B) - (A) - (C)",
      "(B) - (C) - (A)",
      "(C) - (A) - (B)"
    ],
    answer: 3,
    explanation: "주어진 문장에서 음악이 구체적인 것을 지시하지 않는다는 점을 언급한 후, (B)에서 이를 부연하며 이것이 오히려 장점이라고 전환합니다. (A)에서 명시적 의미가 없어 보편적으로 소통하며 감정에 직접 말한다고 설명하고, (C)에서 'This is why'로 결론을 맺습니다."
  },
};
