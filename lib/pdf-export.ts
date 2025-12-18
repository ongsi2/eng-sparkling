/**
 * PDF 내보내기 유틸리티
 * 문제를 PDF 형식으로 내보내기 (한글 지원)
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Question 타입 정의
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

const choiceLabels = ['①', '②', '③', '④', '⑤'];

/**
 * HTML 요소를 생성하고 PDF로 변환
 */
async function createPDFFromHTML(
  htmlContent: string,
  fileName: string
): Promise<void> {
  // 임시 컨테이너 생성
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 794px;
    padding: 40px;
    background: white;
    font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1e293b;
  `;
  document.body.appendChild(container);

  try {
    // html2canvas로 캡처
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // PDF 생성
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    // 첫 페이지
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // 추가 페이지 (필요시)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 문제 HTML 생성
 */
function generateQuestionHTML(
  question: Question,
  index: number,
  includeAnswer: boolean
): string {
  const answerStyle = includeAnswer
    ? `background: #dcfce7; border-color: #10b981;`
    : '';

  return `
    <div style="margin-bottom: 40px; page-break-inside: avoid;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="background: linear-gradient(135deg, #06b6d4, #10b981); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          Q${index + 1}
        </span>
        <span style="background: #f1f5f9; padding: 4px 12px; border-radius: 8px; font-size: 12px; color: #64748b;">
          ${question.typeName} | ${question.difficulty}
        </span>
      </div>

      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f172a;">
        ${question.questionText}
      </h3>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0; white-space: pre-wrap; text-align: justify;">
          ${question.passage}
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        ${question.choices
          .map(
            (choice, i) => `
          <div style="padding: 12px 16px; margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 8px; ${
            includeAnswer && i + 1 === question.answer ? answerStyle : ''
          }">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #f1f5f9; border-radius: 50%; margin-right: 12px; font-size: 12px; font-weight: 600; color: #06b6d4;">
              ${i + 1}
            </span>
            ${choice}
            ${includeAnswer && i + 1 === question.answer ? '<span style="margin-left: 8px; color: #10b981; font-size: 12px; font-weight: 600;">✓ 정답</span>' : ''}
          </div>
        `
          )
          .join('')}
      </div>

      ${
        includeAnswer
          ? `
        <div style="background: #0f172a; color: white; padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="color: #22d3ee;">💡</span>
            <span style="font-weight: 600;">해설</span>
          </div>
          <p style="margin: 0; color: rgba(255,255,255,0.9); line-height: 1.7;">
            ${question.explanation}
          </p>
        </div>
      `
          : ''
      }
    </div>
  `;
}

/**
 * 문제를 PDF로 내보내기
 */
export async function exportQuestionToPDF(
  question: Question,
  includeAnswer: boolean = false
): Promise<void> {
  const htmlContent = `
    <div>
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #06b6d4;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">
          ENG-SPARKLING
        </h1>
        <p style="color: #64748b; margin: 0; font-size: 14px;">
          AI 영어 문제 자동 생성
        </p>
      </div>
      ${generateQuestionHTML(question, 0, includeAnswer)}
      <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        Generated by ENG-SPARKLING | ${new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  `;

  const fileName = `eng-sparkling-${question.type.toLowerCase()}-${Date.now()}.pdf`;
  await createPDFFromHTML(htmlContent, fileName);
}

/**
 * 여러 문제를 PDF로 내보내기
 */
export async function exportQuestionsToPDF(
  questions: Question[],
  includeAnswer: boolean = false,
  title: string = 'ENG-SPARKLING 문제집'
): Promise<void> {
  const questionsHTML = questions
    .map((q, i) => generateQuestionHTML(q, i, includeAnswer))
    .join('<div style="page-break-before: always;"></div>');

  const htmlContent = `
    <div>
      <div style="text-align: center; margin-bottom: 60px;">
        <h1 style="font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
          ${title}
        </h1>
        <p style="color: #64748b; margin: 0; font-size: 14px;">
          총 ${questions.length}문제 | ${new Date().toLocaleDateString('ko-KR')}
        </p>
        <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #06b6d4, #10b981); margin: 20px auto 0; border-radius: 2px;"></div>
      </div>

      ${questionsHTML}

      <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        Generated by ENG-SPARKLING | ${new Date().toLocaleDateString('ko-KR')}
      </div>
    </div>
  `;

  const fileName = `eng-sparkling-workbook-${Date.now()}.pdf`;
  await createPDFFromHTML(htmlContent, fileName);
}
