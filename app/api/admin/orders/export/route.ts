import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { courierName, deliveryTypeLabel } from '@/lib/couriers';
import { orderNumber, orderStatusLabel } from '@/lib/orders';

// CSV cell: wrap in quotes, escape internal quotes.
const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await requireAdmin())) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });

  const headers = [
    'Номер', 'Дата', 'Клиент', 'Имейл', 'Телефон', 'Град', 'Адрес/Офис',
    'Куриер', 'Доставка', 'Продукти', 'Междинна', 'Отстъпка', 'Доставка(лв)', 'Общо',
    'Плащане', 'Статус плащане', 'Статус', 'Източник',
  ];

  const rows = orders.map((o) => [
    '#' + orderNumber(o.id),
    new Date(o.createdAt).toLocaleString('bg-BG'),
    o.customerName, o.email, o.phone, o.city, o.address,
    courierName(o.courier), deliveryTypeLabel(o.deliveryType),
    o.items.map((i) => `${i.name} x${i.quantity}`).join('; '),
    o.subtotal.toFixed(2), o.discountAmount.toFixed(2), o.shipping.toFixed(2), o.total.toFixed(2),
    o.paymentMethod === 'stripe' ? 'Карта' : 'Наложен платеж',
    o.paymentStatus === 'paid' ? 'Платена' : 'Неплатена',
    orderStatusLabel(o.status),
    o.source || '',
  ].map(cell).join(','));

  // BOM so Excel reads UTF-8 (Cyrillic) correctly.
  const csv = '﻿' + [headers.map(cell).join(','), ...rows].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="porachki-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
