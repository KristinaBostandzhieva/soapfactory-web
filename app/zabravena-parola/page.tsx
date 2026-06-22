'use client';

import { useState } from 'react';
import Link from 'next/link';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Възникна грешка.'); return; }
      setSent(true);
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-[440px] mx-auto px-[15px] py-20 text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#9B72C7', marginBottom: 12 }}>
          Провери пощата си
        </h1>
        <p className="text-[14px] text-[var(--text-body)] mb-6">
          Ако имейл адресът <strong>{email}</strong> е регистриран при нас, ще получиш линк за смяна на паролата в следващите минути.
        </p>
        <Link href="/vhod" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">
          ← Обратно към вход
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[440px] mx-auto px-[15px] py-16">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }} className="mb-2 text-center">
        Забравена парола
      </h1>
      <p className="text-[13px] text-[var(--text-muted)] text-center mb-6">
        Въведи имейла си и ще ти изпратим линк за смяна на паролата.
      </p>
      <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
        )}
        <div className="mb-5">
          <label className="block text-[13px] mb-1">Имейл *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="твоят@имейл.com"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ padding: '11px', fontSize: 14 }}>
          {loading ? 'Изпращане…' : 'Изпрати линк'}
        </button>
        <p className="text-[13px] text-[var(--text-body)] text-center mt-5">
          <Link href="/vhod" className="text-[var(--primary)] font-semibold hover:underline">← Обратно към вход</Link>
        </p>
      </form>
    </div>
  );
}
