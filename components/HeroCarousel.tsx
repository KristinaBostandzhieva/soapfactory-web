'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

const SLIDE_STATIC = [
  { image: '/images/hero-carousel/hero-1.webp', href: '/kategoria/bio-sapuni', side: 'right' as const },
  { image: '/images/hero-carousel/hero-2.webp', href: '/shop' },
  { image: '/images/hero-carousel/hero-3.webp', href: '/produkt/slanchev-sapun' },
  { image: '/images/hero-carousel/hero-4.webp', href: '/kategoria/bio-sapuni' },
];

export default function HeroCarousel() {
  const tr = useT();
  const slides = [
    { ...SLIDE_STATIC[0], badge: tr.hero.badge1, title: tr.hero.title1, text: tr.hero.text1, cta: tr.hero.cta1 },
    { ...SLIDE_STATIC[1], badge: tr.hero.badge2, title: tr.hero.title2, text: tr.hero.text2, cta: tr.hero.cta2 },
    { ...SLIDE_STATIC[2], badge: tr.hero.badge3, title: tr.hero.title3, text: tr.hero.text3, cta: tr.hero.cta3 },
    { ...SLIDE_STATIC[3], badge: tr.hero.badge4, title: tr.hero.title4, text: tr.hero.text4, cta: tr.hero.cta4 },
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
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: '100%', minHeight: 760 }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${s.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        />
      ))}

      {/* Readability overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'background 0.6s ease',
        background: slides[active].side === 'right'
          ? 'linear-gradient(260deg, rgba(64,37,17,0.78) 0%, rgba(64,37,17,0.45) 42%, rgba(64,37,17,0.05) 75%)'
          : 'linear-gradient(100deg, rgba(64,37,17,0.78) 0%, rgba(64,37,17,0.45) 42%, rgba(64,37,17,0.05) 75%)',
      }} />

      {/* Text content */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 56, alignItems: slides[active].side === 'right' ? 'flex-end' : 'flex-start' }}>
        {slides.map((s, i) => (
          <div
            key={i}
            style={{
              display: i === active ? 'block' : 'none',
              maxWidth: 450,
              textAlign: s.side === 'right' ? 'right' : 'left',
            }}
          >
            <h1 className={i === active ? 'hero-anim' : ''} style={{
              fontFamily: 'var(--font-display), Georgia, serif', fontStyle: 'italic', fontWeight: 600,
              fontSize: 44, lineHeight: '54px', color: '#fff', margin: '0 0 18px',
              animationDelay: '0.35s',
            }}>
              {s.title}
            </h1>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 400,
              color: 'rgba(255,255,255,0.9)', lineHeight: '1.65', marginBottom: 24,
            }}>
              {s.text.split(' ').map((word, wi) => (
                <span key={wi}>
                  <span
                    className={i === active ? 'hero-word' : ''}
                    style={{ animationDelay: `${0.6 + wi * 0.06}s` }}
                  >
                    {word}
                  </span>{' '}
                </span>
              ))}
            </p>
            <Link href={s.href} className={`hero-cta${i === active ? ' hero-anim' : ''}`} style={{
              animationDelay: '0.85s',
            }}>
              {s.cta}
              <span className="hero-cta-arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', zIndex: 2, bottom: 24, left: 56, display: 'flex', gap: 8 }}>
        {slides.map((s, i) => (
          <button
            key={i}
            aria-label={tr.hero.slideLabel(i + 1)}
            onClick={() => { setActive(i); restart(); }}
            style={{
              width: i === active ? 24 : 10,
              height: 10,
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              background: i === active ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.25s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
