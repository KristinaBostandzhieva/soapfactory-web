'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const fb = 'var(--font-body)';

const SKIN_TYPES    = ['Нормална', 'Суха', 'Мазна', 'Смесена', 'Чувствителна'];
const SKIN_CONCERNS = ['Акне', 'Стареене', 'Хидратация', 'Равномерен тен', 'Чувствителност'];

const labelStyle = {
  fontFamily: fb, fontSize: 10, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
  color: '#aaa', display: 'block', marginBottom: 10,
};

const inputStyle = {
  width: '100%', fontFamily: fb, fontSize: 14, color: '#222',
  background: 'transparent', border: 'none', borderBottom: '1px solid #ddd',
  padding: '8px 0', outline: 'none',
};

export default function ReviewForm({ productId, showSkinType = false }: { productId: string; showSkinType?: boolean }) {
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [name,       setName]       = useState('');
  const [comment,    setComment]    = useState('');
  const [skinType,   setSkinType]   = useState('');
  const [concerns,   setConcerns]   = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState('');
  const [loggedIn,   setLoggedIn]   = useState<boolean | null>(null);
  const [math,       setMath]       = useState<{ a: number; b: number } | null>(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [hp,         setHp]         = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => setLoggedIn(r.ok)).catch(() => setLoggedIn(false));
    setMath({ a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) });
  }, []);

  const toggleConcern = (c: string) =>
    setConcerns(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rating < 1) { setError('Моля избери оценка.'); return; }
    if (!name.trim()) { setError('Моля попълни ime.'); return; }
    if (!math || Number(mathAnswer) !== math.a + math.b) { setError('Грешен отговор на въпроса за сигурност.'); return; }

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
        body: JSON.stringify({ productId, authorName: name, rating, comment: fullComment, hp, mathA: math.a, mathB: math.b, mathAnswer }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setError(d.error || 'Възникна грешка.'); return; }
      setDone(true);
    } catch { setError('Възникна грешка. Опитай отново.'); }
    finally { setLoading(false); }
  }

  if (loggedIn === null) return null;

  if (!loggedIn) return (
    <div style={{ paddingTop: 12 }}>
      <p style={{ fontFamily: fb, fontSize: 13, color: '#888', marginBottom: 16 }}>
        Само регистрирани потребители могат да оставят отзив.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <a href="/vhod" style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid #222', color: '#222', padding: '9px 18px', textDecoration: 'none' }}>Вход</a>
        <a href="/registratsiya" style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid #9B72C7', color: '#9B72C7', padding: '9px 18px', textDecoration: 'none' }}>Регистрация</a>
      </div>
    </div>
  );

  if (done) return (
    <p style={{ fontFamily: fb, fontSize: 13, color: '#6a9e6a', paddingTop: 8 }}>
      Благодарим за отзива — ще се появи след преглед. 🌿
    </p>
  );

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 480 }}>
      <p style={{ fontFamily: fb, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333', margin: 0 }}>
        Напиши отзив
      </p>

      {error && (
        <p style={{ fontFamily: fb, fontSize: 12, color: '#e74c3c', margin: 0 }}>{error}</p>
      )}

      {/* Stars */}
      <div>
        <span style={labelStyle}>Оценка</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button" onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer' }}>
              <Star size={22} strokeWidth={1.2}
                style={{ color: i <= (hover || rating) ? '#D4899A' : '#ddd', fill: i <= (hover || rating) ? '#D4899A' : 'none', transition: 'color 0.15s' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label style={labelStyle}>Ime *</label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Твоето Ime" style={inputStyle} />
      </div>

      {/* Skin type */}
      {showSkinType && (
        <>
          <div>
            <span style={labelStyle}>Тип кожа</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKIN_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setSkinType(s => s === t ? '' : t)}
                  style={{
                    fontFamily: fb, fontSize: 11, padding: '5px 0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: skinType === t ? '#9B72C7' : '#999',
                    borderBottom: skinType === t ? '1px solid #9B72C7' : '1px solid transparent',
                    letterSpacing: '0.04em', transition: 'all 0.2s',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span style={labelStyle}>Основни грижи</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKIN_CONCERNS.map(c => (
                <button key={c} type="button" onClick={() => toggleConcern(c)}
                  style={{
                    fontFamily: fb, fontSize: 11, padding: '5px 0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: concerns.includes(c) ? '#9B72C7' : '#999',
                    borderBottom: concerns.includes(c) ? '1px solid #9B72C7' : '1px solid transparent',
                    letterSpacing: '0.04em', transition: 'all 0.2s',
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Comment */}
      <div>
        <label style={labelStyle}>Коментар</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          rows={3} placeholder="Сподели мнението си (по желание)"
          style={{ ...inputStyle, resize: 'none', borderBottom: '1px solid #ddd' }} />
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
      </div>

      {/* Math captcha */}
      <div>
        <label style={labelStyle}>
          За сигурност: {math ? `${math.a} + ${math.b} = ?` : '…'} *
        </label>
        <input value={mathAnswer} onChange={e => setMathAnswer(e.target.value)}
          inputMode="numeric" placeholder="Отговор" disabled={!math}
          style={{ ...inputStyle, maxWidth: 100 }} />
      </div>

      <button type="submit" disabled={loading}
        style={{
          fontFamily: fb, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', background: '#222', color: '#fff',
          border: 'none', padding: '13px 28px', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, alignSelf: 'flex-start',
        }}>
        {loading ? 'Изпращане…' : 'Изпрати'}
      </button>
    </form>
  );
}
