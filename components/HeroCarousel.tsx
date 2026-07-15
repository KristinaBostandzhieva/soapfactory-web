'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

const SLIDE_STATIC: { image: string; href: string; side?: 'left' | 'right'; bgPos: string }[] = [
  { image: '/images/hero-carousel-1st.png', href: '/kategoria/bio-sapuni', side: 'left', bgPos: 'center' },
  { image: '/images/hero-carousel/hero-2.webp', href: '/shop', bgPos: 'center' },
  { image: '/images/hero-carousel/hero-3.webp', href: '/produkt/slanchev-sapun', bgPos: 'center' },
  { image: '/images/hero-carousel/hero-4.webp', href: '/kategoria/bio-sapuni', bgPos: '20% 30%' },
];

export default function HeroCarousel() {
  const tr = useT();
  const slides = [
    { ...SLIDE_STATIC[0], title: tr.hero.title1, text: tr.hero.text1, cta: tr.hero.cta1 },
    { ...SLIDE_STATIC[1], title: tr.hero.title2, text: tr.hero.text2, cta: tr.hero.cta2 },
    { ...SLIDE_STATIC[2], title: tr.hero.title3, text: tr.hero.text3, cta: tr.hero.cta3 },
    { ...SLIDE_STATIC[3], title: tr.hero.title4, text: tr.hero.text4, cta: tr.hero.cta4 },
  ];

  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timer.current = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const restart = () => {
    if (timer.current) clearInterval(timer.current);
    startTimer();
  };

  return (
    <div className="hero-carousel-wrap" style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: '100%', minHeight: 620 }}>
      <style>{`
        /* ── Desktop: unchanged full-bleed with overlay ── */
        .hc-img-wrap { position: absolute; inset: 0; }
        .hc-img-wrap > div { position: absolute; inset: 0; }
        .hc-mobile-panel { display: none; }

        /* Slow Ken Burns drift on the active slide */
        @keyframes hcKenBurns {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
        .hc-kenburns { animation: hcKenBurns 7s ease-out both; }
        @media (max-width: 900px) {
          .hc-kenburns { animation: none; }
        }

        /* Slide progress bar fill */
        @keyframes hcProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        /* ── Mobile: BoJ split layout ── */
        @media (max-width: 900px) {
          .hero-carousel-wrap {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
            border-radius: 14px !important;
            isolation: isolate;
            background: #fff;
          }
          .hero-carousel-wrap::before,
          .hero-carousel-wrap::after {
            content: '';
            position: absolute;
            pointer-events: none;
            z-index: 0;
            filter: blur(18px);
            opacity: 0.72;
          }
          .hero-carousel-wrap::before {
            left: -18%;
            bottom: -16%;
            width: 62%;
            height: 42%;
            background:
              radial-gradient(ellipse at 20% 70%, rgba(198, 229, 190, 0.76) 0%, rgba(198, 229, 190, 0.42) 38%, transparent 72%),
              radial-gradient(ellipse at 78% 26%, rgba(255, 211, 220, 0.55) 0%, transparent 64%);
          }
          .hero-carousel-wrap::after {
            right: -20%;
            bottom: -18%;
            width: 68%;
            height: 46%;
            background:
              radial-gradient(ellipse at 76% 76%, rgba(255, 205, 219, 0.78) 0%, rgba(255, 205, 219, 0.4) 36%, transparent 72%),
              radial-gradient(ellipse at 28% 28%, rgba(234, 223, 166, 0.56) 0%, transparent 66%);
          }
          .hc-img-wrap {
            position: relative !important;
            inset: auto !important;
            height: 54vw;
            max-height: 260px;
            flex-shrink: 0;
            overflow: hidden;
            border-radius: 14px 14px 0 0;
            z-index: 1;
          }
          /* hide desktop text overlay on mobile */
          .hero-carousel-content { display: none !important; }
          .hero-carousel-dots { display: none !important; }
          /* white vignette on mobile instead of dark brown */
          .hc-img-overlay { background: linear-gradient(to bottom, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.55) 100%) !important; }

          /* mobile text panel */
          .hc-mobile-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background:
              radial-gradient(ellipse at 10% 110%, rgba(255,130,165,0.55) 0%, transparent 58%),
              radial-gradient(ellipse at 90% 110%, rgba(120,210,150,0.50) 0%, transparent 58%),
              #fff;
            padding: 14px 18px 16px;
            border-radius: 0 0 14px 14px;
            position: relative;
            z-index: 1;
          }
          .hc-slide-title {
            font-family: var(--font-display), Georgia, serif;
            font-size: 17px;
            font-weight: 600;
            font-style: italic;
            color: #2a1a10;
            margin: 0 0 5px;
            line-height: 1.25;
          }
          .hc-slide-text {
            font-family: var(--font-body);
            font-size: 11px;
            color: #888;
            margin: 0 0 10px;
            line-height: 1.5;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
          }
          .hc-slide-btn {
            display: inline-block;
            border: 1px solid #2a1a10;
            color: transparent;
            padding: 7px 22px;
            font-family: var(--font-body);
            font-size: 0;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-decoration: none;
            margin-bottom: 12px;
            transition: background 0.2s, color 0.2s;
            position: relative;
          }
          .hc-slide-btn::after {
            content: 'ПАЗАРУВАЙ';
            font-size: 10px;
            color: #2a1a10;
            font-family: var(--font-body);
            font-weight: 700;
            letter-spacing: 0.1em;
          }
          .hc-slide-btn:active { background: #2a1a10; }
          .hc-slide-btn:active::after { color: #fff; }
          .hc-dash-dots {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
          }
          .hc-dash-dot {
            height: 2px;
            width: 20px;
            background: rgba(0,0,0,0.18);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
            flex-shrink: 0;
          }
          .hc-dash-dot.on { width: 32px; background: #2a1a10; }
        }
      `}</style>

      {/* Image layer */}
      <div className="hc-img-wrap">
        {slides.map((s, i) => (
          <div
            key={i}
            className={i === active ? 'hc-kenburns' : undefined}
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: s.bgPos || 'center',
              opacity: i === active ? 1 : 0,
              transition: 'opacity 1s ease',
              willChange: 'transform, opacity',
            }}
          />
        ))}
        {/* Overlay — dark on desktop, white fade on mobile */}
        <div className="hc-img-overlay" style={{
          position: 'absolute', inset: 0,
          background: slides[active].side === 'right'
            ? 'linear-gradient(260deg, rgba(64,37,17,0.48) 0%, rgba(64,37,17,0.26) 42%, rgba(64,37,17,0.02) 75%)'
            : 'linear-gradient(100deg, rgba(64,37,17,0.48) 0%, rgba(64,37,17,0.26) 42%, rgba(64,37,17,0.02) 75%)',
          transition: 'background 0.6s ease',
        }} />
      </div>

      {/* Desktop text (full-bleed overlay) */}
      <div className="hero-carousel-content" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 46, alignItems: slides[active].side === 'right' ? 'flex-end' : 'flex-start' }}>
        {slides.map((s, i) => (
          <div key={i} style={{ display: i === active ? 'block' : 'none', maxWidth: 580, textAlign: s.side === 'right' ? 'right' : 'left' }}>
            <h1 className={`hero-carousel-h1${i === active ? ' hero-anim' : ''}`} style={{
              fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 400,
              fontSize: 'var(--text-hero)', lineHeight: 1.12, color: '#fff', margin: '0 0 32px',
              textShadow: '0 2px 24px rgba(30, 18, 8, 0.28)', animationDelay: '0.35s',
            }}>
              {s.title}
            </h1>
            <Link href={s.href} className={`hero-cta${i === active ? ' hero-anim' : ''}`} style={{ animationDelay: '0.85s' }}>
              {s.cta}
              <span className="hero-cta-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop slide indicator — thin lines, active one fills over the slide duration */}
      <div className="hero-carousel-dots" style={{ position: 'absolute', zIndex: 2, bottom: 26, left: 0, right: 0, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        {slides.map((s, i) => (
          <button key={i} aria-label={tr.hero.slideLabel(i + 1)} onClick={() => { setActive(i); restart(); }}
            style={{
              position: 'relative', overflow: 'hidden',
              width: i === active ? 44 : 24, height: 2,
              border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
              background: 'rgba(255,255,255,0.35)',
              transition: 'width 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}>
            {i === active && (
              <span key={active} style={{
                position: 'absolute', inset: 0, display: 'block',
                background: '#fff', transformOrigin: 'left',
                animation: 'hcProgress 6s linear both',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Mobile BoJ-style panel */}
      <div className="hc-mobile-panel">
        {slides.map((s, i) => (
          <div key={i} style={{ display: i === active ? 'contents' : 'none' }}>
            <h2 className="hc-slide-title">{s.title}</h2>
            <p className="hc-slide-text">{s.text}</p>
            <Link href={s.href} className="hc-slide-btn">{s.cta}</Link>
          </div>
        ))}
        <div className="hc-dash-dots">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setActive(i); restart(); }} className={`hc-dash-dot${i === active ? ' on' : ''}`} aria-label={tr.hero.slideLabel(i + 1)} />
          ))}
        </div>
      </div>
    </div>
  );
}
