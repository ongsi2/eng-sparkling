/**
 * Generation Cache - API 비용 절감을 위한 캐싱 시스템
 * 동일한 입력에 대한 생성 결과를 캐싱하여 재사용
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 서비스 역할 클라이언트 (RLS 우회)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type CacheType = 'article' | 'question';

interface CacheEntry<T> {
  id: string;
  cache_key: string;
  cache_type: CacheType;
  input_data: Record<string, unknown>;
  output_data: T;
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
  expires_at: string;
}

/**
 * 입력값으로 캐시 키 생성
 */
export function generateCacheKey(
  cacheType: CacheType,
  inputData: Record<string, unknown>
): string {
  // 입력값을 정렬된 JSON으로 변환 후 해시
  const sortedInput = JSON.stringify(inputData, Object.keys(inputData).sort());
  const hash = crypto.createHash('sha256').update(sortedInput).digest('hex');
  return `${cacheType}:${hash.slice(0, 32)}`;
}

/**
 * 캐시에서 결과 조회
 */
export async function getFromCache<T>(
  cacheType: CacheType,
  inputData: Record<string, unknown>
): Promise<{ hit: true; data: T } | { hit: false }> {
  try {
    const cacheKey = generateCacheKey(cacheType, inputData);

    const { data, error } = await supabaseAdmin
      .from('generation_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { hit: false };
    }

    // 캐시 히트 카운트 업데이트 (비동기, 에러 무시)
    supabaseAdmin.rpc('update_cache_hit', { p_cache_key: cacheKey }).then(
      () => {},
      () => {}
    );

    console.log(`[Cache HIT] ${cacheType} - key: ${cacheKey.slice(0, 20)}... (hits: ${data.hit_count + 1})`);

    return {
      hit: true,
      data: data.output_data as T,
    };
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return { hit: false };
  }
}

/**
 * 결과를 캐시에 저장
 */
export async function saveToCache<T>(
  cacheType: CacheType,
  inputData: Record<string, unknown>,
  outputData: T,
  ttlDays: number = 7
): Promise<boolean> {
  try {
    const cacheKey = generateCacheKey(cacheType, inputData);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const { error } = await supabaseAdmin
      .from('generation_cache')
      .upsert({
        cache_key: cacheKey,
        cache_type: cacheType,
        input_data: inputData,
        output_data: outputData,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'cache_key',
      });

    if (error) {
      console.error('[Cache] Error saving to cache:', error);
      return false;
    }

    console.log(`[Cache SAVE] ${cacheType} - key: ${cacheKey.slice(0, 20)}...`);
    return true;
  } catch (error) {
    console.error('[Cache] Error saving to cache:', error);
    return false;
  }
}

/**
 * 캐시 통계 조회 (관리자용)
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalHits: number;
  byType: Record<CacheType, { count: number; hits: number }>;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('generation_cache')
      .select('cache_type, hit_count');

    if (error || !data) {
      return {
        totalEntries: 0,
        totalHits: 0,
        byType: {
          article: { count: 0, hits: 0 },
          question: { count: 0, hits: 0 },
        },
      };
    }

    const stats = {
      totalEntries: data.length,
      totalHits: data.reduce((sum, entry) => sum + (entry.hit_count || 0), 0),
      byType: {
        article: { count: 0, hits: 0 },
        question: { count: 0, hits: 0 },
      } as Record<CacheType, { count: number; hits: number }>,
    };

    data.forEach((entry) => {
      const type = entry.cache_type as CacheType;
      if (stats.byType[type]) {
        stats.byType[type].count++;
        stats.byType[type].hits += entry.hit_count || 0;
      }
    });

    return stats;
  } catch (error) {
    console.error('[Cache] Error getting stats:', error);
    return {
      totalEntries: 0,
      totalHits: 0,
      byType: {
        article: { count: 0, hits: 0 },
        question: { count: 0, hits: 0 },
      },
    };
  }
}
