/**
 * API Route: /api/generate
 * Generate English grammar questions using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';
import { createGrammarPrompt } from '@/lib/prompts';
import { createPrompt } from '@/lib/all-prompts';
import { GeneratedQuestion, GenerateQuestionRequest } from '@/types';
import { checkRateLimit, getClientIP, API_RATE_LIMITS } from '@/lib/rate-limit';
import { getDemoUsageFromRequest, incrementDemoUsage, getClientIP as getDemoClientIP } from '@/lib/demo';
import { getUserFromRequest } from '@/lib/admin';
import { logGenerate } from '@/lib/activity-logger';
import { getFromCache, saveToCache } from '@/lib/generation-cache';

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
 * 한국어 번역 제거 (예: "contains(포함하다)" -> "contains")
 */
function stripKorean(word: string): string {
  // Remove Korean text in parentheses
  return word.replace(/\([가-힣]+\)/g, '').trim();
}

interface BuildResult {
  modifiedPassage: string;
  newAnswerIndex: number;  // 1-5 (정렬 후 오답의 새 위치)
  sortedMarkers: GrammarMarker[];  // 정렬된 마커 배열
}

/**
 * Build modifiedPassage from markers array (for GRAMMAR_INCORRECT and SELECT_INCORRECT_WORD)
 * This approach is more reliable than asking AI to insert markers directly
 *
 * 핵심 개선: 마커를 지문 순서대로 정렬하여 ①②③④⑤가 읽기 순서대로 배치되도록 함
 */
