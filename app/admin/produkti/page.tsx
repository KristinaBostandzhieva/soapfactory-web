import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { firstImage } from '@/lib/catalog';
import { Plus, Pencil } from 'lucide-react';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q } } : undefined,
    include: { categories: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>Продукти <span className="text-[var(--text-muted)] text-[18px]">({products.length})</span></h1>
        <Link href="/admin/produkti/nov" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Нов продукт</Link>
      </div>

      <form className="mb-5">
        <input name="q" defaultValue={q || ''} placeholder="Търси по име…"
          className="w-full max-w-sm border border-[var(--border)] rounded px-4 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]" />
      </form>

      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">Продукт</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3">Наличност</th>
              <th className="px-4 py-3">Промо</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = firstImage(p.images);
              return (
                <tr key={p.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[var(--bg-light)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <span className="text-[var(--text-muted)] text-xs">—</span>}
                      </div>
                      <span className="font-medium text-[var(--text-dark)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">{p.categories.map((c) => c.name).join(', ') || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{p.price.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    {p.stockQty != null ? (
                      p.stockQty <= 0
                        ? <span className="text-red-500">Изчерпано</span>
                        : <span className={p.stockQty <= 5 ? 'text-amber-600' : 'text-green-600'}>{p.stockQty} бр.{p.stockQty <= 5 ? ' (малко)' : ''}</span>
                    ) : (
                      p.inStock ? <span className="text-green-600">Налично</span> : <span className="text-red-500">Изчерпано</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.featured ? '★' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/produkti/${p.id}`} className="text-[var(--text-muted)] hover:text-[var(--primary)]" aria-label="Редактирай"><Pencil size={16} /></Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Няма намерени продукти.</p>}
      </div>
    </div>
  );
}
