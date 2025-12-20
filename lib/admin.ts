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
  deleted_at?: string | null;
}

export async function getUsers(
  page = 1,
  pageSize = 20,
  search?: string,
  includeDeleted = false
): Promise<{ users: AdminUser[]; total: number }> {
  const offset = (page - 1) * pageSize;

  // Build query with optional search
  let countQuery = supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  let dataQuery = supabaseAdmin.from('profiles').select('*');

  // Filter by deleted status
  if (includeDeleted) {
    // Show only deleted users
    countQuery = countQuery.not('deleted_at', 'is', null);
    dataQuery = dataQuery.not('deleted_at', 'is', null);
  } else {
    // Show only active users
    countQuery = countQuery.is('deleted_at', null);
    dataQuery = dataQuery.is('deleted_at', null);
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    countQuery = countQuery.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`);
    dataQuery = dataQuery.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`);
  }

  // Get count
  const { count } = await countQuery;

  // Get users
  const { data, error } = await dataQuery
    .order(includeDeleted ? 'deleted_at' : 'created_at', { ascending: false })
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

// Soft delete user
export async function softDeleteUser(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

// Restore soft-deleted user
export async function restoreUser(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

export async function updateUserCoins(userId: string, newBalance: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ coins: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return !error;
}

export async function addUserCoins(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  // Get current balance
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();

  const currentBalance = profile?.coins ?? 0;
  const newBalance = currentBalance + amount;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ coins: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return { success: !error, newBalance };
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

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getOrders(page = 1, pageSize = 20, filters?: OrderFilters): Promise<{ orders: AdminOrder[]; total: number }> {
  const offset = (page - 1) * pageSize;

  let countQuery = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
  let dataQuery = supabaseAdmin.from('orders').select('*');

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    countQuery = countQuery.eq('status', filters.status);
    dataQuery = dataQuery.eq('status', filters.status);
  }
  if (filters?.startDate) {
    countQuery = countQuery.gte('created_at', filters.startDate);
    dataQuery = dataQuery.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    countQuery = countQuery.lt('created_at', endDate.toISOString());
    dataQuery = dataQuery.lt('created_at', endDate.toISOString());
  }

  const { count } = await countQuery;

  const { data, error } = await dataQuery
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

// Demo Usage Management
export interface DemoUsageRecord {
  id: string;
  ip_address: string;
  usage_count: number;
  max_usage: number;
  created_at: string;
  last_used_at: string;
}

export async function getDemoUsages(page = 1, pageSize = 20, search?: string): Promise<{ usages: DemoUsageRecord[]; total: number }> {
  const offset = (page - 1) * pageSize;

  let countQuery = supabaseAdmin.from('demo_usage').select('*', { count: 'exact', head: true });
  let dataQuery = supabaseAdmin.from('demo_usage').select('*');

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    countQuery = countQuery.ilike('ip_address', searchTerm);
    dataQuery = dataQuery.ilike('ip_address', searchTerm);
  }

  const { count } = await countQuery;

  const { data, error } = await dataQuery
    .order('last_used_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching demo usages:', error);
    return { usages: [], total: 0 };
  }

  return {
    usages: data as DemoUsageRecord[],
    total: count ?? 0,
  };
}

export async function resetDemoUsage(ipAddress: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('demo_usage')
    .update({ usage_count: 0 })
    .eq('ip_address', ipAddress);

  return !error;
}

export async function deleteDemoUsage(ipAddress: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('demo_usage')
    .delete()
    .eq('ip_address', ipAddress);

  return !error;
}

// Period Stats for Dashboard
export interface PeriodStats {
  today: { users: number; revenue: number; questions: number };
  week: { users: number; revenue: number; questions: number };
  month: { users: number; revenue: number; questions: number };
}

export async function getPeriodStats(): Promise<PeriodStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Today's stats
  const { count: todayUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart);

  const { data: todayOrders } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', todayStart);

  const { count: todayQuestions } = await supabaseAdmin
    .from('archived_questions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart);

  // Week's stats
  const { count: weekUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekStart);

  const { data: weekOrders } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', weekStart);

  const { count: weekQuestions } = await supabaseAdmin
    .from('archived_questions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekStart);

  // Month's stats
  const { count: monthUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart);

  const { data: monthOrders } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', monthStart);

  const { count: monthQuestions } = await supabaseAdmin
    .from('archived_questions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart);

  return {
    today: {
      users: todayUsers ?? 0,
      revenue: todayOrders?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0,
      questions: todayQuestions ?? 0,
    },
    week: {
      users: weekUsers ?? 0,
      revenue: weekOrders?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0,
      questions: weekQuestions ?? 0,
    },
    month: {
      users: monthUsers ?? 0,
      revenue: monthOrders?.reduce((sum, o) => sum + (o.amount || 0), 0) ?? 0,
      questions: monthQuestions ?? 0,
    },
  };
}

// Coin Products (Pricing) Management
export interface CoinProductDB {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  popular: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getCoinProducts(): Promise<CoinProductDB[]> {
  const { data, error } = await supabaseAdmin
    .from('coin_products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching coin products:', error);
    return [];
  }

  return data as CoinProductDB[];
}

export async function createCoinProduct(product: Omit<CoinProductDB, 'id' | 'created_at' | 'updated_at'>): Promise<CoinProductDB | null> {
  const { data, error } = await supabaseAdmin
    .from('coin_products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating coin product:', error);
    return null;
  }

  return data as CoinProductDB;
}

export async function updateCoinProduct(id: string, updates: Partial<CoinProductDB>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('coin_products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function deleteCoinProduct(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('coin_products')
    .delete()
    .eq('id', id);

  return !error;
}

// Refund Management
export interface AdminRefund {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  coins: number;
  reason: string | null;
  refunded_by: string | null;
  toss_refund_key: string | null;
  created_at: string;
  processed_at: string;
  // Joined fields
  order?: AdminOrder;
  user_email?: string;
  admin_email?: string;
}

export interface RefundFilters {
  startDate?: string;
  endDate?: string;
}

export async function getRefunds(
  page = 1,
  pageSize = 20,
  filters?: RefundFilters
): Promise<{ refunds: AdminRefund[]; total: number }> {
  const offset = (page - 1) * pageSize;

  let countQuery = supabaseAdmin.from('refunds').select('*', { count: 'exact', head: true });
  let dataQuery = supabaseAdmin.from('refunds').select('*');

  if (filters?.startDate) {
    countQuery = countQuery.gte('created_at', filters.startDate);
    dataQuery = dataQuery.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    countQuery = countQuery.lt('created_at', endDate.toISOString());
    dataQuery = dataQuery.lt('created_at', endDate.toISOString());
  }

  const { count } = await countQuery;

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching refunds:', error);
    return { refunds: [], total: 0 };
  }

  return {
    refunds: data as AdminRefund[],
    total: count ?? 0,
  };
}

export interface CreateRefundInput {
  orderId: string;      // orders 테이블의 UUID
  amount: number;
  coins: number;
  reason?: string;
  tossRefundKey?: string;
  adminId: string;
}

export async function createRefund(input: CreateRefundInput): Promise<{ success: boolean; error?: string; refund?: AdminRefund }> {
  // 1. 주문 정보 확인
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', input.orderId)
    .single();

  if (orderError || !order) {
    return { success: false, error: '주문을 찾을 수 없습니다.' };
  }

  if (order.status === 'refunded') {
    return { success: false, error: '이미 환불 처리된 주문입니다.' };
  }

  if (order.status !== 'completed') {
    return { success: false, error: '완료된 주문만 환불할 수 있습니다.' };
  }

  // 2. 사용자 코인 차감
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('coins')
    .eq('id', order.user_id)
    .single();

  if (profileError) {
    return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
  }

  const newCoins = Math.max(0, (profile?.coins || 0) - input.coins);

  const { error: updateCoinsError } = await supabaseAdmin
    .from('profiles')
    .update({ coins: newCoins, updated_at: new Date().toISOString() })
    .eq('id', order.user_id);

  if (updateCoinsError) {
    return { success: false, error: '코인 차감에 실패했습니다.' };
  }

  // 3. 환불 기록 생성
  const { data: refund, error: refundError } = await supabaseAdmin
    .from('refunds')
    .insert({
      order_id: input.orderId,
      user_id: order.user_id,
      amount: input.amount,
      coins: input.coins,
      reason: input.reason || null,
      refunded_by: input.adminId,
      toss_refund_key: input.tossRefundKey || null,
    })
    .select()
    .single();

  if (refundError) {
    // 롤백: 코인 복구
    await supabaseAdmin
      .from('profiles')
      .update({ coins: profile?.coins || 0 })
      .eq('id', order.user_id);
    return { success: false, error: '환불 기록 생성에 실패했습니다.' };
  }

  // 4. 주문 상태 업데이트
  const { error: updateOrderError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'refunded' })
    .eq('id', input.orderId);

  if (updateOrderError) {
    console.error('Failed to update order status:', updateOrderError);
  }

  // 5. 크레딧 사용 내역에 환불 기록
  await supabaseAdmin.from('credit_usage_history').insert({
    user_id: order.user_id,
    amount: -input.coins,
    balance_after: newCoins,
    transaction_type: 'refund',
    reference_id: refund.id,
    description: `환불: ${input.reason || '사유 없음'}`,
  });

  return { success: true, refund: refund as AdminRefund };
}
