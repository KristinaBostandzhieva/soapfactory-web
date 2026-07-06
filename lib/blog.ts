import { prisma } from './prisma';

const POST_LIST_SELECT = {
  id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true,
  titleEn: true, excerptEn: true,
} as const;

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: POST_LIST_SELECT,
  });
}

export async function getRecentPosts(take = 3) {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take,
    select: POST_LIST_SELECT,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}
