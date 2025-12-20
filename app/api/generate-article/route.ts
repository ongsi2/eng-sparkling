import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createArticlePrompt, ArticleRequest, ArticleResponse } from '@/lib/article-prompts';
import { checkRateLimit, getClientIP, API_RATE_LIMITS } from '@/lib/rate-limit';
import { checkDemoUsage, incrementDemoUsage, getClientIP as getDemoClientIP } from '@/lib/demo';
import { getFromCache, saveToCache } from '@/lib/generation-cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 체크
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `generate-article:${clientIP}`,
      API_RATE_LIMITS.generateArticle
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body: ArticleRequest & { demo?: boolean } = await request.json();
    const { keywords, difficulty, wordCount, demo = false } = body;

    // Demo mode: check usage limit
    if (demo) {
      const ip = getDemoClientIP(request);
      const usage = await checkDemoUsage(ip);

      if (!usage.canUse) {
        return NextResponse.json(
          {
            error: 'DEMO_LIMIT_EXCEEDED',
            message: '데모 사용 횟수를 모두 소진했습니다. 로그인하시면 더 많은 문제를 생성할 수 있습니다.',
            remaining: 0,
            max: usage.max_usage
          },
          { status: 403 }
        );
      }
    }

    // Validate input
    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    if (!difficulty) {
      return NextResponse.json(
        { error: 'Difficulty level is required' },
        { status: 400 }
      );
    }

    if (!wordCount || wordCount < 100 || wordCount > 1000) {
      return NextResponse.json(
        { error: 'Word count must be between 100 and 1000' },
        { status: 400 }
      );
    }

    // 캐시 입력 데이터 (정렬된 키워드 사용)
    const sortedKeywords = [...keywords].sort();
    const cacheInput = {
      keywords: sortedKeywords,
      difficulty,
      wordCount,
    };

    // 캐시에서 먼저 확인
    const cacheResult = await getFromCache<ArticleResponse>('article', cacheInput);
    if (cacheResult.hit) {
      // Demo mode: 캐시 히트도 사용 횟수에 포함
      if (demo) {
        const ip = getDemoClientIP(request);
        await incrementDemoUsage(ip);
      }

      return NextResponse.json({
        ...cacheResult.data,
        cached: true, // 클라이언트에게 캐시된 결과임을 알림
      });
    }

    // Create prompt
    const prompt = createArticlePrompt({ keywords, difficulty, wordCount });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert English content writer. Return ONLY valid JSON, no markdown, no code blocks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let articleData: ArticleResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResult = result
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      articleData = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', result);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: result },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!articleData.article || !articleData.title) {
      return NextResponse.json(
        { error: 'Invalid article response structure', details: articleData },
        { status: 500 }
      );
    }

    // Demo mode: increment usage after successful generation
    if (demo) {
      const ip = getDemoClientIP(request);
      await incrementDemoUsage(ip);
    }

    // 캐시에 저장 (비동기, 에러 무시)
    saveToCache('article', cacheInput, articleData).catch(() => {});

    return NextResponse.json(articleData);
  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate article', details: error.message },
      { status: 500 }
    );
  }
}
