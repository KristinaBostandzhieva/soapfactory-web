import { prisma } from '@/lib/prisma';
import { createCategory, renameCategory, deleteCategory } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';
const input = 'border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
  });
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div className="max-w-4xl">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-2">Категории <span className="text-[var(--text-muted)] text-[18px]">({categories.length})</span></h1>
      <p className="text-[13px] text-[var(--text-muted)] mb-6">Организирай продуктите. Категориите се избират при редакция на продукт.</p>

      {/* Create */}
      <form action={createCategory} className="bg-white border border-[var(--border)] rounded-lg p-5 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-medium mb-1">Име на категория *</label>
          <input name="name" required placeholder="напр. Подаръчни комплекти" className={`${input} w-full`} />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-[13px] font-medium mb-1">Подкатегория на (по желание)</label>
          <select name="parentId" className={`${input} w-full`} defaultValue="">
            <option value="">— основна категория —</option>
            {topLevel.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>Добави</button>
      </form>

      {/* List */}
      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
            <tr><th className="px-4 py-3">Име</th><th className="px-4 py-3">Подкатегория на</th><th className="px-4 py-3">Продукти</th><th className="px-4 py-3 text-right">Действия</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3">
                  <form action={renameCategory.bind(null, c.id)} className="flex items-center gap-2">
                    <input name="name" defaultValue={c.name} className={`${input} py-1.5`} />
                    <button className="text-[12px] text-[var(--primary)] hover:underline">Запази</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{c.parent?.name || '—'}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteCategory.bind(null, c.id)}>
                    <button className="text-[13px] text-red-500 hover:underline">Изтрий</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Няма категории.</p>}
      </div>

      <p className="text-[12px] text-[var(--text-muted)] mt-3">Бележка: главното меню на сайта е фиксирано — новите категории се виждат на страниците им и при продуктите, но добавянето им в горното меню става отделно (кажи ми).</p>
    </div>
  );
}
