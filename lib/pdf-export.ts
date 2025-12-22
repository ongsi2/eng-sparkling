/**
 * PDF 내보내기 유틸리티
 * 문제를 PDF 형식으로 내보내기 (한글 지원)
 * 해설 섹션이 페이지 경계에서 잘리지 않도록 처리
 *
 * 성능 최적화: 동적 임포트로 초기 번들 크기 ~340KB 절감
 */

// 동적 임포트를 위한 타입 정의
type JsPDF = import('jspdf').default;
type Html2Canvas = typeof import('html2canvas').default;

// 지연 로드된 라이브러리 캐시
let jsPDFModule: typeof import('jspdf') | null = null;
let html2canvasModule: Html2Canvas | null = null;

/**
 * jsPDF 동적 로드
 */
async function getJsPDF(): Promise<typeof import('jspdf').default> {
  if (!jsPDFModule) {
    jsPDFModule = await import('jspdf');
  }
  return jsPDFModule.default;
}

/**
 * html2canvas 동적 로드
 */
async function getHtml2Canvas(): Promise<Html2Canvas> {
  if (!html2canvasModule) {
    const module = await import('html2canvas');
    html2canvasModule = module.default;
  }
  return html2canvasModule;
}

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

// PDF 상수
const PDF_WIDTH = 210; // A4 width in mm
const PDF_HEIGHT = 297; // A4 height in mm
const MARGIN = 10; // 여백 mm
const USABLE_HEIGHT = PDF_HEIGHT - (MARGIN * 2); // 사용 가능한 높이

/**
 * HTML 요소를 캔버스로 변환
 */
async function htmlToCanvas(htmlContent: string): Promise<HTMLCanvasElement> {
  const html2canvas = await getHtml2Canvas();

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
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    return canvas;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 캔버스 높이를 mm로 변환
 */
function canvasHeightToMM(canvas: HTMLCanvasElement): number {
  return (canvas.height * PDF_WIDTH) / canvas.width;
}

/**
 * 스마트 PDF 생성 - 해설 섹션이 페이지 경계에서 잘리지 않도록 처리
 */
async function createSmartPDF(
  sections: { html: string; type: 'header' | 'question' | 'explanation' | 'footer' }[],
  fileName: string
): Promise<void> {
  const jsPDF = await getJsPDF();
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = MARGIN;
  let isFirstPage = true;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const canvas = await htmlToCanvas(section.html);
    const imgHeight = canvasHeightToMM(canvas);

    // 해설 섹션이 현재 페이지에 안 들어가면 새 페이지로
    if (section.type === 'explanation') {
      const remainingSpace = PDF_HEIGHT - currentY - MARGIN;
      if (imgHeight > remainingSpace) {
        // 해설 섹션 전체가 안 들어가면 새 페이지로
        pdf.addPage();
        currentY = MARGIN;
      }
    }

    // 일반 섹션도 현재 페이지에 안 들어가면 새 페이지로 (해설 외)
    if (section.type !== 'explanation') {
      const remainingSpace = PDF_HEIGHT - currentY - MARGIN;
      if (imgHeight > remainingSpace && currentY > MARGIN + 10) {
        pdf.addPage();
        currentY = MARGIN;
      }
    }

    // 이미지가 페이지보다 크면 분할해서 추가
    if (imgHeight > USABLE_HEIGHT) {
      // 큰 섹션은 여러 페이지에 걸쳐 추가
      let heightLeft = imgHeight;
      let sourceY = 0;

      while (heightLeft > 0) {
        const availableHeight = isFirstPage && currentY === MARGIN
          ? USABLE_HEIGHT
          : PDF_HEIGHT - currentY - MARGIN;

        const sliceHeight = Math.min(heightLeft, availableHeight);

        // 캔버스에서 해당 부분만 잘라서 새 캔버스 생성
        const sliceCanvas = document.createElement('canvas');
        const sourceHeightPx = (sliceHeight / imgHeight) * canvas.height;
        const sourceYPx = (sourceY / imgHeight) * canvas.height;

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeightPx;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceYPx, canvas.width, sourceHeightPx,
            0, 0, canvas.width, sourceHeightPx
          );
        }

        pdf.addImage(
          sliceCanvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          currentY,
          PDF_WIDTH,
          sliceHeight
        );

        heightLeft -= sliceHeight;
        sourceY += sliceHeight;

        if (heightLeft > 0) {
          pdf.addPage();
          currentY = MARGIN;
        } else {
          currentY += sliceHeight;
        }
      }
    } else {
      // 작은 섹션은 그대로 추가
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        currentY,
        PDF_WIDTH,
        imgHeight
      );
      currentY += imgHeight;
    }

    isFirstPage = false;
  }

  pdf.save(fileName);
}

/**
 * 기존 방식 - HTML 요소를 생성하고 PDF로 변환 (하위 호환)
 */
