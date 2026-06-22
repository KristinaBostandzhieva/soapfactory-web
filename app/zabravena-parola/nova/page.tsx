'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Паролите не съвпадат.'); return; }
    if (password.length < 6) { setError('Паролата трябва да е поне 6 символа.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Възникна грешка.'); return; }
      setDone(true);
      setTimeout(() => router.push('/vhod'), 3000);
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-[440px] mx-auto px-[15px] py-20 text-center">
        <p className="text-[14px] text-red-600 mb-4">Невалиден или липсващ линк.</p>
        <Link href="/zabravena-parola" className="text-[var(--primary)] font-semibold hover:underline">Поискай нов линк</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-[440px] mx-auto px-[15px] py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#9B72C7', marginBottom: 12 }}>
          Паролата е сменена!
        </h1>
        <p className="text-[14px] text-[var(--text-body)]">Пренасочване към вход…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[440px] mx-auto px-[15px] py-16">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }} className="mb-2 text-center">
        Нова парола
      </h1>
      <p className="text-[13px] text-[var(--text-muted)] text-center mb-6">
        Въведи новата си парола (поне 6 символа).
      </p>
      <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
        )}
        <div className="mb-4">
          <label className="block text-[13px] mb-1">Нова парола *</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-6">
          <label className="block text-[13px] mb-1">Потвърди паролата *</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ padding: '11px', fontSize: 14 }}>
          {loading ? 'Запазване…' : 'Смени паролата'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[var(--text-muted)]">Зареждане…</div>}>
      <ResetForm />
    </Suspense>
  );
}
