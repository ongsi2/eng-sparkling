'use client';

import { GeneratedQuestion } from '@/types';

interface QuestionDisplayProps {
  question: GeneratedQuestion;
}

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-6">
      {/* Question Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{question.question}</h2>
        <p className="text-sm text-gray-500 mt-2">
          생성 시각: {new Date(question.createdAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* Passage */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">지문</h3>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {question.modifiedPassage}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">선택지</h3>
        {question.choices.map((choice, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-colors ${
              index + 1 === question.answer
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span className="font-semibold text-gray-700">
              {index + 1}.{' '}
            </span>
            <span className={index + 1 === question.answer ? 'text-red-700 font-medium' : ''}>
              {choice}
            </span>
            {index + 1 === question.answer && (
              <span className="ml-2 text-red-600 font-bold">← 정답</span>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">해설</h3>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
