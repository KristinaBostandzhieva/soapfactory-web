'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(''); setError('');
    if (next !== confirm) { setError('Новите пароли не съвпадат.'); return; }
    if (next.length < 6) { setError('Новата парола трябва да е поне 6 символа.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Грешка.'); return; }
      setMsg('Паролата е сменена успешно.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Смяна на парола"
        breadcrumbs={[
          { label: 'Начало', href: '/' },
          { label: 'Моят профил', href: '/account' },
          { label: 'Смяна на парола' },
        ]}
      />
      <div className="max-w-[500px] mx-auto px-[15px] py-12">
        <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 20 }}>
            Смяна на парола
          </h2>
          {msg && <p className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{msg}</p>}
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-[13px] mb-1">Текуща парола *</label>
            <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
          </div>
          <div className="mb-4">
            <label className="block text-[13px] mb-1">Нова парола *</label>
            <input type="password" required value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} />
          </div>
          <div className="mb-6">
            <label className="block text-[13px] mb-1">Потвърди новата парола *</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: '11px', fontSize: 14 }}>
            {loading ? 'Запазване…' : 'Смени паролата'}
          </button>
        </form>
        <div className="mt-6">
          <Link href="/account" className="text-[14px] text-[var(--text-muted)] hover:underline">
            ← Обратно към профила
          </Link>
        </div>
      </div>
    </div>
  );
}
