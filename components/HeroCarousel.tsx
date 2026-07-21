'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { useLanguageStore } from '@/store/languageStore';

const SLIDE_STATIC: { image: string; href: string; side?: 'left' | 'right'; bgPos: string }[] = [
  { image: '/images/hero-carousel-1st.png', href: '/kategoria/bio-sapuni', side: 'left', bgPos: 'center' },
  { image: '/images/hero-carousel-3.png', href: '/shop', bgPos: 'center' },
  { image: '/images/hero-carousel/hero-3.webp', href: '/produkt/slanchev-sapun', bgPos: 'center' },
  { image: '/images/hero-carousel2.png', href: '/kategoria/bio-sapuni', bgPos: 'center' },
  { image: '/images/carousel-3.png', href: '/kategoria/grizha-za-litseto', bgPos: 'center' },
  { image: '/images/carouse;-4.png', href: '/kategoria/grizha-za-litseto', bgPos: 'center' },
];

// Each container is set to the photo's own exact pixel aspect ratio, so
// object-fit: cover fills it with ZERO crop and ZERO letterbox gaps — the
// whole picture, edge-to-edge, no framing box.
const MOBILE_SLIDES: {
  image: string; href: string; bg: string; ratio: string;
  title: { bg: string; en: string }; text: { bg: string; en: string };
  showCta: boolean;
  minimal?: boolean;
  focalX?: string;
  focalY?: string;
  titleAsLink?: boolean;
  subtitleOnly?: boolean;
  zoom?: number;
}[] = [
  {
    image: '/images/mobile-version/bakuchiol-cream-hero2.png',
    href: '/kategoria/grizha-za-litseto',
    bg: '#ede7ec',
    ratio: '1024 / 1536',
    title: { bg: 'Bakuchiol Крем', en: 'Bakuchiol Cream' },
    text: { bg: 'Anti-age грижа с лифтинг ефект', en: 'Anti-ageing care with lifting power' },
    showCta: false,
    titleAsLink: true,
  },
  {
    image: '/images/happy-face-promo.png',
    href: '/kategoria/grizha-za-litseto',
    bg: '#e9ede8',
    ratio: '1024 / 1536',
    title: { bg: 'Happy Face Пяна', en: 'Happy Face Foam' },
    text: { bg: 'Почистваща пяна с AHA комплекс и алое вера', en: 'Cleansing foam with AHA complex & aloe vera' },
    showCta: true,
  },
  {
    image: '/images/mobile-version/happy-skin-cleanser-hero2.png',
    href: '/kategoria/grizha-za-litseto',
    bg: '#e9ede8',
    ratio: '1024 / 1536',
    title: { bg: 'Happy Face Пяна', en: 'Happy Face Foam' },
    text: { bg: 'Почистваща пяна с AHA комплекс и алое вера', en: 'Cleansing foam with AHA complex & aloe vera' },
    showCta: false,
    subtitleOnly: true,
    zoom: 1,
  },
  {
    image: '/images/mobile-version/mobile-herp-happyskin-blue2.png',
    href: '/kategoria/grizha-za-litseto',
    bg: '#eef0f2',
    ratio: '1024 / 1536',
    title: { bg: 'Happy Face — Проблемна кожа', en: 'Happy Face — Problem Skin' },
    text: { bg: 'Нежно почистване за сияйна кожа', en: 'Gentle cleansing for radiant skin' },
    showCta: true,
  },
  {
    image: '/images/mobile-version/bilkov-mobile-hero3.png',
    href: '/kategoria/bio-sapuni',
    bg: '#f2efe8',
    ratio: '1024 / 1536',
    title: { bg: 'Билкова Серия', en: 'Herbal Collection' },
    text: { bg: '100% натурални съставки, ръчно изработени', en: '100% natural ingredients, handcrafted' },
    showCta: true,
    focalX: '30%',
    minimal: true,
  },
  {
    image: '/images/mobile-version/slunchev-mobile-hero2.png',
    href: '/produkt/slanchev-sapun',
    bg: '#f4efe5',
    ratio: '1024 / 1536',
    title: { bg: 'Слънчева Серия', en: 'Sunny Collection' },
    text: { bg: 'Топлина и свежест с цитрусови масла', en: 'Warmth & freshness with citrus oils' },
    showCta: true,
    minimal: true,
    focalY: '20%',
  },
];

