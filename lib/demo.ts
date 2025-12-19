/**
 * Demo usage management utilities
 * Tracks and limits usage for non-logged-in users by IP address
 */

import { supabaseAdmin } from './supabase-server';
import { NextRequest } from 'next/server';

const MAX_DEMO_USAGE = 3; // Maximum number of free generations per IP (1 article + 2 questions)

export interface DemoUsage {
  ip_address: string;
  usage_count: number;
  max_usage: number;
  remaining: number;
  canUse: boolean;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default (for local development)
  return '127.0.0.1';
}

/**
 * Check demo usage for an IP address
 */
export async function checkDemoUsage(ip: string): Promise<DemoUsage> {
  const { data, error } = await supabaseAdmin
    .from('demo_usage')
    .select('*')
    .eq('ip_address', ip)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is fine for new users
    console.error('Error checking demo usage:', error);
  }

  if (!data) {
    // New user, hasn't used demo yet
    return {
      ip_address: ip,
      usage_count: 0,
      max_usage: MAX_DEMO_USAGE,
      remaining: MAX_DEMO_USAGE,
      canUse: true,
    };
  }

  const remaining = data.max_usage - data.usage_count;
  return {
    ip_address: data.ip_address,
    usage_count: data.usage_count,
    max_usage: data.max_usage,
    remaining: Math.max(0, remaining),
    canUse: remaining > 0,
  };
}

/**
 * Increment demo usage count for an IP
 * Returns the updated usage info
 */
export async function incrementDemoUsage(ip: string): Promise<DemoUsage> {
  // First, try to upsert the record
  const { data: existing } = await supabaseAdmin
    .from('demo_usage')
    .select('*')
    .eq('ip_address', ip)
    .single();

  if (existing) {
    // Update existing record
    const newCount = existing.usage_count + 1;
    const { error } = await supabaseAdmin
      .from('demo_usage')
      .update({
        usage_count: newCount,
        last_used_at: new Date().toISOString(),
      })
      .eq('ip_address', ip);

    if (error) {
      console.error('Error updating demo usage:', error);
    }

    const remaining = existing.max_usage - newCount;
    return {
      ip_address: ip,
      usage_count: newCount,
      max_usage: existing.max_usage,
      remaining: Math.max(0, remaining),
      canUse: remaining > 0,
    };
  } else {
    // Insert new record
    const { error } = await supabaseAdmin
      .from('demo_usage')
      .insert({
        ip_address: ip,
        usage_count: 1,
        max_usage: MAX_DEMO_USAGE,
      });

    if (error) {
      console.error('Error inserting demo usage:', error);
    }

    return {
      ip_address: ip,
      usage_count: 1,
      max_usage: MAX_DEMO_USAGE,
      remaining: MAX_DEMO_USAGE - 1,
      canUse: MAX_DEMO_USAGE - 1 > 0,
    };
  }
}

/**
 * Get demo usage without requiring authentication
 * For use in API routes
 */
export async function getDemoUsageFromRequest(request: NextRequest): Promise<DemoUsage> {
  const ip = getClientIP(request);
  return checkDemoUsage(ip);
}
