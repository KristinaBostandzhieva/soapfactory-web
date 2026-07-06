import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { orderNumber, orderStatusLabel, orderStatusColor } from '@/lib/orders';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminUserProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: 'desc' } } },
  });
  if (!user) notFound();

  const orders = user.orders;
  const spent = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const lastOrder = orders[0];

  const stats = [
    { label: 'Поръчки', value: orders.length },
    { label: 'Похарчено (платени)', value: `${spent.toFixed(2)} €` },
    { label: 'Последна поръчка', value: lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString('bg-BG') : '—' },
    { label: 'Регистриран', value: new Date(user.createdAt).toLocaleDateString('bg-BG') },
  ];

  const field = (label: string, value: string | null | undefined) => (
    <div>
      <div className="text-[12px] text-[var(--text-muted)]">{label}</div>
      <div className="text-[14px] text-[var(--text-dark)]">{value || '—'}</div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>
          {user.name || 'Потребител'}
          {user.role === 'admin' && <span className="ml-3 px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[var(--primary)] text-white align-middle">Админ</span>}
        </h1>
        <Link href="/admin/potrebiteli" className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)]">← Назад</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[var(--border)] rounded-lg p-4">
            <div className="text-[12px] text-[var(--text-muted)] mb-1">{s.label}</div>
            <div style={{ fontFamily: hf }} className="text-[20px] font-extrabold text-[var(--text-dark)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Contact details */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-5 mb-8">
        <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }} className="mb-4">Данни за контакт</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {field('Имейл', user.email)}
          {field('Телефон', user.phone)}
          {field('Град', user.city)}
          {field('Адрес', user.address)}
          {field('Пощенски код', user.postcode)}
          {field('Държава', user.country)}
        </div>
      </div>

      {/* Order history */}
      <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333' }} className="mb-4">Поръчки на клиента</h2>
      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        {orders.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Този потребител още няма поръчки.</p>
        ) : (
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
              <tr><th className="px-4 py-3">№</th><th className="px-4 py-3">Сума</th><th className="px-4 py-3">Плащане</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Дата</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                  <td className="px-4 py-3"><Link href={`/admin/porachki/${o.id}`} className="text-[var(--primary)] font-semibold">#{orderNumber(o.id)}</Link></td>
                  <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} €</td>
                  <td className="px-4 py-3">{o.paymentStatus === 'paid' ? 'Платена' : 'Неплатена'}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span></td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(o.createdAt).toLocaleDateString('bg-BG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
