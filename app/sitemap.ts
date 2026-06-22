import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.post.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/za-nas`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/za-kontakti`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/polezno`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/dostavka`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/obshti-uslovia`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/poveritelnost`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/kategoria/${encodeURIComponent(c.slug)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/produkt/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/polezno/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...postPages];
}
