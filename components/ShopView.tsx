'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import { sortProducts, type UiProduct } from '@/lib/catalog';

export default function ShopView({ products }: { products: UiProduct[] }) {
  const [sort, setSort] = useState('default');
  const items = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (
    <div className="shop-page">
      <PageHeader
        title="Всички продукти"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Всички продукти' }]}
      />

      <div className="shop-content max-w-full mx-auto px-[15px] py-10">
        <div className="shop-toolbar flex items-center justify-between mb-8">
          <p className="shop-result-count text-[13px] text-[var(--text-muted)]">Показани {items.length} продукта</p>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="shop-sort-select select-custom border border-[var(--border)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)] bg-white">
            <option value="default">Подреждане по подразбиране</option>
            <option value="popularity">Първо най-популярните</option>
            <option value="rating">Сортиране по средна оценка</option>
            <option value="newest">Първо най-новите</option>
            <option value="price-asc">Първо най-евтините</option>
            <option value="price-desc">Първо най-скъпите</option>
          </select>
        </div>
        <div className="shop-product-grid grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
