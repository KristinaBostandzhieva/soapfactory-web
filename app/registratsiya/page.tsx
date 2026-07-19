'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Turnstile from '@/components/Turnstile';

const captchaEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken: captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Възникна грешка.');
        // Token is single-use — reset the widget so the user can retry.
        setCaptchaToken(''); setCaptchaKey((k) => k + 1);
        return;
      }
      // Account isn't created yet — go confirm the code we just emailed.
      router.push(`/registratsiya/potvarzhdenie?email=${encodeURIComponent(email)}`);
    } catch {
      setError('Възникна грешка. Опитай отново.');
      setCaptchaToken(''); setCaptchaKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
      <p className="auth-kicker">Soapfactory account</p>
      <h1 style={{ fontFamily: hf }} className="auth-title">Регистрация</h1>
      <form onSubmit={submit} className="auth-form">
        {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="auth-label">Име и фамилия *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-4">
          <label className="auth-label">Имейл *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div className="mb-6">
          <label className="auth-label">Парола * <span className="text-[var(--text-muted)]">(поне 6 символа)</span></label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        <Turnstile key={captchaKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />
        <button type="submit" disabled={loading || (captchaEnabled && !captchaToken)} className="auth-submit">
          {loading ? 'Създаване…' : 'Създай профил'}
        </button>
        <p className="auth-switch">
          Вече имаш профил? <Link href="/vhod">Вход</Link>
        </p>
      </form>
      </div>
    </div>
  );
}
