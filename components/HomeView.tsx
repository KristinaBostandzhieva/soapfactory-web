'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductSection from '@/components/ProductSection';
import HomeMegaCarousel from '@/components/HomeMegaCarousel';
import DeostickProduct from '@/components/DeostickProduct';
import ProductCard from '@/components/ProductCard';
import { useT } from '@/hooks/useT';

const VELVET_IMGS = [
  { src: '/images/fscr-care/velvet-banner/model-velvet.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol-promo-model.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol-model-cream.png' },
  { src: '/images/fscr-care/velvet-banner/bakuchiol1.png', size: 'auto 100%' },
  { src: '/images/fscr-care/velvet-banner/hyalouron-serum-model.png' },
  { src: '/images/fscr-care/velvet-banner/hyalouron-promo-model2.png', size: '100% auto' },
];

const fd = 'var(--font-display), Georgia, serif';
const fb = 'var(--font-body)';

const TRUST_ICONS = [
  <svg key="t1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21c0-4.5 2.5-8 7-12" /><path d="M11 9c2-1 5-1 6 1 .5 2.5-1.5 5-4 5.5-2.5.5-5-1-5.5-3.5" /></svg>,
  <svg key="t2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4 0-7-2.5-7-6 0-3 2-5 3-7 .5-1 .5-3-1-4 2-1 4 .5 4.5 2 .5-1 2.5-1 3 0 .5-1.5 2.5-3 4.5-2-1.5 1-1.5 3-1 4 1 2 3 4 3 7 0 3.5-3 6-7 6Z" /><circle cx="10" cy="11" r=".6" fill="currentColor" stroke="none" /><circle cx="14" cy="11" r=".6" fill="currentColor" stroke="none" /></svg>,
  <svg key="t3" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V11" /><path d="M12 14C12 9 16 6 20 6c0 5-3 9-8 8Z" /><path d="M12 17C12 13 9 10 5 10c0 4.5 2.5 8 7 7Z" /></svg>,
  <svg key="t4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
];

const CAT_IMGS = ['/images/cat-litse.png', '/images/cat-ytalo.png', '/images/cat-hair.png'];
const CAT_HREFS = ['/kategoria/grizha-za-litseto', '/kategoria/grizha-za-tialoto', '/kategoria/grizha-za-kosata'];
const FEATURE_ICONS = ['/images/icon-plant.png', '/images/icon-quality.png', '/images/icon-leaf.png', '/images/icon-wheat.png'];
const PARTNERS = [
  { name: 'Lilly', img: '/images/logo-l.png' },
  { name: 'Kaufland', img: '/images/logo-k.png' },
  { name: 'Fantastico', img: '/images/logo-f.jpeg' },
  { name: 'Zoya', img: '/images/logo-z.png' },
];

interface Product { id: string; name: string; price: number; slug: string; image?: string; priceMax?: number; }
interface Post { id: string; slug: string; title: string; excerpt?: string | null; coverImage?: string | null; publishedAt: string | Date; }

