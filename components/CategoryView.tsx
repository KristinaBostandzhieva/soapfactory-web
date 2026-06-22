'use client';

import { useState, useMemo } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import { sortProducts, type UiProduct } from '@/lib/catalog';
import { useT } from '@/hooks/useT';

const hf = 'var(--font-body)';

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15, color: '#333', textTransform: 'uppercase', letterSpacing: '0.02em' }}
        className="pb-3 mb-4 border-b-2 border-[var(--primary)] inline-block">{title}</h3>
      {children}
    </div>
  );
}

function GridIcon({ n }: { n: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={(16 / n) * i + 1} y="1" width={16 / n - 2} height="14" rx="1" />
      ))}
    </svg>
  );
}

const colClass: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4',
};

export default function CategoryView({
  products, title, parentTitle, parentSlug,
}: {
  products: UiProduct[];
  title: string;
  parentTitle?: string | null;
  parentSlug?: string | null;
}) {
  const tr = useT();
  const [sort, setSort] = useState('default');
  const [price, setPrice] = useState<number | null>(null);
  const [perPage, setPerPage] = useState(12);
  const [cols, setCols] = useState(4);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const maxPrice = Math.max(10, Math.ceil(Math.max(0, ...products.map((p) => p.price))));
  const curPrice = price ?? maxPrice;

  const sorted = useMemo(() => {
    const filtered = products.filter((p) => p.price <= curPrice);
    return sortProducts(filtered, sort);
  }, [products, sort, curPrice]);

  const shown = sorted.slice(0, perPage);
  const total = sorted.length;
  const countText = shown.length >= total
    ? tr.filters.showingAll(total)
    : tr.filters.showingRange(shown.length, total);

  const filters = (
    <>
      <Widget title={tr.filters.price}>
        <div className="filter-widget">
          <input type="range" min={0} max={maxPrice} step={1} value={curPrice} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          <div className="text-[13px] text-[var(--text-body)] mt-2">{tr.filters.priceRange(curPrice)}</div>
        </div>
      </Widget>
      <Widget title={tr.filters.suitable}>
        <ul className="filter-widget space-y-2">
          {tr.filters.suitableOptions.map((s) => (
            <li key={s}><label className="flex items-center gap-2 text-[14px] text-[var(--text-body)] cursor-pointer hover:text-[var(--primary)]"><input type="checkbox" className="accent-[var(--primary)]" /> {s}</label></li>
          ))}
        </ul>
      </Widget>
      <Widget title={tr.filters.scent}>
        <ul className="filter-widget space-y-2">
          {tr.filters.scentOptions.map((s) => (
            <li key={s}><label className="flex items-center gap-2 text-[14px] text-[var(--text-body)] cursor-pointer hover:text-[var(--primary)]"><input type="checkbox" className="accent-[var(--primary)]" /> {s}</label></li>
          ))}
        </ul>
      </Widget>
    </>
  );

  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: tr.common.home, href: '/' },
          ...(parentTitle && parentSlug ? [{ label: parentTitle, href: `/kategoria/${parentSlug}` }] : []),
          { label: title },
        ]}
      />
      <div className="max-w-full mx-auto px-[15px]">
      <div className="flex flex-wrap items-center justify-end gap-2 pt-6 pb-2">
        <p className="text-[13px] text-[var(--text-muted)]">{countText}</p>
      </div>

      <div className="shop-toolbar flex flex-wrap items-center justify-between gap-3 mb-8">
        <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-dark)] hover:text-[var(--primary)]" style={{ fontFamily: hf }}>
          <SlidersHorizontal size={16} /> {tr.filters.filters}
        </button>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <span>{tr.filters.show}</span>
            {[12, 24].map((n) => (
              <button key={n} onClick={() => setPerPage(n)} className={`font-semibold ${perPage === n ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'}`}>{n}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => setCols(n)} className={`p-1 transition-colors ${cols === n ? 'text-[var(--primary)]' : 'text-[#c9c9c9] hover:text-[var(--primary)]'}`} aria-label={tr.filters.colsLabel(n)}>
                <GridIcon n={n} />
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="select-custom border border-[var(--border)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)] bg-white">
            <option value="default">{tr.filters.sortDefault}</option>
            <option value="popularity">{tr.filters.sortPopular}</option>
            <option value="rating">{tr.filters.sortRating}</option>
            <option value="newest">{tr.filters.sortNewest}</option>
            <option value="price-asc">{tr.filters.sortPriceAsc}</option>
            <option value="price-desc">{tr.filters.sortPriceDesc}</option>
          </select>
        </div>
      </div>

      <div className="pb-16">
        {shown.length > 0 ? (
          <div className={`grid ${colClass[cols]} gap-x-5 gap-y-10`}>
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-[var(--text-body)] py-12 text-center">{tr.filters.noProducts}</p>
        )}
      </div>
      </div>

      {filtersOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setFiltersOpen(false)} />}
      <div className={`fixed top-0 left-0 h-full w-full max-w-[320px] bg-white z-50 shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ${filtersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333' }}>{tr.filters.filters}</h2>
          <button onClick={() => setFiltersOpen(false)} className="hover:text-[var(--primary)]"><X size={22} /></button>
        </div>
        {filters}
      </div>
    </div>
  );
}
