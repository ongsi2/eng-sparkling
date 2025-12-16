'use client';

import { useState } from 'react';

interface PassageInputProps {
  onGenerate: (passage: string) => void;
  isLoading: boolean;
}

export default function PassageInput({ onGenerate, isLoading }: PassageInputProps) {
  const [passage, setPassage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passage.trim() && !isLoading) {
      onGenerate(passage);
    }
  };

  const samplePassage = `Climate change is one of the most pressing issues facing humanity today. Scientists have been warning us about the consequences of global warming for decades, but many people still fail to take the threat seriously. The rise in global temperatures is causing ice caps to melt, sea levels to rise, and extreme weather events to become more frequent. If we do not take immediate action, the future of our planet will be in jeopardy.`;

  const loadSample = () => {
    setPassage(samplePassage);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="passage" className="block text-sm font-medium text-gray-700 mb-2">
            영어 지문 입력 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="passage"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="영어 지문을 입력하세요... (최소 50자, 최대 2000자)"
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
            <span>{passage.length} / 2000 characters</span>
            <button
              type="button"
              onClick={loadSample}
              className="text-blue-600 hover:text-blue-800 underline"
              disabled={isLoading}
            >
              샘플 지문 불러오기
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || passage.length < 50}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? '문제 생성 중...' : '문법 문제 생성하기'}
        </button>
      </form>
    </div>
  );
}
