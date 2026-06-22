import { prisma } from '@/lib/prisma';
import { approveReview, deleteReview } from '@/app/admin/actions';
import Stars from '@/components/Stars';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const show = filter === 'approved' ? 'approved' : filter === 'all' ? 'all' : 'pending';
  const where = show === 'pending' ? { approved: false } : show === 'approved' ? { approved: true } : {};

  const [reviews, pendingCount] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, include: { product: { select: { name: true, slug: true } } } }),
    prisma.review.count({ where: { approved: false } }),
  ]);

  const TABS = [['pending', `Чакащи (${pendingCount})`], ['approved', 'Одобрени'], ['all', 'Всички']] as const;

  return (
    <div className="max-w-4xl">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mb-6">Отзиви</h1>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(([val, label]) => (
          <a key={val} href={`/admin/otzivi?filter=${val}`}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${show === val ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)] text-[var(--text-dark)] hover:border-[var(--primary)]'}`}>
            {label}
          </a>
        ))}
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
        {reviews.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Няма отзиви тук.</p>
        ) : (
          <ul>
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-[var(--border)] p-5 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Stars rating={r.rating} size={14} />
                      <span className="text-[14px] font-semibold text-[var(--text-dark)]">{r.authorName}</span>
                      <span className="text-[12px] text-[var(--text-muted)]">за „{r.product.name}“ · {new Date(r.createdAt).toLocaleDateString('bg-BG')}</span>
                      {!r.approved && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Чака одобрение</span>}
                    </div>
                    {r.comment && <p className="text-[14px] text-[var(--text-body)]">{r.comment}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {!r.approved && (
                      <form action={approveReview.bind(null, r.id)}>
                        <button className="text-[13px] font-semibold text-green-600 hover:underline">Одобри</button>
                      </form>
                    )}
                    <form action={deleteReview.bind(null, r.id)}>
                      <button className="text-[13px] text-red-500 hover:underline">Изтрий</button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
