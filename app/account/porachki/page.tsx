import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { courierName, deliveryTypeLabel } from '@/lib/couriers';
import { orderNumber, orderStatusLabel, orderStatusColor } from '@/lib/orders';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div>
      <PageHeader
        title="Моите поръчки"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Моят профил', href: '/account' }, { label: 'Моите поръчки' }]}
      />

      <div className="max-w-[820px] mx-auto px-[15px] py-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-body)] mb-6">Все още нямаш поръчки.</p>
            <Link href="/shop" className="btn-primary inline-block">Към магазина</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-[var(--border)] rounded-lg p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: hf }} className="font-bold">#{orderNumber(o.id)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span>
                  </div>
                  <span className="text-[13px] text-[var(--text-muted)]">{new Date(o.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <ul className="text-[14px] mb-3">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between py-1">
                      <span className="text-[var(--text-body)]">{it.name} × {it.quantity}</span>
                      <span>{(it.price * it.quantity).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] pt-2 border-t border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">
                    {courierName(o.courier)} · {deliveryTypeLabel(o.deliveryType)}
                    {o.trackingNumber && <> · Товарителница: <span className="font-mono">{o.trackingNumber}</span></>}
                  </span>
                  <span style={{ fontFamily: hf }} className="font-bold text-[var(--primary)]">Общо: {o.total.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
