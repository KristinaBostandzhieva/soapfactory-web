import PageHeader from '@/components/PageHeader';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';

export default function ShopLoading() {
  return (
    <div>
      <PageHeader
        title="Всички продукти"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Всички продукти' }]}
      />
      <div className="max-w-full mx-auto px-[15px] py-10">
        <div className="shop-toolbar skeleton-toolbar" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
