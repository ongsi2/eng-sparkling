/**
 * Memoized Components for Workflow Page
 *
 * React.memo를 사용하여 불필요한 리렌더링 방지
 */

import React, { memo } from 'react';
import Link from 'next/link';
import type { QuestionType, GeneratedQuestion } from '../hooks/useWorkflowReducer';
import { sanitizePassageHtml, sanitizeExplanationHtml } from '@/lib/sanitize-html';

// ============ SparklingLogo ============

export const SparklingLogo = memo(function SparklingLogo() {
  return (
    <div className="relative group">
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <defs>
          <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGrad2)" strokeWidth="2.5" className="group-hover:animate-pulse" />
        <circle cx="20" cy="20" r="15" fill="url(#logoGrad2)" fillOpacity="0.08" />
        <g transform="translate(12, 11)">
          <path d="M0 0 L14 0 L14 3 L4 3 L4 7.5 L12 7.5 L12 10.5 L4 10.5 L4 15 L14 15 L14 18 L0 18 Z" fill="url(#logoGrad2)" />
        </g>
        <g filter="url(#glow2)">
          <circle cx="32" cy="10" r="2" fill="#22d3ee" className="animate-sparkle" />
          <circle cx="8" cy="32" r="1.5" fill="#10b981" className="animate-sparkle delay-300" />
        </g>
      </svg>
    </div>
  );
});

// ============ StepIndicator ============

interface StepIndicatorProps {
  currentStep: 1 | 2;
  hasArticle: boolean;
}

export const StepIndicator = memo(function StepIndicator({ currentStep, hasArticle }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className={`flex items-center ${currentStep === 1 ? 'text-[var(--color-spark)]' : 'text-[var(--color-text-light)]'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${
          currentStep === 1
            ? 'border-[var(--color-spark)] bg-[var(--color-spark)] text-white'
            : hasArticle
              ? 'border-[var(--color-mint)] bg-[var(--color-mint)] text-white'
              : 'border-[var(--color-text-light)]'
        }`}>
          {hasArticle && currentStep !== 1 ? '✓' : '1'}
        </div>
        <span className="ml-3 font-medium">아티클 생성</span>
      </div>

      <div className={`w-20 h-1 mx-6 rounded-full transition-all ${
        hasArticle ? 'bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-spark)]' : 'bg-[var(--color-cream-dark)]'
      }`} />

      <div className={`flex items-center ${currentStep === 2 ? 'text-[var(--color-spark)]' : 'text-[var(--color-text-light)]'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all ${
          currentStep === 2 && hasArticle
            ? 'border-[var(--color-spark)] bg-[var(--color-spark)] text-white'
            : 'border-[var(--color-text-light)]'
        }`}>
          2
        </div>
        <span className="ml-3 font-medium">문제 생성</span>
      </div>
    </div>
  );
});

// ============ DifficultyButton ============

interface DifficultyButtonProps {
  level: '중학생' | '고1' | '고2' | '고3';
  isSelected: boolean;
  onClick: () => void;
}

export const DifficultyButton = memo(function DifficultyButton({ level, isSelected, onClick }: DifficultyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-4 rounded-xl font-medium transition-all cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-spark-light)] text-white shadow-md'
          : 'bg-[var(--color-cream)] text-[var(--color-text)] hover:bg-[var(--color-cream-dark)] border border-[var(--color-spark)]/10'
      }`}
    >
      {level}
    </button>
  );
});

// ============ QuestionTypeChip ============

interface QuestionTypeChipProps {
  type: QuestionType;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export const QuestionTypeChip = memo(function QuestionTypeChip({ type, label, isSelected, onClick }: QuestionTypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white border-transparent'
          : 'bg-[var(--color-cream)] text-[var(--color-text)] hover:bg-[var(--color-cream-dark)] border-[var(--color-spark)]/20'
      }`}
    >
      {label}
    </button>
  );
});

// ============ QuestionCard ============

interface QuestionCardProps {
  index: number;
  type: QuestionType;
  typeLabel: string;
  question: GeneratedQuestion['question'];
  isSaved: boolean;
  isLoggedIn: boolean;
  onSave: () => void;
}

export const QuestionCard = memo(function QuestionCard({
  index,
  type,
  typeLabel,
  question,
  isSaved,
  isLoggedIn,
  onSave,
}: QuestionCardProps) {
  return (
    <div className="question-card animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="space-y-6">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] text-xs font-medium rounded">
                {typeLabel}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                #{index + 1}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">
              {question.question}
            </h3>
          </div>
          {isLoggedIn ? (
            <button
              onClick={onSave}
              disabled={isSaved}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-[var(--color-mint)]/20 text-[var(--color-mint)] cursor-default'
                  : 'bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] hover:bg-[var(--color-spark)]/20'
              }`}
            >
              {isSaved ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  저장완료
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  저장하기
                </>
              )}
            </button>
          ) : (
            <span className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
              로그인 필요
            </span>
          )}
        </div>

        {/* Passage */}
        <div className="p-6 bg-[var(--color-cream)] rounded-xl border border-[var(--color-spark)]/10">
          <h4 className="font-semibold text-[var(--color-ink)] mb-3 text-sm">지문</h4>
          <p
            className="passage-content whitespace-pre-wrap leading-relaxed text-[var(--color-text)]"
            dangerouslySetInnerHTML={{ __html: sanitizePassageHtml(question.modifiedPassage) }}
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
            {question.choices.map((choice, choiceIndex) => (
              <div
                key={choiceIndex}
                className={`choice-item ${choiceIndex + 1 === question.answer ? 'correct' : ''}`}
              >
                <span className="font-medium text-[var(--color-text)]">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-spark)]/10 text-[var(--color-spark-deep)] text-sm font-semibold mr-3">
                    {choiceIndex + 1}
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
          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
            {sanitizeExplanationHtml(question.explanation)}
          </p>
        </div>
      </div>
    </div>
  );
});

// ============ DemoModeBanner ============

interface DemoModeBannerProps {
  remaining: number;
}

export const DemoModeBanner = memo(function DemoModeBanner({ remaining }: DemoModeBannerProps) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm">
          <p className="font-medium text-amber-700 mb-1">데모 모드로 체험 중</p>
          <p className="text-amber-600">
            {remaining}회의 무료 체험 기회가 남았습니다.
            <Link href="/login" className="ml-1 underline font-medium hover:text-amber-800">
              로그인하면 더 많은 문제를 생성할 수 있어요!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
});

// ============ LoadingSpinner ============

export const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[var(--color-spark)] border-t-transparent rounded-full" />
    </div>
  );
});
