'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';

const hf = 'var(--font-body)';

export interface BlogListPost {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  excerpt: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  publishedAt: string; // ISO string
}

// Client grid of blog cards: shows the English title/excerpt when the EN
// toggle is on, falling back to Bulgarian.
export default function BlogList({ posts }: { posts: BlogListPost[] }) {
  const lang = useLanguageStore((s) => s.lang);
  const en = lang === 'en';

  if (posts.length === 0) {
    return <p className="text-[14px] text-[var(--text-muted)]">{en ? 'No posts yet.' : 'Все още няма публикации.'}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-12">
      {posts.map((post) => {
        const title = en && post.titleEn ? post.titleEn : post.title;
        const excerpt = en && post.excerptEn ? post.excerptEn : post.excerpt;
        return (
          <article key={post.id} className="group">
            <Link href={`/polezno/${post.slug}`} className="block">
              <div className="rounded-md bg-[var(--bg-light)] mb-4 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                {post.coverImage
                  ? <img src={post.coverImage} alt={title} className="product-img w-full h-full object-cover" />
                  : <div className="w-full h-full" />}
              </div>
              <p className="text-[12px] text-[var(--text-muted)] mb-1">{new Date(post.publishedAt).toLocaleDateString(en ? 'en-GB' : 'bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333' }} className="group-hover:!text-[var(--primary)] transition-colors mb-2 leading-snug">
                {title}
              </h2>
              {excerpt && <p className="text-[14px] text-[var(--text-body)] line-clamp-3">{excerpt}</p>}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
