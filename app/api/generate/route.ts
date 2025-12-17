/**
 * API Route: /api/generate
 * Generate English grammar questions using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';
import { createGrammarPrompt } from '@/lib/prompts';
import { createPrompt } from '@/lib/all-prompts';
import { GeneratedQuestion, GenerateQuestionRequest } from '@/types';

// Types that require all 5 markers (①②③④⑤)
const MARKER_REQUIRED_TYPES = ['GRAMMAR_INCORRECT', 'SELECT_INCORRECT_WORD'];
const REQUIRED_MARKERS = ['①', '②', '③', '④', '⑤'];
const MAX_RETRIES = 5;

interface GrammarMarker {
  position: string;
  displayWord: string;
  isWrong: boolean;
  originalWord?: string;
  correctWord?: string;  // For SELECT_INCORRECT_WORD
  grammarNote?: string;
  contextNote?: string;  // For SELECT_INCORRECT_WORD
}

/**
 * Validate that modifiedPassage contains all required markers
 */
function validateMarkers(modifiedPassage: string, questionType: string): { valid: boolean; missing: string[] } {
  if (!MARKER_REQUIRED_TYPES.includes(questionType)) {
    return { valid: true, missing: [] };
  }

  const missing = REQUIRED_MARKERS.filter(marker => !modifiedPassage.includes(marker));
  return { valid: missing.length === 0, missing };
}

/**
 * Build modifiedPassage from markers array (for GRAMMAR_INCORRECT)
 * This approach is more reliable than asking AI to insert markers directly
 */
