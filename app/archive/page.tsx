'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CoinDisplay from '@/app/components/CoinDisplay';
import AuthButton from '@/app/components/AuthButton';
import { useAuth } from '@/app/components/AuthProvider';
import { getArchivedQuestions, deleteArchivedQuestion, ArchivedQuestion } from '@/lib/archive';

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

export default function ArchivePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [archive, setArchive] = useState<ArchivedQuestion[]>([]);
  const [selectedItem, setSelectedItem] = useState<ArchivedQuestion | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 안 했으면 /login으로 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchArchive = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getArchivedQuestions(user.id);
      setArchive(data);
    } catch (error) {
      console.error('Failed to fetch archive:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchArchive();
    }
  }, [user, fetchArchive]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('이 문제를 삭제하시겠습니까?')) {
      const success = await deleteArchivedQuestion(user.id, id);
      if (success) {
        setArchive(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 로딩 중이거나 로그인 안 했으면 로딩 화면 표시
  if (loading || !user || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--color-spark)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-cream)]/90 border-b border-[var(--color-spark)]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <SparklingLogo />
            <span className="text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              ENG-SPARKLING
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/workflow" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
              ← 문제 생성
            </a>
            <div className="h-6 w-px bg-[var(--color-spark)]/20" />
            <CoinDisplay showLabel showChargeButton />
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-ink)] mb-3">
            저장된 문제
          </h1>
          <p className="text-[var(--color-text-muted)]">
            생성한 문제들을 확인하고 관리하세요
          </p>
        </div>

        {archive.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h3 className="text-xl font-semibold text-[var(--color-ink)] mb-2">저장된 문제가 없습니다</h3>
            <p className="text-[var(--color-text-muted)] mb-6">문제를 생성하고 저장하면 여기에 표시됩니다.</p>
            <a
              href="/workflow"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-spark-light)] text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              문제 생성하러 가기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Archive List */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="font-semibold text-[var(--color-ink)] mb-4">
                문제 목록 ({archive.length}개)
              </h3>
              {archive.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setShowAnswer(false);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-[var(--color-spark)]/10 border-2 border-[var(--color-spark)]'
                      : 'bg-white border border-[var(--color-spark)]/10 hover:border-[var(--color-spark)]/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[var(--color-mint)]/10 text-[var(--color-mint)] rounded-full mb-2">
                        {QUESTION_TYPE_LABELS[item.question_type as QuestionType]}
                      </span>
                      <h4 className="font-medium text-[var(--color-ink)] text-sm truncate">
                        {item.article.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-1.5 text-[var(--color-text-light)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Question Display */}
            <div className="md:col-span-2">
              {selectedItem ? (
                <div className="question-card animate-fade-in">
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-[var(--color-mint)]/10 text-[var(--color-mint)] rounded-full mb-3">
                      {QUESTION_TYPE_LABELS[selectedItem.question_type as QuestionType]}
                    </span>
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                      {selectedItem.question.question}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {formatDate(selectedItem.created_at)}
                    </p>
                  </div>

                  {/* Passage */}
                  <div className="p-6 bg-[var(--color-cream)] rounded-xl border border-[var(--color-spark)]/10 mb-6">
                    <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">지문</h4>
                    <p
                      className="whitespace-pre-wrap leading-relaxed text-[var(--color-text)] [&>u]:underline [&>u]:decoration-[var(--color-spark)] [&>u]:decoration-2 [&>u]:underline-offset-2 [&>u]:font-medium [&>u]:text-[var(--color-spark-deep)]"
                      dangerouslySetInnerHTML={{ __html: selectedItem.question.modifiedPassage }}
                    />
                    {selectedItem.question.sentenceToInsert && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-[var(--color-spark)]/5 to-[var(--color-mint)]/5 rounded-lg border border-[var(--color-spark)]/20">
                        <p className="font-semibold text-[var(--color-ink)] text-sm mb-1">주어진 문장:</p>
                        <p className="text-[var(--color-text)] italic">{selectedItem.question.sentenceToInsert}</p>
                      </div>
                    )}
                  </div>

                  {/* Choices */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">선택지</h4>
                    <div className="space-y-3">
                      {selectedItem.question.choices.map((choice, index) => (
                        <div
                          key={index}
                          className={`choice-item ${showAnswer && index + 1 === selectedItem.question.answer ? 'correct' : ''}`}
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

                  {/* Show Answer Button / Explanation */}
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="w-full py-3 bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer"
                    >
                      정답 확인하기
                    </button>
                  ) : (
                    <div className="p-6 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-xl text-white animate-fade-in">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-spark-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        해설
                      </h4>
                      <p className="text-white/90 leading-relaxed">{selectedItem.question.explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-elevated p-12 text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-[var(--color-text-muted)]">왼쪽 목록에서 문제를 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
