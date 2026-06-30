import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CategoryView from '@/components/CategoryView';
import { getCategoryBySlug, getProductsInCategory } from '@/lib/catalog';
import {
  absoluteUrl, metaDescription, breadcrumbJsonLd, jsonLdScript, decodeSlug, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE,
} from '@/lib/seo';

const loadCategory = cache((slug: string) => getCategoryBySlug(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const cat = await loadCategory(slug);
  const title = cat?.name ?? 'Продукти';
  const description = metaDescription(
    cat ? `${cat.name} — натурални, ръчно изработени продукти от Сапунена работилница.` : SITE_DESCRIPTION
  );
  return {
    title,
    description,
    alternates: { canonical: `/kategoria/${slug}` },
    openGraph: {
      type: 'website',
      url: absoluteUrl(`/kategoria/${slug}`),
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const [cat, products] = await Promise.all([
    loadCategory(slug),
    getProductsInCategory(slug),
  ]);

  if (!cat) notFound();

  const crumbs = [{ name: 'Начало', path: '/' }];
  if (cat?.parent?.name && cat.parent.slug) {
    crumbs.push({ name: cat.parent.name, path: `/kategoria/${cat.parent.slug}` });
  }
  crumbs.push({ name: cat?.name ?? 'Продукти', path: `/kategoria/${slug}` });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(crumbs))} />
      <CategoryView
        products={products}
        title={cat?.name ?? 'Продукти'}
        categorySlug={slug}
        parentTitle={cat?.parent?.name}
        parentSlug={cat?.parent?.slug}
      />
    </>
  );
}
