import type { Metadata } from 'next';
import ShopView from '@/components/ShopView';
import { getAllProducts } from '@/lib/catalog';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Всички продукти',
  description: 'Разгледай всички натурални продукти на Сапунена работилница — сапуни, шампоани, део стикове и грижа за лицето. 100% натурални, веган и ръчно изработени.',
  alternates: { canonical: '/shop' },
  openGraph: {
    type: 'website',
    url: '/shop',
    title: 'Всички продукти | Сапунена работилница',
    description: 'Натурални сапуни, шампоани, део стикове и козметика за лице — ръчно изработени.',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Сапунена работилница' }],
  },
};

export default async function ShopPage() {
  const products = await getAllProducts();
  return <ShopView products={products} />;
}
