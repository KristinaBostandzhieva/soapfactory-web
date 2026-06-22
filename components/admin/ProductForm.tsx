'use client';

import Link from 'next/link';
import { useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

const hf = 'var(--font-body)';
const label = 'block text-[13px] font-medium mb-1';
const input = 'w-full border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export interface ProductInitial {
  name?: string; slug?: string; price?: number; sku?: string | null;
  shortDescription?: string | null; description?: string | null; weight?: string | null;
  inStock?: boolean; featured?: boolean; imageUrl?: string; categoryId?: string;
  stockQty?: number | null;
}

export default function ProductForm({
  action, categories, initial, heading,
}: {
  action: (formData: FormData) => void | Promise<void>;
  categories: { id: string; name: string; parentName?: string | null }[];
  initial?: ProductInitial;
  heading: string;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#333' }}>{heading}</h1>
        <Link href="/admin/produkti" className="text-[14px] text-[var(--text-muted)] hover:text-[var(--primary)]">← Назад</Link>
      </div>

      <form action={action} onSubmit={() => setSaving(true)} className="bg-white border border-[var(--border)] rounded-lg p-6 space-y-5">
        <div>
          <label className={label}>Име на продукта *</label>
          <input name="name" required defaultValue={initial?.name} className={input} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Цена (€) *</label>
            <input name="price" type="number" step="0.01" min="0" required defaultValue={initial?.price} className={input} />
          </div>
          <div>
            <label className={label}>Категория</label>
            <select name="categoryId" defaultValue={initial?.categoryId || ''} className={input}>
              <option value="">— без категория —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.parentName ? `${c.parentName} › ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={label}>Артикулен номер (SKU)</label>
            <input name="sku" defaultValue={initial?.sku || ''} className={input} />
          </div>
          <div>
            <label className={label}>Тегло</label>
            <input name="weight" defaultValue={initial?.weight || ''} placeholder="напр. 100 г" className={input} />
          </div>
        </div>

        <div>
          <label className={label}>Наличност (брой)</label>
          <input name="stockQty" type="number" min="0" step="1" defaultValue={initial?.stockQty ?? ''} placeholder="напр. 25" className={input} />
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Остави празно за неограничена наличност. Намалява автоматично при поръчка; при 0 се показва „Изчерпано“.</p>
        </div>

        <div>
          <label className={label}>Кратко описание</label>
          <input name="shortDescription" defaultValue={initial?.shortDescription || ''} className={input} />
        </div>

        <div>
          <label className={label}>Описание</label>
          <textarea name="description" rows={5} defaultValue={initial?.description || ''} className={input} />
        </div>

        <div>
          <label className={label}>Снимка на продукта</label>
          <ImageUpload name="imageUrl" defaultValue={initial?.imageUrl} />
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Качи файл от компютъра или постави URL. Остави празно за заместваща снимка.</p>
        </div>

        <div>
          <label className={label}>URL адрес (slug) — по желание</label>
          <input name="slug" defaultValue={initial?.slug || ''} placeholder="генерира се автоматично от името" className={input} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-[14px] cursor-pointer">
            <input type="checkbox" name="inStock" defaultChecked={initial?.inStock ?? true} className="accent-[var(--primary)]" /> Налично <span className="text-[12px] text-[var(--text-muted)]">(когато няма зададен брой)</span>
          </label>
          <label className="flex items-center gap-2 text-[14px] cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="accent-[var(--primary)]" /> Промотиран (на начална страница)
          </label>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>
            {saving ? 'Запазване…' : 'Запази'}
          </button>
        </div>
      </form>
    </div>
  );
}
