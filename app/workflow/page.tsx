'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArticleResponse } from '@/lib/article-prompts';
import { deductCoinsFromDB, hasEnoughCoinsInDB, COIN_COSTS } from '@/lib/coins';
import { saveQuestionToArchive } from '@/lib/archive';
import CoinDisplay, { CoinCost, triggerCoinUpdate } from '@/app/components/CoinDisplay';
import AuthButton from '@/app/components/AuthButton';
import { useAuth } from '@/app/components/AuthProvider';

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
  const { user, loading } = useAuth();
  const router = useRouter();

  // 로그인 안 했으면 /login으로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Article Generation
  const [keywords, setKeywords] = useState('');
  const [difficulty, setDifficulty] = useState<'중학생' | '고1' | '고2' | '고3'>('고3');
  const [wordCount, setWordCount] = useState(300);
  const [generatedArticle, setGeneratedArticle] = useState<ArticleResponse | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  // Step 2: Question Generation (Multi-select)
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<{type: QuestionType, question: Question}[]>([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{current: number, total: number} | null>(null);

  // Archive state - track individually saved questions by index
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  // Toggle question type selection
  const toggleQuestionType = (type: QuestionType) => {
    setSelectedQuestionTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Select/Deselect all
  const selectAllTypes = () => {
    setSelectedQuestionTypes(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]);
  };
  const deselectAllTypes = () => {
    setSelectedQuestionTypes([]);
  };

  const handleGenerateArticle = async () => {
    if (!keywords.trim()) {
      toast.error('키워드를 입력해주세요');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // Check coin balance from DB
    const hasEnough = await hasEnoughCoinsInDB(user.id, COIN_COSTS.GENERATE_ARTICLE);
    if (!hasEnough) {
      toast.error('코인이 부족합니다. 코인을 충전해주세요.');
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

      // Deduct coin after successful generation (DB)
      await deductCoinsFromDB(user.id, COIN_COSTS.GENERATE_ARTICLE);
      triggerCoinUpdate();

      setGeneratedArticle(data);
      setStep(2);
      toast.success('아티클이 생성되었습니다!');
    } catch (error: any) {
      console.error('Article generation error:', error);
      toast.error(`아티클 생성 실패: ${error.message}`);
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const handleGenerateQuestion = async () => {
    if (!generatedArticle) return;
    if (selectedQuestionTypes.length === 0) {
      toast.error('문제 유형을 하나 이상 선택해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // Check coin balance for all selected types from DB
    const totalCost = selectedQuestionTypes.length * COIN_COSTS.GENERATE_QUESTION;
    const hasEnough = await hasEnoughCoinsInDB(user.id, totalCost);
    if (!hasEnough) {
      toast.error(`코인이 부족합니다. 필요한 코인: ${totalCost}개`);
      return;
    }

    setIsGeneratingQuestion(true);
    setGeneratedQuestions([]);
    setGenerationProgress({ current: 0, total: selectedQuestionTypes.length });

    const results: {type: QuestionType, question: Question}[] = [];
    let successCount = 0;

    // Generate questions in parallel
    const promises = selectedQuestionTypes.map(async (type) => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passage: generatedArticle.article,
            questionType: type,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.details || data.error || 'Failed to generate question';
          throw new Error(errorMsg);
        }

        return { type, question: data as Question, success: true };
      } catch (error: any) {
        console.error(`Question generation error for ${type}:`, error);
        return { type, question: null, success: false, error: error.message };
      }
    });

    const allResults = await Promise.all(promises);

    for (const result of allResults) {
      if (result.success && result.question) {
        results.push({ type: result.type, question: result.question });
        successCount++;
        // Deduct coin for each successful generation (DB)
        await deductCoinsFromDB(user.id, COIN_COSTS.GENERATE_QUESTION);
      }
      setGenerationProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
    }

    triggerCoinUpdate();
    setGeneratedQuestions(results);
    setSavedIndexes(new Set());
    setIsGeneratingQuestion(false);
    setGenerationProgress(null);

    if (successCount === 0) {
      toast.error('문제 생성에 실패했습니다.');
    } else if (successCount < selectedQuestionTypes.length) {
      toast(`${selectedQuestionTypes.length}개 중 ${successCount}개 문제가 생성되었습니다.`, {
        icon: '⚠️',
      });
    } else {
      toast.success(`${successCount}개 문제가 생성되었습니다!`);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setGeneratedQuestions([]);
  };

  const handleReset = () => {
    setStep(1);
    setKeywords('');
    setGeneratedArticle(null);
    setGeneratedQuestions([]);
    setSelectedQuestionTypes([]);
    setSavedIndexes(new Set());
  };

  // Save individual question (DB)
  const handleSaveQuestion = async (index: number) => {
    if (!generatedArticle || savedIndexes.has(index) || !user) return;
    const { type, question } = generatedQuestions[index];

    const result = await saveQuestionToArchive(
      user.id,
      type,
      question,
      generatedArticle
    );

    if (result) {
      setSavedIndexes(prev => new Set(prev).add(index));
      toast.success('문제가 저장되었습니다!');
    } else {
      toast.error('저장에 실패했습니다.');
    }
  };

  // Save all unsaved questions (DB)
  const handleSaveAllToArchive = async () => {
    if (generatedQuestions.length === 0 || !generatedArticle || !user) return;

    let savedCount = 0;
    const newSavedIndexes = new Set(savedIndexes);

    for (let index = 0; index < generatedQuestions.length; index++) {
      if (!savedIndexes.has(index)) {
        const { type, question } = generatedQuestions[index];
        const result = await saveQuestionToArchive(
          user.id,
          type,
          question,
          generatedArticle
        );
        if (result) {
          newSavedIndexes.add(index);
          savedCount++;
        }
      }
    }

    setSavedIndexes(newSavedIndexes);

    if (savedCount > 0) {
      toast.success(`${savedCount}개 문제가 저장되었습니다!`);
    } else {
      toast('이미 모든 문제가 저장되었습니다.', { icon: 'ℹ️' });
    }
  };

  // 로딩 중이거나 로그인 안 했으면 로딩 화면 표시
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-spark)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Toast Container */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-cream)]/90 border-b border-[var(--color-spark)]/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <SparklingLogo />
            <span className="text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              ENG-SPARKLING
            </span>
          </Link>
          <div className="flex items-center gap-6">
            {/* 네비게이션 */}
            <nav className="flex items-center gap-4">
              <Link href="/archive" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                저장함
              </Link>
              <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
                홈
              </Link>
            </nav>

            {/* 구분선 */}
            <div className="h-6 w-px bg-[var(--color-spark)]/20" />

            {/* 사용자 영역 */}
            <div className="flex items-center gap-4">
              <CoinDisplay showLabel showChargeButton />
              <AuthButton />
            </div>
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
                      className={`py-3 px-4 rounded-xl font-medium transition-all cursor-pointer ${
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
                  className="text-[var(--color-spark)] hover:text-[var(--color-spark-deep)] text-sm font-medium transition-colors cursor-pointer"
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[var(--color-ink)]">
                      문제 유형 선택 <span className="text-[var(--color-text-muted)]">(12가지, 복수 선택 가능)</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllTypes}
                        className="text-xs px-2 py-1 text-[var(--color-spark)] hover:bg-[var(--color-spark)]/10 rounded transition-colors cursor-pointer"
                      >
                        전체선택
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllTypes}
                        className="text-xs px-2 py-1 text-[var(--color-text-muted)] hover:bg-[var(--color-ink)]/5 rounded transition-colors cursor-pointer"
                      >
                        선택해제
                      </button>
                    </div>
                  </div>
                  {/* Chip/Tag Multi-select UI */}
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => {
                      const isSelected = selectedQuestionTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleQuestionType(type)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white border-transparent'
                              : 'bg-[var(--color-cream)] text-[var(--color-text)] hover:bg-[var(--color-cream-dark)] border-[var(--color-spark)]/20'
                          }`}
                        >
                          {QUESTION_TYPE_LABELS[type]}
                        </button>
                      );
                    })}
                  </div>
                  {selectedQuestionTypes.length > 0 && (
                    <p className="text-sm text-[var(--color-spark)] mt-3 font-medium">
                      {selectedQuestionTypes.length}개 유형 선택됨
                    </p>
                  )}
                </div>

                <button
                  onClick={handleGenerateQuestion}
                  disabled={isGeneratingQuestion || selectedQuestionTypes.length === 0}
                  className="w-full bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-spark)] text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-mint)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isGeneratingQuestion ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {generationProgress
                        ? `문제 생성 중... (${generationProgress.current}/${generationProgress.total})`
                        : '문제 생성 중...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      {selectedQuestionTypes.length > 0
                        ? `${selectedQuestionTypes.length}개 문제 생성하기`
                        : '문제 유형을 선택하세요'}
                      {selectedQuestionTypes.length > 0 && (
                        <CoinCost amount={selectedQuestionTypes.length * COIN_COSTS.GENERATE_QUESTION} />
                      )}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Questions Display */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header with actions */}
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                      생성된 문제 ({generatedQuestions.length}개)
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {savedIndexes.size}/{generatedQuestions.length} 저장됨
                      </span>
                      <button
                        onClick={handleSaveAllToArchive}
                        disabled={savedIndexes.size === generatedQuestions.length}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                          savedIndexes.size === generatedQuestions.length
                            ? 'bg-[var(--color-mint)]/20 text-[var(--color-mint)] cursor-default'
                            : 'bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] hover:bg-[var(--color-spark)]/20'
                        }`}
                      >
                        {savedIndexes.size === generatedQuestions.length ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            전체 저장됨
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            전체 저장
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-[var(--color-cream-dark)] text-[var(--color-text)] rounded-full text-sm font-medium hover:bg-[var(--color-ink)]/10 transition-colors cursor-pointer"
                      >
                        처음부터 다시
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Cards */}
                {generatedQuestions.map(({ type, question }, qIndex) => (
                  <div key={qIndex} className="question-card animate-scale-in" style={{ animationDelay: `${qIndex * 100}ms` }}>
                    <div className="space-y-6">
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] text-xs font-medium rounded">
                              {QUESTION_TYPE_LABELS[type]}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              #{qIndex + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                            {question.question}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleSaveQuestion(qIndex)}
                          disabled={savedIndexes.has(qIndex)}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                            savedIndexes.has(qIndex)
                              ? 'bg-[var(--color-mint)]/20 text-[var(--color-mint)] cursor-default'
                              : 'bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] hover:bg-[var(--color-spark)]/20'
                          }`}
                        >
                          {savedIndexes.has(qIndex) ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              저장됨
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                              저장
                            </>
                          )}
                        </button>
                      </div>

                      {/* Passage */}
                      <div className="p-6 bg-[var(--color-cream)] rounded-xl border border-[var(--color-spark)]/10">
                        <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">지문</h4>
                        <p
                          className="whitespace-pre-wrap leading-relaxed text-[var(--color-text)] [&>u]:underline [&>u]:decoration-[var(--color-spark)] [&>u]:decoration-2 [&>u]:underline-offset-2 [&>u]:font-medium [&>u]:text-[var(--color-spark-deep)]"
                          dangerouslySetInnerHTML={{ __html: question.modifiedPassage }}
                        />
                        {question.sentenceToInsert && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-[var(--color-spark)]/5 to-[var(--color-mint)]/5 rounded-lg border border-[var(--color-spark)]/20">
                            <p className="font-semibold text-[var(--color-ink)] text-sm mb-1">주어진 문장:</p>
                            <p className="text-[var(--color-text)] italic">{question.sentenceToInsert}</p>
                          </div>
                        )}
                      </div>

                      {/* Choices */}
                      <div>
                        <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">선택지</h4>
                        <div className="space-y-3">
                          {question.choices.map((choice, index) => (
                            <div
                              key={index}
                              className={`choice-item ${index + 1 === question.answer ? 'correct' : ''}`}
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
                        <p className="text-white/90 leading-relaxed">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
