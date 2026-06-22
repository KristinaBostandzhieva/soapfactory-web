'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Simple anti-bot math question — generated client-side only (after mount)
  // so the SSR markup doesn't depend on Math.random() and stays hydration-safe.
  const [math, setMath] = useState<{ a: number; b: number } | null>(null);
  useEffect(() => {
    setMath({ a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) });
  }, []);
  const [mathAnswer, setMathAnswer] = useState('');
  const [hp, setHp] = useState(''); // honeypot — humans never see/fill this

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rating < 1) { setError('Моля избери оценка (звезди).'); return; }
    if (!name.trim()) { setError('Моля попълни име.'); return; }
    if (!math || Number(mathAnswer) !== math.a + math.b) { setError('Моля отговори вярно на въпроса за сигурност.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, authorName: name, rating, comment, hp, mathA: math.a, mathB: math.b, mathAnswer }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || 'Възникна грешка.'); return; }
      setDone(true);
    } catch { setError('Възникна грешка. Опитай отново.'); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="bg-[var(--bg-light)] rounded-md p-5 text-[14px] text-[var(--text-body)]">
        Благодарим за отзива! 🌿 Той ще се появи след преглед от наш екип.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl">
      <h4 style={{ fontFamily: hf, fontWeight: 800, fontSize: 16, color: '#333' }} className="mb-3">Напиши отзив</h4>
      {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">{error}</p>}

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" aria-label={`${i} звезди`}
            onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            className="p-0.5">
            <Star size={26} className={i <= (hover || rating) ? 'text-amber-400' : 'text-gray-300'} fill={i <= (hover || rating) ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <div className="mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Твоето име *" className={inputCls} />
      </div>
      <div className="mb-3">
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Сподели мнението си (по желание)" className={inputCls} />
      </div>

      {/* Honeypot — hidden from humans; only bots fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', height: 0, width: 0, overflow: 'hidden' }}>
        <label>Не попълвай това поле
          <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>

      {/* Simple anti-bot question */}
      <div className="mb-4">
        <label className="block text-[13px] mb-1">За сигурност: колко е <strong>{math ? `${math.a} + ${math.b}` : '… + …'}</strong>? *</label>
        <input value={mathAnswer} onChange={(e) => setMathAnswer(e.target.value)} inputMode="numeric"
          className={inputCls} style={{ maxWidth: 140 }} placeholder="Отговор" disabled={!math} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>
        {loading ? 'Изпращане…' : 'Изпрати отзив'}
      </button>
    </form>
  );
}
