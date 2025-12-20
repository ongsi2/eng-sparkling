'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'article-1', title: '제1조 (수집하는 개인정보)' },
  { id: 'article-2', title: '제2조 (수집 목적)' },
  { id: 'article-3', title: '제3조 (보유 및 이용 기간)' },
  { id: 'article-4', title: '제4조 (제3자 제공)' },
  { id: 'article-5', title: '제5조 (처리 위탁)' },
  { id: 'article-6', title: '제6조 (국외 이전)' },
  { id: 'article-7', title: '제7조 (파기)' },
  { id: 'article-8', title: '제8조 (이용자의 권리)' },
  { id: 'article-9', title: '제9조 (안전성 확보 조치)' },
  { id: 'article-10', title: '제10조 (쿠키)' },
  { id: 'article-11', title: '제11조 (보호책임자)' },
  { id: 'article-12', title: '제12조 (권익침해 구제)' },
  { id: 'article-13', title: '제13조 (방침 변경)' },
];

export default function PrivacyPage() {
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
          <p className="text-slate-400 text-sm tracking-widest uppercase mb-3">Privacy Policy</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">개인정보처리방침</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-slate-400">
            <span>문서번호: PP-2025-001</span>
            <span className="hidden md:block w-1 h-1 bg-slate-600 rounded-full" />
            <span>시행일: 2025년 1월 1일</span>
            <span className="hidden md:block w-1 h-1 bg-slate-600 rounded-full" />
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
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
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
                  href="/terms"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  서비스 이용약관
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
                    <h2 className="text-xl font-semibold text-slate-900">ENG-SPARKLING 개인정보처리방침</h2>
                    <p className="text-sm text-slate-500 mt-1">개인정보 보호법 제30조에 의한 공개</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>최종 수정: 2025.01.01</p>
                  </div>
                </div>
              </div>

              {/* Introduction */}
              <div className="px-8 py-6 bg-slate-900 text-white">
                <p className="text-slate-300 leading-relaxed">
                  ENG-SPARKLING(이하 "서비스")은 이용자의 개인정보를 중요하게 생각하며,
                  「개인정보 보호법」 등 관련 법령을 준수합니다.
                  이 개인정보처리방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간 등을 안내합니다.
                </p>
              </div>

              {/* Document Body */}
              <div className="px-8 py-8 space-y-10 text-slate-700 leading-relaxed">
                {/* 제1조 */}
                <section id="article-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">1</span>
                    수집하는 개인정보 항목
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">서비스는 회원 가입 및 서비스 제공을 위해 다음 정보를 수집합니다:</p>

                  <div className="pl-11 space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        필수 항목
                      </h4>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          이메일 주소 (Google 계정 연동)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          이름 (Google 계정 프로필)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          프로필 이미지 URL
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        자동 수집 항목
                      </h4>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          IP 주소 (암호화하여 저장)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          접속 기기 정보 (User-Agent)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          서비스 이용 기록 (로그인, 문제 생성 등)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                          결제 기록
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 제2조 */}
                <section id="article-2" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">2</span>
                    개인정보의 수집 목적
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">수집된 개인정보는 다음 목적으로 사용됩니다:</p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.1</span>
                      <p className="text-slate-600"><strong className="text-slate-800">회원 관리:</strong> 회원 식별, 가입 의사 확인, 본인 확인</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.2</span>
                      <p className="text-slate-600"><strong className="text-slate-800">서비스 제공:</strong> 문제 생성, 저장, 내보내기 기능 제공</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.3</span>
                      <p className="text-slate-600"><strong className="text-slate-800">결제 처리:</strong> 코인 구매 및 결제 내역 관리</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.4</span>
                      <p className="text-slate-600"><strong className="text-slate-800">고객 지원:</strong> 문의 응대, 불만 처리, 공지사항 전달</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.5</span>
                      <p className="text-slate-600"><strong className="text-slate-800">서비스 개선:</strong> 이용 통계 분석, 서비스 품질 향상</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">2.6</span>
                      <p className="text-slate-600"><strong className="text-slate-800">법적 의무 준수:</strong> 통신비밀보호법에 따른 로그 보관</p>
                    </div>
                  </div>
                </section>

                {/* 제3조 */}
                <section id="article-3" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">3</span>
                    개인정보의 보유 및 이용 기간
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">
                    개인정보는 수집 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다:
                  </p>
                  <div className="pl-11">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">항목</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">보유 기간</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">근거 법령</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-4 py-3 text-sm text-slate-600">회원 정보</td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">탈퇴 시까지</td>
                            <td className="px-4 py-3 text-sm text-slate-500">회원 동의</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">결제 기록</td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">5년</td>
                            <td className="px-4 py-3 text-sm text-slate-500">전자상거래법</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-slate-600">접속 로그</td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">3개월</td>
                            <td className="px-4 py-3 text-sm text-slate-500">통신비밀보호법</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-600">소비자 불만/분쟁 기록</td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">3년</td>
                            <td className="px-4 py-3 text-sm text-slate-500">전자상거래법</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* 제4조 */}
                <section id="article-4" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">4</span>
                    개인정보의 제3자 제공
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">
                    서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다:
                  </p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.1</span>
                      <p className="text-slate-600">이용자가 사전에 동의한 경우</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.2</span>
                      <p className="text-slate-600">법령에 따라 요구되는 경우</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">4.3</span>
                      <p className="text-slate-600">수사 기관의 적법한 요청이 있는 경우</p>
                    </div>
                  </div>
                </section>

                {/* 제5조 */}
                <section id="article-5" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">5</span>
                    개인정보 처리 위탁
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">
                    서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다:
                  </p>
                  <div className="pl-11">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">수탁업체</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">위탁 업무</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-slate-800">Supabase</span>
                              <span className="text-slate-500 text-xs ml-2">(미국)</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">데이터베이스 호스팅, 인증 서비스</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-slate-800">Toss Payments</span>
                              <span className="text-slate-500 text-xs ml-2">(한국)</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">결제 처리</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-slate-800">OpenAI</span>
                              <span className="text-slate-500 text-xs ml-2">(미국)</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">AI 문제 생성</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-slate-800">Vercel</span>
                              <span className="text-slate-500 text-xs ml-2">(미국)</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">웹 호스팅</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* 제6조 */}
                <section id="article-6" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">6</span>
                    개인정보의 국외 이전
                  </h3>
                  <p className="text-slate-600 pl-11">
                    서비스는 클라우드 서비스 이용을 위해 개인정보가 국외로 이전될 수 있습니다.
                    이전되는 국가(미국)의 개인정보 보호 수준은 국내와 다를 수 있으나,
                    서비스는 적절한 보호 조치를 취하고 있습니다.
                  </p>
                </section>

                {/* 제7조 */}
                <section id="article-7" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">7</span>
                    개인정보의 파기
                  </h3>
                  <p className="text-slate-600 pl-11">
                    개인정보의 수집 및 이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다.
                    전자적 파일은 복구 불가능한 방법으로 삭제하고, 종이 문서는 분쇄하거나 소각합니다.
                  </p>
                </section>

                {/* 제8조 */}
                <section id="article-8" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">8</span>
                    이용자의 권리
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">이용자는 다음과 같은 권리를 행사할 수 있습니다:</p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">8.1</span>
                      <p className="text-slate-600"><strong className="text-slate-800">열람권:</strong> 본인의 개인정보 처리 현황을 열람할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">8.2</span>
                      <p className="text-slate-600"><strong className="text-slate-800">정정권:</strong> 부정확한 개인정보의 정정을 요청할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">8.3</span>
                      <p className="text-slate-600"><strong className="text-slate-800">삭제권:</strong> 개인정보의 삭제를 요청할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">8.4</span>
                      <p className="text-slate-600"><strong className="text-slate-800">처리정지권:</strong> 개인정보 처리의 정지를 요청할 수 있습니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">8.5</span>
                      <p className="text-slate-600"><strong className="text-slate-800">동의철회권:</strong> 개인정보 수집 및 이용 동의를 철회할 수 있습니다.</p>
                    </div>
                  </div>
                  <p className="text-slate-500 pl-11 mt-4 text-sm">
                    * 권리 행사는 아래 연락처로 요청하시면 지체 없이 처리해 드립니다.
                  </p>
                </section>

                {/* 제9조 */}
                <section id="article-9" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">9</span>
                    개인정보의 안전성 확보 조치
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">서비스는 개인정보의 안전성 확보를 위해 다음 조치를 취합니다:</p>
                  <div className="pl-11 space-y-3">
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.1</span>
                      <p className="text-slate-600"><strong className="text-slate-800">암호화:</strong> 비밀번호, IP 주소 등 민감 정보는 암호화하여 저장합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.2</span>
                      <p className="text-slate-600"><strong className="text-slate-800">접근 제한:</strong> 개인정보에 대한 접근 권한을 최소화합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.3</span>
                      <p className="text-slate-600"><strong className="text-slate-800">보안 프로그램:</strong> 해킹 등에 대비한 보안 시스템을 운영합니다.</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-400 font-mono text-sm">9.4</span>
                      <p className="text-slate-600"><strong className="text-slate-800">SSL 인증:</strong> 데이터 전송 시 암호화 프로토콜(HTTPS)을 사용합니다.</p>
                    </div>
                  </div>
                </section>

                {/* 제10조 */}
                <section id="article-10" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">10</span>
                    쿠키의 사용
                  </h3>
                  <p className="text-slate-600 pl-11">
                    서비스는 이용자의 편의를 위해 쿠키를 사용합니다.
                    쿠키는 로그인 상태 유지 등에 사용되며, 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
                    단, 쿠키를 거부하면 일부 서비스 이용에 제한이 있을 수 있습니다.
                  </p>
                </section>

                {/* 제11조 */}
                <section id="article-11" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">11</span>
                    개인정보 보호책임자
                  </h3>
                  <div className="pl-11">
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <p className="text-slate-600 mb-3">개인정보 관련 문의는 아래로 연락해 주시기 바랍니다:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-slate-800 font-medium">개인정보 보호책임자</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href="mailto:privacy@eng-sparkling.com" className="text-blue-600 hover:underline">privacy@eng-sparkling.com</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 제12조 */}
                <section id="article-12" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">12</span>
                    권익침해 구제방법
                  </h3>
                  <p className="text-slate-600 pl-11 mb-4">
                    개인정보 침해로 인한 피해 구제를 위해 다음 기관에 상담을 요청할 수 있습니다:
                  </p>
                  <div className="pl-11">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                        <span>개인정보 침해신고센터: <strong className="text-slate-800">(국번없이) 118</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                        <span>개인정보 분쟁조정위원회: <strong className="text-slate-800">1833-6972</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                        <span>대검찰청 사이버수사과: <strong className="text-slate-800">(국번없이) 1301</strong></span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="w-2 h-2 bg-slate-300 rounded-full" />
                        <span>경찰청 사이버안전국: <strong className="text-slate-800">(국번없이) 182</strong></span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 제13조 */}
                <section id="article-13" className="pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-slate-900 text-white text-sm rounded flex items-center justify-center">13</span>
                    개인정보처리방침 변경
                  </h3>
                  <p className="text-slate-600 pl-11">
                    이 개인정보처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될 수 있습니다.
                    변경 시 최소 7일 전에 서비스 내 공지를 통해 알려드립니다.
                  </p>
                </section>

                {/* 부칙 */}
                <section className="pt-8 mt-8 border-t-2 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">부칙</h3>
                  <p className="text-slate-600">
                    이 개인정보처리방침은 <strong>2025년 1월 1일</strong>부터 시행됩니다.
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
