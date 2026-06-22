'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function AccountSettingsPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name ?? '');
          setPhone(d.user.phone ?? '');
          setAddress(d.user.address ?? '');
          setCity(d.user.city ?? '');
          setPostcode(d.user.postcode ?? '');
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(''); setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address, city, postcode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Грешка.'); return; }
      setMsg('Данните са запазени.');
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Редактиране на профила"
        breadcrumbs={[
          { label: 'Начало', href: '/' },
          { label: 'Моят профил', href: '/account' },
          { label: 'Редактиране' },
        ]}
      />
      <div className="max-w-[600px] mx-auto px-[15px] py-12">
        <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 20 }}>
            Лични данни
          </h2>
          {msg && <p className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{msg}</p>}
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-[13px] mb-1">Имена</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Имена" />
          </div>
          <div className="mb-4">
            <label className="block text-[13px] mb-1">Телефон</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+359..." />
          </div>
          <div className="mb-4">
            <label className="block text-[13px] mb-1">Адрес</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="Улица, №" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[13px] mb-1">Град</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="Град" />
            </div>
            <div>
              <label className="block text-[13px] mb-1">Пощенски код</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className={inputCls} placeholder="1000" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: '11px', fontSize: 14 }}>
            {loading ? 'Запазване…' : 'Запази промените'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/account/promyana-parola" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">
            Смяна на парола →
          </Link>
          <Link href="/account" className="text-[14px] text-[var(--text-muted)] hover:underline">
            ← Обратно към профила
          </Link>
        </div>
      </div>
    </div>
  );
}
