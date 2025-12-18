/**
 * API Route: /api/fetch-url
 * URL에서 아티클 본문을 추출
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { checkRateLimit, getClientIP, API_RATE_LIMITS } from '@/lib/rate-limit';

// 허용된 도메인 (보안을 위해)
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '192.168.',
  '10.',
  '172.16.',
];

function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return BLOCKED_DOMAINS.some(blocked =>
      parsed.hostname.includes(blocked) || parsed.hostname.startsWith(blocked)
    );
  } catch {
    return true;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

function estimateWordCount(text: string): number {
  // 영어 단어 수 추정
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  return englishWords.length;
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `fetch-url:${clientIP}`,
      { maxRequests: 10, windowMs: 60000 } // 분당 10회
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: '유효한 URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 차단된 도메인 체크
    if (isBlockedUrl(url)) {
      return NextResponse.json(
        { error: '해당 URL은 지원되지 않습니다.' },
        { status: 400 }
      );
    }

    // 웹 페이지 가져오기
    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(20000), // 20초 타임아웃
        redirect: 'follow',
      });
    } catch (fetchError: any) {
      console.error('Fetch failed:', fetchError);
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
        return NextResponse.json(
          { error: '요청 시간이 초과되었습니다. 다른 URL을 시도해주세요.' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: '페이지에 연결할 수 없습니다. URL을 확인해주세요.' },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `페이지를 가져올 수 없습니다. (HTTP ${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();
    console.log(`Fetched HTML length: ${html.length} chars from ${url}`);

    // Readability로 본문 추출 시도
    let article: { title: string; content: string; textContent: string } | null = null;

    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const parsed = reader.parse();
      if (parsed && parsed.textContent && parsed.textContent.length > 100) {
        article = {
          title: parsed.title || '',
          content: parsed.content || '',
          textContent: parsed.textContent || '',
        };
        console.log(`Readability extracted: ${article.textContent.length} chars`);
      }
    } catch (e) {
      console.error('Readability parsing failed:', e);
    }

    // Readability 실패 시 cheerio로 대체
    if (!article || !article.textContent || article.textContent.length < 100) {
      console.log('Falling back to cheerio extraction...');
      const $ = cheerio.load(html);

      // 불필요한 요소 제거
      $('script, style, nav, header, footer, aside, noscript, iframe, .ad, .ads, .advertisement, .sidebar, .menu, .nav, .navigation, .comment, .comments, .social, .share, .related, .recommended, [role="navigation"], [role="complementary"]').remove();

      // 제목 추출
      const title = $('h1').first().text() ||
                   $('meta[property="og:title"]').attr('content') ||
                   $('meta[name="title"]').attr('content') ||
                   $('title').text() ||
                   '제목 없음';

      // 본문 추출 시도 (여러 선택자) - 뉴스 사이트별 선택자 추가
      let content = '';
      const selectors = [
        // 일반적인 선택자
        'article',
        '[role="main"]',
        'main',
        // 뉴스 사이트 전용
        '.article-body',
        '.article-content',
        '.article__body',
        '.story-body',
        '.story-content',
        '.post-content',
        '.entry-content',
        '.news-content',
        '.body-content',
        '#article-body',
        '#story-body',
        // CNN, BBC, Reuters 등
        '.zn-body__paragraph',
        '.ssrcss-11r1m41-RichTextComponentWrapper',
        '[data-component="text-block"]',
        // 기타
        '.content',
        '.text',
        '.body',
      ];

      for (const selector of selectors) {
        const el = $(selector);
        if (el.length > 0) {
          content = el.text();
          if (content.length > 200) {
            console.log(`Found content with selector: ${selector}`);
            break;
          }
        }
      }

      // 선택자로 못 찾으면 body에서 p 태그들 추출
      if (content.length < 200) {
        console.log('Extracting from p tags...');
        const paragraphs = $('p')
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 30); // 짧은 단락 제외
        content = paragraphs.join('\n\n');
      }

      article = {
        title: cleanText(title),
        content: '',
        textContent: cleanText(content),
      };
      console.log(`Cheerio extracted: ${article.textContent.length} chars`);
    }

    const textContent = cleanText(article.textContent || '');
    const wordCount = estimateWordCount(textContent);

    if (wordCount < 50) {
      return NextResponse.json(
        { error: '추출된 본문이 너무 짧습니다. 다른 URL을 시도해주세요.' },
        { status: 400 }
      );
    }

    // 너무 긴 경우 자르기 (약 2000단어)
    let finalContent = textContent;
    if (wordCount > 2000) {
      const words = textContent.split(/\s+/);
      finalContent = words.slice(0, 2000).join(' ') + '...';
    }

    return NextResponse.json({
      success: true,
      title: cleanText(article.title || ''),
      content: finalContent,
      wordCount: Math.min(wordCount, 2000),
      sourceUrl: url,
    });

  } catch (error: any) {
    console.error('Fetch URL error:', error);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: '아티클을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
