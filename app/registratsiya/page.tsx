'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '???????? ??????.'); return; }
      router.push('/account');
      router.refresh();
    } catch {
      setError('???????? ??????. ?????? ??????.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[440px] mx-auto px-[15px] py-16">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }} className="mb-6 text-center">???????????</h1>
      <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
        {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-[13px] mb-1">???</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-4">
          <label className="block text-[13px] mb-1">????? *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-6">
          <label className="block text-[13px] mb-1">?????? * <span className="text-[var(--text-muted)]">(???? 6 ???????)</span></label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ padding: '11px', fontSize: 14 }}>
          {loading ? '?????????…' : '?????? ??????'}
        </button>
        <p className="text-[13px] text-[var(--text-body)] text-center mt-5">
          ???? ???? ??????? <Link href="/vhod" className="text-[var(--primary)] font-semibold hover:underline">????</Link>
        </p>
      </form>
    </div>
  );
}
