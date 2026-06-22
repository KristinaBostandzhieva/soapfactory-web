import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { shippingPrice, getCourier, type CourierId, type DeliveryType } from '@/lib/couriers';
import { sendOrderEmails } from '@/lib/email';
import { validateDiscount } from '@/lib/discounts';
import { deriveChannel } from '@/lib/attribution';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const items: { id: string; name: string; price: number; quantity: number }[] = Array.isArray(body.items) ? body.items : [];
  const c = body.customer || {};
  const d = body.delivery || {};
  const paymentMethod = body.paymentMethod === 'stripe' ? 'stripe' : 'cod';

  if (items.length === 0) return NextResponse.json({ error: 'Количката е празна.' }, { status: 400 });
  const customerName = `${(c.firstName || '').trim()} ${(c.lastName || '').trim()}`.trim();
  if (!customerName || !c.email || !c.phone || !c.city) {
    return NextResponse.json({ error: 'Моля попълни всички задължителни полета.' }, { status: 400 });
  }

  // ── Validate delivery selection ─────────────────────────────────────
  const courier = d.courier as CourierId;
  const deliveryType = d.deliveryType as DeliveryType;
  const courierDef = getCourier(courier);
  if (!courierDef || !courierDef.methods.includes(deliveryType)) {
    return NextResponse.json({ error: 'Невалиден метод за доставка.' }, { status: 400 });
  }
  const toAddress = deliveryType === 'address';
  if (toAddress && !String(c.address || '').trim()) {
    return NextResponse.json({ error: 'Моля попълни адрес за доставка.' }, { status: 400 });
  }
  if (!toAddress && (!d.officeCode || !d.officeName)) {
    return NextResponse.json({ error: 'Моля избери офис/автомат за доставка.' }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
  const shipping = shippingPrice(courier, deliveryType, subtotal) ?? 0;

  // Apply promo code (re-validated on the server — never trust the client total).
  let discountCode: string | null = null;
  let discountAmount = 0;
  if (body.discountCode) {
    const dres = await validateDiscount(String(body.discountCode), subtotal);
    if (dres.valid) { discountCode = dres.code ?? null; discountAmount = dres.amount; }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  // Attribution — where did this customer come from? (first-touch this session)
  const a = body.attribution || {};
  const source = deriveChannel(a.utmSource, a.utmMedium, a.referrer);
  const utmCampaign = a.utmCampaign ? String(a.utmCampaign).slice(0, 120) : null;

  const session = await getSession();
  // only link product ids that actually exist (snapshot name/price regardless)
  const dbProducts = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.id) } }, select: { id: true, stockQty: true } });
  const existing = new Set(dbProducts.map((p) => p.id));
  const stockMap = new Map(dbProducts.map((p) => [p.id, p.stockQty]));

  const order = await prisma.order.create({
    data: {
      userId: session?.sub || null,
      status: 'new',
      customerName,
      email: String(c.email).trim(),
      phone: String(c.phone).trim(),
      city: String(c.city).trim(),
      address: toAddress ? String(c.address).trim() : String(d.officeName).trim(),
      postcode: c.postcode ? String(c.postcode).trim() : null,
      notes: c.notes ? String(c.notes).trim() : null,
      subtotal, shipping, total,
      discountCode,
      discountAmount,
      source,
      utmCampaign,
      courier,
      deliveryType,
      officeCode: toAddress ? null : String(d.officeCode).trim(),
      officeName: toAddress ? null : String(d.officeName).trim(),
      paymentMethod,
      paymentStatus: 'pending',
      items: {
        create: items.map((i) => ({
          productId: existing.has(i.id) ? i.id : null,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
        })),
      },
    },
  });

  // Decrement tracked stock (products with a stockQty set). Floors at 0.
  await Promise.all(
    items
      .filter((i) => existing.has(i.id) && stockMap.get(i.id) != null)
      .map((i) => {
        const next = Math.max(0, (stockMap.get(i.id) as number) - Number(i.quantity));
        return prisma.product.update({ where: { id: i.id }, data: { stockQty: next } });
      })
  );

  // Count the promo-code use.
  if (discountCode) {
    await prisma.discount.update({ where: { code: discountCode }, data: { usedCount: { increment: 1 } } }).catch(() => {});
  }

  // Cash-on-delivery orders are confirmed immediately → send emails now.
  // (Card orders get their emails once payment succeeds.) Fire-and-forget.
  if (paymentMethod === 'cod') {
    sendOrderEmails(order.id).catch(() => {});
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
