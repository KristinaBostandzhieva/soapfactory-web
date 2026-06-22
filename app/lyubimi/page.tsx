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

      <div className="max-w-full mx-auto px-[15px] py-10">
        {favs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤍</div>
            <p className="text-[var(--text-body)] mb-6">Все още нямаш любими продукти. Натисни сърцето върху продукт, за да го запазиш тук.</p>
            <Link href="/shop" className="btn-primary inline-block">Към магазина</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[14px] text-[var(--text-muted)]">{favs.length} продукт{favs.length === 1 ? '' : 'а'}</p>
              <button onClick={clear} className="text-[13px] text-[var(--text-muted)] hover:text-[var(--primary)] underline">Изчисти всички</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {favs.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
