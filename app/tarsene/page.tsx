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

      <div className="max-w-full mx-auto px-[15px] py-10">
        {/* Search box (works without JavaScript — plain GET form) */}
        <form action="/tarsene" method="get" className="flex gap-2 max-w-xl mb-10">
          <input name="q" defaultValue={query} placeholder="Търси продукт по име…" className={inputCls} autoFocus />
          <button type="submit" className="btn-primary">Търси</button>
        </form>

        {query && results.length === 0 && (
          <div className="text-[14px] text-[var(--text-body)]">
            <p className="mb-4">Опитай с друга дума или разгледай всички продукти.</p>
            <Link href="/shop" className="btn-primary inline-block">Към магазина</Link>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!query && (
          <p className="text-[14px] text-[var(--text-muted)]">Въведи дума, за да потърсиш продукт.</p>
        )}
      </div>
    </div>
  );
}
