'use client';

import { GeneratedQuestion } from '@/types';

interface HistoryProps {
  questions: GeneratedQuestion[];
  onSelect: (question: GeneratedQuestion) => void;
  onClear: () => void;
}

export default function History({ questions, onSelect, onClear }: HistoryProps) {
  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center text-gray-500">
        아직 생성된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          생성 기록 ({questions.length}/10)
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-2">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q)}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {q.passage.substring(0, 60)}...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(q.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                문법형
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
