'use client';

import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CoinIcon } from '@/app/components/CoinDisplay';
import { supabase } from '@/lib/supabase';

interface CoinProduct {
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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ProductsPage() {
  const [products, setProducts] = useState<CoinProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CoinProduct | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<CoinProduct | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    coins: '',
    price: '',
    bonus: '',
    popular: false,
    active: true,
    sort_order: '',
  });

  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      accessTokenRef.current = session?.access_token || null;
      fetchProducts();
    }
    init();
  }, []);

  async function fetchProducts() {
    if (!accessTokenRef.current) return;
    setLoading(true);
    try {
      const response = await fetch(`${basePath}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    fetchProducts();
  }

  function openCreateModal() {
    setEditingProduct(null);
    setFormData({
      name: '',
      coins: '',
      price: '',
      bonus: '0',
      popular: false,
      active: true,
      sort_order: String(products.length),
    });
    setModalOpen(true);
  }

  function openEditModal(product: CoinProduct) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      coins: String(product.coins),
      price: String(product.price),
      bonus: String(product.bonus),
      popular: product.popular,
      active: product.active,
      sort_order: String(product.sort_order),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessTokenRef.current) return;

    const payload = {
      name: formData.name,
      coins: parseInt(formData.coins),
      price: parseInt(formData.price),
      bonus: parseInt(formData.bonus) || 0,
      popular: formData.popular,
      active: formData.active,
      sort_order: parseInt(formData.sort_order) || 0,
    };

    try {
      if (editingProduct) {
        // Update
        const response = await fetch(`${basePath}/api/admin/products`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessTokenRef.current}`,
          },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });

        if (!response.ok) throw new Error('Failed to update product');
        toast.success('요금제가 수정되었습니다');
      } else {
        // Create
        const response = await fetch(`${basePath}/api/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessTokenRef.current}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create product');
        toast.success('요금제가 추가되었습니다');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    if (!productToDelete || !accessTokenRef.current) return;

    try {
      const response = await fetch(`${basePath}/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
      });

      if (!response.ok) throw new Error('Failed to delete product');

      toast.success('요금제가 삭제되었습니다');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleToggleActive(product: CoinProduct) {
    if (!accessTokenRef.current) return;

    try {
      const response = await fetch(`${basePath}/api/admin/products`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessTokenRef.current}`,
        },
        body: JSON.stringify({ id: product.id, active: !product.active }),
      });

      if (!response.ok) throw new Error('Failed to update product');
      toast.success(product.active ? '요금제가 비활성화되었습니다' : '요금제가 활성화되었습니다');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
        <h3 className="font-semibold mb-2">오류 발생</h3>
        <p>{error}</p>
        <p className="mt-4 text-sm">
          coin_products 테이블이 없을 수 있습니다. Supabase에서 아래 SQL을 실행해주세요:
        </p>
        <pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
{`CREATE TABLE coin_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  price INTEGER NOT NULL,
  bonus INTEGER DEFAULT 0,
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default products
INSERT INTO coin_products (name, coins, price, bonus, popular, sort_order) VALUES
  ('10 코인', 10, 1000, 0, false, 0),
  ('50 코인', 50, 4000, 5, true, 1),
  ('100 코인', 100, 7000, 15, false, 2);`}
        </pre>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">요금제 관리</h2>
            <p className="text-sm text-gray-500">코인 상품 {products.length}개</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-spark)] hover:bg-[var(--color-spark-deep)] rounded-lg transition-colors cursor-pointer"
            >
              + 요금제 추가
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="새로고침"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 shadow-sm text-center text-gray-500">
              등록된 요금제가 없습니다
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
                  product.popular ? 'border-[var(--color-spark)]' : 'border-transparent'
                } ${!product.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    {product.popular && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-spark)]/10 text-[var(--color-spark)]">
                        인기
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.active ? '활성' : '비활성'}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CoinIcon className="w-6 h-6" />
                    <span className="text-2xl font-bold text-gray-900">{product.coins}</span>
                    {product.bonus > 0 && (
                      <span className="text-sm text-green-600 font-medium">+{product.bonus} 보너스</span>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-[var(--color-spark)]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    코인당 {Math.round(product.price / (product.coins + product.bonus))}원
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {product.active ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => {
                      setProductToDelete(product);
                      setDeleteConfirmOpen(true);
                    }}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <CoinIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">요금제 설정 안내</h3>
              <p className="text-sm text-gray-600">
                요금제를 추가/수정/삭제할 수 있습니다. 비활성화된 요금제는 결제 페이지에 표시되지 않습니다.
                정렬 순서가 낮은 상품이 먼저 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingProduct ? '요금제 수정' : '요금제 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 50 코인"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">코인 수량</label>
                    <input
                      type="number"
                      value={formData.coins}
                      onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                      placeholder="50"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">보너스 코인</label>
                    <input
                      type="number"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                      placeholder="5"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="4000"
                      required
                      min="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-spark)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-4 h-4 text-[var(--color-spark)] border-gray-300 rounded focus:ring-[var(--color-spark)]"
                    />
                    <span className="text-sm text-gray-700">인기 상품</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-[var(--color-spark)] border-gray-300 rounded focus:ring-[var(--color-spark)]"
                    />
                    <span className="text-sm text-gray-700">활성화</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-spark)] hover:bg-[var(--color-spark-deep)] rounded-lg transition-colors cursor-pointer"
                  >
                    {editingProduct ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmOpen && productToDelete && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">요금제 삭제</h3>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold">{productToDelete.name}</span> 요금제를 삭제하시겠습니까?
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
