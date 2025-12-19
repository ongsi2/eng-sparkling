/**
 * Admin utilities
 * Check admin permissions and provide admin-specific functions
 */

import { supabaseAdmin } from './supabase-server';
import { supabase } from './supabase';
import { NextRequest } from 'next/server';

// Admin email addresses (in production, use database)
const ADMIN_EMAILS = [
  'ongsya@gmail.com',
];

/**
 * Get user from request (server-side)
 * Tries cookie-based and then token-based auth
 */
export async function getUserFromRequest(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && user) {
      return user;
    }
  }

  // Try to get Supabase session cookie
  // Supabase stores the session in a cookie with a specific format
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...val] = c.split('=');
      return [key, val.join('=')];
    })
  );

  // Look for Supabase auth cookies (format: sb-<project-ref>-auth-token)
  const authCookie = Object.entries(cookies).find(([key]) =>
    key.includes('-auth-token') || key === 'sb-access-token'
  );

  if (authCookie) {
    try {
      // The cookie value might be base64 encoded JSON
      const decoded = decodeURIComponent(authCookie[1]);
      const parsed = JSON.parse(decoded);
      const accessToken = parsed.access_token || parsed;

      if (typeof accessToken === 'string') {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
        if (!error && user) {
          return user;
        }
      }
    } catch {
      // Cookie parsing failed, try as raw token
    }
  }

  return null;
}

/**
 * Check if user is admin (client-side)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin, email')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  // Check is_admin flag or email in admin list
  return data.is_admin === true || ADMIN_EMAILS.includes(data.email || '');
}

/**
 * Check if user is admin (server-side with admin client)
 */
export async function isUserAdminServer(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, email')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Also check auth.users for email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userData?.user?.email && ADMIN_EMAILS.includes(userData.user.email)) {
      return true;
    }
    return false;
  }

  return data.is_admin === true || ADMIN_EMAILS.includes(data.email || '');
}

// Admin Dashboard Statistics
export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalOrders: number;
  totalRevenue: number;
  totalCoinsIssued: number;
  totalQuestionsGenerated: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Get total users
  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get active users today (users with activity in last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { count: activeUsersToday } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', yesterday.toISOString());

  // Get total orders and revenue
  const { data: orderStats } = await supabaseAdmin
    .from('orders')
    .select('amount, coins, status')
    .eq('status', 'completed');

  const totalOrders = orderStats?.length ?? 0;
  const totalRevenue = orderStats?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0;
  const totalCoinsIssued = orderStats?.reduce((sum, o) => sum + (o.coins || 0), 0) ?? 0;

  // Get total questions generated
  const { count: totalQuestionsGenerated } = await supabaseAdmin
    .from('archived_questions')
    .select('*', { count: 'exact', head: true });

  return {
    totalUsers: totalUsers ?? 0,
    activeUsersToday: activeUsersToday ?? 0,
    totalOrders,
    totalRevenue,
    totalCoinsIssued,
    totalQuestionsGenerated: totalQuestionsGenerated ?? 0,
  };
}

// User Management
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  coins: number;
  is_admin: boolean;
  provider?: string;
  full_name?: string;
  avatar_url?: string;
}

export async function getUsers(page = 1, pageSize = 20): Promise<{ users: AdminUser[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Get count
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get users
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }

  return {
    users: data as AdminUser[],
    total: count ?? 0,
  };
}

export async function updateUserCoins(userId: string, newBalance: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ coins: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

export async function setUserAdmin(userId: string, isAdmin: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

// Order/Payment History
export interface AdminOrder {
  id: string;
  order_id: string;
  user_id: string;
  user_email?: string;
  amount: number;
  coins: number;
  status: string;
  payment_key?: string;
  created_at: string;
  completed_at?: string;
}

export async function getOrders(page = 1, pageSize = 20): Promise<{ orders: AdminOrder[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const { count } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], total: 0 };
  }

  return {
    orders: data as AdminOrder[],
    total: count ?? 0,
  };
}

// Question Generation Logs
export interface AdminQuestionLog {
  id: string;
  user_id: string;
  user_email?: string;
  question_type: string;
  article_title?: string;
  created_at: string;
}

export async function getQuestionLogs(page = 1, pageSize = 20): Promise<{ logs: AdminQuestionLog[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const { count } = await supabaseAdmin
    .from('archived_questions')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseAdmin
    .from('archived_questions')
    .select('id, user_id, question_type, article, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching question logs:', error);
    return { logs: [], total: 0 };
  }

  const logs = data?.map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    question_type: item.question_type,
    article_title: item.article?.title,
    created_at: item.created_at,
  })) ?? [];

  return { logs, total: count ?? 0 };
}
