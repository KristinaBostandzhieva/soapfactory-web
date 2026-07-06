'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useT } from '@/hooks/useT';

const fb = 'var(--font-body)';
const fd = 'var(--font-display)';

const SKIN_TYPES    = ['Нормална', 'Суха', 'Мазна', 'Смесена', 'Чувствителна'];
const SKIN_CONCERNS = ['Акне', 'Стареене', 'Хидратация', 'Равномерен тен', 'Чувствителност'];

const labelCls = 'block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2';
const inputCls = 'w-full bg-white border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[14px] text-[var(--text-dark)] placeholder:text-[#b8aea6] focus:outline-none focus:border-[var(--primary)] transition-colors';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
        active
          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
          : 'bg-white border-[var(--border)] text-[var(--text-body)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
      }`}>
      {children}
    </button>
  );
}

export default function ReviewForm({ productId, showSkinType = false }: { productId: string; showSkinType?: boolean }) {
  const tr = useT().reviewsSection;
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [comment,    setComment]    = useState('');
  const [skinType,   setSkinType]   = useState('');
  const [concerns,   setConcerns]   = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');
  // null = still checking; false = guest; string = logged-in display name
  const [userName,   setUserName]   = useState<string | false | null>(null);
  const [math,       setMath]       = useState<{ a: number; b: number } | null>(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [hp,         setHp]         = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d?.user) { setUserName(false); return; }
        // Same shortening the server applies: "Мария Димитрова" → "Мария Д."
        const full = (d.user.name || d.user.email.split('@')[0]).trim();
        const parts = full.split(/\s+/);
        setUserName(parts.length < 2 ? full : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`);
      })
      .catch(() => setUserName(false));
    setMath({ a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) });
  }, []);

  const toggleConcern = (c: string) =>
    setConcerns(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rating < 1) { setError(tr.errRating); return; }
    if (!math || Number(mathAnswer) !== math.a + math.b) { setError(tr.errSecurity); return; }

    let fullComment = comment.trim();
    if (showSkinType && (skinType || concerns.length)) {
      const meta: string[] = [];
      if (skinType) meta.push(`Тип кожа: ${skinType}`);
      if (concerns.length) meta.push(`Грижи: ${concerns.join(', ')}`);
      fullComment = `[${meta.join(' · ')}]${fullComment ? '\n' + fullComment : ''}`;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment: fullComment, hp, mathA: math.a, mathB: math.b, mathAnswer }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || tr.errGeneric); return; }
      setDone(true);
    } catch { setError(tr.errNetwork); }
    finally { setLoading(false); }
  }

  if (userName === null) return null;

  if (userName === false) return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-light)] p-6 max-w-[520px]">
      <p style={{ fontFamily: fb }} className="text-[14px] text-[var(--text-body)] mb-4">
        {tr.loginRequired}
      </p>
      <div className="flex gap-2.5">
        <a href="/vhod" style={{ fontFamily: fb }}
          className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors no-underline">
          {tr.login}
        </a>
        <a href="/registratsiya" style={{ fontFamily: fb }}
          className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors no-underline">
          {tr.register}
        </a>
      </div>
    </div>
  );

  if (done) return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 max-w-[520px] flex items-start gap-3">
      <span className="text-[20px]">🌿</span>
      <div>
        <p style={{ fontFamily: fb }} className="text-[14px] font-semibold text-green-800 mb-0.5">{tr.thanksTitle}</p>
        <p style={{ fontFamily: fb }} className="text-[13px] text-green-700">{tr.thanksBody}</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-xl border border-[var(--border)] bg-[var(--bg-light)] p-6 sm:p-7 max-w-[520px] space-y-5">
      <div>
        <h3 style={{ fontFamily: fd, fontWeight: 600, fontSize: 20 }} className="text-[var(--text-heading)] mb-1">{tr.formTitle}</h3>
        <p style={{ fontFamily: fb }} className="text-[13px] text-[var(--text-muted)]">
          {tr.postingAs} <span className="font-semibold text-[var(--text-body)]">{userName}</span> · {tr.helps}
        </p>
      </div>

      {error && (
        <p style={{ fontFamily: fb }} className="text-[13px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      {/* Stars */}
      <div>
        <span className={labelCls} style={{ fontFamily: fb }}>{tr.rating} *</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} type="button" onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              className="p-1 -m-0.5 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
              aria-label={`${i} звезди`}>
              <Star size={28} strokeWidth={1.4}
                style={{
                  color: i <= (hover || rating) ? '#E8A33D' : '#d8cfc7',
                  fill: i <= (hover || rating) ? '#E8A33D' : 'none',
                  transition: 'color 0.15s, fill 0.15s',
                }} />
            </button>
          ))}
          {rating > 0 && (
            <span style={{ fontFamily: fb }} className="ml-2 text-[13px] font-semibold text-[var(--text-body)]">{rating} / 5</span>
          )}
        </div>
      </div>

      {/* Skin type */}
      {showSkinType && (
        <>
          <div>
            <span className={labelCls} style={{ fontFamily: fb }}>{tr.skinTypeLabel}</span>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map(t => (
                <Chip key={t} active={skinType === t} onClick={() => setSkinType(s => s === t ? '' : t)}>{tr.valueMap[t] || t}</Chip>
              ))}
            </div>
          </div>

          <div>
            <span className={labelCls} style={{ fontFamily: fb }}>{tr.concernsLabel}</span>
            <div className="flex flex-wrap gap-2">
              {SKIN_CONCERNS.map(c => (
                <Chip key={c} active={concerns.includes(c)} onClick={() => toggleConcern(c)}>{tr.valueMap[c] || c}</Chip>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Comment */}
      <div>
        <label className={labelCls} style={{ fontFamily: fb }}>{tr.comment}</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          rows={4} placeholder={tr.commentPlaceholder}
          className={`${inputCls} resize-none`} style={{ fontFamily: fb }} />
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {/* Math captcha */}
      <div>
        <label className={labelCls} style={{ fontFamily: fb }}>
          {math ? tr.security(math.a, math.b) : '…'} *
        </label>
        <input value={mathAnswer} onChange={e => setMathAnswer(e.target.value)}
          inputMode="numeric" placeholder={tr.answer} disabled={!math}
          className={`${inputCls} max-w-[110px]`} style={{ fontFamily: fb }} />
      </div>

      <button type="submit" disabled={loading} style={{ fontFamily: fb }}
        className="px-7 py-3 rounded-lg text-[12px] font-bold uppercase tracking-[0.1em] bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none">
        {loading ? tr.submitting : tr.submit}
      </button>
    </form>
  );
}
