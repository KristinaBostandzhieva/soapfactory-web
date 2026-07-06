import { notFound } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { updatePost } from '@/app/admin/actions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  const initial = {
    title: post.title, slug: post.slug, excerpt: post.excerpt,
    coverImage: post.coverImage, content: post.content, published: post.published,
    titleEn: post.titleEn, excerptEn: post.excerptEn, contentEn: post.contentEn,
  };

  return <PostForm action={updatePost.bind(null, id)} initial={initial} heading="Редактиране на статия" />;
}
