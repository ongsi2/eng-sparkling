/**
 * API Route: /api/generate
 * Generate English grammar questions using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';
import { createGrammarPrompt } from '@/lib/prompts';
import { createPrompt } from '@/lib/all-prompts';
import { GeneratedQuestion, GenerateQuestionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateQuestionRequest = await request.json();
    const { passage, questionType } = body;

    // Validation
    if (!passage || passage.trim().length === 0) {
      return NextResponse.json(
        { error: 'Passage is required' },
        { status: 400 }
      );
    }

    if (passage.length < 50) {
      return NextResponse.json(
        { error: 'Passage is too short. Minimum 50 characters required.' },
        { status: 400 }
      );
    }

    if (passage.length > 2000) {
      return NextResponse.json(
        { error: 'Passage is too long. Maximum 2000 characters allowed.' },
        { status: 400 }
      );
    }

    // Create prompt based on question type
    let prompt: string;
    try {
      prompt = createPrompt(questionType, passage);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert English teacher specializing in Korean SAT (수능) style grammar questions. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse JSON response
    const parsed = JSON.parse(responseText);

    // Validate response structure (some question types have 4 choices instead of 5)
    const expectedChoices = questionType === 'INSERT_SENTENCE' ? 4 : 5;
    if (
      !parsed.question ||
      !parsed.modifiedPassage ||
      !parsed.choices ||
      !Array.isArray(parsed.choices) ||
      parsed.choices.length !== expectedChoices ||
      typeof parsed.answer !== 'number' ||
      !parsed.explanation
    ) {
      throw new Error('Invalid response structure from AI');
    }

    // Construct response
    const result: GeneratedQuestion = {
      id: crypto.randomUUID(),
      questionType,
      question: parsed.question,
      passage,
      modifiedPassage: parsed.modifiedPassage,
      choices: parsed.choices,
      answer: parsed.answer,
      explanation: parsed.explanation,
      sentenceToInsert: parsed.sentenceToInsert,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating question:', error);

    // Handle specific errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate question',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