function buildModifiedPassageFromMarkers(passage: string, markers: GrammarMarker[], questionType: string): BuildResult {
  if (!markers || markers.length !== 5) {
    throw new Error('Markers array must have exactly 5 items');
  }

  const useUnderline = questionType === 'SELECT_INCORRECT_WORD' || questionType === 'GRAMMAR_INCORRECT';

  // Step 1: 각 마커의 위치 찾기
  interface MarkerWithPosition {
    marker: GrammarMarker;
    originalIndex: number;
    position: number;
    foundWord: string;
  }

  const markersWithPositions: MarkerWithPosition[] = [];
  const usedPositions: number[] = [];

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    // 한국어 제거하고 검색어 목록 만들기
    const searchWords = [
      stripKorean(marker.originalWord || ''),
      stripKorean(marker.isWrong ? (marker.correctWord || '') : ''),
      stripKorean(marker.displayWord || ''),
    ].filter(w => w.length > 0);

    let foundPos = -1;
    let foundWord = '';

    for (const searchWord of searchWords) {
      if (foundPos >= 0) break;

      const exactRegex = new RegExp(`\\b${escapeRegExp(searchWord)}\\b`, 'gi');
      let match;

      while ((match = exactRegex.exec(passage)) !== null) {
        const pos = match.index;
        const overlaps = usedPositions.some(usedPos => Math.abs(pos - usedPos) < 20);
        if (!overlaps) {
          foundPos = pos;
          foundWord = match[0]; // 실제 매칭된 단어 사용
          break;
        }
      }
    }

    if (foundPos >= 0) {
      usedPositions.push(foundPos);
      markersWithPositions.push({
        marker,
        originalIndex: i,
        position: foundPos,
        foundWord,
      });
    } else {
      console.warn(`Marker ${i + 1}: Could not find words for marker, will use fallback`);
      // 나중에 fallback 처리
      markersWithPositions.push({
        marker,
        originalIndex: i,
        position: -1,
        foundWord: '',
      });
    }
  }

  // Step 2: 위치순으로 정렬 (지문에서 먼저 나오는 순서)
  const sortedMarkers = [...markersWithPositions].sort((a, b) => {
    if (a.position === -1) return 1;
    if (b.position === -1) return -1;
    return a.position - b.position;
  });

  // Step 3: 정렬된 순서대로 ①②③④⑤ 할당하여 교체
  const markerSymbols = ['①', '②', '③', '④', '⑤'];
  let modifiedPassage = passage;

  // 뒤에서부터 교체해야 위치가 밀리지 않음
  const sortedByPosDesc = [...sortedMarkers]
    .map((m, sortedIndex) => ({ ...m, symbol: markerSymbols[sortedIndex] }))
    .filter(m => m.position >= 0)
    .sort((a, b) => b.position - a.position);

  for (const item of sortedByPosDesc) {
    const displayWord = stripKorean(item.marker.displayWord || item.foundWord);
    const replaceRegex = new RegExp(`\\b${escapeRegExp(item.foundWord)}\\b`, 'i');

    const replacement = useUnderline
      ? `${item.symbol}<u>${displayWord}</u>`
      : `${displayWord}${item.symbol}`;

    modifiedPassage = modifiedPassage.replace(replaceRegex, replacement);
  }

  // Step 4: 찾지 못한 마커들 fallback 처리
  const usedSymbols = sortedByPosDesc.map(m => m.symbol);
  const remainingSymbols = markerSymbols.filter(s => !usedSymbols.includes(s));

  if (remainingSymbols.length > 0) {
    const words = modifiedPassage.match(/\b[a-zA-Z]{4,}\b/g) || [];
    const usedWords = new Set(sortedByPosDesc.map(m => m.foundWord.toLowerCase()));

    for (const symbol of remainingSymbols) {
      for (const word of words) {
        if (!usedWords.has(word.toLowerCase()) && !modifiedPassage.includes(`${symbol}<u>`)) {
          usedWords.add(word.toLowerCase());
          const replacement = useUnderline ? `${symbol}<u>${word}</u>` : `${word}${symbol}`;
          modifiedPassage = modifiedPassage.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`), replacement);
          console.warn(`Fallback: assigned ${symbol} to "${word}"`);
          break;
        }
      }
    }
  }

  // Step 5: 오답 마커의 새 위치 찾기
  let newAnswerIndex = 1;
  for (let i = 0; i < sortedMarkers.length; i++) {
    if (sortedMarkers[i].marker.isWrong) {
      newAnswerIndex = i + 1;  // 1-indexed
      break;
    }
  }

  // 정렬된 마커 배열 (displayWord에서 한국어 제거)
  const cleanedSortedMarkers = sortedMarkers.map(m => ({
    ...m.marker,
    displayWord: stripKorean(m.marker.displayWord || ''),
  }));

  return {
    modifiedPassage,
    newAnswerIndex,
    sortedMarkers: cleanedSortedMarkers,
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 체크
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(
      `generate:${clientIP}`,
      API_RATE_LIMITS.generateQuestion
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

    // Parse request body
    const body: GenerateQuestionRequest & { demo?: boolean } = await request.json();
    const { passage, questionType, demo } = body;

    // Demo mode: check IP-based usage limit
    if (demo) {
      const demoUsage = await getDemoUsageFromRequest(request);
      if (!demoUsage.canUse) {
        return NextResponse.json(
          {
            error: '데모 사용 횟수를 모두 소진했습니다. 로그인하시면 더 많은 문제를 생성할 수 있습니다.',
            errorCode: 'DEMO_LIMIT_EXCEEDED',
            remaining: 0,
          },
          { status: 403 }
        );
      }
    }

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

    // 캐시 입력 데이터 (지문은 공백 정규화)
    const normalizedPassage = passage.trim().replace(/\s+/g, ' ');
    const cacheInput = {
      passage: normalizedPassage,
      questionType,
    };

    // 캐시에서 먼저 확인
    const cacheResult = await getFromCache<GeneratedQuestion>('question', cacheInput);
    if (cacheResult.hit) {
      // Demo mode: 캐시 히트도 사용 횟수에 포함
      if (demo) {
        const ip = getDemoClientIP(request);
        await incrementDemoUsage(ip);
      }

      // 활동 로그 (캐시에서)
      const user = await getUserFromRequest(request);
      if (user) {
        logGenerate(user.id, questionType, request, true).catch(() => {});
      }

      return NextResponse.json({
        ...cacheResult.data,
        cached: true, // 클라이언트에게 캐시된 결과임을 알림
      });
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

        // Check if AI returned an error (e.g., passage not suitable for this question type)
        if (parsed.error) {
          const errorMessages: Record<string, string> = {
            'NO_SUITABLE_EXPRESSION': '이 지문에는 밑줄의 의미형 문제에 적합한 관용구나 비유적 표현이 없습니다. 다른 문제 유형을 선택해주세요.',
          };
          const message = errorMessages[parsed.error] || parsed.message || '이 지문은 해당 문제 유형에 적합하지 않습니다.';
          return NextResponse.json(
            { error: message, errorCode: parsed.error },
            { status: 400 }
          );
        }

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
            const buildResult = buildModifiedPassageFromMarkers(passage, parsed.markers, questionType);
            parsed.modifiedPassage = buildResult.modifiedPassage;
            parsed.answer = buildResult.newAnswerIndex;  // 정렬된 순서 기준 정답
            parsed.markers = buildResult.sortedMarkers;  // 정렬된 마커로 교체
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
            // For vocabulary, choices are the displayWords (정렬된 순서)
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

    // Demo mode: increment usage after successful generation
    if (demo) {
      const ip = getDemoClientIP(request);
      await incrementDemoUsage(ip);
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

    // Log activity for logged-in users (non-blocking)
    if (!demo) {
      const user = await getUserFromRequest(request);
      if (user) {
        logGenerate(request, user.id, questionType, true).catch(err => {
          console.error('Failed to log generate activity:', err);
        });
      }
    }

    // 캐시에 저장 (비동기, 에러 무시)
    saveToCache('question', cacheInput, result).catch(() => {});

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
