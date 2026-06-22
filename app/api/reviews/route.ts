import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Submit a product review. Stored unapproved — an admin moderates before it
// shows publicly (prevents spam / abuse).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // ── Anti-spam ───────────────────────────────────────────────────────
  // Honeypot: a hidden field only bots fill. If set, silently accept (so the
  // bot thinks it worked) but save nothing.
  if (body.hp) {
    return NextResponse.json({ ok: true });
  }
  // Simple math question (validated server-side too).
  if (Number(body.mathAnswer) !== Number(body.mathA) + Number(body.mathB)) {
    return NextResponse.json({ error: 'Грешен отговор на въпроса за сигурност.' }, { status: 400 });
  }

  const productId = String(body.productId || '').trim();
  const authorName = String(body.authorName || '').trim().slice(0, 80);
  const rating = Math.round(Number(body.rating));
  const comment = body.comment ? String(body.comment).trim().slice(0, 1000) : null;

  if (!productId || !authorName) {
    return NextResponse.json({ error: 'Моля попълни име.' }, { status: 400 });
  }
  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: 'Моля избери оценка от 1 до 5 звезди.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: 'Продуктът не е намерен.' }, { status: 404 });
  }

  await prisma.review.create({
    data: { productId, authorName, rating, comment, approved: false },
  });

  return NextResponse.json({ ok: true });
}
