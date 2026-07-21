'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useLanguageStore } from '@/store/languageStore';

// Client wrapper for a blog post: picks the admin-entered English title /
// content when the EN toggle is on, falling back to Bulgarian.
export default function BlogPostView({
  title, titleEn, content, contentEn, coverImage, publishedAt,
}: {
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  coverImage: string | null;
  publishedAt: string; // ISO string
}) {
  const lang = useLanguageStore((s) => s.lang);
  const en = lang === 'en';
  const displayTitle = en && titleEn ? titleEn : title;
  const displayContent = en && contentEn ? contentEn : content;

  return (
    <div className="blog-post-page">
      <PageHeader
        title={displayTitle}
        breadcrumbs={[
          { label: en ? 'Home' : 'Начало', href: '/' },
          { label: en ? 'Blog' : 'Полезно', href: '/polezno' },
          { label: displayTitle },
        ]}
        subtitle={new Date(publishedAt).toLocaleDateString(en ? 'en-GB' : 'bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
      />

      <article className="blog-post-article max-w-[820px] mx-auto px-[15px] py-10">
        {coverImage && (
          <img src={coverImage} alt={displayTitle} className="blog-post-cover w-full rounded-lg mb-8 object-cover" style={{ maxHeight: 460 }} />
        )}

        <div className="blog-post-content blog-content" dangerouslySetInnerHTML={{ __html: displayContent }} />

        <div className="blog-post-footer mt-10 pt-6 border-t border-[var(--border)]">
          <Link href="/polezno" className="blog-post-back text-[14px] text-[var(--primary)] font-semibold hover:underline">
            {en ? '← All posts' : '← Всички статии'}
          </Link>
        </div>
      </article>
    </div>
  );
}
