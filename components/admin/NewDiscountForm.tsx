'use client';

import { useState } from 'react';
import { createDiscount } from '@/app/admin/actions';

const hf = 'var(--font-body)';
const label = 'block text-[13px] font-medium mb-1';
const input = 'w-full border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

// Avoid easily-confused characters (0/O, 1/I) so codes are easy to read & type.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function randomCode(len = 8): string {
  let s = '';
  for (let i = 0; i < len; i++) s += pick(ALPHABET.split(''));
  return s;
}
function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function NewDiscountForm() {
  const [code, setCode] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState('');
  const [minSubtotal, setMin] = useState('');
  const [maxUses, setMax] = useState('');
  const [expiresAt, setExp] = useState('');

  function generate() {
    setCode(randomCode());
    setType('percent');
    setValue(String(pick([5, 10, 15, 20])));
    setMax('100');
    setExp(inDays(30));
    setMin('');
  }

  return (
    <form action={createDiscount} className="bg-white border border-[var(--border)] rounded-lg p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }}>Нов код</h3>
        <button type="button" onClick={generate}
          className="px-4 py-2 rounded text-[13px] font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">
          🎲 Генерирай
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={label}>Код *</label>
          <input name="code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
            placeholder="напр. WELCOME10" className={`${input} uppercase`} />
        </div>
        <div>
          <label className={label}>Тип</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={input}>
            <option value="percent">Процент (%)</option>
            <option value="fixed">Фиксирана сума (€)</option>
          </select>
        </div>
        <div>
          <label className={label}>Стойност *</label>
          <input name="value" type="number" step="0.01" min="0" required value={value} onChange={(e) => setValue(e.target.value)}
            placeholder="10" className={input} />
        </div>
        <div>
          <label className={label}>Мин. сума на поръчка (€)</label>
          <input name="minSubtotal" type="number" step="0.01" min="0" value={minSubtotal} onChange={(e) => setMin(e.target.value)}
            placeholder="по желание" className={input} />
        </div>
        <div>
          <label className={label}>Макс. брой употреби</label>
          <input name="maxUses" type="number" min="1" step="1" value={maxUses} onChange={(e) => setMax(e.target.value)}
            placeholder="неограничено" className={input} />
        </div>
        <div>
          <label className={label}>Валиден до</label>
          <input name="expiresAt" type="date" value={expiresAt} onChange={(e) => setExp(e.target.value)} className={input} />
        </div>
      </div>

      <button type="submit" className="btn-primary mt-5" style={{ padding: '10px 26px', fontSize: 14 }}>Създай код</button>
    </form>
  );
}