async function createPDFFromHTML(
  htmlContent: string,
  fileName: string
): Promise<void> {
  const jsPDF = await getJsPDF();
  const canvas = await htmlToCanvas(htmlContent);
  const imgHeight = canvasHeightToMM(canvas);

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
    PDF_WIDTH,
    imgHeight
  );
  heightLeft -= PDF_HEIGHT;

  // 추가 페이지 (필요시)
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.95),
      'JPEG',
      0,
      position,
      PDF_WIDTH,
      imgHeight
    );
    heightLeft -= PDF_HEIGHT;
  }

  pdf.save(fileName);
}

/**
 * 문제 본문 HTML 생성 (해설 제외)
 */
function generateQuestionBodyHTML(
  question: Question,
  index: number,
  includeAnswer: boolean
): string {
  const answerStyle = includeAnswer
    ? `background: #dcfce7; border-color: #10b981;`
    : '';

  return `
    <div style="margin-bottom: 20px;">
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
    </div>
  `;
}

/**
 * 해설 HTML 생성
 */
function generateExplanationHTML(question: Question): string {
  return `
    <div style="background: #0f172a; color: white; padding: 20px; border-radius: 12px; margin-bottom: 40px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="color: #22d3ee;">💡</span>
        <span style="font-weight: 600;">해설</span>
      </div>
      <p style="margin: 0; color: rgba(255,255,255,0.9); line-height: 1.7;">
        ${question.explanation}
      </p>
    </div>
  `;
}

/**
 * 문제 HTML 생성 (기존 호환 - 해설 포함)
 */
function generateQuestionHTML(
  question: Question,
  index: number,
  includeAnswer: boolean
): string {
  return `
    <div style="margin-bottom: 40px;">
      ${generateQuestionBodyHTML(question, index, includeAnswer)}
      ${includeAnswer ? generateExplanationHTML(question) : ''}
    </div>
  `;
}

/**
 * 문제를 PDF로 내보내기 (스마트 페이지 처리)
 */
export async function exportQuestionToPDF(
  question: Question,
  includeAnswer: boolean = false
): Promise<void> {
  const fileName = `eng-sparkling-${question.type.toLowerCase()}-${Date.now()}.pdf`;

  // 헤더 HTML
  const headerHTML = `
    <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #06b6d4;">
      <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">
        ENG-SPARKLING
      </h1>
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        AI 영어 문제 자동 생성
      </p>
    </div>
  `;

  // 스마트 PDF 생성 - 헤더+문제를 함께, 해설만 별도 처리
  const sections: { html: string; type: 'header' | 'question' | 'explanation' | 'footer' }[] = [
    {
      type: 'question',
      html: headerHTML + generateQuestionBodyHTML(question, 0, includeAnswer)
    }
  ];

  // 해설 포함 시 별도 섹션으로 추가 (페이지 넘김 처리)
  if (includeAnswer) {
    sections.push({
      type: 'explanation',
      html: generateExplanationHTML(question)
    });
  }

  sections.push({
    type: 'footer',
    html: `
      <div style="text-align: center; color: #94a3b8; font-size: 11px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        Generated by ENG-SPARKLING | ${new Date().toLocaleDateString('ko-KR')}
      </div>
    `
  });

  await createSmartPDF(sections, fileName);
}

/**
 * 여러 문제를 PDF로 내보내기 (스마트 페이지 처리)
 */
export async function exportQuestionsToPDF(
  questions: Question[],
  includeAnswer: boolean = false,
  title: string = 'ENG-SPARKLING 문제집'
): Promise<void> {
  const fileName = `eng-sparkling-workbook-${Date.now()}.pdf`;

  // 헤더 HTML
  const headerHTML = `
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
        ${title}
      </h1>
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        총 ${questions.length}문제 | ${new Date().toLocaleDateString('ko-KR')}
      </p>
      <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #06b6d4, #10b981); margin: 20px auto 0; border-radius: 2px;"></div>
    </div>
  `;

  // 스마트 PDF 생성 - 헤더는 첫 문제와 함께, 해설만 별도 처리
  const sections: { html: string; type: 'header' | 'question' | 'explanation' | 'footer' }[] = [];

  // 각 문제를 개별 섹션으로 추가 (첫 문제는 헤더와 함께)
  questions.forEach((question, index) => {
    sections.push({
      type: 'question',
      html: index === 0
        ? headerHTML + generateQuestionBodyHTML(question, index, includeAnswer)
        : generateQuestionBodyHTML(question, index, includeAnswer)
    });

    // 해설 포함 시 별도 섹션으로 추가 (페이지 넘김 처리)
    if (includeAnswer) {
      sections.push({
        type: 'explanation',
        html: generateExplanationHTML(question)
      });
    }
  });

  sections.push({
    type: 'footer',
    html: `
      <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        Generated by ENG-SPARKLING | ${new Date().toLocaleDateString('ko-KR')}
      </div>
    `
  });

  await createSmartPDF(sections, fileName);
}
