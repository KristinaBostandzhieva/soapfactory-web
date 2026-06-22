import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, isStripeConfigured } from '@/lib/stripe';

// GET → lets the checkout UI know whether card payment is available yet.
export async function GET() {
  return NextResponse.json({ configured: isStripeConfigured() });
}

// POST → create a hosted Stripe Checkout session for an existing order.
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Картовото плащане още не е активирано (липсва Stripe API ключ).' },
      { status: 503 }
    );
  }

  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: 'Липсва номер на поръчка.' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Поръчката не е намерена.' }, { status: 404 });
  if (order.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'Поръчката вече е платена.' }, { status: 400 });
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const line_items = order.items.map((it) => ({
    quantity: it.quantity,
    price_data: {
      currency: 'eur',
      unit_amount: Math.round(it.price * 100),
      product_data: { name: it.name },
    },
  }));

  if (order.shipping > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(order.shipping * 100),
        product_data: { name: 'Доставка' },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    customer_email: order.email,
    metadata: { orderId: order.id },
    success_url: `${origin}/poruchka/uspeh?order=${order.id}`,
    cancel_url: `${origin}/poruchka`,
  });

  // Remember the session so the webhook can reconcile it.
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id, paymentMethod: 'stripe' },
  });

  return NextResponse.json({ url: session.url });
}
