import { prisma } from '@/lib/prisma';
import { toggleDiscount, deleteDiscount } from '@/app/admin/actions';
import NewDiscountForm from '@/components/admin/NewDiscountForm';
import SaveForm from '@/components/admin/SaveForm';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminDiscounts() {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-4xl">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-6">Промокодове</h1>

      <NewDiscountForm />

      {/* List */}
      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        {discounts.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Все още няма промокодове.</p>
        ) : (
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Код</th><th className="px-4 py-3">Отстъпка</th>
                <th className="px-4 py-3">Условия</th><th className="px-4 py-3">Употреби</th>
                <th className="px-4 py-3">Статус</th><th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-mono font-bold">{d.code}</td>
                  <td className="px-4 py-3">{d.type === 'percent' ? `${d.value}%` : `${d.value.toFixed(2)} €`}</td>
                  <td className="px-4 py-3 text-[13px] text-[var(--text-muted)]">
                    {d.minSubtotal != null ? `мин. ${d.minSubtotal.toFixed(2)} € · ` : ''}
                    {d.expiresAt ? `до ${new Date(d.expiresAt).toLocaleDateString('bg-BG')}` : 'без срок'}
                  </td>
                  <td className="px-4 py-3">{d.usedCount}{d.maxUses != null ? ` / ${d.maxUses}` : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.active ? 'Активен' : 'Спрян'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <SaveForm action={toggleDiscount.bind(null, d.id)}>
                        <button className="text-[13px] text-[var(--primary)] hover:underline">{d.active ? 'Спри' : 'Активирай'}</button>
                      </SaveForm>
                      <span className="text-[var(--border)]">|</span>
                      <form action={deleteDiscount.bind(null, d.id)}>
                        <button className="text-[13px] text-red-500 hover:underline">Изтрий</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
