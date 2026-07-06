import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Pagination from '@/components/admin/Pagination';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';
const PAGE_SIZE = 50;

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageParam } = await searchParams;
  const where = q
    ? {
        OR: [
          { email: { contains: q } },
          { name: { contains: q } },
          { phone: { contains: q } },
          { address: { contains: q } },
          { city: { contains: q } },
          { postcode: { contains: q } },
        ],
      }
    : undefined;

  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(pageParam || '1', 10) || 1), totalPages);

  // Fetch only this page of users, and let the DB do the order count + spend sum
  // (no more pulling every order row into JS just to length/reduce it).
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
  });

  const spentByUser = new Map<string, number>();
  if (users.length) {
    const sums = await prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: users.map((u) => u.id) } },
      _sum: { total: true },
    });
    for (const s of sums) if (s.userId) spentByUser.set(s.userId, s._sum.total || 0);
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-2">Потребители <span className="text-[var(--text-muted)] text-[18px]">({total})</span></h1>
      <p className="text-[13px] text-[var(--text-muted)] mb-5">Показани {from}–{to} от {total}. Използвай търсенето за конкретен потребител.</p>

      <form className="mb-5">
        <input name="q" defaultValue={q || ''} placeholder="Търси по имейл, име, телефон или адрес…"
          className="w-full max-w-sm border border-[var(--border)] rounded px-4 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]" />
      </form>

      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
            <tr><th className="px-4 py-3">Имейл</th><th className="px-4 py-3">Име</th><th className="px-4 py-3">Телефон</th><th className="px-4 py-3">Поръчки</th><th className="px-4 py-3">Похарчено</th><th className="px-4 py-3">Роля</th><th className="px-4 py-3">Действия</th></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const orderCount = u._count.orders;
              const spent = spentByUser.get(u.id) || 0;
              return (
              <tr key={u.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.name || '—'}</td>
                <td className="px-4 py-3 text-[var(--text-body)]">{u.phone || '—'}</td>
                <td className="px-4 py-3">{orderCount}</td>
                <td className="px-4 py-3 font-semibold">{spent > 0 ? `${spent.toFixed(2)} €` : '—'}</td>
                <td className="px-4 py-3">{u.role === 'admin' ? <span className="px-2 py-0.5 rounded-full text-[12px] font-semibold bg-[var(--primary)] text-white">Админ</span> : 'Клиент'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link href={`/admin/potrebiteli/${u.id}`} className="btn-primary">Виж профила →</Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Няма намерени потребители.</p>}
      </div>

      <Pagination basePath="/admin/potrebiteli" page={page} totalPages={totalPages} params={{ q }} />
    </div>
  );
}
