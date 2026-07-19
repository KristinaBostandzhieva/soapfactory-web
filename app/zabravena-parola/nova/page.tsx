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
      <div className="auth-page">
      <div className="auth-card text-center">
        <p className="text-[14px] text-red-600 mb-4">Невалиден или липсващ линк.</p>
        <Link href="/zabravena-parola" className="auth-mini-link">Поискай нов линк</Link>
      </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
      <div className="auth-card text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 style={{ fontFamily: hf }} className="auth-title">
          Паролата е сменена!
        </h1>
        <p className="text-[14px] text-[var(--text-body)]">Пренасочване към вход…</p>
      </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
      <p className="auth-kicker">Password reset</p>
      <h1 style={{ fontFamily: hf }} className="auth-title">
        Нова парола
      </h1>
      <p className="auth-subtitle">
        Въведи новата си парола (поне 6 символа).
      </p>
      <form onSubmit={submit} className="auth-form">
        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
        )}
        <div className="mb-4">
          <label className="auth-label">Нова парола *</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-6">
          <label className="auth-label">Потвърди паролата *</label>
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Запазване…' : 'Смени паролата'}
        </button>
      </form>
      </div>
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
