import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createArticlePrompt, ArticleRequest, ArticleResponse } from '@/lib/article-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: ArticleRequest = await request.json();
    const { keywords, difficulty, wordCount } = body;

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

    return NextResponse.json(articleData);
  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate article', details: error.message },
      { status: 500 }
    );
  }
}
