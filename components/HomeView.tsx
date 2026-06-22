'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductSection from '@/components/ProductSection';
import HomeMegaCarousel from '@/components/HomeMegaCarousel';
import DeostickProduct from '@/components/DeostickProduct';
import { useT } from '@/hooks/useT';

const VELVET_IMGS = [
  { src: '/images/fscr-care/velvet-banner/model-velvet.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol-promo-model.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol-model-cream.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol1.png', size: 'auto 100%' },
  { src: '/images/fscr-care/velvet-banner/conezime-model.png' },
  { src: '/images/fscr-care/velvet-banner/hyalouron-model.png' },
  { src: '/images/fscr-care/velvet-banner/hyalouron-serum-model.png' },
  { src: '/images/fscr-care/velvet-banner/hyalouron-promo-model2.png', size: '100% auto' },
];

const fd = 'var(--font-display), Georgia, serif';
const fb = 'var(--font-body)';

const FEATURE_ICONS_SVG = [
  /* Leaf — natural */
  <svg key="f1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  /* Award — quality */
  <svg key="f2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  /* Heart — vegan */
  <svg key="f3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  /* Flower — herbs */
  <svg key="f4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15"/><circle cx="12" cy="12" r="3"/><path d="m8 8 1.88 1.88M14.12 14.12 16 16m0-8-1.88 1.88M9.88 14.12 8 16"/></svg>,
];

const TRUST_ICONS = [
  <svg key="t1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21c0-4.5 2.5-8 7-12" /><path d="M11 9c2-1 5-1 6 1 .5 2.5-1.5 5-4 5.5-2.5.5-5-1-5.5-3.5" /></svg>,
  <svg key="t2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4 0-7-2.5-7-6 0-3 2-5 3-7 .5-1 .5-3-1-4 2-1 4 .5 4.5 2 .5-1 2.5-1 3 0 .5-1.5 2.5-3 4.5-2-1.5 1-1.5 3-1 4 1 2 3 4 3 7 0 3.5-3 6-7 6Z" /><circle cx="10" cy="11" r=".6" fill="currentColor" stroke="none" /><circle cx="14" cy="11" r=".6" fill="currentColor" stroke="none" /></svg>,
  <svg key="t3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V11" /><path d="M12 14C12 9 16 6 20 6c0 5-3 9-8 8Z" /><path d="M12 17C12 13 9 10 5 10c0 4.5 2.5 8 7 7Z" /></svg>,
  <svg key="t4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
];

const CAT_IMGS = ['/images/cat-litse.jpeg', '/images/cat-tialo.jpeg', '/images/cat-kosa.jpeg'];
const CAT_HREFS = ['/kategoria/grizha-za-litseto', '/kategoria/grizha-za-tialoto', '/kategoria/grizha-za-kosata'];
const FEATURE_ICONS = ['/images/icon-plant.png', '/images/icon-quality.png', '/images/icon-leaf.png', '/images/icon-wheat.png'];
const PARTNERS = [
  { name: 'Lilly', img: '/images/partner-lilly.jpeg' },
  { name: 'Kaufland', img: '/images/partner-kaufland.jpeg' },
  { name: 'Fantastico', img: '/images/partner-ff.jpeg' },
  { name: 'Zoya', img: '/images/partner-zoya.jpeg' },
];

interface Product { id: string; name: string; price: number; slug: string; image?: string; priceMax?: number; }
interface Post { id: string; slug: string; title: string; excerpt?: string | null; coverImage?: string | null; publishedAt: string | Date; }

