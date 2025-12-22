/**
 * Workflow State Management with useReducer
 *
 * 15+ useState를 3개의 논리적 그룹으로 통합:
 * - Article State: 아티클 생성 관련
 * - Question State: 문제 생성 관련
 * - UI State: UI 상태
 */

import { useReducer, useCallback } from 'react';
import { ArticleResponse } from '@/lib/article-prompts';

// ============ Types ============

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

export interface Question {
  question: string;
  modifiedPassage: string;
  choices: string[];
  answer: number;
  explanation: string;
  sentenceToInsert?: string;
}

export interface GeneratedQuestion {
  type: QuestionType;
  question: Question;
}

export interface DemoUsage {
  remaining: number;
  canUse: boolean;
}

// ============ Article State ============

interface ArticleState {
  source: 'generate' | 'direct';
  keywords: string;
  difficulty: '중학생' | '고1' | '고2' | '고3';
  wordCount: number;
  generatedArticle: ArticleResponse | null;
  isGenerating: boolean;
  directInput: string;
  directTitle: string;
}

type ArticleAction =
  | { type: 'SET_SOURCE'; payload: 'generate' | 'direct' }
  | { type: 'SET_KEYWORDS'; payload: string }
  | { type: 'SET_DIFFICULTY'; payload: '중학생' | '고1' | '고2' | '고3' }
  | { type: 'SET_WORD_COUNT'; payload: number }
  | { type: 'SET_GENERATED_ARTICLE'; payload: ArticleResponse | null }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_DIRECT_INPUT'; payload: string }
  | { type: 'SET_DIRECT_TITLE'; payload: string }
  | { type: 'RESET_ARTICLE' };

const initialArticleState: ArticleState = {
  source: 'generate',
  keywords: '',
  difficulty: '고3',
  wordCount: 300,
  generatedArticle: null,
  isGenerating: false,
  directInput: '',
  directTitle: '',
};

function articleReducer(state: ArticleState, action: ArticleAction): ArticleState {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    case 'SET_KEYWORDS':
      return { ...state, keywords: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_WORD_COUNT':
      return { ...state, wordCount: action.payload };
    case 'SET_GENERATED_ARTICLE':
      return { ...state, generatedArticle: action.payload };
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_DIRECT_INPUT':
      return { ...state, directInput: action.payload };
    case 'SET_DIRECT_TITLE':
      return { ...state, directTitle: action.payload };
    case 'RESET_ARTICLE':
      return initialArticleState;
    default:
      return state;
  }
}

// ============ Question State ============

interface QuestionState {
  selectedTypes: QuestionType[];
  generatedQuestions: GeneratedQuestion[];
  isGenerating: boolean;
  progress: { current: number; total: number } | null;
  savedIndexes: Set<number>;
}

type QuestionAction =
  | { type: 'TOGGLE_TYPE'; payload: QuestionType }
  | { type: 'SELECT_ALL_TYPES'; payload: QuestionType[] }
  | { type: 'DESELECT_ALL_TYPES' }
  | { type: 'SET_GENERATED_QUESTIONS'; payload: GeneratedQuestion[] }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: { current: number; total: number } | null }
  | { type: 'ADD_SAVED_INDEX'; payload: number }
  | { type: 'SET_SAVED_INDEXES'; payload: Set<number> }
  | { type: 'RESET_QUESTIONS' };

const initialQuestionState: QuestionState = {
  selectedTypes: [],
  generatedQuestions: [],
  isGenerating: false,
  progress: null,
  savedIndexes: new Set(),
};

function questionReducer(state: QuestionState, action: QuestionAction): QuestionState {
  switch (action.type) {
    case 'TOGGLE_TYPE':
      return {
        ...state,
        selectedTypes: state.selectedTypes.includes(action.payload)
          ? state.selectedTypes.filter(t => t !== action.payload)
          : [...state.selectedTypes, action.payload],
      };
    case 'SELECT_ALL_TYPES':
      return { ...state, selectedTypes: action.payload };
    case 'DESELECT_ALL_TYPES':
      return { ...state, selectedTypes: [] };
    case 'SET_GENERATED_QUESTIONS':
      return { ...state, generatedQuestions: action.payload };
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'ADD_SAVED_INDEX':
      return { ...state, savedIndexes: new Set(state.savedIndexes).add(action.payload) };
    case 'SET_SAVED_INDEXES':
      return { ...state, savedIndexes: action.payload };
    case 'RESET_QUESTIONS':
      return initialQuestionState;
    default:
      return state;
  }
}

// ============ UI State ============

interface UIState {
  step: 1 | 2;
  demoUsage: DemoUsage | null;
  isDemoMode: boolean;
  userMenuOpen: boolean;
}

type UIAction =
  | { type: 'SET_STEP'; payload: 1 | 2 }
  | { type: 'SET_DEMO_USAGE'; payload: DemoUsage | null }
  | { type: 'SET_IS_DEMO_MODE'; payload: boolean }
  | { type: 'SET_USER_MENU_OPEN'; payload: boolean }
  | { type: 'RESET_UI' };

