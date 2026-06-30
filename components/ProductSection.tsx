'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import MobileScrollCarousel from './MobileScrollCarousel';
import { useT } from '@/hooks/useT';

interface Product {
  id: string; name: string; price: number; slug: string;
  image?: string; priceMax?: number;
}

export default function ProductSection({
  title, viewAllHref, products, columns = 4,
}: {
  title: string;
  viewAllHref: string;
  products: Product[];
  columns?: 3 | 4;
}) {
  const tr = useT();
  const gridClass =
    columns === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10';

  return (
    <section className={`section-pad home-product-section home-product-section--${columns}`}>
      <div className="title-row">
        <Link href={viewAllHref} className="section-title-link">
          <h2 className="section-title">{title}</h2>
        </Link>
        <Link href={viewAllHref} className="btn-primary">{tr.home.viewAll}</Link>
      </div>
      <hr className="title-underline-full" />
      <MobileScrollCarousel className={gridClass}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </MobileScrollCarousel>
    </section>
  );
}