export default function HeroCarousel() {
  const tr = useT();
  const lang = useLanguageStore((s) => s.lang);
  const slides = [
    { ...SLIDE_STATIC[0], title: tr.hero.title1, text: tr.hero.text1, cta: tr.hero.cta1 },
    { ...SLIDE_STATIC[1], title: tr.hero.title2, text: tr.hero.text2, cta: tr.hero.cta2 },
    { ...SLIDE_STATIC[2], title: tr.hero.title3, text: tr.hero.text3, cta: tr.hero.cta3 },
    { ...SLIDE_STATIC[3], title: tr.hero.title4, text: tr.hero.text4, cta: tr.hero.cta4 },
    { ...SLIDE_STATIC[4], title: tr.hero.title2, text: tr.hero.text2, cta: tr.hero.cta2 },
    { ...SLIDE_STATIC[5], title: tr.hero.title2, text: tr.hero.text2, cta: tr.hero.cta2 },
  ];

  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timer.current = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    mobileTimer.current = setInterval(() => setMobileActive((i) => (i + 1) % MOBILE_SLIDES.length), 5000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (mobileTimer.current) clearInterval(mobileTimer.current);
    };
  }, []);

  const restart = () => {
    if (timer.current) clearInterval(timer.current);
    if (mobileTimer.current) clearInterval(mobileTimer.current);
    startTimer();
  };

  return (
    <div className="hero-carousel-wrap" style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: '100%', minHeight: 540 }}>
      <style>{`
        /* ── Desktop: unchanged full-bleed with overlay ── */
        .hc-img-wrap { position: absolute; inset: 0; }
        .hc-img-wrap > div { position: absolute; inset: 0; }
        .hc-mobile-panel { display: none; }

        /* Slide progress bar fill */
        @keyframes hcProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        /* ── Mobile: BoJ clean product hero ── */
        .hc-mobile-hero { display: none; }
        @media (max-width: 900px) {
          .hero-carousel-wrap {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            border-radius: 0 !important;
            background: transparent !important;
          }
          .hero-carousel-wrap::before,
          .hero-carousel-wrap::after { display: none; }
          .hc-img-wrap { display: none !important; }
          .hero-carousel-content { display: none !important; }
          .hero-carousel-dots { display: none !important; }
          .hc-mobile-panel { display: none !important; }

          .hc-mobile-hero {
            display: block;
            position: relative;
            overflow: hidden;
            width: 100%;
            aspect-ratio: 1024 / 1700;
          }

          /* Every slide sits absolutely inside the fixed-height container
             above, so height is identical across slides regardless of each
             photo's own pixel dimensions — no more per-slide height jumps. */
          .hcm-slide {
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.8s ease;
            pointer-events: none;
          }
          .hcm-slide.is-active {
            opacity: 1;
            pointer-events: auto;
          }

          /* Fills the fixed-height container edge-to-edge, centered both
             ways, with zero crop bias to one side. */
          .hcm-photo {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            object-position: center;
            transform: scale(1.22);
            filter: saturate(1.12) contrast(1.06) brightness(1.02);
          }

          /* Soft dissolve into the page background instead of a hard cut
             at the card's bottom edge. */
          .hcm-bottom-fade {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 70px;
            background: linear-gradient(to bottom, rgba(251,248,243,0) 0%, #fbf8f3 88%);
            pointer-events: none;
            z-index: 1;
          }

          .hcm-text {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 18px 28px 22px;
          }
          .hcm-title {
            font-family: var(--font-display), Georgia, serif;
            font-size: clamp(26px, 7.5vw, 34px);
            font-weight: 400;
            font-style: normal;
            color: #2a1a10;
            margin: 0 0 8px;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }
          .hcm-subtitle {
            font-family: var(--font-body);
            font-size: 13.5px;
            color: #7a6f69;
            margin: 0 0 18px;
            line-height: 1.5;
            max-width: 260px;
          }
          .hcm-text-nocta .hcm-subtitle {
            margin-bottom: 0;
          }
          .hcm-title-link {
            text-decoration: none;
            cursor: pointer;
          }
          .hcm-cta {
            display: inline-block;
            border: 1.5px solid #2a1a10;
            border-radius: 0;
            padding: 12px 32px;
            font-family: var(--font-body);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            text-decoration: none;
            color: #2a1a10;
            background: transparent;
            transition: background 0.2s, color 0.2s;
          }
          .hcm-cta:active {
            background: #2a1a10;
            color: #fff;
          }

          /* Indicator dashes — full-width like BoJ */
          .hcm-dots {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            padding: 6px 32px 22px;
          }
          .hcm-dot {
            height: 2px;
            flex: 1 1 0;
            background: rgba(42,26,16,0.13);
            border: none;
            padding: 0;
            cursor: pointer;
            transition: background 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
            border-radius: 1px;
          }
          .hcm-dot.is-on {
            background: #2a1a10;
          }
        }
      `}</style>

      {/* Image layer */}
      <div className="hc-img-wrap">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`hc-slide-image hc-slide-image-${i + 1}`}
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: s.bgPos || 'center',
              opacity: i === active ? 1 : 0,
              transition: 'opacity 1s ease',
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

      {/* Mobile BoJ-style panel — hidden on desktop */}
      <div className="hc-mobile-panel" />

      {/* Mobile clean product hero */}
      <div className="hc-mobile-hero">
        {MOBILE_SLIDES.map((ms, i) => (
          <div key={i} className={`hcm-slide${i === mobileActive ? ' is-active' : ''}`} style={{ background: ms.bg }}>
            <img
              src={ms.image}
              alt={ms.title[lang]}
              className="hcm-photo"
              style={(ms.focalX || ms.focalY || ms.zoom !== undefined) ? {
                objectPosition: `${ms.focalX || '50%'} ${ms.focalY || '50%'}`,
                transformOrigin: `${ms.focalX || '50%'} ${ms.focalY || '50%'}`,
                transform: `scale(${ms.zoom ?? 1.22})`,
              } : undefined}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {ms.minimal ? null : ms.subtitleOnly ? (
              <div className="hcm-text hcm-text-nocta">
                <p className="hcm-subtitle" style={{ margin: 0 }}>{ms.text[lang]}</p>
              </div>
            ) : (
              <div className={`hcm-text${!ms.showCta ? ' hcm-text-nocta' : ''}`}>
                {ms.titleAsLink ? (
                  <Link href={ms.href} className="hcm-title hcm-title-link">
                    {ms.title[lang]}
                  </Link>
                ) : (
                  <h2 className="hcm-title">{ms.title[lang]}</h2>
                )}
                <p className="hcm-subtitle">{ms.text[lang]}</p>
                {ms.showCta && (
                  <Link href={ms.href} className="hcm-cta">
                    {lang === 'en' ? 'SHOP NOW' : 'ПАЗАРУВАЙ'}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="hcm-bottom-fade" />
        <div className="hcm-dots">
          {MOBILE_SLIDES.map((_, i) => (
            <button key={i} onClick={() => { setMobileActive(i); restart(); }} className={`hcm-dot${i === mobileActive ? ' is-on' : ''}`} aria-label={tr.hero.slideLabel(i + 1)} />
          ))}
        </div>
      </div>
    </div>
  );
}