function buildModifiedPassageFromMarkers(passage: string, markers: GrammarMarker[]): string {
  if (!markers || markers.length !== 5) {
    throw new Error('Markers array must have exactly 5 items');
  }

  let modifiedPassage = passage;
  const markerSymbols = ['①', '②', '③', '④', '⑤'];
  const usedPositions: number[] = [];

  // Process markers in order, tracking used positions
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const symbol = markerSymbols[i];

    // Try multiple search strategies
    const searchWords = [
      marker.isWrong ? marker.originalWord : null,
      marker.isWrong ? marker.correctWord : null,
      marker.displayWord,
      // Also try without word boundaries for compound words
    ].filter(Boolean) as string[];

    let foundPos = -1;
    let foundWord = '';

    for (const searchWord of searchWords) {
      if (foundPos >= 0) break;

      // Try exact match first
      const exactRegex = new RegExp(`\\b${escapeRegExp(searchWord)}\\b`, 'gi');
      let match;

      while ((match = exactRegex.exec(modifiedPassage)) !== null) {
        const pos = match.index;
        // Check if this position overlaps with already used positions
        const overlaps = usedPositions.some(usedPos =>
          Math.abs(pos - usedPos) < 20
        );
        if (!overlaps) {
          foundPos = pos;
          foundWord = searchWord;
          break;
        }
      }

      // If not found, try case-insensitive partial match
      if (foundPos === -1) {
        const partialRegex = new RegExp(escapeRegExp(searchWord), 'gi');
        while ((match = partialRegex.exec(modifiedPassage)) !== null) {
          const pos = match.index;
          const overlaps = usedPositions.some(usedPos =>
            Math.abs(pos - usedPos) < 20
          );
          if (!overlaps) {
            foundPos = pos;
            foundWord = searchWord;
            break;
          }
        }
      }
    }

    if (foundPos >= 0 && foundWord) {
      usedPositions.push(foundPos);
      // Replace at this position
      const before = modifiedPassage.substring(0, foundPos);
      const after = modifiedPassage.substring(foundPos);
      const replaceRegex = new RegExp(escapeRegExp(foundWord), 'i');
      modifiedPassage = before + after.replace(replaceRegex, `${marker.displayWord}${symbol}`);
    } else {
      // Fallback: find any suitable word near expected position
      console.warn(`Marker ${i + 1}: Could not find "${marker.displayWord}", using fallback`);

      // Find a word in the passage that hasn't been used
      const words = modifiedPassage.match(/\b[a-zA-Z]{4,}\b/g) || [];
      const targetIndex = Math.floor((i / 5) * words.length);

      for (let j = targetIndex; j < words.length; j++) {
        const word = words[j];
        const wordPos = modifiedPassage.indexOf(word);
        const overlaps = usedPositions.some(usedPos => Math.abs(wordPos - usedPos) < 20);

        if (!overlaps && wordPos >= 0) {
          usedPositions.push(wordPos);
          // Insert marker after this word
          modifiedPassage = modifiedPassage.replace(
            new RegExp(`\\b${escapeRegExp(word)}\\b`),
            `${word}${symbol}`
          );
          break;
        }
      }
    }
  }

  return modifiedPassage;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

    // Retry logic for marker-required question types
    let lastError: Error | null = null;
    let parsed: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Lower temperature on retries for more consistent output
        const temperature = attempt === 1 ? 0.7 : 0.3;

        // Add retry hint to prompt if this is a retry
        let currentPrompt = prompt;
        if (attempt > 1 && MARKER_REQUIRED_TYPES.includes(questionType)) {
          currentPrompt = prompt + `\n\n**CRITICAL REMINDER (Attempt ${attempt}):** Your response MUST include ALL 5 markers: ①, ②, ③, ④, ⑤. Each marker must appear EXACTLY ONCE in the modifiedPassage. Count them before responding!`;
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert English teacher specializing in Korean SAT (수능) style grammar questions. Always respond with valid JSON only. For questions requiring numbered markers (①②③④⑤), you MUST include ALL 5 markers in your modifiedPassage.',
            },
            {
              role: 'user',
              content: currentPrompt,
            },
          ],
          temperature,
          response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content;

        if (!responseText) {
          throw new Error('Empty response from OpenAI');
        }

        // Parse JSON response
        parsed = JSON.parse(responseText);

        // Handle GRAMMAR_INCORRECT and SELECT_INCORRECT_WORD with markers array format
        if (MARKER_REQUIRED_TYPES.includes(questionType) && parsed.markers && Array.isArray(parsed.markers)) {
          // Validate markers array
          if (parsed.markers.length !== 5) {
            console.warn(`Attempt ${attempt}: Expected 5 markers, got ${parsed.markers.length}`);
            if (attempt < MAX_RETRIES) {
              continue;
            }
            throw new Error('마커 배열에 5개 항목이 필요합니다.');
          }

          // Check that exactly one marker is wrong
          const wrongMarkers = parsed.markers.filter((m: GrammarMarker) => m.isWrong);
          if (wrongMarkers.length !== 1) {
            console.warn(`Attempt ${attempt}: Expected 1 wrong marker, got ${wrongMarkers.length}`);
            if (attempt < MAX_RETRIES) {
              continue;
            }
            throw new Error('정확히 1개의 오답 마커가 필요합니다.');
          }

          // Build modifiedPassage from markers
          try {
            parsed.modifiedPassage = buildModifiedPassageFromMarkers(passage, parsed.markers);
          } catch (markerError: any) {
            console.warn(`Attempt ${attempt}: Failed to build passage: ${markerError.message}`);
            if (attempt < MAX_RETRIES) {
              continue;
            }
            throw markerError;
          }

          // Set choices based on question type
          if (questionType === 'GRAMMAR_INCORRECT') {
            // For grammar, choices are marker symbols
            parsed.choices = ['①', '②', '③', '④', '⑤'];
          } else if (questionType === 'SELECT_INCORRECT_WORD') {
            // For vocabulary, choices are the displayWords
            parsed.choices = parsed.markers.map((m: GrammarMarker) => m.displayWord);
          }

          // Validate that all markers are in the final passage
          const markerValidation = validateMarkers(parsed.modifiedPassage, questionType);
          if (!markerValidation.valid) {
            console.warn(`Attempt ${attempt}: Missing markers after build: ${markerValidation.missing.join(', ')}`);
            if (attempt < MAX_RETRIES) {
              continue;
            }
            throw new Error(`문제 생성 실패: 마커 누락 (${markerValidation.missing.join(', ')}). 다시 시도해주세요.`);
          }
        } else {
          // Standard validation for other question types
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
        }

        // Final validation for all types
        if (!parsed.question || typeof parsed.answer !== 'number' || !parsed.explanation) {
          throw new Error('Invalid response structure from AI');
        }

        // All validations passed
        break;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }

    if (!parsed) {
      throw lastError || new Error('Failed to generate question after multiple attempts');
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
