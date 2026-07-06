import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { orderNumber, orderStatusLabel, orderStatusColor } from '@/lib/orders';
import Pagination from '@/components/admin/Pagination';
import SelectAllCheckbox from '@/components/admin/SelectAllCheckbox';
import SaveForm from '@/components/admin/SaveForm';
import { bulkUpdateOrderStatus } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';
const PAGE_SIZE = 50;

const TABS = [['all', 'Всички'], ['new', 'Нови'], ['processing', 'Обработват се'], ['shipped', 'Изпратени'], ['delivered', 'Доставени'], ['cancelled', 'Отказани']] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const { status, q, page: pageParam } = await searchParams;
  const where: Record<string, unknown> = {};
  if (status && status !== 'all') where.status = status;
  if (q) where.OR = [
    { customerName: { contains: q } },
    { email: { contains: q } },
    { phone: { contains: q } },
    { address: { contains: q } },
    { city: { contains: q } },
    { officeName: { contains: q } },
  ];

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(pageParam || '1', 10) || 1), totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>Поръчки</h1>
        <a href="/api/admin/orders/export" className="px-4 py-2 rounded text-[13px] font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">⬇ Експорт (Excel/CSV)</a>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(([val, label]) => {
          const active = (status || 'all') === val;
          return (
            <Link key={val} href={`/admin/porachki${val === 'all' ? '' : `?status=${val}`}`}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${active ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)] text-[var(--text-dark)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}>
              {label}
            </Link>
          );
        })}
      </div>

      <form className="mb-5">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q || ''} placeholder="Търси по клиент, имейл, телефон или адрес…"
          className="w-full max-w-sm border border-[var(--border)] rounded px-4 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]" />
      </form>

      <SaveForm action={bulkUpdateOrderStatus}>
        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[13px] text-[var(--text-muted)]">Маркирай избраните като:</span>
            {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
              <button key={s} type="submit" name="status" value={s}
                className="px-3 py-1.5 rounded text-[13px] font-semibold border border-[var(--border)] bg-white text-[var(--text-dark)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                {orderStatusLabel(s)}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
          {orders.length === 0 ? (
            <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Няма поръчки.</p>
          ) : (
            <table className="w-full text-[14px]">
              <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 w-8"><SelectAllCheckbox /></th>
                  <th className="px-4 py-3">№</th><th className="px-4 py-3">Клиент</th><th className="px-4 py-3">Артикули</th><th className="px-4 py-3">Сума</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Дата</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                    <td className="px-4 py-3"><input type="checkbox" name="ids" value={o.id} aria-label={`Избери #${orderNumber(o.id)}`} className="accent-[var(--primary)] cursor-pointer" /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-[var(--text-dark)] mb-1.5">#{orderNumber(o.id)}</div>
                      <Link href={`/admin/porachki/${o.id}`} className="btn-primary">Виж поръчката →</Link>
                    </td>
                    <td className="px-4 py-3">{o.customerName}<div className="text-[12px] text-[var(--text-muted)]">{o.email}</div></td>
                    <td className="px-4 py-3">{o._count.items}</td>
                    <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} €</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span></td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(o.createdAt).toLocaleDateString('bg-BG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SaveForm>

      <Pagination basePath="/admin/porachki" page={page} totalPages={totalPages} params={{ status, q }} />
    </div>
  );
}
