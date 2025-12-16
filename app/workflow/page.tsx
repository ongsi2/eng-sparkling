'use client';

import { useState } from 'react';
import { ArticleResponse } from '@/lib/article-prompts';

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

  const handleGenerateArticle = async () => {
    if (!keywords.trim()) {
      alert('키워드를 입력해주세요');
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

      setGeneratedQuestion(data);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🎯 ENG-SPARK MVP
        </h1>
        <p className="text-center text-gray-600 mb-8">
          2단계 워크플로우: 키워드 → 아티클 생성 → 문제 생성
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step === 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step === 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2">아티클 생성</span>
          </div>

          <div className={`w-24 h-1 mx-4 ${generatedArticle ? 'bg-blue-600' : 'bg-gray-300'}`} />

          <div className={`flex items-center ${step === 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step === 2 && generatedArticle ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2">문제 생성</span>
          </div>
        </div>

        {/* Step 1: Article Generation */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 1: 아티클 생성</h2>

            <div className="space-y-6">
              {/* Keywords Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 입력 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="예: artificial intelligence, healthcare, diagnosis"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  여러 키워드를 입력하면 해당 키워드를 포함한 영어 지문이 생성됩니다
                </p>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 선택
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['중학생', '고1', '고2', '고3'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        difficulty === level
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Count Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  단어 수: {wordCount}단어
                </label>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100단어</span>
                  <span>800단어</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateArticle}
                disabled={isGeneratingArticle || !keywords.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {isGeneratingArticle ? '아티클 생성 중...' : '아티클 생성하기 →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Question Generation */}
        {step === 2 && generatedArticle && (
          <div className="space-y-6">
            {/* Generated Article Display */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">생성된 아티클</h2>
                <button
                  onClick={handleBackToStep1}
                  className="text-blue-600 hover:underline"
                >
                  ← 아티클 다시 생성
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{generatedArticle.title}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {generatedArticle.article}
                </p>
              </div>

              <div className="flex gap-4 text-sm text-gray-600">
                <span>📊 단어 수: {generatedArticle.wordCount}개</span>
                <span>📚 난이도: {generatedArticle.difficulty}</span>
                <span>🔑 키워드: {generatedArticle.keywords.join(', ')}</span>
              </div>
            </div>

            {/* Question Type Selection */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 2: 문제 생성</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문제 유형 선택 (13가지)
                  </label>
                  <select
                    value={selectedQuestionType}
                    onChange={(e) => setSelectedQuestionType(e.target.value as QuestionType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                      <option key={type} value={type}>
                        {QUESTION_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateQuestion}
                  disabled={isGeneratingQuestion}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {isGeneratingQuestion ? '문제 생성 중...' : '문제 생성하기'}
                </button>
              </div>
            </div>

            {/* Generated Question Display */}
            {generatedQuestion && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">생성된 문제</h2>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    처음부터 다시
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">{generatedQuestion.question}</h3>
                    <div className="text-sm text-gray-500 mb-2">
                      생성 시각: {new Date().toLocaleString('ko-KR')}
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h4 className="font-bold mb-2">지문</h4>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {generatedQuestion.modifiedPassage}
                    </p>
                    {generatedQuestion.sentenceToInsert && (
                      <div className="mt-4 p-4 bg-blue-100 rounded">
                        <p className="font-bold mb-1">주어진 문장:</p>
                        <p>{generatedQuestion.sentenceToInsert}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">선택지</h4>
                    <div className="space-y-2">
                      {generatedQuestion.choices.map((choice, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            index + 1 === generatedQuestion.answer
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">
                            {index + 1}. {choice}
                            {index + 1 === generatedQuestion.answer && (
                              <span className="ml-2 text-green-600">← 정답</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-bold mb-2">해설</h4>
                    <p className="text-gray-700">{generatedQuestion.explanation}</p>
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
