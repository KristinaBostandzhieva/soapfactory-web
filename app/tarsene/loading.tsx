import PageHeader from '@/components/PageHeader';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function SearchLoading() {
  return (
    <div>
      <PageHeader
        title="Търсене"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Търсене' }]}
      />
      <div className="max-w-[1400px] mx-auto px-[15px] py-10">
        <div className="skeleton-search" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
