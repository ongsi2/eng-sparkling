'use client';

import { useState, useEffect, useRef } from 'react';
import { ArticleResponse } from '@/lib/article-prompts';
import { getCoins, deductCoins, hasEnoughCoins, COIN_COSTS, CoinState } from '@/lib/coins';
import CoinDisplay, { CoinCost, triggerCoinUpdate } from '@/app/components/CoinDisplay';

// Archive storage key
const ARCHIVE_KEY = 'eng-sparkling-archive';

type QuestionType =
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

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  GRAMMAR_INCORRECT: '문법형 (어법상 틀린 것)',
  SELECT_INCORRECT_WORD: '틀린 단어 선택형',
  PICK_UNDERLINE: '밑줄의 의미형',
  PICK_SUBJECT: '주제 뽑기형',
  PICK_TITLE: '제목 뽑기형',
  CORRECT_ANSWER: '맞는 선지 뽑기',
  INCORRECT_ANSWER: '틀린 선지 뽑기',
  BLANK_WORD: '빈칸에 들어갈 말',
  COMPLETE_SUMMARY: '요약문 완성',
  IRRELEVANT_SENTENCE: '무관한 문장',
  INSERT_SENTENCE: '문장 삽입',
  SENTENCE_ORDER: '글의 순서형',
};

interface Question {
  question: string;
  modifiedPassage: string;
  choices: string[];
  answer: number;
  explanation: string;
  sentenceToInsert?: string;
}

// Archive item interface
interface ArchivedQuestion {
  id: string;
  questionType: QuestionType;
  question: Question;
  article: ArticleResponse;
  createdAt: string;
}

// Archive helper functions
function getArchive(): ArchivedQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ARCHIVE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToArchive(item: Omit<ArchivedQuestion, 'id' | 'createdAt'>): ArchivedQuestion {
  const archive = getArchive();
  const newItem: ArchivedQuestion = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  archive.unshift(newItem); // Add to beginning
  // Keep only last 50 items
  const trimmed = archive.slice(0, 50);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed));
  return newItem;
}

// Sparkling Logo Component
const SparklingLogo = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8">
    <defs>
      <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#06b6d4' }} />
        <stop offset="50%" style={{ stopColor: '#22d3ee' }} />
        <stop offset="100%" style={{ stopColor: '#10b981' }} />
      </linearGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0f172a' }} />
        <stop offset="100%" style={{ stopColor: '#1e293b' }} />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="url(#bgGrad)" />
    <g transform="translate(6, 7)">
      <path d="M2 0 L12 0 L12 2.5 L5 2.5 L5 7 L10 7 L10 9.5 L5 9.5 L5 15.5 L12 15.5 L12 18 L2 18 Z" fill="#f8fafc" />
      <path d="M15 4 L16 6 L18 7 L16 8 L15 10 L14 8 L12 7 L14 6 Z" fill="url(#sparkGrad)" />
      <circle cx="18" cy="3" r="1" fill="#22d3ee" opacity="0.9" />
      <circle cx="13" cy="12" r="0.8" fill="#10b981" opacity="0.8" />
    </g>
  </svg>
);

