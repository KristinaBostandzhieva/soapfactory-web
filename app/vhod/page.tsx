'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Възникна грешка.'); return; }
      router.push(data.user?.role === 'admin' ? '/admin' : next);
      router.refresh();
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
      <p className="auth-kicker">Soapfactory account</p>
      <h1 style={{ fontFamily: hf }} className="auth-title">Вход</h1>
      <form onSubmit={submit} className="auth-form">
        {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="auth-label">Имейл *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-2">
          <label className="auth-label">Парола *</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div className="text-right mb-5">
          <Link href="/zabravena-parola" className="auth-mini-link">Забравена парола?</Link>
        </div>
        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Влизане…' : 'Вход'}
        </button>
        <p className="auth-switch">
          Нямаш профил? <Link href="/registratsiya">Регистрирай се</Link>
        </p>
      </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[var(--text-muted)]">Зареждане…</div>}>
      <LoginForm />
    </Suspense>
  );
}