export default function HomeView({
  newProducts, bestSellers, bioSoaps, deoSticks, shampooBlocks, velvetProducts, recentPosts,
}: {
  newProducts: Product[];
  bestSellers: Product[];
  bioSoaps: Product[];
  deoSticks: Product[];
  shampooBlocks: Product[];
  velvetProducts: Product[];
  recentPosts: Post[];
}) {
  const tr = useT();
  const [velvetIdx, setVelvetIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVelvetIdx(i => (i + 1) % VELVET_IMGS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const cats = [
    { title: tr.home.catFace, label: tr.home.catFaceLabel, desc: tr.home.catFaceDesc, cta: tr.home.catFaceCta, trust: tr.home.catFaceTrust, href: CAT_HREFS[0], img: CAT_IMGS[0] },
    { title: tr.home.catBody, label: tr.home.catBodyLabel, desc: tr.home.catBodyDesc, cta: tr.home.catBodyCta, trust: tr.home.catBodyTrust, href: CAT_HREFS[1], img: CAT_IMGS[1] },
    { title: tr.home.catHair, label: tr.home.catHairLabel, desc: tr.home.catHairDesc, cta: tr.home.catHairCta, trust: tr.home.catHairTrust, href: CAT_HREFS[2], img: CAT_IMGS[2] },
  ];

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section style={{ maxWidth: '100%', margin: '0 auto', padding: '20px 15px 0', display: 'grid', gridTemplateColumns: '2fr 1fr', minHeight: 760, gap: 30 }} className="hero-grid">
        <HeroCarousel />

        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 10, backgroundImage: 'url(/images/hero-carousel/promo-background.webp)', backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', zIndex: 0 }} />
          <div style={{ position: 'absolute', left: '50%', bottom: '9%', transform: 'translateX(-50%)', zIndex: 1, width: 'min(98%, 585px)', height: 590 }}>
            <div className="hero-product-shadow" />
            <div className="hero-product-pop" style={{ animationDelay: '0.3s', height: '100%' }}>
              <DeostickProduct />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, padding: '24px 24px 40px', background: 'linear-gradient(to bottom, rgba(40,20,8,0.82) 0%, rgba(40,20,8,0.4) 60%, transparent 100%)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 26, lineHeight: '32px', color: '#fff', margin: 0 }}>
              {tr.hero.deotitle}
            </h2>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '60px 28px 28px', background: 'linear-gradient(to top, rgba(40,20,8,0.92) 0%, rgba(40,20,8,0.62) 52%, transparent 100%)', textAlign: 'center' }}>
            <p style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.68)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              {tr.hero.deobadge}
            </p>
            <p style={{ fontFamily: fb, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.80)', lineHeight: '20px', margin: '0 0 20px' }}>
              {tr.hero.deotext}
            </p>
            <Link href="/kategoria/deo-stikove" style={{ display: 'inline-block', background: '#fff', color: '#402511', fontSize: 13, fontWeight: 700, padding: '9px 22px', borderRadius: 50, fontFamily: fb, letterSpacing: '0.01em', textDecoration: 'none' }}>
              {tr.hero.deocta}
            </Link>
          </div>
        </div>
      </section>

      <div className="reveal-after-hero">

      {/* ═══ TRUST STRIP ═══ */}
      {/* ═══ НОВИ + НАЙ-ПРОДАВАНИ CAROUSEL ═══ */}
      <HomeMegaCarousel newProducts={newProducts} bestSellers={bestSellers} />

      {/* ═══ CATEGORY CARDS ═══ */}
      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: fb, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 10 }}>{tr.home.catSectionEyebrow}</p>
          <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 34, color: '#2e1a0e', lineHeight: 1.2, marginBottom: 12 }}>{tr.home.catSectionTitle}</h2>
          <p style={{ fontFamily: fb, fontSize: 15, color: 'var(--text-body)', maxWidth: 520, margin: '0 auto' }}>{tr.home.catSectionSub}</p>
        </div>

        <div className="cat-cards-grid">
          {cats.map((cat) => (
            <Link key={cat.href} href={cat.href} className="cat-card" aria-label={cat.cta}>
              <img src={cat.img} alt={cat.title} className="cat-card-img" />
              <div className="cat-card-overlay" />
              <div className="cat-card-content">
                <span className="cat-card-label">{cat.label}</span>
                <h3 className="cat-card-title">{cat.title}</h3>
                <p className="cat-card-desc">{cat.desc}</p>
                <span className="cat-card-btn">{cat.cta} <span aria-hidden="true">→</span></span>
                <span className="cat-card-trust"><span aria-hidden="true">✓</span> {cat.trust}</span>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 36, fontFamily: fb, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{tr.home.catTrustLine}</p>
      </section>

      {/* merged into HomeMegaCarousel above */}

      {/* ═══ ABOUT ═══ */}
      <section className="section-pad" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Sakura — top center, 5 notched petals */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: 20, left: '40%', opacity: 0.18, pointerEvents: 'none', userSelect: 'none' }} width="200" height="200" viewBox="-100 -100 200 200" fill="none">
          <g>
            {[0,72,144,216,288].map((deg, i) => (
              <path key={i} transform={`rotate(${deg})`}
                d="M 0 0 C -16 -10, -19 -36, -8 -54 Q 0 -63 8 -54 C 19 -36, 16 -10, 0 0 Z"
                fill="#F2A0BE" />
            ))}
            <circle r="16" fill="#FFFDE7" />
            <circle r="9" fill="#F9D04A" />
            <circle r="4" fill="#fff" />
          </g>
        </svg>

        {/* Anime round-petal flower — mid left, no face */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: '42%', left: 24, opacity: 0.16, pointerEvents: 'none', userSelect: 'none', transform: 'rotate(10deg)' }} width="160" height="160" viewBox="-80 -80 160 160" fill="none">
          <g>
            {[0,40,80,120,160,200,240,280,320].map((deg, i) => (
              <ellipse key={i} transform={`rotate(${deg})`} cx="0" cy="-30" rx="12" ry="12" fill="#FF85AD" />
            ))}
            <circle r="20" fill="#FFE566" />
            <circle r="11" fill="#FFB830" />
            <circle r="5" fill="#fff" />
          </g>
        </svg>

        {/* Small sakura — bottom center */}
        <svg aria-hidden="true" style={{ position: 'absolute', bottom: 50, left: '33%', opacity: 0.15, pointerEvents: 'none', userSelect: 'none', transform: 'rotate(-12deg)' }} width="130" height="130" viewBox="-65 -65 130 130" fill="none">
          <g>
            {[0,72,144,216,288].map((deg, i) => (
              <path key={i} transform={`rotate(${deg})`}
                d="M 0 0 C -11 -8, -13 -26, -6 -38 Q 0 -45 6 -38 C 13 -26, 11 -8, 0 0 Z"
                fill="#EE9BB5" />
            ))}
            <circle r="11" fill="#FFFDE7" />
            <circle r="6" fill="#F9D04A" />
            <circle r="3" fill="#fff" />
          </g>
        </svg>

        {/* Tiny anime flower — top left area */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: '18%', left: '28%', opacity: 0.13, pointerEvents: 'none', userSelect: 'none' }} width="100" height="100" viewBox="-50 -50 100 100" fill="none">
          <g>
            {[0,45,90,135,180,225,270,315].map((deg, i) => (
              <ellipse key={i} transform={`rotate(${deg})`} cx="0" cy="-19" rx="8" ry="8" fill="#FF85AD" />
            ))}
            <circle r="13" fill="#FFE566" />
            <circle r="7" fill="#FFB830" />
            <circle r="3" fill="#fff" />
          </g>
        </svg>

        {/* Botanical background — top right flower */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: -40, right: -60, opacity: 0.08, pointerEvents: 'none', userSelect: 'none' }} width="480" height="480" viewBox="0 0 480 480" fill="none">
          {/* Large open rose / botanical bloom */}
          {[0,45,90,135,180,225,270,315].map((deg, i) => (
            <ellipse key={i} cx="240" cy="240" rx="52" ry="130"
              transform={`rotate(${deg} 240 240)`}
              fill="#9B72C7" />
          ))}
          <circle cx="240" cy="240" r="38" fill="#fff" />
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={i} cx="240" cy="240" rx="18" ry="52"
              transform={`rotate(${deg} 240 240)`}
              fill="#4E8B3F" />
          ))}
          <circle cx="240" cy="240" r="18" fill="#fff" />
          <circle cx="240" cy="240" r="10" fill="#9B72C7" />
          {/* Scattered small dots */}
          {[30,80,145,200,265,320,380,435].map((a, i) => {
            const r = 190 + (i % 3) * 18;
            const x = 240 + r * Math.cos(a * Math.PI / 180);
            const y = 240 + r * Math.sin(a * Math.PI / 180);
            return <circle key={i} cx={x} cy={y} r="5" fill="#9B72C7" />;
          })}
        </svg>

        {/* Botanical — top left small cluster */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: 20, left: 10, opacity: 0.07, pointerEvents: 'none', userSelect: 'none' }} width="220" height="220" viewBox="0 0 220 220" fill="none">
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={i} cx="110" cy="110" rx="28" ry="72" transform={`rotate(${deg} 110 110)`} fill="#9B72C7" />
          ))}
          <circle cx="110" cy="110" r="22" fill="#fff" />
          <circle cx="110" cy="110" r="12" fill="#4E8B3F" />
          <circle cx="110" cy="110" r="6" fill="#fff" />
          {/* satellite buds */}
          {[25,100,175,250,325].map((a, i) => {
            const x = 110 + 95 * Math.cos(a * Math.PI / 180);
            const y = 110 + 95 * Math.sin(a * Math.PI / 180);
            return (
              <g key={i}>
                {[0,72,144,216,288].map((d, j) => (
                  <ellipse key={j} cx={x} cy={y} rx="7" ry="18" transform={`rotate(${d} ${x} ${y})`} fill="#9B72C7" />
                ))}
                <circle cx={x} cy={y} r="5" fill="#fff" />
              </g>
            );
          })}
        </svg>

        {/* Botanical — bottom right medium bloom */}
        <svg aria-hidden="true" style={{ position: 'absolute', bottom: -20, right: 80, opacity: 0.065, pointerEvents: 'none', userSelect: 'none', transform: 'rotate(25deg)' }} width="300" height="300" viewBox="0 0 300 300" fill="none">
          {[0,40,80,120,160,200,240,280,320].map((deg, i) => (
            <ellipse key={i} cx="150" cy="150" rx="34" ry="90" transform={`rotate(${deg} 150 150)`} fill="#4E8B3F" />
          ))}
          <circle cx="150" cy="150" r="28" fill="#fff" />
          {[0,60,120,180,240,300].map((deg, i) => (
            <ellipse key={i} cx="150" cy="150" rx="12" ry="36" transform={`rotate(${deg} 150 150)`} fill="#9B72C7" />
          ))}
          <circle cx="150" cy="150" r="13" fill="#fff" />
          <circle cx="150" cy="150" r="7" fill="#4E8B3F" />
        </svg>

        {/* Botanical — mid right loose petals */}
        <svg aria-hidden="true" style={{ position: 'absolute', top: '38%', right: 20, opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }} width="160" height="200" viewBox="0 0 160 200" fill="none">
          <path d="M80 180 Q60 130 80 80 Q100 130 80 180Z" fill="#9B72C7" />
          <path d="M80 180 Q30 150 20 100 Q70 110 80 180Z" fill="#4E8B3F" />
          <path d="M80 180 Q130 150 140 100 Q90 110 80 180Z" fill="#4E8B3F" />
          <path d="M80 80 Q55 50 60 10 Q85 45 80 80Z" fill="#9B72C7" />
          <path d="M80 80 Q105 50 100 10 Q75 45 80 80Z" fill="#9B72C7" />
          <circle cx="80" cy="80" r="10" fill="#9B72C7" />
          <circle cx="80" cy="80" r="5" fill="#fff" />
        </svg>

        {/* Botanical background — bottom left leaf branch */}
        <svg aria-hidden="true" style={{ position: 'absolute', bottom: -30, left: -50, opacity: 0.07, pointerEvents: 'none', userSelect: 'none', transform: 'rotate(-20deg)' }} width="340" height="340" viewBox="0 0 340 340" fill="none">
          {/* Main stem */}
          <path d="M60 320 Q120 220 170 140 Q200 80 210 30" stroke="#4E8B3F" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Leaves */}
          {[
            { cx: 110, cy: 260, rx: 38, ry: 18, rot: -40 },
            { cx: 140, cy: 210, rx: 44, ry: 20, rot: 30 },
            { cx: 158, cy: 168, rx: 40, ry: 17, rot: -35 },
            { cx: 178, cy: 125, rx: 36, ry: 16, rot: 28 },
            { cx: 192, cy: 88,  rx: 32, ry: 14, rot: -30 },
          ].map((l, i) => (
            <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
              transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
              fill="#4E8B3F" />
          ))}
          {/* Small flowers along stem */}
          {[{x:108,y:258},{x:178,y:123},{x:200,y:62}].map((p, i) => (
            <g key={i}>
              {[0,72,144,216,288].map((d, j) => (
                <ellipse key={j} cx={p.x} cy={p.y} rx="5" ry="11"
                  transform={`rotate(${d} ${p.x} ${p.y})`}
                  fill="#9B72C7" />
              ))}
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" />
            </g>
          ))}
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-center">
            <img src="/images/about-soaps.jpeg" alt={tr.home.aboutTitle} className="max-w-full h-auto object-contain" style={{ maxHeight: 840 }} />
          </div>
          <div>
            <p style={{ fontFamily: fb, fontWeight: 600, fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 10 }}>{tr.home.aboutSub}</p>
            <h2 style={{ fontFamily: fd, fontWeight: 500, fontStyle: 'italic', fontSize: 'clamp(26px,2.6vw,38px)', color: 'var(--text-heading)', marginBottom: 16, lineHeight: 1.15 }}>{tr.home.aboutTitle}</h2>
            <p style={{ fontFamily: fb, fontSize: 15, color: 'var(--text-body)', lineHeight: 1.72, marginBottom: 32 }}>{tr.home.aboutBody}</p>

            {/* Feature cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
              {tr.home.features.slice(0, 3).map((f, i) => (
                <div key={i} style={{
                  background: 'var(--bg-light)',
                  borderRadius: 14,
                  padding: '18px 14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  border: '1px solid rgba(141,85,60,0.10)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(141,85,60,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0,
                  }}>
                    {FEATURE_ICONS_SVG[i]}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: fb, fontWeight: 700, fontSize: 13, color: 'var(--text-heading)', marginBottom: 5, lineHeight: 1.3 }}>{f.title}</h4>
                    <p style={{ fontFamily: fb, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/za-nas" className="btn-primary inline-block">{tr.home.aboutLearnMore}</Link>
          </div>
        </div>
      </section>

      {/* ═══ PROMO BANNERS ═══ */}
      <section style={{ maxWidth: '100%', margin: '0 auto', padding: '0 15px', display: 'grid', gridTemplateColumns: 'minmax(320px, 760px) minmax(0, 1fr)', gap: 16 }} className="promo-grid">

        {/* Velvet */}
        <Link href="/kategoria/velvet" className="group" style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '0.8 / 1', borderRadius: 16, overflow: 'hidden', textDecoration: 'none' }}>
          {VELVET_IMGS.map((slide, i) => (
            <div key={slide.src} style={{
              position: 'absolute', inset: 0,
              backgroundColor: '#2f211d',
              opacity: i === velvetIdx ? 1 : 0,
              transition: 'opacity 0.9s ease',
            }}>
              <div style={{
                position: 'absolute', inset: '-10%',
                backgroundImage: `url(${slide.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(18px)',
                transform: 'scale(1.05)',
                opacity: 0.55,
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${slide.src})`,
                backgroundSize: slide.size || 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }} />
            </div>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(58,38,28,0.95) 0%, rgba(58,38,28,0.5) 45%, rgba(58,38,28,0.0) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '36px 40px', maxWidth: '90%' }}>
            <h2 style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 'clamp(22px, 2.4vw, 32px)', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{tr.home.velvetTitle}</h2>
            <p style={{ fontFamily: fb, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 24 }}>{tr.home.velvetBody.split('\n').join(' ')}</p>
          </div>
        </Link>

        {/* Velvet products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>Серия Velvet</h3>
            <Link href="/kategoria/seria-velvet" style={{ fontFamily: fb, fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Виж всички →</Link>
          </div>
          {velvetProducts.map(p => (
            <Link key={p.id} href={`/produkt/${p.slug}`} style={{ display: 'flex', gap: 20, alignItems: 'center', textDecoration: 'none', background: 'var(--bg-light)', borderRadius: 14, padding: 20, border: '1px solid var(--border)', transition: 'box-shadow 0.2s, transform 0.2s' }} className="group hover:shadow-md">
              <div style={{ width: 140, height: 140, borderRadius: 10, background: '#fff', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: fb, fontWeight: 600, fontSize: 17, color: 'var(--text-heading)', margin: '0 0 10px', lineHeight: 1.4 }}>{p.name}</p>
                <p style={{ fontFamily: fb, fontSize: 17, color: 'var(--primary)', fontWeight: 700, margin: 0 }}>{p.price.toFixed(2)} €</p>
              </div>
              <span style={{ fontFamily: fb, fontSize: 22, color: 'var(--primary)', flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>

      </section>

      {/* ═══ БИО САПУНИ ═══ */}
      <ProductSection title={tr.home.sectionBioSoaps} viewAllHref="/kategoria/bio-sapuni" products={bioSoaps} />

      {/* ═══ ДЕО СТИКОВЕ ═══ */}
      <ProductSection title={tr.home.sectionDeoSticks} viewAllHref="/kategoria/deo-stikove" products={deoSticks} columns={3} />

      {/* ═══ ШАМПОАНОВИ БЛОКЧЕТА ═══ */}
      <ProductSection title={tr.home.sectionShampooBlocks} viewAllHref="/kategoria/shampoanovi-blokcheta" products={shampooBlocks} />

      {/* ═══ PARTNERS ═══ */}
      <section className="section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ fontFamily: fb, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 8 }}>{tr.home.partnersSub}</p>
            <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 36, color: 'var(--text-heading)', lineHeight: 1.15, marginBottom: 18 }}>{tr.home.partnersTitle}</h2>
            <p className="text-[15px] text-[var(--text-body)] leading-relaxed mb-6">{tr.home.partnersBody}</p>
            <Link href="/za-kontakti" className="btn-primary">{tr.home.partnersContact}</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 items-center justify-items-center">
            {PARTNERS.map((p) => (
              <div key={p.name} className="flex items-center justify-center" style={{ height: 150 }}>
                <img src={p.img} alt={p.name} className="max-w-full max-h-full object-contain" style={{ maxHeight: 150 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOG ═══ */}
      <section className="section-pad">
        <div className="title-row">
          <h2 className="section-title">{tr.home.blogTitle}</h2>
          <Link href="/polezno" className="btn-primary">{tr.home.viewAll}</Link>
        </div>
        <hr className="title-underline-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/polezno/${post.slug}`} className="group">
              <div className="rounded-md bg-[var(--bg-light)] mb-4 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                {post.coverImage && <img src={post.coverImage} alt={post.title} className="product-img w-full h-full object-cover" />}
              </div>
              <p className="text-[12px] text-[var(--text-muted)] mb-1">{new Date(post.publishedAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h4 style={{ fontFamily: fd, fontWeight: 600, fontSize: 16, color: '#333' }} className="group-hover:!text-[#9B72C7] transition-colors mb-2">{post.title}</h4>
              {post.excerpt && <p className="text-[14px] text-[var(--text-body)] line-clamp-2">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>

      </div>
    </div>
  );
}
