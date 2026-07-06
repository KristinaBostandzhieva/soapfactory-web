import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import ProductDetail from '@/components/ProductDetail';
import { getProductBySlug, getRelatedProducts, getProductReviews } from '@/lib/catalog';
import {
  absoluteUrl, metaDescription, productJsonLd, breadcrumbJsonLd, jsonLdScript, decodeSlug, SITE_NAME,
} from '@/lib/seo';

const hf = 'var(--font-body)';

// Wrapped in cache() so generateMetadata + the page share a single query.
const loadProduct = cache((rawSlug: string) => getProductBySlug(decodeSlug(rawSlug)));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) {
    return { title: 'Продуктът не е намерен', robots: { index: false, follow: true } };
  }
  const url = absoluteUrl(`/produkt/${product.slug}`);
  const description = metaDescription(product.shortDescription || product.description);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produkt/${product.slug}` },
    openGraph: {
      type: 'website',
      url,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      ...(product.image ? { images: [{ url: product.image, alt: product.name }] } : {}),
    },
    twitter: {
      card: product.image ? 'summary_large_image' : 'summary',
      title: `${product.name} | ${SITE_NAME}`,
      description,
      ...(product.image ? { images: [product.image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    return (
      <div className="max-w-full mx-auto px-[15px] py-24 text-center">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }}>Продуктът не е намерен</h1>
        <Link href="/shop" className="btn-primary inline-block mt-6">Към магазина</Link>
      </div>
    );
  }

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product.id),
  ]);

  const crumbs = [{ name: 'Начало', path: '/' }];
  if (product.categorySlug && product.categoryTitle) {
    crumbs.push({ name: product.categoryTitle, path: `/kategoria/${product.categorySlug}` });
  }
  crumbs.push({ name: product.name, path: `/produkt/${product.slug}` });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd(product))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(crumbs))} />
      <ProductDetail product={product} related={related} reviews={reviews} />
    </>
  );
}
