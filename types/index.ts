/**
 * Type definitions for ENG-MVP
 */

export type QuestionType =
  | 'GRAMMAR_INCORRECT'      // 문법형 (어법상 틀린 것)
  | 'SELECT_INCORRECT_WORD'  // 틀린 단어 선택형
  | 'PICK_UNDERLINE'         // 밑줄의 의미형
  | 'PICK_SUBJECT'           // 주제 뽑기형
  | 'PICK_TITLE'             // 제목 뽑기형
  | 'CORRECT_ANSWER'         // 맞는 선지 뽑기
  | 'INCORRECT_ANSWER'       // 틀린 선지 뽑기
  | 'BLANK_WORD'             // 빈칸에 들어갈 말
  | 'COMPLETE_SUMMARY'       // 요약문 완성
  | 'IRRELEVANT_SENTENCE'    // 무관한 문장
  | 'INSERT_SENTENCE'        // 문장 삽입
  | 'SENTENCE_ORDER';        // 글의 순서형

export interface GenerateQuestionRequest {
  passage: string;
  questionType: QuestionType;
}

export interface GeneratedQuestion {
  id: string;
  questionType: QuestionType;
  question: string;              // 문제 본문
  passage: string;               // 원본 지문
  modifiedPassage: string;       // 가공된 지문 (①②③④⑤ 포함)
  choices: string[];             // 5지선다 선택지
  answer: number;                // 정답 번호 (1-5)
  explanation: string;           // 해설 (한국어)
  sentenceToInsert?: string;     // 문장 삽입 유형에서 사용
  createdAt: string;             // ISO timestamp
}

export interface QuestionHistory {
  questions: GeneratedQuestion[];
}

export interface APIError {
  error: string;
  details?: string;
}
