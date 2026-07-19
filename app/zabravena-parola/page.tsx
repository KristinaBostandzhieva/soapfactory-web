'use client';

import { useState } from 'react';
import Link from 'next/link';
import Turnstile from '@/components/Turnstile';

const captchaEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (captchaEnabled && !captchaToken) { setError('Моля, потвърди, че не си робот.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken: captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Възникна грешка.');
        setCaptchaToken(''); setCaptchaKey((k) => k + 1); // single-use token → reset
        return;
      }
      setSent(true);
    } catch {
      setError('Възникна грешка. Опитай отново.');
      setCaptchaToken(''); setCaptchaKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
      <div className="auth-card text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 style={{ fontFamily: hf }} className="auth-title">
          Провери пощата си
        </h1>
        <p className="text-[14px] text-[var(--text-body)] mb-6">
          Ако имейл адресът <strong>{email}</strong> е регистриран при нас, ще получиш линк за смяна на паролата в следващите минути.
        </p>
        <Link href="/vhod" className="auth-mini-link">
          ← Обратно към вход
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
      <p className="auth-kicker">Password help</p>
      <h1 style={{ fontFamily: hf }} className="auth-title">
        Забравена парола
      </h1>
      <p className="auth-subtitle">
        Въведи имейла си и ще ти изпратим линк за смяна на паролата.
      </p>
      <form onSubmit={submit} className="auth-form">
        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
        )}
        <div className="mb-5">
          <label className="auth-label">Имейл *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="твоят@имейл.com"
          />
        </div>
        <Turnstile key={captchaKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />
        <button type="submit" disabled={loading || (captchaEnabled && !captchaToken)} className="auth-submit">
          {loading ? 'Изпращане…' : 'Изпрати линк'}
        </button>
        <p className="auth-switch">
          <Link href="/vhod">← Обратно към вход</Link>
        </p>
      </form>
      </div>
    </div>
  );
}
