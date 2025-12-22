'use client';

import { useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { ArticleResponse } from '@/lib/article-prompts';
import { deductCoinsFromDB, hasEnoughCoinsInDB, COIN_COSTS } from '@/lib/coins';
import { saveQuestionToArchive } from '@/lib/archive';
import CoinDisplay, { CoinCost, triggerCoinUpdate } from '@/app/components/CoinDisplay';
import AuthButton from '@/app/components/AuthButton';
import UserAvatar from '@/app/components/UserAvatar';
import { useAuth } from '@/app/components/AuthProvider';
import { ArticleSkeleton, QuestionSkeleton, ProgressBar } from '@/app/components/Skeleton';
import { PDFExportButton } from '@/app/components/PDFExportButton';
import { apiClient } from '@/lib/api-client';
import { useWorkflowReducer, QuestionType, GeneratedQuestion } from './hooks/useWorkflowReducer';
import {
  SparklingLogo,
  StepIndicator,
  DifficultyButton,
  QuestionTypeChip,
  QuestionCard,
  DemoModeBanner,
  LoadingSpinner,
} from './components/MemoizedComponents';

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

const ALL_QUESTION_TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

export default function WorkflowPage() {
  const { user, loading } = useAuth();

  // useReducer-based state management
  const {
    articleState,
    questionState,
    uiState,
    setArticleSource,
    setKeywords,
    setDifficulty,
    setWordCount,
    setGeneratedArticle,
    setIsGeneratingArticle,
    setDirectInput,
    setDirectTitle,
    toggleQuestionType,
    selectAllTypes,
    deselectAllTypes,
    setGeneratedQuestions,
    setIsGeneratingQuestion,
    setProgress,
    addSavedIndex,
    setSavedIndexes,
    setStep,
    setDemoUsage,
    setIsDemoMode,
    setUserMenuOpen,
    resetAll,
  } = useWorkflowReducer();

  // Fetch demo usage on mount (for non-logged-in users)
  useEffect(() => {
    async function fetchDemoUsage() {
      if (!user && !loading) {
        try {
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
          const response = await fetch(`${basePath}/api/demo/status`);
          if (response.ok) {
            const data = await response.json();
            setDemoUsage(data);
            setIsDemoMode(true);
          }
        } catch (error) {
          console.error('Failed to fetch demo usage:', error);
        }
      }
    }
    fetchDemoUsage();
  }, [user, loading, setDemoUsage, setIsDemoMode]);

  // Memoized handlers with useCallback
  const handleSelectAllTypes = useCallback(() => {
    selectAllTypes(ALL_QUESTION_TYPES);
  }, [selectAllTypes]);

  // Destructure for easier access
  const { source: articleSource, keywords, difficulty, wordCount, generatedArticle, isGenerating: isGeneratingArticle, directInput, directTitle } = articleState;
  const { selectedTypes: selectedQuestionTypes, generatedQuestions, isGenerating: isGeneratingQuestion, progress: generationProgress, savedIndexes } = questionState;
  const { step, demoUsage, isDemoMode, userMenuOpen } = uiState;

  const handleGenerateArticle = useCallback(async () => {
    if (!keywords.trim()) {
      toast.error('키워드를 입력해주세요');
      return;
    }

    // 로그인 사용자: 코인 체크
    if (user) {
      const hasEnough = await hasEnoughCoinsInDB(user.id, COIN_COSTS.GENERATE_ARTICLE);
      if (!hasEnough) {
        toast.error('코인이 부족합니다. 코인을 충전해주세요.');
        return;
      }
    } else if (isDemoMode) {
      // 데모 모드: 사용 횟수 체크
      if (!demoUsage?.canUse) {
        toast.error('데모 사용 횟수를 모두 소진했습니다. 로그인하시면 더 많은 문제를 생성할 수 있습니다.');
        return;
      }
    } else {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsGeneratingArticle(true);
    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);

      const response = await apiClient.post('/api/generate-article', {
        keywords: keywordArray,
        difficulty,
        wordCount,
        demo: isDemoMode && !user,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      // Deduct coin after successful generation (DB) - only for logged-in users
      if (user) {
        await deductCoinsFromDB(user.id, COIN_COSTS.GENERATE_ARTICLE);
        triggerCoinUpdate();
      } else if (isDemoMode) {
        // Refresh demo usage after article generation
        try {
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
          const response = await fetch(`${basePath}/api/demo/status`);
          if (response.ok) {
            const data = await response.json();
            setDemoUsage(data);
          }
        } catch (error) {
          console.error('Failed to refresh demo usage:', error);
        }
      }

      setGeneratedArticle(data);
      setStep(2);
      toast.success('아티클이 생성되었습니다!');
    } catch (error: any) {
      console.error('Article generation error:', error);
      toast.error(`아티클 생성 실패: ${error.message}`);
    } finally {
      setIsGeneratingArticle(false);
    }
  }, [keywords, user, isDemoMode, demoUsage, difficulty, wordCount, setIsGeneratingArticle, setDemoUsage, setGeneratedArticle, setStep]);

  const handleGenerateQuestion = useCallback(async () => {
    if (!generatedArticle) return;
    if (selectedQuestionTypes.length === 0) {
      toast.error('문제 유형을 하나 이상 선택해주세요.');
      return;
    }

    // 로그인 사용자: 코인 체크
    if (user) {
      const totalCost = selectedQuestionTypes.length * COIN_COSTS.GENERATE_QUESTION;
      const hasEnough = await hasEnoughCoinsInDB(user.id, totalCost);
      if (!hasEnough) {
        toast.error(`코인이 부족합니다. 필요한 코인: ${totalCost}개`);
        return;
      }
    } else if (isDemoMode) {
      // 데모 모드: 사용 횟수 체크 (1개만 생성 가능)
      if (!demoUsage?.canUse) {
        toast.error('데모 사용 횟수를 모두 소진했습니다. 로그인하시면 더 많은 문제를 생성할 수 있습니다.');
        return;
      }
      // 데모 모드에서는 1개만 생성 가능
      if (selectedQuestionTypes.length > demoUsage.remaining) {
        toast.error(`데모 모드에서는 ${demoUsage.remaining}개만 더 생성할 수 있습니다.`);
        return;
      }
    } else {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsGeneratingQuestion(true);
    setGeneratedQuestions([]);
    setProgress({ current: 0, total: selectedQuestionTypes.length });

    const results: GeneratedQuestion[] = [];
    let successCount = 0;
    let completedCount = 0;
    let demoLimitExceeded = false;

    // 병렬 처리 설정: 3개씩 동시 요청 (API 부하 방지 + 속도 향상)
    const MAX_CONCURRENT = 3;

    // 단일 문제 생성 함수
    const generateSingleQuestion = async (type: QuestionType): Promise<GeneratedQuestion | null> => {
      if (demoLimitExceeded) return null;

      try {
        const response = await apiClient.post('/api/generate', {
          passage: generatedArticle.article,
          questionType: type,
          demo: isDemoMode && !user,
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.errorCode === 'DEMO_LIMIT_EXCEEDED') {
            demoLimitExceeded = true;
            toast.error('데모 사용 횟수를 모두 소진했습니다.');
            return null;
          }
          throw new Error(data.details || data.error || 'Failed to generate question');
        }

        // 성공 시 코인 차감 (로그인 사용자만)
        if (user) {
          await deductCoinsFromDB(user.id, COIN_COSTS.GENERATE_QUESTION);
        }

        return { type, question: data };
      } catch (error: any) {
        console.error(`Question generation error for ${type}:`, error);
        return null;
      }
    };

    // 배치 단위 병렬 처리 (진행률 표시를 위해)
    for (let i = 0; i < selectedQuestionTypes.length; i += MAX_CONCURRENT) {
      if (demoLimitExceeded) break;

      const batch = selectedQuestionTypes.slice(i, i + MAX_CONCURRENT);
      const batchResults = await Promise.all(batch.map(generateSingleQuestion));

      for (const result of batchResults) {
        completedCount++;
        if (result) {
          results.push(result);
          successCount++;
        }
      }

      setProgress({ current: completedCount, total: selectedQuestionTypes.length });
    }

    if (user) {
      triggerCoinUpdate();
    } else if (isDemoMode) {
      // Refresh demo usage after generation
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/api/demo/status`);
        if (response.ok) {
          const data = await response.json();
          setDemoUsage(data);
        }
      } catch (error) {
        console.error('Failed to refresh demo usage:', error);
      }
    }

    setGeneratedQuestions(results);
    setIsGeneratingQuestion(false);
    setProgress(null);

    if (successCount === 0) {
      toast.error('문제 생성에 실패했습니다.');
      setSavedIndexes(new Set());
    } else {
      // 로그인 사용자는 자동 저장
      if (user && generatedArticle && results.length > 0) {
        const autoSavedIndexes = new Set<number>();
        for (let i = 0; i < results.length; i++) {
          const { type, question } = results[i];
          const saved = await saveQuestionToArchive(user.id, type, question, generatedArticle);
          if (saved) {
            autoSavedIndexes.add(i);
          }
        }
        setSavedIndexes(autoSavedIndexes);

        if (successCount < selectedQuestionTypes.length) {
          toast(`${successCount}개 문제 생성 및 자동 저장됨`, { icon: '⚠️' });
        } else {
          toast.success(`${successCount}개 문제가 생성되고 자동 저장되었습니다!`);
        }
      } else {
        // 비로그인 사용자
        setSavedIndexes(new Set());
        if (successCount < selectedQuestionTypes.length) {
          toast(`${selectedQuestionTypes.length}개 중 ${successCount}개 문제가 생성되었습니다.`, { icon: '⚠️' });
        } else {
          toast.success(`${successCount}개 문제가 생성되었습니다!`);
        }
      }
    }
  }, [generatedArticle, selectedQuestionTypes, user, isDemoMode, demoUsage, setIsGeneratingQuestion, setGeneratedQuestions, setProgress, setDemoUsage, setSavedIndexes]);

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
    setGeneratedQuestions([]);
  }, [setStep, setGeneratedQuestions]);

  const handleDirectInput = useCallback(() => {
    const trimmedInput = directInput.trim();

    if (!trimmedInput) {
      toast.error('지문을 입력해주세요');
      return;
    }

    if (trimmedInput.length < 100) {
      toast.error('지문은 최소 100자 이상 입력해주세요');
      return;
    }

    // 데모 모드에서도 직접 입력은 허용 (무료)
    if (!user && !isDemoMode) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // 영어 단어 수 계산
    const englishWords = trimmedInput.match(/[a-zA-Z]+/g) || [];
    const estimatedWordCount = englishWords.length;

    if (estimatedWordCount < 30) {
      toast.error('영어 지문을 입력해주세요 (최소 30단어 이상)');
      return;
    }

    // 직접 입력한 아티클은 코인 차감 없음
    const articleData: ArticleResponse = {
      title: directTitle.trim() || 'Custom Article',
      article: trimmedInput,
      wordCount: estimatedWordCount,
      difficulty: '고3',
      keywords: [],
    };

    setGeneratedArticle(articleData);
    setStep(2);
    toast.success('지문이 등록되었습니다!');
  }, [directInput, directTitle, user, isDemoMode, setGeneratedArticle, setStep]);

  const handleReset = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // Save individual question (DB)
  const handleSaveQuestion = useCallback(async (index: number) => {
    if (!generatedArticle || savedIndexes.has(index) || !user) return;
    const { type, question } = generatedQuestions[index];

    const result = await saveQuestionToArchive(
      user.id,
      type,
      question,
      generatedArticle
    );

    if (result) {
      addSavedIndex(index);
      toast.success('문제가 저장되었습니다!');
    } else {
      toast.error('저장에 실패했습니다.');
    }
  }, [generatedArticle, savedIndexes, user, generatedQuestions, addSavedIndex]);

  // Save all unsaved questions (DB)
  const handleSaveAllToArchive = useCallback(async () => {
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
  }, [generatedQuestions, generatedArticle, user, savedIndexes, setSavedIndexes]);

  // Memoized values
  const pdfQuestions = useMemo(() => {
    if (!generatedArticle || generatedQuestions.length === 0) return [];
    return generatedQuestions.map(({ type, question }) => ({
      type,
      typeName: QUESTION_TYPE_LABELS[type],
      questionText: question.question,
      passage: question.modifiedPassage.replace(/<[^>]*>/g, ''),
      choices: question.choices,
      answer: question.answer,
      explanation: question.explanation,
      difficulty: generatedArticle.difficulty,
    }));
  }, [generatedQuestions, generatedArticle]);

  const totalQuestionCost = useMemo(() => {
    return selectedQuestionTypes.length * COIN_COSTS.GENERATE_QUESTION;
  }, [selectedQuestionTypes.length]);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return <LoadingSpinner />;
  }

  // 비로그인 + 데모 모드 초기화 중
  if (!user && !demoUsage) {
    return <LoadingSpinner />;
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
          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                {/* 코인 영역 */}
                <CoinDisplay />

                {/* 사용자 드롭다운 메뉴 */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-cream-dark)]/50 transition-colors cursor-pointer"
                  >
                    <UserAvatar user={user} size="md" />
                    <svg className={`hidden md:block w-4 h-4 text-[var(--color-text-muted)] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[var(--color-cream-dark)] py-2 z-50">
                        <div className="px-4 py-2 border-b border-[var(--color-cream-dark)]">
                          <p className="text-xs text-[var(--color-text-muted)]">로그인 계정</p>
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/archive"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          저장함
                        </Link>
                        <Link
                          href="/credit-history"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          크레딧 내역
                        </Link>
                        <Link
                          href="/payment"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          코인 충전
                        </Link>
                        <div className="border-t border-[var(--color-cream-dark)] mt-2 pt-2">
                          <AuthButton compact onAction={() => setUserMenuOpen(false)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : isDemoMode ? (
              <>
                {/* 데모 모드 표시 */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-700">
                    데모 모드
                  </span>
                  <span className="text-xs text-amber-600">
                    ({demoUsage?.remaining ?? 0}회 남음)
                  </span>
                </div>

                {/* 구분선 */}
                <div className="h-5 w-px bg-[var(--color-ink)]/10" />

                {/* 로그인 버튼 */}
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] rounded-full hover:shadow-lg transition-all"
                >
                  로그인
                </Link>
              </>
            ) : null}
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
        <StepIndicator currentStep={step} hasArticle={!!generatedArticle} />

        {/* Step 1: Article Generation */}
        {step === 1 && (
          <div className="card-elevated p-8 animate-fade-in-up">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--color-spark)]/10 text-[var(--color-spark)] flex items-center justify-center text-sm font-bold">1</span>
              아티클 준비
            </h2>

            {/* Source Selection Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-[var(--color-cream-dark)]/50 rounded-xl">
              <button
                onClick={() => setArticleSource('generate')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  articleSource === 'generate'
                    ? 'bg-white text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI로 생성
              </button>
              <button
                onClick={() => setArticleSource('direct')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  articleSource === 'direct'
                    ? 'bg-white text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                직접 입력
              </button>
            </div>

            <div className="space-y-8">
              {/* AI Generate Mode */}
              {articleSource === 'generate' && (
                <>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['중학생', '고1', '고2', '고3'] as const).map((level) => (
                        <DifficultyButton
                          key={level}
                          level={level}
                          isSelected={difficulty === level}
                          onClick={() => setDifficulty(level)}
                        />
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
                    disabled={isGeneratingArticle || !keywords.trim() || (isDemoMode && !user && !demoUsage?.canUse)}
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
                    ) : user ? (
                      <span className="flex items-center justify-center gap-3">
                        아티클 생성하기
                        <CoinCost amount={COIN_COSTS.GENERATE_ARTICLE} />
                      </span>
                    ) : isDemoMode ? (
                      <span className="flex items-center justify-center gap-3">
                        아티클 생성하기
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          데모 {demoUsage?.remaining ?? 0}회 남음
                        </span>
                      </span>
                    ) : (
                      <span>로그인 필요</span>
                    )}
                  </button>

                  {/* Demo mode notice */}
                  {isDemoMode && !user && (
                    <DemoModeBanner remaining={demoUsage?.remaining ?? 0} />
                  )}
                </>
              )}

              {/* Direct Input Mode */}
              {articleSource === 'direct' && (
                <>
                  {/* Title Input (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                      제목 <span className="text-[var(--color-text-muted)]">(선택)</span>
                    </label>
                    <input
                      type="text"
                      value={directTitle}
                      onChange={(e) => setDirectTitle(e.target.value)}
                      placeholder="예: The Future of Artificial Intelligence"
                      className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[var(--color-spark)]/20 rounded-xl focus:ring-2 focus:ring-[var(--color-spark)]/30 focus:border-[var(--color-spark)] transition-all outline-none"
                    />
                  </div>

                  {/* Article Content Input */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
                      영어 지문 입력 <span className="text-[var(--color-error)]">*</span>
                    </label>
                    <textarea
                      value={directInput}
                      onChange={(e) => setDirectInput(e.target.value)}
                      placeholder="영어 지문을 여기에 붙여넣으세요...&#10;&#10;The rapid advancement of artificial intelligence has transformed various industries..."
                      rows={10}
                      className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[var(--color-spark)]/20 rounded-xl focus:ring-2 focus:ring-[var(--color-spark)]/30 focus:border-[var(--color-spark)] transition-all outline-none resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-[var(--color-text-muted)]">
                        최소 100자 이상의 영어 지문을 입력해주세요
                      </p>
                      <span className={`text-sm font-medium ${
                        directInput.length >= 100
                          ? 'text-[var(--color-mint)]'
                          : 'text-[var(--color-text-muted)]'
                      }`}>
                        {directInput.length}자
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--color-mint)]/10 border border-[var(--color-mint)]/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[var(--color-mint)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-[var(--color-text)]">
                        <p className="font-medium text-[var(--color-mint)] mb-1">직접 입력은 무료!</p>
                        <p className="text-[var(--color-text-muted)]">수능, 모의고사, 교재 등의 영어 지문을 직접 입력하여 문제를 생성할 수 있습니다.</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleDirectInput}
                    disabled={directInput.trim().length < 100}
                    className="w-full btn-spark py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      지문 등록하기
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">무료</span>
                    </span>
                  </button>
                </>
              )}

              {/* Article Generation Skeleton */}
              {isGeneratingArticle && (
                <div className="mt-8">
                  <ArticleSkeleton />
                </div>
              )}
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
                        onClick={handleSelectAllTypes}
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
                    {ALL_QUESTION_TYPES.map((type) => (
                      <QuestionTypeChip
                        key={type}
                        type={type}
                        label={QUESTION_TYPE_LABELS[type]}
                        isSelected={selectedQuestionTypes.includes(type)}
                        onClick={() => toggleQuestionType(type)}
                      />
                    ))}
                  </div>
                  {selectedQuestionTypes.length > 0 && (
                    <p className="text-sm text-[var(--color-spark)] mt-3 font-medium">
                      {selectedQuestionTypes.length}개 유형 선택됨
                    </p>
                  )}
                </div>

                <button
                  onClick={handleGenerateQuestion}
                  disabled={isGeneratingQuestion || selectedQuestionTypes.length === 0 || (isDemoMode && !user && !demoUsage?.canUse)}
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
                  ) : user ? (
                    <span className="flex items-center justify-center gap-3">
                      {selectedQuestionTypes.length > 0
                        ? `${selectedQuestionTypes.length}개 문제 생성하기`
                        : '문제 유형을 선택하세요'}
                      {selectedQuestionTypes.length > 0 && (
                        <CoinCost amount={totalQuestionCost} />
                      )}
                    </span>
                  ) : isDemoMode ? (
                    <span className="flex items-center justify-center gap-3">
                      {selectedQuestionTypes.length > 0
                        ? `${selectedQuestionTypes.length}개 문제 생성하기`
                        : '문제 유형을 선택하세요'}
                      {selectedQuestionTypes.length > 0 && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          데모 {demoUsage?.remaining ?? 0}회 남음
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>로그인 필요</span>
                  )}
                </button>

                {/* Demo mode warning for question generation */}
                {isDemoMode && !user && selectedQuestionTypes.length > (demoUsage?.remaining ?? 0) && (
                  <p className="text-sm text-amber-600 mt-2 text-center">
                    데모 모드에서는 {demoUsage?.remaining ?? 0}개까지만 생성할 수 있습니다.
                  </p>
                )}

                {/* Question Generation Progress & Skeleton */}
                {isGeneratingQuestion && generationProgress && (
                  <div className="mt-6 space-y-4">
                    <ProgressBar
                      current={generationProgress.current}
                      total={generationProgress.total}
                      label="문제 생성 진행률"
                    />
                    <div className="grid gap-4">
                      {Array.from({ length: Math.min(3, generationProgress.total - generationProgress.current) }).map((_, i) => (
                        <QuestionSkeleton key={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Questions Display */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header with actions */}
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="font-display text-xl font-semibold text-[var(--color-ink)]">
                      생성된 문제 ({generatedQuestions.length}개)
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      {user ? (
                        <span className="text-sm text-[var(--color-mint)] flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {savedIndexes.size === generatedQuestions.length ? '자동 저장됨' : `${savedIndexes.size}/${generatedQuestions.length} 저장됨`}
                        </span>
                      ) : (
                        <span className="text-sm text-amber-600">
                          로그인하면 자동 저장
                        </span>
                      )}
                      {user && generatedArticle && (
                        <PDFExportButton
                          variant="button"
                          questions={pdfQuestions}
                          title={`ENG-SPARKLING - ${generatedArticle.title}`}
                        />
                      )}
                      {user && (
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
                              자동 저장됨
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
                      )}
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
                  <QuestionCard
                    key={qIndex}
                    index={qIndex}
                    type={type}
                    typeLabel={QUESTION_TYPE_LABELS[type]}
                    question={question}
                    isSaved={savedIndexes.has(qIndex)}
                    isLoggedIn={!!user}
                    onSave={() => handleSaveQuestion(qIndex)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