export default function WorkflowPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Article Generation
  const [keywords, setKeywords] = useState('');
  const [difficulty, setDifficulty] = useState<'중학생' | '고1' | '고2' | '고3'>('고3');
  const [wordCount, setWordCount] = useState(300);
  const [generatedArticle, setGeneratedArticle] = useState<ArticleResponse | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  // Step 2: Question Generation
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>('GRAMMAR_INCORRECT');
  const [generatedQuestion, setGeneratedQuestion] = useState<Question | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // Archive state
  const [isSaved, setIsSaved] = useState(false);

  // Dropdown state for custom select
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerateArticle = async () => {
    if (!keywords.trim()) {
      alert('키워드를 입력해주세요');
      return;
    }

    // Check coin balance
    if (!hasEnoughCoins(COIN_COSTS.GENERATE_ARTICLE)) {
      alert('코인이 부족합니다. 코인을 충전해주세요.');
      return;
    }

    setIsGeneratingArticle(true);
    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);

      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywordArray,
          difficulty,
          wordCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      // Deduct coin after successful generation
      deductCoins(COIN_COSTS.GENERATE_ARTICLE);
      triggerCoinUpdate();

      setGeneratedArticle(data);
      setStep(2);
    } catch (error: any) {
      console.error('Article generation error:', error);
      alert(`아티클 생성 실패: ${error.message}`);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!generatedArticle) return;

    // Check coin balance
    if (!hasEnoughCoins(COIN_COSTS.GENERATE_QUESTION)) {
      alert('코인이 부족합니다. 코인을 충전해주세요.');
      return;
    }

    setIsGeneratingQuestion(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage: generatedArticle.article,
          questionType: selectedQuestionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate question');
      }

      // Deduct coin after successful generation
      deductCoins(COIN_COSTS.GENERATE_QUESTION);
      triggerCoinUpdate();

      setGeneratedQuestion(data);
      setIsSaved(false); // Reset saved state for new question
    } catch (error: any) {
      console.error('Question generation error:', error);
      alert(`문제 생성 실패: ${error.message}`);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setGeneratedQuestion(null);
  };

  const handleReset = () => {
    setStep(1);
    setKeywords('');
    setGeneratedArticle(null);
    setGeneratedQuestion(null);
    setIsSaved(false);
  };

  const handleSaveToArchive = () => {
    if (!generatedQuestion || !generatedArticle) return;
    saveToArchive({
      questionType: selectedQuestionType,
      question: generatedQuestion,
      article: generatedArticle,
    });
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-cream)]/90 border-b border-[var(--color-spark)]/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <SparklingLogo />
            <span className="text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              ENG-SPARKLING
            </span>
          </a>
          <div className="flex items-center gap-4">
            <CoinDisplay showLabel />
            <a href="/archive" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              저장함
            </a>
            <a href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
              ← 홈으로
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-ink)] mb-3">
            문제 생성 워크플로우
          </h1>
          <p className="text-[var(--color-text-muted)]">
            키워드 입력 → AI 아티클 생성 → 문제 유형 선택 → 문제 생성
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center ${step === 1 ? 'text-[var(--color-spark)]' : 'text-[var(--color-text-light)]'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${
              step === 1
                ? 'border-[var(--color-spark)] bg-[var(--color-spark)] text-white'
                : generatedArticle
                  ? 'border-[var(--color-mint)] bg-[var(--color-mint)] text-white'
                  : 'border-[var(--color-text-light)]'
            }`}>
              {generatedArticle && step !== 1 ? '✓' : '1'}
            </div>
            <span className="ml-3 font-medium">아티클 생성</span>
          </div>

          <div className={`w-20 h-1 mx-6 rounded-full transition-all ${
            generatedArticle ? 'bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-spark)]' : 'bg-[var(--color-cream-dark)]'
          }`} />

          <div className={`flex items-center ${step === 2 ? 'text-[var(--color-spark)]' : 'text-[var(--color-text-light)]'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${
              step === 2 && generatedArticle
                ? 'border-[var(--color-spark)] bg-[var(--color-spark)] text-white'
                : 'border-[var(--color-text-light)]'
            }`}>
              2
            </div>
            <span className="ml-3 font-medium">문제 생성</span>
          </div>
        </div>

        {/* Step 1: Article Generation */}
        {step === 1 && (
          <div className="card-elevated p-8 animate-fade-in-up">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--color-spark)]/10 text-[var(--color-spark)] flex items-center justify-center text-sm font-bold">1</span>
              아티클 생성
            </h2>

            <div className="space-y-8">
              {/* Keywords Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                  키워드 입력 <span className="text-[var(--color-text-muted)]">(쉼표로 구분)</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="예: artificial intelligence, healthcare, diagnosis"
                  className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[var(--color-spark)]/20 rounded-xl focus:ring-2 focus:ring-[var(--color-spark)]/30 focus:border-[var(--color-spark)] transition-all outline-none"
                />
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  여러 키워드를 입력하면 해당 키워드를 포함한 영어 지문이 생성됩니다
                </p>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">
                  난이도 선택
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['중학생', '고1', '고2', '고3'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        difficulty === level
                          ? 'bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-spark-light)] text-white shadow-md'
                          : 'bg-[var(--color-cream)] text-[var(--color-text)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-spark)]/10'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Count Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">
                  단어 수: <span className="text-[var(--color-spark)] font-bold">{wordCount}</span>단어
                </label>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--color-cream-dark)] rounded-full appearance-none cursor-pointer accent-[var(--color-spark)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
                  <span>100단어</span>
                  <span>800단어</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateArticle}
                disabled={isGeneratingArticle || !keywords.trim()}
                className="w-full btn-spark py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGeneratingArticle ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    아티클 생성 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    아티클 생성하기
                    <CoinCost amount={COIN_COSTS.GENERATE_ARTICLE} />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Question Generation */}
        {step === 2 && generatedArticle && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Generated Article Display */}
            <div className="card-elevated p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                  생성된 아티클
                </h2>
                <button
                  onClick={handleBackToStep1}
                  className="text-[var(--color-spark)] hover:text-[var(--color-spark-deep)] text-sm font-medium transition-colors"
                >
                  ← 아티클 다시 생성
                </button>
              </div>

              <div className="passage-card mb-6">
                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-4">{generatedArticle.title}</h3>
                <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                  {generatedArticle.article}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] rounded-full">
                  📊 {generatedArticle.wordCount}단어
                </span>
                <span className="px-3 py-1 bg-[var(--color-mint)]/10 text-[var(--color-mint)] rounded-full">
                  📚 {generatedArticle.difficulty}
                </span>
                <span className="px-3 py-1 bg-[var(--color-ink)]/5 text-[var(--color-text-muted)] rounded-full">
                  🔑 {generatedArticle.keywords.join(', ')}
                </span>
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="card-elevated p-8">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--color-spark)]/10 text-[var(--color-spark)] flex items-center justify-center text-sm font-bold">2</span>
                문제 생성
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-ink)] mb-3">
                    문제 유형 선택 <span className="text-[var(--color-text-muted)]">(12가지)</span>
                  </label>
                  {/* Custom Dropdown to fix z-index issues */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[var(--color-spark)]/20 rounded-xl focus:ring-2 focus:ring-[var(--color-spark)]/30 focus:border-[var(--color-spark)] transition-all outline-none cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>{QUESTION_TYPE_LABELS[selectedQuestionType]}</span>
                      <svg className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-[var(--color-spark)]/20 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                        {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setSelectedQuestionType(type);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-[var(--color-spark)]/5 transition-colors ${
                              selectedQuestionType === type
                                ? 'bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] font-medium'
                                : 'text-[var(--color-text)]'
                            } first:rounded-t-xl last:rounded-b-xl`}
                          >
                            {QUESTION_TYPE_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuestion}
                  disabled={isGeneratingQuestion}
                  className="w-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-spark)] text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-mint)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingQuestion ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      문제 생성 중...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      문제 생성하기
                      <CoinCost amount={COIN_COSTS.GENERATE_QUESTION} />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Question Display */}
            {generatedQuestion && (
              <div className="question-card animate-scale-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                    생성된 문제
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSaveToArchive}
                      disabled={isSaved}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                        isSaved
                          ? 'bg-[var(--color-mint)]/20 text-[var(--color-mint)] cursor-default'
                          : 'bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] hover:bg-[var(--color-spark)]/20'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          저장됨
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          저장하기
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-[var(--color-cream-dark)] text-[var(--color-text)] rounded-full text-sm font-medium hover:bg-[var(--color-ink)]/10 transition-colors"
                    >
                      처음부터 다시
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Question */}
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
                      {generatedQuestion.question}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      생성 시각: {new Date().toLocaleString('ko-KR')}
                    </p>
                  </div>

                  {/* Passage */}
                  <div className="p-6 bg-[var(--color-cream)] rounded-xl border border-[var(--color-spark)]/10">
                    <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">지문</h4>
                    <p
                      className="whitespace-pre-wrap leading-relaxed text-[var(--color-text)] [&>u]:underline [&>u]:decoration-[var(--color-spark)] [&>u]:decoration-2 [&>u]:underline-offset-2 [&>u]:font-medium [&>u]:text-[var(--color-spark-deep)]"
                      dangerouslySetInnerHTML={{ __html: generatedQuestion.modifiedPassage }}
                    />
                    {generatedQuestion.sentenceToInsert && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[var(--color-spark)]/5 to-[var(--color-mint)]/5 rounded-lg border border-[var(--color-spark)]/20">
                        <p className="font-semibold text-[var(--color-ink)] text-sm mb-1">주어진 문장:</p>
                        <p className="text-[var(--color-text)] italic">{generatedQuestion.sentenceToInsert}</p>
                      </div>
                    )}
                  </div>

                  {/* Choices */}
                  <div>
                    <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">선택지</h4>
                    <div className="space-y-3">
                      {generatedQuestion.choices.map((choice, index) => (
                        <div
                          key={index}
                          className={`choice-item ${index + 1 === generatedQuestion.answer ? 'correct' : ''}`}
                        >
                          <span className="font-medium text-[var(--color-text)]">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] text-sm font-semibold mr-3">
                              {index + 1}
                            </span>
                            {choice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-6 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-xl text-white">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[var(--color-spark-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      해설
                    </h4>
                    <p className="text-white/90 leading-relaxed">{generatedQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
