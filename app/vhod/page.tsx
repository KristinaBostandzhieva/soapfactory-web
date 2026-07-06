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
    <div className="max-w-[440px] mx-auto px-[15px] py-16">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }} className="mb-6 text-center">Вход</h1>
      <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
        {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-[13px] mb-1">Имейл *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-2">
          <label className="block text-[13px] mb-1">Парола *</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <div className="text-right mb-5">
          <Link href="/zabravena-parola" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--primary)]">Забравена парола?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ padding: '11px', fontSize: 14 }}>
          {loading ? 'Влизане…' : 'Вход'}
        </button>
        <p className="text-[13px] text-[var(--text-body)] text-center mt-5">
          Нямаш профил? <Link href="/registratsiya" className="text-[var(--primary)] font-semibold hover:underline">Регистрирай се</Link>
        </p>
      </form>
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