const initialUIState: UIState = {
  step: 1,
  demoUsage: null,
  isDemoMode: false,
  userMenuOpen: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_DEMO_USAGE':
      return { ...state, demoUsage: action.payload };
    case 'SET_IS_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };
    case 'SET_USER_MENU_OPEN':
      return { ...state, userMenuOpen: action.payload };
    case 'RESET_UI':
      return { ...initialUIState, demoUsage: state.demoUsage, isDemoMode: state.isDemoMode };
    default:
      return state;
  }
}

// ============ Combined Hook ============

export function useWorkflowReducer() {
  const [articleState, articleDispatch] = useReducer(articleReducer, initialArticleState);
  const [questionState, questionDispatch] = useReducer(questionReducer, initialQuestionState);
  const [uiState, uiDispatch] = useReducer(uiReducer, initialUIState);

  // Article Actions
  const setArticleSource = useCallback((source: 'generate' | 'direct') => {
    articleDispatch({ type: 'SET_SOURCE', payload: source });
  }, []);

  const setKeywords = useCallback((keywords: string) => {
    articleDispatch({ type: 'SET_KEYWORDS', payload: keywords });
  }, []);

  const setDifficulty = useCallback((difficulty: '중학생' | '고1' | '고2' | '고3') => {
    articleDispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  }, []);

  const setWordCount = useCallback((wordCount: number) => {
    articleDispatch({ type: 'SET_WORD_COUNT', payload: wordCount });
  }, []);

  const setGeneratedArticle = useCallback((article: ArticleResponse | null) => {
    articleDispatch({ type: 'SET_GENERATED_ARTICLE', payload: article });
  }, []);

  const setIsGeneratingArticle = useCallback((isGenerating: boolean) => {
    articleDispatch({ type: 'SET_IS_GENERATING', payload: isGenerating });
  }, []);

  const setDirectInput = useCallback((input: string) => {
    articleDispatch({ type: 'SET_DIRECT_INPUT', payload: input });
  }, []);

  const setDirectTitle = useCallback((title: string) => {
    articleDispatch({ type: 'SET_DIRECT_TITLE', payload: title });
  }, []);

  // Question Actions
  const toggleQuestionType = useCallback((type: QuestionType) => {
    questionDispatch({ type: 'TOGGLE_TYPE', payload: type });
  }, []);

  const selectAllTypes = useCallback((types: QuestionType[]) => {
    questionDispatch({ type: 'SELECT_ALL_TYPES', payload: types });
  }, []);

  const deselectAllTypes = useCallback(() => {
    questionDispatch({ type: 'DESELECT_ALL_TYPES' });
  }, []);

  const setGeneratedQuestions = useCallback((questions: GeneratedQuestion[]) => {
    questionDispatch({ type: 'SET_GENERATED_QUESTIONS', payload: questions });
  }, []);

  const setIsGeneratingQuestion = useCallback((isGenerating: boolean) => {
    questionDispatch({ type: 'SET_IS_GENERATING', payload: isGenerating });
  }, []);

  const setProgress = useCallback((progress: { current: number; total: number } | null) => {
    questionDispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  const addSavedIndex = useCallback((index: number) => {
    questionDispatch({ type: 'ADD_SAVED_INDEX', payload: index });
  }, []);

  const setSavedIndexes = useCallback((indexes: Set<number>) => {
    questionDispatch({ type: 'SET_SAVED_INDEXES', payload: indexes });
  }, []);

  // UI Actions
  const setStep = useCallback((step: 1 | 2) => {
    uiDispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setDemoUsage = useCallback((usage: DemoUsage | null) => {
    uiDispatch({ type: 'SET_DEMO_USAGE', payload: usage });
  }, []);

  const setIsDemoMode = useCallback((isDemoMode: boolean) => {
    uiDispatch({ type: 'SET_IS_DEMO_MODE', payload: isDemoMode });
  }, []);

  const setUserMenuOpen = useCallback((isOpen: boolean) => {
    uiDispatch({ type: 'SET_USER_MENU_OPEN', payload: isOpen });
  }, []);

  // Combined Reset
  const resetAll = useCallback(() => {
    articleDispatch({ type: 'RESET_ARTICLE' });
    questionDispatch({ type: 'RESET_QUESTIONS' });
    uiDispatch({ type: 'RESET_UI' });
  }, []);

  return {
    // States
    articleState,
    questionState,
    uiState,

    // Article Actions
    setArticleSource,
    setKeywords,
    setDifficulty,
    setWordCount,
    setGeneratedArticle,
    setIsGeneratingArticle,
    setDirectInput,
    setDirectTitle,

    // Question Actions
    toggleQuestionType,
    selectAllTypes,
    deselectAllTypes,
    setGeneratedQuestions,
    setIsGeneratingQuestion,
    setProgress,
    addSavedIndex,
    setSavedIndexes,

    // UI Actions
    setStep,
    setDemoUsage,
    setIsDemoMode,
    setUserMenuOpen,

    // Combined
    resetAll,
  };
}

// Export types
export type { ArticleState, QuestionState, UIState };
