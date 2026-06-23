import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Package, ShoppingBag, Users, Clock } from 'lucide-react';
import { orderNumber, orderStatusLabel } from '@/lib/orders';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminDashboard() {
  const [products, orders, users, newOrders, revenueAgg, recent, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: 'new' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { stockQty: { lte: 5 } }, orderBy: { stockQty: 'asc' }, select: { id: true, name: true, stockQty: true }, take: 12 }),
  ]);

  const cards = [
    { label: '????????', value: products, icon: Package, href: '/admin/produkti' },
    { label: '???????', value: orders, icon: ShoppingBag, href: '/admin/porachki' },
    { label: '???? ???????', value: newOrders, icon: Clock, href: '/admin/porachki?status=new' },
    { label: '???????????', value: users, icon: Users, href: '/admin/potrebiteli' },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-6">?????</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white border border-[var(--border)] rounded-lg p-5 hover:shadow-sm transition-shadow">
            <c.icon size={22} className="text-[var(--primary)] mb-3" />
            <div style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>{c.value}</div>
            <div className="text-[13px] text-[var(--text-muted)]">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
        <div className="bg-white border border-[var(--border)] rounded-lg p-5">
          <div className="text-[13px] text-[var(--text-muted)]">??????? (??????? ???????)</div>
          <div style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#9B72C7' }}>{(revenueAgg._sum.total || 0).toFixed(2)} €</div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="text-[13px] text-[var(--text-muted)] mb-1">???????? ????? ?? ???????</div>
            <p className="text-[12px] text-[var(--text-muted)]">????? ????? ?? ?????? ???? (????????, ???????, ???????) ? ?? ?????? ?? ??????? ?????.</p>
          </div>
          <a href="/api/admin/backup" className="btn-primary mt-3 inline-block text-center w-fit" style={{ padding: '8px 18px', fontSize: 13 }}>
            ??????? ???????? ?????
          </a>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-5 mb-8">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 16, color: '#333' }} className="mb-3">?? ?????????? ?? ????????</h2>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <Link key={p.id} href={`/admin/produkti/${p.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-colors hover:border-[var(--primary)] ${p.stockQty === 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                {p.name} <span className="font-bold">· {p.stockQty} ??.</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333' }} className="mb-4">???????? ???????</h2>
      <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
        {recent.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">??? ??? ???? ???????.</p>
        ) : (
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
              <tr><th className="px-4 py-3">?</th><th className="px-4 py-3">??????</th><th className="px-4 py-3">????</th><th className="px-4 py-3">??????</th><th className="px-4 py-3">????</th></tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                  <td className="px-4 py-3"><Link href={`/admin/porachki/${o.id}`} className="text-[var(--primary)] font-semibold">#{orderNumber(o.id)}</Link></td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} €</td>
                  <td className="px-4 py-3">{orderStatusLabel(o.status)}</td>
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
