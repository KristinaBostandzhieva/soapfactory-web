'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';

export default function FavoritesPage() {
  const items = useFavoritesStore((s) => s.items);
  const clear = useFavoritesStore((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const favs = mounted ? items : [];

  return (
    <div>
      <PageHeader
        title="Любими продукти"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Любими' }]}
      />

      <div className="favorites-page max-w-[1400px] mx-auto px-[15px] py-10">
        {favs.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-art" aria-hidden="true">
              <span>♡</span>
            </div>
            <p className="favorites-empty-kicker">Твоята селекция</p>
            <h2>Запази продуктите, към които искаш да се върнеш</h2>
            <p>Натисни сърцето върху любим продукт и ще го пазим тук, готов за следващата ти поръчка.</p>
            <div className="favorites-empty-actions">
              <Link href="/shop" className="favorites-primary-link">Към магазина</Link>
              <Link href="/kategoria/promotsii" className="favorites-secondary-link">Виж промоции</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="favorites-toolbar">
              <div>
                <p className="favorites-toolbar-kicker">Запазени продукти</p>
                <h2>{favs.length} продукт{favs.length === 1 ? '' : 'а'}</h2>
              </div>
              <button onClick={clear}>Изчисти всички</button>
            </div>
            <div className="boj-product-grid favorites-grid">
              {favs.map((p) => <ProductCard key={p.id} product={p} variant="bojCategory" />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
