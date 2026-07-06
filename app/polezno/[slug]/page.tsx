import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/blog';
import { absoluteUrl, metaDescription, jsonLdScript, decodeSlug, SITE_NAME, SITE_URL } from '@/lib/seo';
import BlogPostView from '@/components/BlogPostView';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

const loadPost = cache((slug: string) => getPostBySlug(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(decodeSlug(slug));
  if (!post) return { title: 'Статията не е намерена', robots: { index: false, follow: true } };
  const description = metaDescription(post.excerpt);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/polezno/${post.slug}` },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/polezno/${post.slug}`),
      title: `${post.title} | ${SITE_NAME}`,
      description,
      publishedTime: post.publishedAt.toISOString(),
      ...(post.coverImage ? { images: [{ url: post.coverImage, alt: post.title }] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(decodeSlug(slug));

  if (!post || !post.published) {
    return (
      <div className="max-w-full mx-auto px-[15px] py-24 text-center">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }}>Статията не е намерена</h1>
        <Link href="/polezno" className="btn-primary inline-block mt-6">Към блога</Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` } },
    mainEntityOfPage: absoluteUrl(`/polezno/${post.slug}`),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <BlogPostView
        title={post.title}
        titleEn={post.titleEn}
        content={post.content}
        contentEn={post.contentEn}
        coverImage={post.coverImage}
        publishedAt={post.publishedAt.toISOString()}
      />
    </div>
  );
}
