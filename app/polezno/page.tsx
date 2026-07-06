import type { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/blog';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import BlogList from '@/components/BlogList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Полезно от нас',
  description: 'Съвети, рецепти и полезни статии за натурална грижа за кожата и косата от Сапунена работилница.',
  alternates: { canonical: '/polezno' },
  openGraph: {
    type: 'website', url: '/polezno', title: 'Полезно от нас | Сапунена работилница',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Полезно от нас' }],
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div>
      <PageHeader
        title="Полезно от нас"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Полезно' }]}
        subtitle="Съвети и рецепти за натурална грижа за кожата и косата."
      />

      <div className="max-w-full mx-auto px-[15px] py-12">
        <BlogList posts={posts.map((p) => ({ ...p, publishedAt: p.publishedAt.toISOString() }))} />
      </div>
    </div>
  );
}
