import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Pencil } from 'lucide-react';
import { togglePostPublished, deletePost } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function AdminBlog() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: 'desc' } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>Блог <span className="text-[var(--text-muted)] text-[18px]">({posts.length})</span></h1>
        <Link href="/admin/blog/nov" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Нова статия</Link>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg overflow-x-auto">
        {posts.length === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] p-6 text-center">Все още няма статии.</p>
        ) : (
          <table className="w-full text-[14px]">
            <thead className="bg-[var(--bg-light)] text-left text-[var(--text-muted)]">
              <tr><th className="px-4 py-3">Заглавие</th><th className="px-4 py-3">Дата</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3 text-right">Действия</th></tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-light)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded bg-[var(--bg-light)] overflow-hidden flex-shrink-0">
                        {p.coverImage && <img src={p.coverImage} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-[var(--text-dark)] line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{new Date(p.publishedAt).toLocaleDateString('bg-BG')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Публикувана' : 'Чернова'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <form action={togglePostPublished.bind(null, p.id)}>
                        <button className="text-[13px] text-[var(--primary)] hover:underline">{p.published ? 'Скрий' : 'Публикувай'}</button>
                      </form>
                      <Link href={`/admin/blog/${p.id}`} className="text-[var(--text-muted)] hover:text-[var(--primary)]" aria-label="Редактирай"><Pencil size={16} /></Link>
                      <form action={deletePost.bind(null, p.id)}>
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
