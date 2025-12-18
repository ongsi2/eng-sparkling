'use client';

/**
 * PDF 내보내기 버튼 컴포넌트
 */

import { useState } from 'react';
import { exportQuestionToPDF, exportQuestionsToPDF } from '@/lib/pdf-export';

interface Question {
  type: string;
  typeName: string;
  questionText: string;
  passage: string;
  choices: string[];
  answer: number;
  explanation: string;
  difficulty: string;
}

interface PDFExportButtonProps {
  question?: Question;
  questions?: Question[];
  title?: string;
  className?: string;
  variant?: 'icon' | 'button' | 'full';
}

export function PDFExportButton({
  question,
  questions,
  title,
  className = '',
  variant = 'button',
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (includeAnswer: boolean) => {
    setIsExporting(true);
    setShowOptions(false);

    try {
      if (questions && questions.length > 0) {
        await exportQuestionsToPDF(questions, includeAnswer, title);
      } else if (question) {
        await exportQuestionToPDF(question, includeAnswer);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // 아이콘 버전
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isExporting}
          className={`p-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors ${className}`}
          title="PDF로 내보내기"
        >
          {isExporting ? (
            <svg
              className="w-5 h-5 animate-spin text-[var(--color-spark)]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[var(--color-text-muted)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
        </button>

        {showOptions && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[var(--color-spark)]/10 overflow-hidden z-10 min-w-[180px]">
            <button
              onClick={() => handleExport(false)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-cream)] transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-[var(--color-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              문제만 내보내기
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-cream)] transition-colors flex items-center gap-2 border-t border-[var(--color-cream-dark)]"
            >
              <svg
                className="w-4 h-4 text-[var(--color-mint)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              정답/해설 포함
            </button>
          </div>
        )}
      </div>
    );
  }

  // 버튼 버전
  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isExporting}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-spark)]/20 hover:border-[var(--color-spark)] hover:bg-[var(--color-spark)]/5 transition-colors text-sm font-medium ${className}`}
        >
          {isExporting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              내보내는 중...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDF 내보내기
            </>
          )}
        </button>

        {showOptions && (
          <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[var(--color-spark)]/10 overflow-hidden z-10 min-w-[180px]">
            <button
              onClick={() => handleExport(false)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-cream)] transition-colors"
            >
              문제만 내보내기
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-cream)] transition-colors border-t border-[var(--color-cream-dark)]"
            >
              정답/해설 포함
            </button>
          </div>
        )}
      </div>
    );
  }

  // 전체 버전 (큰 버튼)
  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={() => handleExport(false)}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[var(--color-spark)]/20 rounded-xl hover:border-[var(--color-spark)] hover:shadow-md transition-all"
      >
        <svg
          className="w-5 h-5 text-[var(--color-spark)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="font-medium">문제만 PDF로 저장</span>
      </button>
      <button
        onClick={() => handleExport(true)}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-spark)] text-white rounded-xl hover:bg-[var(--color-spark-deep)] hover:shadow-md transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">정답/해설 포함 PDF 저장</span>
      </button>
    </div>
  );
}
