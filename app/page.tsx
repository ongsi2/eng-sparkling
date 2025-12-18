'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_PASSAGE, DEMO_QUESTIONS, QUESTION_TYPES, QuestionType } from '@/data/demo-questions';
import { useAuth } from '@/app/components/AuthProvider';
import AuthButton from '@/app/components/AuthButton';
import CoinDisplay from '@/app/components/CoinDisplay';

// Sparkling Logo Component - Fresh Cyan/Mint
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
      <circle cx="17" cy="11" r="0.6" fill="#67e8f9" opacity="0.7" />
    </g>
  </svg>
);

// Lightning Icon Component
const LightningIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Check Circle Icon
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Layout Icon
const LayoutIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
  </svg>
);

// Close Icon
const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Chevron Icon
const ChevronIcon = ({ className = "w-4 h-4", direction = "down" }: { className?: string; direction?: "up" | "down" }) => (
  <svg
    className={`${className} transition-transform duration-300 ${direction === "up" ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Decorative Sparkling Particles - Fresh colors
const SparklingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-[10%] w-2 h-2 bg-[var(--color-spark)] rounded-full opacity-50 animate-sparkle" />
    <div className="absolute top-32 right-[12%] w-3 h-3 bg-[var(--color-spark-light)] rounded-full opacity-40 animate-sparkle delay-200" />
    <div className="absolute top-48 left-[25%] w-1.5 h-1.5 bg-[var(--color-mint)] rounded-full opacity-60 animate-twinkle delay-400" />
    <div className="absolute top-60 right-[20%] w-2 h-2 bg-[var(--color-spark-glow)] rounded-full opacity-45 animate-sparkle delay-100" />
    <div className="absolute bottom-40 left-[15%] w-2.5 h-2.5 bg-[var(--color-mint-light)] rounded-full opacity-50 animate-twinkle delay-600" />
    <div className="absolute bottom-28 right-[28%] w-1.5 h-1.5 bg-[var(--color-spark)] rounded-full opacity-55 animate-sparkle delay-300" />
    <div className="absolute top-36 left-[45%] w-1 h-1 bg-[var(--color-spark-light)] rounded-full opacity-70 animate-twinkle delay-500" />
  </div>
);

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeClick = (type: QuestionType) => {
    setSelectedType(type);
    setShowQuestion(true);
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

  const firstRowTypes = QUESTION_TYPES.slice(0, 5);
  const secondRowTypes = QUESTION_TYPES.slice(5, 10);
  const thirdRowTypes = QUESTION_TYPES.slice(10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-cream)]/90 border-b border-[var(--color-spark)]/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <SparklingLogo />
            <span className="text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              ENG-SPARKLING
            </span>
          </Link>
          {loading ? (
            <div className="w-24 h-8 bg-[var(--color-cream-dark)] rounded-full animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link href="/workflow" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
                문제 생성
              </Link>
              <Link href="/archive" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-spark)] transition-colors">
                저장함
              </Link>
              <div className="h-6 w-px bg-[var(--color-spark)]/20" />
              <CoinDisplay showLabel showChargeButton />
              <AuthButton />
            </div>
          ) : (
            <Link href="/login" className="btn-ghost text-sm">
              로그인 / 회원가입
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <SparklingParticles />

        {/* Background decorative elements - Fresh cyan gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-spark)]/8 via-[var(--color-spark-light)]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[var(--color-mint)]/6 to-transparent rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="animate-fade-in-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-paper)] border border-[var(--color-spark)]/20 text-sm text-[var(--color-text-muted)] mb-8 shadow-sm">
              <span className="w-2 h-2 bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] rounded-full animate-pulse" />
              AI-Powered English Question Generator
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-ink)] mb-6 leading-tight animate-fade-in-up">
            AI로 만드는<br />
            <span className="text-gradient-spark">실전 영어 모의고사</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
            수능 영어 13유형을 1분 만에 생성하세요.<br className="hidden md:block" />
            지문만 입력하면 AI가 정교한 문제를 만들어 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            {user ? (
              <Link href="/workflow" className="btn-spark">
                문제 생성하기
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-spark">
                  무료로 시작하기
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <span className="text-sm text-[var(--color-text-light)]">
                  첫 달 무료 체험
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Demo Passage Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)] mb-3">
              예시 지문으로 체험해보세요
            </h2>
            <p className="text-[var(--color-text-muted)]">
              {DEMO_PASSAGE.title}
            </p>
          </div>

          <div className="passage-card animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-gradient-to-r from-[var(--color-spark)] to-[var(--color-mint)] text-white text-xs font-medium rounded-full">
                SAMPLE
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">
                수능 영어 독해 지문
              </span>
            </div>
            <p className="text-[var(--color-text)] leading-relaxed text-justify font-body">
              {DEMO_PASSAGE.content}
            </p>
          </div>
        </div>
      </section>

      {/* Try Our Features Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-[var(--color-cream-dark)]/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[var(--color-spark)] font-semibold text-sm tracking-wide uppercase mb-3 block">
              Try Our Features
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-ink)] mb-3">
              문제 유형을 선택하세요
            </h2>
            <p className="text-[var(--color-text-muted)]">
              클릭하면 AI가 생성한 문제를 바로 확인할 수 있습니다
            </p>
          </div>

          {/* Question Type Pills */}
          <div className="space-y-4">
            {/* First Row */}
            <div className="flex flex-wrap justify-center gap-3">
              {firstRowTypes.map((typeInfo, index) => (
                <button
                  key={typeInfo.type}
                  onClick={() => handleTypeClick(typeInfo.type)}
                  className={`type-pill ${selectedType === typeInfo.type ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="icon">{typeInfo.icon}</span>
                  {typeInfo.label}
                </button>
              ))}
            </div>

            {/* Expand/Collapse Button */}
            <div className="text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 text-[var(--color-spark-deep)] hover:text-[var(--color-spark)] text-sm font-medium transition-colors cursor-pointer"
              >
                {isExpanded ? '접기' : '더 많은 유형 보기'}
                <ChevronIcon direction={isExpanded ? "up" : "down"} />
              </button>
            </div>

            {/* Hidden Rows */}
            <div className={`space-y-3 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-wrap justify-center gap-3">
                {secondRowTypes.map((typeInfo) => (
                  <button
                    key={typeInfo.type}
                    onClick={() => handleTypeClick(typeInfo.type)}
                    className={`type-pill ${selectedType === typeInfo.type ? 'active' : ''}`}
                  >
                    <span className="icon">{typeInfo.icon}</span>
                    {typeInfo.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {thirdRowTypes.map((typeInfo) => (
                  <button
                    key={typeInfo.type}
                    onClick={() => handleTypeClick(typeInfo.type)}
                    className={`type-pill ${selectedType === typeInfo.type ? 'active' : ''}`}
                  >
                    <span className="icon">{typeInfo.icon}</span>
                    {typeInfo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated Question Display */}
      {showQuestion && selectedQuestion && selectedTypeInfo && (
        <section id="question-section" className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="question-card animate-scale-in">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-[var(--color-spark)]/10 to-[var(--color-mint)]/10 text-[var(--color-spark-deep)] rounded-full text-sm font-semibold border border-[var(--color-spark)]/20">
                      {selectedTypeInfo.icon} {selectedTypeInfo.label}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)] ml-1">
                    {selectedTypeInfo.description}
                  </span>
                </div>
                <button
                  onClick={handleCloseQuestion}
                  className="p-2 rounded-full hover:bg-[var(--color-cream-dark)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Question Content */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[var(--color-ink)] leading-relaxed">
                  {selectedQuestion.question}
                </h3>

                {/* Sentence to Insert (for INSERT_SENTENCE type) */}
                {selectedQuestion.sentenceToInsert && (
                  <div className="p-5 bg-gradient-to-r from-[var(--color-spark)]/5 to-[var(--color-mint)]/5 border border-[var(--color-spark)]/20 rounded-xl">
                    <p className="font-semibold text-[var(--color-ink)] text-sm mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[var(--color-spark)] rounded-full" />
                      주어진 문장
                    </p>
                    <p className="text-[var(--color-text)] italic">
                      {selectedQuestion.sentenceToInsert}
                    </p>
                  </div>
                )}

                {/* Modified Passage */}
                <div className="p-6 bg-[var(--color-cream)] rounded-xl border border-[var(--color-spark)]/10">
                  <p
                    className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap font-body [&>u]:underline [&>u]:decoration-[var(--color-spark)] [&>u]:decoration-2 [&>u]:underline-offset-2 [&>u]:font-medium [&>u]:text-[var(--color-spark-deep)]"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.modifiedPassage }}
                  />
                </div>

                {/* Choices */}
                <div className="space-y-3">
                  {selectedQuestion.choices.map((choice, index) => (
                    <div
                      key={index}
                      className={`choice-item ${index + 1 === selectedQuestion.answer ? 'correct' : ''}`}
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

                {/* Explanation */}
                <div className="p-6 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-ink-light)] rounded-xl text-white">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--color-spark-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    해설
                  </h4>
                  <p className="text-white/90 leading-relaxed">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why ENG-SPARKLING Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[var(--color-spark)] font-semibold text-sm tracking-wide uppercase mb-3 block">
              Why ENG-SPARKLING
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-ink)] mb-4">
              왜 ENG-SPARKLING을 써야 할까요?
            </h2>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="feature-card text-center">
              <div className="feature-icon mx-auto">
                <LightningIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-3">
                1분 내 13유형 생성
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                고성능 AI가 지문을 분석해 수능 독해 대표 13유형을 정교하게 생성하고, 변별력 있는 선지까지 함께 구성합니다.
              </p>
            </div>

            <div className="feature-card text-center">
              <div className="feature-icon mx-auto">
                <CheckIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-3">
                수능 영어에 집중
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                수능 영어영역에만 집중해, 출제 맥락과 난이도 흐름에 맞는 문항을 제공하며 서식도 자연스럽게 맞춰드립니다.
              </p>
            </div>

            <div className="feature-card text-center">
              <div className="feature-icon mx-auto">
                <LayoutIcon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-3">
                직관적인 UI
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                지문 입력, 유형 선택, 생성의 간단한 흐름으로, 처음 써도 헤매지 않고 빠르게 문항을 완성할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background - Fresh gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink)] via-[var(--color-ink-light)] to-[var(--color-ink)]" />

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-[var(--color-spark)]/15 rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-[var(--color-mint)]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[var(--color-spark)] rounded-full opacity-60 animate-sparkle" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[var(--color-mint-light)] rounded-full opacity-50 animate-sparkle delay-500" />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-[var(--color-spark-light)] rounded-full opacity-40 animate-twinkle delay-300" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            <span className="text-[var(--color-cream)]">지금 바로</span><br />
            <span className="text-gradient-spark">시작하세요</span>
          </h2>
          {user ? (
            <>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                AI가 만드는 수능 스타일 영어 문제로<br />
                효율적인 학습을 시작하세요.
              </p>
              <Link href="/workflow" className="btn-spark text-lg px-10 py-4">
                문제 생성하러 가기
              </Link>
            </>
          ) : (
            <>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                회원가입시 10개의 문제를 생성할 수 있는 코인 지급.<br />
                가입하시고 무료로 체험해보세요.
              </p>
              <Link href="/login" className="btn-spark text-lg px-10 py-4">
                무료 체험 시작하기
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-paper)] border-t border-[var(--color-spark)]/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <SparklingLogo />
              <span className="text-lg font-semibold text-[var(--color-ink)]">
                ENG-SPARKLING
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-[var(--color-text-muted)]">
              <a href="#" className="hover:text-[var(--color-spark)] transition-colors">이용약관</a>
              <a href="#" className="hover:text-[var(--color-spark)] transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-[var(--color-spark)] transition-colors">문의하기</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[var(--color-spark)]/10 text-center text-sm text-[var(--color-text-light)]">
            <p>© 2024 ENG-SPARKLING. AI-powered English Question Generator.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
