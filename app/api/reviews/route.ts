import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Submit a product review. Stored unapproved — an admin moderates before it
// shows publicly (prevents spam / abuse).
export async function POST(req: Request) {
  // Only logged-in users may submit (the form already enforces this in the
  // UI; this closes the direct-API hole).
  const session = await getSession();
  if (!session?.sub) {
    return NextResponse.json({ error: 'Само регистрирани потребители могат да оставят отзив.' }, { status: 401 });
  }

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
  const rating = Math.round(Number(body.rating));
  const comment = body.comment ? String(body.comment).trim().slice(0, 1000) : null;

  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: 'Моля избери оценка от 1 до 5 звезди.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: 'Продуктът не е намерен.' }, { status: 404 });
  }

  // The author name comes from the account, not the form — stored already
  // shortened ("Мария Димитрова" → "Мария Д.") so the family name never
  // appears publicly.
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { name: true, email: true } });
  if (!user) {
    return NextResponse.json({ error: 'Само регистрирани потребители могат да оставят отзив.' }, { status: 401 });
  }
  const fullName = (user.name || user.email.split('@')[0]).trim().slice(0, 80);
  const parts = fullName.split(/\s+/);
  const authorName = parts.length < 2 ? fullName : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;

  // Verified buyer: the account has an order (by user id or email) containing
  // this product.
  const purchase = await prisma.order.findFirst({
    where: {
      OR: [{ userId: session.sub }, { email: user.email }],
      items: { some: { productId } },
    },
    select: { id: true },
  });

  await prisma.review.create({
    data: { productId, authorName, rating, comment, approved: false, verified: !!purchase },
  });

  return NextResponse.json({ ok: true });
}
