import { prisma } from '@/lib/prisma';
import { createCategory, renameCategory, deleteCategory, addProductToCategory, removeProductFromCategory } from '@/app/admin/actions';
import SaveForm from '@/components/admin/SaveForm';
import { ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';
const input = 'border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default async function AdminCategories() {
  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        parent: { select: { name: true } },
        products: { select: { id: true, name: true, price: true }, orderBy: { name: 'asc' } },
      },
    }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <div className="max-w-4xl">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-2">Категории <span className="text-[var(--text-muted)] text-[18px]">({categories.length})</span></h1>
      <p className="text-[13px] text-[var(--text-muted)] mb-6">Разгъни категория, за да видиш и редактираш продуктите в нея.</p>

      {/* Create */}
      <SaveForm action={createCategory} className="bg-white border border-[var(--border)] rounded-lg p-5 mb-8 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-medium mb-1">Име на категория *</label>
          <input name="name" required placeholder="напр. Подаръчни комплекти" className={`${input} w-full`} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-medium mb-1">Име (EN) <span className="text-[var(--text-muted)] font-normal">— по желание</span></label>
          <input name="nameEn" placeholder="e.g. Gift Sets" className={`${input} w-full`} />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-[13px] font-medium mb-1">Подкатегория на (по желание)</label>
          <select name="parentId" className={`${input} w-full`} defaultValue="">
            <option value="">— основна категория —</option>
            {topLevel.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>Добави</button>
      </SaveForm>

      {/* Category cards */}
      <div className="space-y-3">
        {categories.map((c) => {
          const memberIds = new Set(c.products.map((p) => p.id));
          const addable = allProducts.filter((p) => !memberIds.has(p.id));
          return (
            <details key={c.id} className="group bg-white border border-[var(--border)] rounded-lg overflow-hidden">
              <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-[var(--bg-light)] transition-colors">
                <ChevronDown size={16} className="text-[var(--text-muted)] transition-transform group-open:rotate-180 shrink-0" />
                <span className="font-semibold text-[15px] text-[var(--text-dark)]">{c.name}</span>
                {c.nameEn && <span className="text-[12px] text-[var(--text-muted)]">EN: {c.nameEn}</span>}
                {c.parent && <span className="text-[12px] text-[var(--text-muted)]">в „{c.parent.name}“</span>}
                <span className="ml-auto text-[12px] font-semibold text-[var(--text-muted)] bg-[var(--bg-light)] border border-[var(--border)] rounded-full px-2.5 py-0.5 whitespace-nowrap">
                  {c.products.length} продукта
                </span>
              </summary>

              <div className="border-t border-[var(--border)] px-5 py-4 space-y-5">
                {/* Rename (BG + EN) + delete */}
                <div className="flex flex-wrap items-center gap-3">
                  <SaveForm action={renameCategory.bind(null, c.id)} className="flex flex-wrap items-center gap-2">
                    <input name="name" defaultValue={c.name} title="Име (BG)" className={`${input} py-1.5`} />
                    <input name="nameEn" defaultValue={c.nameEn || ''} placeholder="Име (EN) — по желание" title="Име (EN)" className={`${input} py-1.5`} />
                    <button className="text-[13px] font-semibold text-[var(--primary)] hover:underline">Запази имената</button>
                  </SaveForm>
                  <form action={deleteCategory.bind(null, c.id)} className="ml-auto">
                    <button className="text-[13px] text-red-500 hover:underline">Изтрий категорията</button>
                  </form>
                </div>

                {/* Products in this category */}
                {c.products.length === 0 ? (
                  <p className="text-[13px] text-[var(--text-muted)]">Няма продукти в тази категория.</p>
                ) : (
                  <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
                    {c.products.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-[14px] text-[var(--text-dark)] min-w-0 truncate">{p.name}</span>
                        <span className="text-[13px] text-[var(--text-muted)] whitespace-nowrap">{p.price.toFixed(2)} €</span>
                        <SaveForm action={removeProductFromCategory.bind(null, c.id, p.id)} className="ml-auto">
                          <button className="text-[12px] text-red-500 hover:underline whitespace-nowrap">Премахни</button>
                        </SaveForm>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add a product */}
                {addable.length > 0 && (
                  <SaveForm action={addProductToCategory.bind(null, c.id)} className="flex flex-wrap items-center gap-2">
                    <select name="productId" required defaultValue="" className={`${input} flex-1 min-w-[220px]`}>
                      <option value="" disabled>— избери продукт за добавяне —</option>
                      {addable.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>+ Добави</button>
                  </SaveForm>
                )}
              </div>
            </details>
          );
        })}
      </div>
      {categories.length === 0 && <p className="text-[14px] text-[var(--text-muted)] p-6 text-center bg-white border border-[var(--border)] rounded-lg">Няма категории.</p>}

      <p className="text-[12px] text-[var(--text-muted)] mt-4">Бележка: продукт може да е в няколко категории оттук. При редакция на самия продукт обаче падащото меню „Категория“ задава само една — запазването му ще премахне допълнителните категории на този продукт.</p>
    </div>
  );
}
