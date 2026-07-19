import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import { searchProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || '').trim();
  return {
    title: query ? `Търсене: ${query}` : 'Търсене',
    description: query
      ? `Резултати от търсенето за „${query}“ в Сапунена работилница.`
      : 'Търсене на натурални продукти в Сапунена работилница.',
    // SEO best practice: internal search result pages are NOT indexed
    // (they create thin/duplicate pages), but links are still followed.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <div>
      <PageHeader
        title={query ? `Резултати за „${query}“` : 'Търсене'}
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Търсене' }]}
        subtitle={query ? (results.length === 0 ? 'Няма намерени продукти' : `Намерени ${results.length} продукт${results.length === 1 ? '' : 'а'}`) : undefined}
      />

      <div className="search-page max-w-[1400px] mx-auto px-[15px] py-10">
        {/* Search box (works without JavaScript — plain GET form) */}
        <form action="/tarsene" method="get" className="search-form flex gap-2 max-w-xl mb-10">
          <input name="q" defaultValue={query} placeholder="Търси продукт по име…" className={inputCls} autoFocus />
          <button type="submit" className="btn-primary">Търси</button>
        </form>

        {query && results.length === 0 && (
          <div className="sf-empty-state">
            <div className="sf-empty-art" aria-hidden="true">⌕</div>
            <p className="sf-empty-kicker">Няма съвпадения</p>
            <h2>Не открихме продукти за „{query}“</h2>
            <p>Опитай с по-кратка дума, аромат или категория. Понякога най-хубавите неща се намират с малко ровене.</p>
            <div className="sf-empty-actions">
              <Link href="/shop" className="sf-empty-primary">Към магазина</Link>
              <Link href="/kategoria/promotsii" className="sf-empty-secondary">Виж промоции</Link>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="boj-product-grid search-results-grid">
            {results.map((p) => <ProductCard key={p.id} product={p} variant="bojCategory" />)}
          </div>
        )}

        {!query && (
          <div className="sf-empty-state compact">
            <div className="sf-empty-art" aria-hidden="true">⌕</div>
            <p className="sf-empty-kicker">Търсене</p>
            <h2>Какво търсиш днес?</h2>
            <p>Въведи име, аромат или категория, за да намериш подходящ продукт.</p>
          </div>
        )}
      </div>
    </div>
  );
}
