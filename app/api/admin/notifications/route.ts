import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Counts + recent items needing attention, for the admin notification bell.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const [newOrders, pendingReviews, recentOrders, recentReviews] = await Promise.all([
    prisma.order.count({ where: { status: 'new' } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.order.findMany({ where: { status: 'new' }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, customerName: true, total: true, createdAt: true } }),
    prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, authorName: true, rating: true, createdAt: true, product: { select: { name: true } } } }),
  ]);

  return NextResponse.json({
    total: newOrders + pendingReviews,
    newOrders,
    pendingReviews,
    recentOrders,
    recentReviews,
  });
}
