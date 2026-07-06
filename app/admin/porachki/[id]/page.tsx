import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { orderNumber, orderStatusLabel, orderStatusColor } from '@/lib/orders';
import { updateOrderDetails, updateOrderItems, togglePaymentStatus } from '@/app/admin/actions';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import ShippingPanel from '@/components/admin/ShippingPanel';
import PrintButton from '@/components/admin/PrintButton';
import SaveForm from '@/components/admin/SaveForm';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';
const label = 'block text-[13px] font-medium mb-1';
const input = 'w-full border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>Поръчка #{orderNumber(order.id)}</h1>
          <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Link href="/admin/porachki" className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)]">← Назад</Link>
        </div>
      </div>

      <p className="text-[13px] text-[var(--text-muted)] mb-6">
        Направена на {new Date(order.createdAt).toLocaleString('bg-BG')}
        {order.source ? ` · Източник: ${order.source}` : ''}
        {order.user ? ' · Регистриран клиент' : ' · Гост'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: items + totals ── */}
        <div className="lg:col-span-2 space-y-6">
          <SaveForm action={updateOrderItems.bind(null, order.id)} className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
                <tr><th className="px-4 py-3">Продукт</th><th className="px-4 py-3 w-24">Брой</th><th className="px-4 py-3 text-right">Ед. цена</th><th className="px-4 py-3 text-right">Сума</th></tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">{it.name}</td>
                    <td className="px-4 py-3">
                      <input name={`qty-${it.id}`} type="number" min="0" step="1" defaultValue={it.quantity}
                        className="w-20 border border-[var(--border)] rounded px-2 py-1.5 text-[14px] focus:outline-none focus:border-[var(--primary)]" />
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-muted)]">{it.price.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-semibold">{(it.price * it.quantity).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-[var(--border)] px-4 py-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-light)]/50">
              <p className="text-[12px] text-[var(--text-muted)] print:hidden">Промени брой и запази — сумите се преизчисляват, наличността се коригира. 0 премахва артикула.</p>
              <button type="submit" className="btn-primary print:hidden" style={{ padding: '8px 20px', fontSize: 13 }}>Запази артикулите</button>
            </div>
          </SaveForm>

          <div className="bg-white border border-[var(--border)] rounded-lg p-5">
            <div className="space-y-1.5 text-[14px] max-w-xs ml-auto">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Междинна сума</span><span>{order.subtotal.toFixed(2)} €</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700"><span>Отстъпка{order.discountCode ? ` (${order.discountCode})` : ''}</span><span>−{order.discountAmount.toFixed(2)} €</span></div>
              )}
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Доставка</span><span>{order.shipping === 0 ? 'Безплатна' : `${order.shipping.toFixed(2)} €`}</span></div>
              <div className="flex justify-between font-bold text-[16px] pt-2 border-t border-[var(--border)]"><span>Общо</span><span>{order.total.toFixed(2)} €</span></div>
            </div>
          </div>

          {/* Customer / delivery details — editable */}
          <SaveForm action={updateOrderDetails.bind(null, order.id)} className="bg-white border border-[var(--border)] rounded-lg p-5 space-y-4">
            <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }}>Клиент и доставка</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={label}>Име *</label><input name="customerName" required defaultValue={order.customerName} className={input} /></div>
              <div><label className={label}>Имейл *</label><input name="email" type="email" required defaultValue={order.email} className={input} /></div>
              <div><label className={label}>Телефон *</label><input name="phone" required defaultValue={order.phone} className={input} /></div>
              <div><label className={label}>Град *</label><input name="city" required defaultValue={order.city} className={input} /></div>
              <div className="sm:col-span-2"><label className={label}>Адрес / Офис *</label><input name="address" required defaultValue={order.address} className={input} /></div>
              <div><label className={label}>Пощенски код</label><input name="postcode" defaultValue={order.postcode || ''} className={input} /></div>
            </div>
            <div><label className={label}>Бележки</label><textarea name="notes" rows={2} defaultValue={order.notes || ''} className={input} /></div>
            <button type="submit" className="btn-primary print:hidden" style={{ padding: '8px 20px', fontSize: 13 }}>Запази данните</button>
          </SaveForm>
        </div>

        {/* ── Right: status, payment, shipping ── */}
        <div className="space-y-6">
          <div className="bg-white border border-[var(--border)] rounded-lg p-5 print:hidden">
            <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }} className="mb-3">Статус на поръчката</h2>
            <OrderStatusSelect id={order.id} status={order.status} />
            <p className="text-[12px] text-[var(--text-muted)] mt-2">При „Отказана“ артикулите се връщат в наличност автоматично.</p>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-lg p-5">
            <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }} className="mb-3">Плащане</h2>
            <div className="text-[14px] space-y-1.5 mb-3">
              <div><span className="text-[var(--text-muted)]">Метод:</span> {order.paymentMethod === 'stripe' ? 'Карта' : 'Наложен платеж'}</div>
              <div>
                <span className="text-[var(--text-muted)]">Статус:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.paymentStatus === 'paid' ? 'Платена' : 'Неплатена'}
                </span>
              </div>
            </div>
            <SaveForm action={togglePaymentStatus.bind(null, order.id)} className="print:hidden">
              <button className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
                {order.paymentStatus === 'paid' ? 'Маркирай като неплатена' : 'Маркирай като платена'}
              </button>
            </SaveForm>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-lg p-5">
            <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }} className="mb-3">Доставка</h2>
            <ShippingPanel id={order.id} courier={order.courier} deliveryType={order.deliveryType}
              officeName={order.officeName} trackingNumber={order.trackingNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