export default function HomeView({
  newProducts, bestSellers, bioSoaps, scrubs, deoSticks, shampooBlocks, velvetProducts, recentPosts,
}: {
  newProducts: Product[];
  bestSellers: Product[];
  bioSoaps: Product[];
  scrubs: Product[];
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

  const [partnerIdx, setPartnerIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPartnerIdx(i => (i + 1) % PARTNERS.length), 2000);
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
          <div style={{ position: 'absolute', left: '50%', bottom: '9%', transform: 'translateX(-50%)', zIndex: 1, width: 'min(102%, 620px)', height: 620 }}>
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
            <p style={{ fontFamily: fb, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.80)', lineHeight: '20px', margin: 0 }}>
              {tr.hero.deotext}
            </p>
          </div>
        </div>
      </section>

      <div className="reveal-after-hero">

      {/* ═══ TRUST STRIP ═══ */}
      {/* ═══ НОВИ + НАЙ-ПРОДАВАНИ CAROUSEL ═══ */}
      <HomeMegaCarousel newProducts={[]} bestSellers={bestSellers} />

      {/* ═══ CATEGORY CARDS ═══ */}
      <section className="section-pad cat-ritual-section" style={{ paddingTop: 0 }}>
        <div className="cat-section-header" style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: fd, fontWeight: 500, fontSize: 'clamp(24px, 2vw, 30px)', color: '#2e1a0e', lineHeight: 1.2 }}>{tr.home.catSectionTitle}</h2>
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
                backgroundSize: slide.size || 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }} />
            </div>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(58,38,28,0.55) 0%, rgba(58,38,28,0.18) 45%, rgba(58,38,28,0.0) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '36px 40px', maxWidth: '90%' }}>
            <h2 style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 'clamp(22px, 2.4vw, 32px)', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{tr.home.velvetTitle}</h2>
            <p style={{ fontFamily: fb, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: 24 }}>{tr.home.velvetBody.split('\n').join(' ')}</p>
          </div>
        </Link>

        {/* Velvet products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 22, color: 'var(--text-heading)', margin: 0 }}>Серия Velvet</h3>
            <Link href="/kategoria/seria-velvet" style={{ fontFamily: fb, fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>Виж всички →</Link>
          </div>
          {velvetProducts.map(p => (
            <Link
              key={p.id}
              href={`/produkt/${p.slug}`}
              className="group velvet-product-row"
              style={{
                display: 'flex', gap: 24, alignItems: 'center',
                textDecoration: 'none', background: '#fdfbf8',
                border: '1px solid rgba(155, 114, 199, 0.16)', borderRadius: 18,
                padding: 20, transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
            >
              <div style={{ width: 200, height: 200, borderRadius: 12, background: '#fff', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontFamily: fd, fontStyle: 'italic', fontWeight: 500, fontSize: 19, color: 'var(--text-heading)', margin: '0 0 10px', lineHeight: 1.35 }}>{p.name}</h4>
                <p style={{ fontFamily: fb, fontSize: 17, color: 'var(--primary)', fontWeight: 700, margin: 0 }}>{p.price.toFixed(2)} €</p>
              </div>
              <span style={{ fontFamily: fb, fontSize: 22, color: 'var(--primary)', flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>

      </section>

      {/* ═══ БИО САПУНИ ═══ */}
      <ProductSection title={tr.home.sectionBioSoaps} viewAllHref="/kategoria/bio-sapuni" products={bioSoaps} />

      {/* ═══ ЕКСФОЛИАНТИ ═══ */}
      <ProductSection title={tr.nav.scrubs} viewAllHref="/kategoria/zaharni-eksfolianti" products={scrubs.slice(0, 3)} columns={3} />

      {/* ═══ PARTNERS ═══ */}
      <section className="section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p style={{ fontFamily: fb, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--secondary)', marginBottom: 8 }}>{tr.home.partnersSub}</p>
            <h2 style={{ fontFamily: fd, fontWeight: 500, fontSize: 'clamp(24px, 2vw, 30px)', color: 'var(--text-heading)', lineHeight: 1.15, marginBottom: 18 }}>{tr.home.partnersTitle}</h2>
            <p className="text-[15px] text-[var(--text-body)] leading-relaxed mb-6">{tr.home.partnersBody}</p>
            <Link href="/za-kontakti" className="btn-primary" style={{ background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 0 }}>{tr.home.partnersContact}</Link>
          </div>
          <div className="flex items-center justify-center" style={{ height: 200, position: 'relative' }}>
            {PARTNERS.map((p, i) => (
              <img
                key={p.name}
                src={p.img}
                alt={p.name}
                className="max-w-full max-h-full object-contain"
                style={{
                  position: 'absolute',
                  maxHeight: 150,
                  maxWidth: '80%',
                  opacity: i === partnerIdx ? 1 : 0,
                  transition: 'opacity 0.6s ease',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BLOG ═══ */}
      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="title-row" style={{ justifyContent: 'flex-end', marginBottom: 14 }}>
            <Link href="/polezno" className="btn-primary">{tr.home.viewAll}</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentPosts.slice(0, 2).map((post) => (
              <Link key={post.id} href={`/polezno/${post.slug}`} className="group">
                <div className="bg-[var(--bg-light)] mb-3 overflow-hidden" style={{ aspectRatio: '4/3', borderRadius: 0 }}>
                  {post.coverImage && <img src={post.coverImage} alt={post.title} className="product-img w-full h-full object-cover" style={{ borderRadius: 0 }} />}
                </div>
                <h4 style={{ fontFamily: fb, fontWeight: 600, fontSize: 14, color: '#111' }} className="group-hover:!text-[#9B72C7] transition-colors mb-2">{post.title}</h4>
                <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111', textDecoration: 'underline', textUnderlineOffset: 3 }}>{tr.home.blogReadMore}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}
