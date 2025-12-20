'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'article-1', title: '제1조 (목적)' },
  { id: 'article-2', title: '제2조 (정의)' },
  { id: 'article-3', title: '제3조 (약관의 효력 및 변경)' },
  { id: 'article-4', title: '제4조 (서비스의 제공)' },
  { id: 'article-5', title: '제5조 (회원 가입)' },
  { id: 'article-6', title: '제6조 (코인 및 결제)' },
  { id: 'article-7', title: '제7조 (이용자의 의무)' },
  { id: 'article-8', title: '제8조 (서비스의 중단)' },
  { id: 'article-9', title: '제9조 (면책사항)' },
  { id: 'article-10', title: '제10조 (저작권)' },
  { id: 'article-11', title: '제11조 (분쟁 해결)' },
];

export default function TermsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Formal Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">E</span>
              </div>
              <span className="font-semibold tracking-wide">ENG-SPARKLING</span>
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              돌아가기
            </button>
          </div>
        </div>
      </header>

      {/* Document Title Section */}
      <div className="bg-slate-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm tracking-widest uppercase mb-3">Legal Document</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">서비스 이용약관</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span>문서번호: TOS-2025-001</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>시행일: 2025년 1월 1일</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>버전: 1.0</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">목차</h3>
              <nav className="space-y-1">
                {sections.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block py-2 px-3 text-sm rounded-lg transition-all ${
                      activeSection === id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {title}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Document Header */}
              <div className="border-b border-slate-200 px-8 py-6 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">ENG-SPARKLING 서비스 이용약관</h2>
                    <p className="text-sm text-slate-500 mt-1">AI 기반 영어 문제 자동 생성 서비스</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>최종 수정: 2025.01.01</p>
                  </div>
                </div>
              </div>

              {/* Document Body */}
              <div className="px-8 py-8 space-y-10 text-slate-700 leading-relaxed">
                {/* 제1조 */}
                <section id="article-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">1</span>
                    목적
                  </h3>
                  <p className="text-slate-600 pl-11">
                    이 약관은 ENG-SPARKLING(이하 "서비스")이 제공하는 AI 기반 영어 문제 생성 서비스의 이용과 관련하여
                    서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                {/* 제2조 */}
                <section id="article-2" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">2</span>
                    정의
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.1</span>
                      <p className="text-slate-600">"서비스"란 ENG-SPARKLING이 제공하는 AI 영어 문제 자동 생성 플랫폼을 의미합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.2</span>
                      <p className="text-slate-600">"이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.3</span>
                      <p className="text-slate-600">"회원"이란 서비스에 가입하여 계정을 보유한 자를 말합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.4</span>
                      <p className="text-slate-600">"코인"이란 서비스 내에서 문제 생성 등에 사용되는 가상의 결제 수단을 말합니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제3조 */}
                <section id="article-3" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">3</span>
                    약관의 효력 및 변경
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">3.1</span>
                      <p className="text-slate-600">이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">3.2</span>
                      <p className="text-slate-600">서비스는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">3.3</span>
                      <p className="text-slate-600">약관이 변경되는 경우 서비스는 변경 내용을 시행일 7일 전부터 공지합니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제4조 */}
                <section id="article-4" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">4</span>
                    서비스의 제공
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">서비스는 다음과 같은 기능을 제공합니다:</p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.1</span>
                      <p className="text-slate-600">AI 기반 영어 지문(아티클) 생성</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.2</span>
                      <p className="text-slate-600">12가지 유형의 영어 문제 자동 생성</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.3</span>
                      <p className="text-slate-600">생성된 문제의 저장 및 관리</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.4</span>
                      <p className="text-slate-600">PDF 내보내기 기능</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.5</span>
                      <p className="text-slate-600">기타 서비스가 정하는 부가 서비스</p>
                    </div>
                  </div>
                </section>

                {/* 제5조 */}
                <section id="article-5" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">5</span>
                    회원 가입
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">5.1</span>
                      <p className="text-slate-600">회원 가입은 Google 계정을 통한 소셜 로그인으로 진행됩니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">5.2</span>
                      <p className="text-slate-600">회원 가입 시 이 약관과 개인정보처리방침에 동의한 것으로 간주합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">5.3</span>
                      <p className="text-slate-600">만 14세 미만의 아동은 법정대리인의 동의를 받아 회원 가입할 수 있습니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제6조 */}
                <section id="article-6" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">6</span>
                    코인 및 결제
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">6.1</span>
                      <p className="text-slate-600">서비스 이용을 위해 코인을 구매할 수 있으며, 결제는 Toss Payments를 통해 처리됩니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">6.2</span>
                      <p className="text-slate-600">구매한 코인은 문제 생성 등 서비스 이용에 사용됩니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">6.3</span>
                      <p className="text-slate-600">코인의 유효기간은 구매일로부터 1년입니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">6.4</span>
                      <p className="text-slate-600">환불은 전자상거래법에 따라 구매 후 7일 이내 미사용 코인에 한해 가능합니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제7조 */}
                <section id="article-7" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">7</span>
                    이용자의 의무
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">이용자는 다음 행위를 하여서는 안 됩니다:</p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">7.1</span>
                      <p className="text-slate-600">타인의 계정을 도용하거나 부정 사용하는 행위</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">7.2</span>
                      <p className="text-slate-600">서비스를 영리 목적으로 무단 복제, 배포하는 행위</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">7.3</span>
                      <p className="text-slate-600">서비스의 운영을 방해하거나 시스템에 부하를 주는 행위</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">7.4</span>
                      <p className="text-slate-600">생성된 콘텐츠를 불법적인 목적으로 사용하는 행위</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">7.5</span>
                      <p className="text-slate-600">기타 관련 법령에 위반되는 행위</p>
                    </div>
                  </div>
                </section>

                {/* 제8조 */}
                <section id="article-8" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">8</span>
                    서비스의 중단
                  </h3>
                  <p className="text-slate-600 pl-11">
                    서비스는 시스템 점검, 장비 교체, 천재지변 등 불가피한 사유가 있는 경우
                    서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.
                    이 경우 사전에 공지하며, 부득이한 경우 사후에 공지할 수 있습니다.
                  </p>
                </section>

                {/* 제9조 */}
                <section id="article-9" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">9</span>
                    면책사항
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.1</span>
                      <p className="text-slate-600">서비스는 AI가 생성한 콘텐츠의 정확성을 보장하지 않습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.2</span>
                      <p className="text-slate-600">이용자가 생성한 콘텐츠의 사용에 따른 책임은 이용자에게 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.3</span>
                      <p className="text-slate-600">서비스는 이용자 간 또는 이용자와 제3자 간의 분쟁에 대해 책임지지 않습니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제10조 */}
                <section id="article-10" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">10</span>
                    저작권
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">10.1</span>
                      <p className="text-slate-600">서비스가 제공하는 콘텐츠에 대한 저작권은 서비스에 귀속됩니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">10.2</span>
                      <p className="text-slate-600">이용자가 생성한 문제의 저작권은 이용자에게 귀속되며, 개인적인 용도로 자유롭게 사용할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">10.3</span>
                      <p className="text-slate-600">이용자는 서비스를 통해 생성한 콘텐츠를 상업적 목적으로 재배포할 수 없습니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제11조 */}
                <section id="article-11" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">11</span>
                    분쟁 해결
                  </h3>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">11.1</span>
                      <p className="text-slate-600">서비스와 이용자 간에 발생한 분쟁은 상호 협의하여 해결합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">11.2</span>
                      <p className="text-slate-600">협의가 이루어지지 않을 경우 관할 법원은 서비스 소재지 법원으로 합니다.</p>
                    </div>
                  </div>
                </section>

                {/* 부칙 */}
                <section className="pt-8 mt-8 border-t-2 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">부칙</h3>
                  <p className="text-slate-600">
                    이 약관은 <strong>2025년 1월 1일</strong>부터 시행됩니다.
                  </p>
                </section>
              </div>

              {/* Document Footer */}
              <div className="border-t border-slate-200 px-8 py-6 bg-slate-50">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <p>ENG-SPARKLING | AI 기반 영어 문제 자동 생성 서비스</p>
                  <p>Copyright 2025. All rights reserved.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
