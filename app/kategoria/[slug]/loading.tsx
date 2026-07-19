import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function CategoryLoading() {
  return (
    <div className="boj-category-page">
      <section className="boj-category-hero skeleton-category-hero" />
      <div className="boj-category-bar">
        <div className="boj-category-bar-inner">
          <div className="skeleton-filter-toggle" />
          <div className="skeleton-sort" />
        </div>
      </div>
      <main className="boj-category-main">
        <aside className="boj-filter-rail">
          <div className="skeleton-filter-block" />
          <div className="skeleton-filter-block" />
          <div className="skeleton-filter-block short" />
        </aside>
        <section className="boj-products-area">
          <ProductGridSkeleton count={9} />
        </section>
      </main>
    </div>
  );
}
