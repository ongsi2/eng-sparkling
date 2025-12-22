-- =====================================================
-- Migration: 010_admin_stats_rpc.sql
-- Description: Admin 통계 RPC 함수 (N+1 쿼리 최적화)
-- Created: 2025-12-22
--
-- 기존: getAdminStats() 5쿼리 + getPeriodStats() 15쿼리 = 20쿼리
-- 개선: 1개 RPC 함수로 통합
-- =====================================================

-- Admin 통계 통합 RPC 함수
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_now TIMESTAMPTZ := now();
  v_today_start TIMESTAMPTZ := date_trunc('day', v_now);
  v_week_start TIMESTAMPTZ := v_now - interval '7 days';
  v_month_start TIMESTAMPTZ := date_trunc('month', v_now);
  v_yesterday TIMESTAMPTZ := v_now - interval '1 day';

  -- Overall stats
  v_total_users INTEGER;
  v_active_users_today INTEGER;
  v_total_orders INTEGER;
  v_total_revenue BIGINT;
  v_total_coins_issued BIGINT;
  v_total_questions INTEGER;

  -- Period stats
  v_today_users INTEGER;
  v_today_revenue BIGINT;
  v_today_questions INTEGER;
  v_week_users INTEGER;
  v_week_revenue BIGINT;
  v_week_questions INTEGER;
  v_month_users INTEGER;
  v_month_revenue BIGINT;
  v_month_questions INTEGER;
BEGIN
  -- 1. Overall Stats (5 queries → 1 query with subqueries)
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM profiles WHERE updated_at >= v_yesterday AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM orders WHERE status = 'completed'),
    (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed'),
    (SELECT COALESCE(SUM(coins), 0) FROM orders WHERE status = 'completed'),
    (SELECT COUNT(*) FROM archived_questions)
  INTO
    v_total_users,
    v_active_users_today,
    v_total_orders,
    v_total_revenue,
    v_total_coins_issued,
    v_total_questions;

  -- 2. Today Stats
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE created_at >= v_today_start AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed' AND created_at >= v_today_start),
    (SELECT COUNT(*) FROM archived_questions WHERE created_at >= v_today_start)
  INTO
    v_today_users,
    v_today_revenue,
    v_today_questions;

  -- 3. Week Stats
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE created_at >= v_week_start AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed' AND created_at >= v_week_start),
    (SELECT COUNT(*) FROM archived_questions WHERE created_at >= v_week_start)
  INTO
    v_week_users,
    v_week_revenue,
    v_week_questions;

  -- 4. Month Stats
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE created_at >= v_month_start AND deleted_at IS NULL),
    (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'completed' AND created_at >= v_month_start),
    (SELECT COUNT(*) FROM archived_questions WHERE created_at >= v_month_start)
  INTO
    v_month_users,
    v_month_revenue,
    v_month_questions;

  -- Build result JSON
  v_result := json_build_object(
    'overall', json_build_object(
      'totalUsers', v_total_users,
      'activeUsersToday', v_active_users_today,
      'totalOrders', v_total_orders,
      'totalRevenue', v_total_revenue,
      'totalCoinsIssued', v_total_coins_issued,
      'totalQuestionsGenerated', v_total_questions
    ),
    'period', json_build_object(
      'today', json_build_object(
        'users', v_today_users,
        'revenue', v_today_revenue,
        'questions', v_today_questions
      ),
      'week', json_build_object(
        'users', v_week_users,
        'revenue', v_week_revenue,
        'questions', v_week_questions
      ),
      'month', json_build_object(
        'users', v_month_users,
        'revenue', v_month_revenue,
        'questions', v_month_questions
      )
    ),
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$;

-- 인덱스 추가 (통계 쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_archived_questions_created_at ON archived_questions(created_at);

COMMENT ON FUNCTION get_admin_dashboard_stats IS 'Admin 대시보드 통계 조회 (N+1 쿼리 최적화)';
