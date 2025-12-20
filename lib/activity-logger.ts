/**
 * Activity Logger
 * Server-side utility for logging user activities
 * Table: user_activity_logs (see migrations/003_activity_logs.sql)
 *
 * IP addresses are encrypted using AES-256-GCM for privacy
 */

import { supabaseAdmin } from './supabase-server';
import { NextRequest } from 'next/server';
import { encrypt, decrypt, isEncrypted } from './encryption';

// Activity types
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'generate'
  | 'purchase'
  | 'signup'
  | 'password_reset'
  | 'profile_update';

export interface ActivityLogInput {
  userId: string;
  action: ActivityAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Get client IP from request headers
 */
export function getClientIPFromRequest(request: NextRequest | Request): string {
  const headers = request.headers;

  // Check various headers for real IP (in order of priority)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Get user agent from request headers
 */
export function getUserAgentFromRequest(request: NextRequest | Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Log a user activity
 * IP address is encrypted before storage for privacy
 */
export async function logActivity(input: ActivityLogInput): Promise<boolean> {
  try {
    // Encrypt IP address for privacy
    const encryptedIp = input.ipAddress ? encrypt(input.ipAddress) : null;

    const { error } = await supabaseAdmin
      .from('user_activity_logs')
      .insert({
        user_id: input.userId,
        action: input.action,
        ip_address: encryptedIp,
        user_agent: input.userAgent || null,
        metadata: input.metadata || {},
      });

    if (error) {
      console.error('Failed to log activity:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error logging activity:', err);
    return false;
  }
}

/**
 * Decrypt IP address for display (admin use)
 */
export function decryptIPAddress(encryptedIp: string | null): string {
  if (!encryptedIp) return 'unknown';
  return decrypt(encryptedIp);
}

/**
 * Helper: Log activity from a NextRequest
 */
export async function logActivityFromRequest(
  request: NextRequest | Request,
  userId: string,
  action: ActivityAction,
  metadata?: Record<string, any>
): Promise<boolean> {
  return logActivity({
    userId,
    action,
    ipAddress: getClientIPFromRequest(request),
    userAgent: getUserAgentFromRequest(request),
    metadata,
  });
}

/**
 * Log a login event
 */
export async function logLogin(
  request: NextRequest | Request,
  userId: string,
  provider?: string
): Promise<boolean> {
  return logActivityFromRequest(request, userId, 'login', {
    provider,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log a question generation event
 */
export async function logGenerate(
  request: NextRequest | Request,
  userId: string,
  questionType: string,
  success: boolean
): Promise<boolean> {
  return logActivityFromRequest(request, userId, 'generate', {
    questionType,
    success,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log a purchase event
 */
export async function logPurchase(
  request: NextRequest | Request,
  userId: string,
  orderId: string,
  amount: number,
  coins: number
): Promise<boolean> {
  return logActivityFromRequest(request, userId, 'purchase', {
    orderId,
    amount,
    coins,
    timestamp: new Date().toISOString(),
  });
}
