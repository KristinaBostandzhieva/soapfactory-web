import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts } from '@/lib/blog';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

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
        {posts.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)]">Все още няма публикации.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-12">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/polezno/${post.slug}`} className="block">
                  <div className="rounded-md bg-[var(--bg-light)] mb-4 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    {post.coverImage
                      ? <img src={post.coverImage} alt={post.title} className="product-img w-full h-full object-cover" />
                      : <div className="w-full h-full" />}
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)] mb-1">{new Date(post.publishedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333' }} className="group-hover:!text-[var(--primary)] transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="text-[14px] text-[var(--text-body)] line-clamp-3">{post.excerpt}</p>}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
