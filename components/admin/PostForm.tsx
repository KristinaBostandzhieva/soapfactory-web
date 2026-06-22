'use client';

import Link from 'next/link';
import { useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

const hf = 'var(--font-body)';
const label = 'block text-[13px] font-medium mb-1';
const input = 'w-full border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export interface PostInitial {
  title?: string; slug?: string; excerpt?: string | null; coverImage?: string | null;
  content?: string; published?: boolean;
}

export default function PostForm({
  action, initial, heading,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: PostInitial;
  heading: string;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#333' }}>{heading}</h1>
        <Link href="/admin/blog" className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)]">← Назад</Link>
      </div>

      <form action={action} onSubmit={() => setSaving(true)} className="bg-white border border-[var(--border)] rounded-lg p-6 space-y-5">
        <div>
          <label className={label}>Заглавие *</label>
          <input name="title" required defaultValue={initial?.title} className={input} />
        </div>

        <div>
          <label className={label}>Кратко описание (резюме)</label>
          <textarea name="excerpt" rows={2} defaultValue={initial?.excerpt || ''} placeholder="Кратък текст, показан в списъка и в Google." className={input} />
        </div>

        <div>
          <label className={label}>Заглавна снимка</label>
          <ImageUpload name="coverImage" defaultValue={initial?.coverImage} />
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Качи файл от компютъра или постави URL.</p>
        </div>

        <div>
          <label className={label}>Съдържание *</label>
          <textarea name="content" required rows={16} defaultValue={initial?.content || ''} placeholder="Напиши статията тук. Раздели абзаците с празен ред." className={`${input} font-mono text-[13px]`} />
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Раздели абзаците с празен ред. Можеш да използваш и HTML.</p>
        </div>

        <div>
          <label className={label}>URL адрес (slug) — по желание</label>
          <input name="slug" defaultValue={initial?.slug || ''} placeholder="генерира се автоматично от заглавието" className={input} />
        </div>

        <label className="flex items-center gap-2 text-[14px] cursor-pointer">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="accent-[var(--primary)]" /> Публикувана (видима на сайта)
        </label>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>
            {saving ? 'Запазване…' : 'Запази'}
          </button>
        </div>
      </form>
    </div>
  );
}
