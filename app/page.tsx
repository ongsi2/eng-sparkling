'use client';

import { useState } from 'react';
import { DEMO_PASSAGE, DEMO_QUESTIONS, QUESTION_TYPES, QuestionType, DemoQuestion } from '@/data/demo-questions';

export default function Home() {
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeClick = (type: QuestionType) => {
    setSelectedType(type);
    setShowQuestion(true);
    // 스크롤 이동
    setTimeout(() => {
      document.getElementById('question-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCloseQuestion = () => {
    setShowQuestion(false);
    setSelectedType(null);
  };

  const selectedQuestion = selectedType ? DEMO_QUESTIONS[selectedType] : null;
  const selectedTypeInfo = selectedType ? QUESTION_TYPES.find(t => t.type === selectedType) : null;

  // 첫 5개와 나머지 분리
  const firstRowTypes = QUESTION_TYPES.slice(0, 5);
  const secondRowTypes = QUESTION_TYPES.slice(5, 10);
  const thirdRowTypes = QUESTION_TYPES.slice(10);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">ENG-SPARK</span>
          </div>
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            로그인/회원가입
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI로 만드는<br />
            실전 영어 모의고사
          </h1>
          <p className="text-gray-600 mb-8">
            가입하고 월 9,000원 요금제 한달 무료 사용하기
          </p>
          <a
            href="/login"
            className="inline-block text-blue-600 hover:text-blue-800 font-medium underline"
          >
            로그인/회원가입
          </a>
        </div>
      </section>

      {/* Demo Passage Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {DEMO_PASSAGE.title}
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              {DEMO_PASSAGE.content}
            </p>
          </div>
        </div>
      </section>

      {/* Try Our Features Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-8">
            Try our features
          </h3>

          {/* Question Type Buttons */}
          <div className="space-y-3">
            {/* First Row */}
            <div className="flex flex-wrap justify-center gap-3">
              {firstRowTypes.map((typeInfo) => (
                <button
                  key={typeInfo.type}
                  onClick={() => handleTypeClick(typeInfo.type)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    selectedType === typeInfo.type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2 text-sm">{typeInfo.icon}</span>
                  {typeInfo.label}
                </button>
              ))}
            </div>

            {/* Expand/Collapse Button */}
            <div className="text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isExpanded ? '축소하기 ▲' : '더보기 ▼'}
              </button>
            </div>

            {/* Second & Third Rows (Expandable) */}
            {isExpanded && (
              <>
                <div className="flex flex-wrap justify-center gap-3">
                  {secondRowTypes.map((typeInfo) => (
                    <button
                      key={typeInfo.type}
                      onClick={() => handleTypeClick(typeInfo.type)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        selectedType === typeInfo.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <span className="mr-2 text-sm">{typeInfo.icon}</span>
                      {typeInfo.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {thirdRowTypes.map((typeInfo) => (
                    <button
                      key={typeInfo.type}
                      onClick={() => handleTypeClick(typeInfo.type)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        selectedType === typeInfo.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <span className="mr-2 text-sm">{typeInfo.icon}</span>
                      {typeInfo.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Generated Question Display */}
      {showQuestion && selectedQuestion && selectedTypeInfo && (
        <section id="question-section" className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {selectedTypeInfo.icon} {selectedTypeInfo.label}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {selectedTypeInfo.description}
                  </span>
                </div>
                <button
                  onClick={handleCloseQuestion}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Question */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedQuestion.question}
                </h3>

                {/* Sentence to Insert (for INSERT_SENTENCE type) */}
                {selectedQuestion.sentenceToInsert && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">
                      [주어진 문장]
                    </p>
                    <p className="text-blue-900 mt-1">
                      {selectedQuestion.sentenceToInsert}
                    </p>
                  </div>
                )}

                {/* Modified Passage */}
                <div className="p-6 bg-yellow-50 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedQuestion.modifiedPassage}
                  </p>
                </div>

                {/* Choices */}
                <div className="space-y-2">
                  {selectedQuestion.choices.map((choice, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index + 1 === selectedQuestion.answer
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-medium text-gray-900">
                        {index + 1}. {choice}
                        {index + 1 === selectedQuestion.answer && (
                          <span className="ml-3 text-green-600 font-bold">← 정답</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">해설</h4>
                  <p className="text-blue-800 leading-relaxed">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why ENG-SPARK Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            왜 ENG-SPARK을 써야 할까요?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                최상급 AI로 수능 13유형 문항을 1분 내 생성
              </h3>
              <p className="text-gray-600 text-sm">
                고성능 AI가 지문을 분석해 수능 독해 대표 13유형을 정교하게 생성하고, 변별력 있는 선지까지 함께 구성합니다.
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                내신은 과감히 빼고, 수능 영어에만 집중
              </h3>
              <p className="text-gray-600 text-sm">
                수능 영어영역에만 집중해, 출제 맥락과 난이도 흐름에 맞는 문항을 제공하며 서식도 자연스럽게 맞춰드립니다.
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                누구나 바로 쓰는 직관적 문제 생성 UI
              </h3>
              <p className="text-gray-600 text-sm">
                지문 입력 → 유형 선택 → 생성의 간단한 흐름으로, 처음 써도 헤매지 않고 빠르게 문항을 완성할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI로 만드는<br />
            실전 영어 모의고사
          </h2>
          <p className="text-gray-600 mb-8">
            가입하고 월 9,000원 요금제 한달 무료 사용하기
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            로그인/회원가입
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>ENG-MVP - AI-powered English Question Generator</p>
          <p className="mt-2">Demo Version</p>
        </div>
      </footer>
    </div>
  );
}
