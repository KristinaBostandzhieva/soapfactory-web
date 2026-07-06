'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-3 text-center text-[22px] tracking-[10px] font-bold focus:outline-none focus:border-[var(--primary)]';

function ConfirmForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60); // a code was just emailed at signup
  const [exhausted, setExhausted] = useState(false); // no more resends without a lockout

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Възникна грешка.'); return; }
      router.push('/account');
      router.refresh();
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(''); setMsg('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Възникна грешка.');
        if (typeof data.retryAfter === 'number') setCooldown(data.retryAfter);
        return;
      }
      setMsg('Изпратихме нов код на имейла ти.');
      if (typeof data.retryAfter === 'number') setCooldown(data.retryAfter);
      else { setExhausted(true); setCooldown(0); } // next request would lock the account
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setResending(false);
    }
  }

  const resendDisabled = resending || cooldown > 0 || exhausted;

  return (
    <div className="max-w-[440px] mx-auto px-[15px] py-16">
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7' }} className="mb-2 text-center">Потвърди имейла</h1>
      <p className="text-[14px] text-[var(--text-body)] text-center mb-6">
        Изпратихме 6-цифрен код на{email ? <> <strong>{email}</strong></> : ' твоя имейл'}. Въведи го, за да завършиш регистрацията.
      </p>
      <form onSubmit={submit} className="bg-[var(--bg-light)] rounded-md p-8">
        {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
        {msg && <p className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">{msg}</p>}
        <div className="mb-6">
          <label className="block text-[13px] mb-1">Код за потвърждение *</label>
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="\d{6}"
            placeholder="______"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={inputCls}
          />
        </div>
        <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full text-center" style={{ padding: '11px', fontSize: 14 }}>
          {loading ? 'Потвърждаване…' : 'Потвърди и влез'}
        </button>
        <p className="text-[13px] text-[var(--text-body)] text-center mt-5">
          {exhausted ? (
            <span className="text-[var(--text-muted)]">Достигна лимита за изпращане. Опитай по-късно.</span>
          ) : (
            <>
              Не получи код?{' '}
              <button type="button" onClick={resend} disabled={resendDisabled} className="text-[var(--primary)] font-semibold hover:underline disabled:opacity-60 disabled:no-underline">
                {resending ? 'Изпращане…' : cooldown > 0 ? `Изпрати отново (${cooldown}с)` : 'Изпрати отново'}
              </button>
            </>
          )}
        </p>
        <p className="text-[12px] text-[var(--text-muted)] text-center mt-4">
          Ако вече имаш профил с този имейл, няма да получиш код — провери пощата си за инструкции за{' '}
          <Link href="/vhod" className="text-[var(--primary)] hover:underline">вход</Link>.
        </p>
        <p className="text-[13px] text-[var(--text-body)] text-center mt-2">
          <Link href="/registratsiya" className="text-[var(--text-muted)] hover:underline">← Обратно към регистрация</Link>
        </p>
      </form>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmForm />
    </Suspense>
  );
}
