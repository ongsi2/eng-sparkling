-- =====================================================
-- Migration: coin_products 테이블 생성
-- 설명: 관리자가 요금제를 동적으로 관리할 수 있는 테이블
-- 날짜: 2024-12-19
-- =====================================================

-- 요금제 테이블 생성
CREATE TABLE IF NOT EXISTS coin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 요금제 이름 (예: "스타터 패키지")
  coins INTEGER NOT NULL,                -- 기본 제공 코인
  price INTEGER NOT NULL,                -- 가격 (원)
  bonus INTEGER DEFAULT 0,               -- 보너스 코인
  popular BOOLEAN DEFAULT false,         -- 인기 상품 여부
  active BOOLEAN DEFAULT true,           -- 활성화 여부
  sort_order INTEGER DEFAULT 0,          -- 정렬 순서
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성 (정렬 및 활성화 필터링 최적화)
CREATE INDEX IF NOT EXISTS idx_coin_products_active ON coin_products(active);
CREATE INDEX IF NOT EXISTS idx_coin_products_sort ON coin_products(sort_order);

-- RLS 활성화
ALTER TABLE coin_products ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 활성화된 상품 조회 가능
CREATE POLICY "Anyone can view active products"
  ON coin_products
  FOR SELECT
  USING (active = true);

-- RLS 정책: 관리자만 모든 상품 조회 가능
CREATE POLICY "Admins can view all products"
  ON coin_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS 정책: 관리자만 상품 생성 가능
CREATE POLICY "Admins can insert products"
  ON coin_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS 정책: 관리자만 상품 수정 가능
CREATE POLICY "Admins can update products"
  ON coin_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS 정책: 관리자만 상품 삭제 가능
CREATE POLICY "Admins can delete products"
  ON coin_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 초기 요금제 데이터 (선택사항)
INSERT INTO coin_products (name, coins, price, bonus, popular, sort_order) VALUES
  ('스타터', 10, 5000, 0, false, 1),
  ('베이직', 30, 12000, 5, true, 2),
  ('프로', 100, 35000, 20, false, 3),
  ('프리미엄', 300, 90000, 60, false, 4)
ON CONFLICT DO NOTHING;
