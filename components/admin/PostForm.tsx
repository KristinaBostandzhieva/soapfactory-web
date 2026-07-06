'use client';

import Link from 'next/link';
import { useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

const hf = 'var(--font-body)';
const label = 'block text-[13px] font-medium mb-1';
const input = 'w-full border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export interface PostInitial {
  title?: string; slug?: string; excerpt?: string | null; coverImage?: string | null;
  content?: string; published?: boolean;
  titleEn?: string | null; excerptEn?: string | null; contentEn?: string | null;
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
          <RichTextEditor name="content" defaultValue={initial?.content || ''} required />
        </div>

        {/* English version — shown on the site when the visitor switches to EN */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-light)] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--primary)] text-white">EN</span>
            <p className="text-[13px] font-semibold text-[var(--text-dark)]">Английска версия <span className="text-[var(--text-muted)] font-normal">(по желание)</span></p>
          </div>
          <p className="text-[12px] text-[var(--text-muted)] -mt-2">Показва се, когато посетителят превключи сайта на английски. Остави празно, за да се показва българският текст.</p>
          <div>
            <label className={label}>Заглавие (EN)</label>
            <input name="titleEn" defaultValue={initial?.titleEn || ''} placeholder="Post title in English" className={input} />
          </div>
          <div>
            <label className={label}>Кратко описание (EN)</label>
            <textarea name="excerptEn" rows={2} defaultValue={initial?.excerptEn || ''} placeholder="Short summary in English" className={input} />
          </div>
          <div>
            <label className={label}>Съдържание (EN)</label>
            <RichTextEditor name="contentEn" defaultValue={initial?.contentEn || ''} />
          </div>
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
