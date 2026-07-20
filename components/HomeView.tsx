'use client';

import { useState, useEffect, useRef } from 'react';
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
const CAT_FACE_IMGS = ['/images/cat-litse.png', '/images/cat-litse-2.png', '/images/cat-litse-3.png', '/images/cat-litse-4.png'];
const CAT_BODY_IMGS = ['/images/cat-ytalo.png', '/images/cat-tyalo-2.png', '/images/cat-tyalo-3.png', '/images/cat-tyalo-4.png'];
const CAT_HAIR_IMGS = ['/images/cat-hair.png', '/images/cat-hair-3.png'];
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
  const [catImgTick, setCatImgTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVelvetIdx(i => (i + 1) % VELVET_IMGS.length), 3000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setCatImgTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);
  const [velvetProductIdx, setVelvetProductIdx] = useState(0);
  const velvetProductCount = velvetProducts.length;
  const velvetLeftProduct = velvetProductCount ? velvetProducts[velvetProductIdx % velvetProductCount] : undefined;
  const velvetRightProduct = velvetProductCount > 1 ? velvetProducts[(velvetProductIdx + 1) % velvetProductCount] : undefined;

  useEffect(() => {
    if (velvetProductCount > 0 && velvetProductIdx >= velvetProductCount) {
      setVelvetProductIdx(0);
    }
  }, [velvetProductCount, velvetProductIdx]);

  const [partnerIdx, setPartnerIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPartnerIdx(i => (i + 1) % PARTNERS.length), 2000);
    return () => clearInterval(id);
  }, []);

  // Mobile slider (arrows scroll one card) for the ritual category cards.
  const catSliderRef = useRef<HTMLDivElement>(null);
  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, cardSel: string, dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(cardSel);
    el.scrollBy({ left: dir * ((card?.offsetWidth || el.clientWidth * 0.82) + 16), behavior: 'smooth' });
  };
  const scrollCats = (dir: number) => scrollRow(catSliderRef, '.cat-card', dir);

  const cats = [
    { title: tr.home.catFace, label: tr.home.catFaceLabel, desc: tr.home.catFaceDesc, cta: tr.home.catFaceCta, trust: tr.home.catFaceTrust, href: CAT_HREFS[0], img: CAT_IMGS[0], images: CAT_FACE_IMGS },
    { title: tr.home.catBody, label: tr.home.catBodyLabel, desc: tr.home.catBodyDesc, cta: tr.home.catBodyCta, trust: tr.home.catBodyTrust, href: CAT_HREFS[1], img: CAT_IMGS[1], images: CAT_BODY_IMGS },
    { title: tr.home.catHair, label: tr.home.catHairLabel, desc: tr.home.catHairDesc, cta: tr.home.catHairCta, trust: tr.home.catHairTrust, href: CAT_HREFS[2], img: CAT_IMGS[2], images: CAT_HAIR_IMGS },
  ];

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section style={{ maxWidth: '100%', margin: '0 auto', padding: '20px 15px 0', display: 'grid', gridTemplateColumns: '2.35fr 0.92fr', minHeight: 640, gap: 30, position: 'relative' }} className="hero-grid">
        <HeroCarousel />

        <div className="hero-deo-panel deo-panel-glow" style={{
          position: 'relative', borderRadius: 10, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background:
            'radial-gradient(ellipse 90% 55% at 50% 110%, rgba(244, 178, 197, 0.35) 0%, transparent 70%), ' +
            'linear-gradient(165deg, #F3F9EE 0%, #E9F3E3 55%, #F7FBF3 100%)',
          border: '1px solid rgba(63, 51, 45, 0.07)',
          padding: '30px 24px 28px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: fb, fontSize: 10.5, fontWeight: 600, color: '#7FA871', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {tr.hero.deobadge}
          </p>
          <h2 style={{ fontFamily: fd, fontWeight: 400, fontSize: 'clamp(24px, 2.2vw, 32px)', lineHeight: 1.2, color: '#3F332D', margin: 0 }}>
            {tr.hero.deotitle}
          </h2>

          {/* Product — fills the middle of the panel */}
          <div className="hero-deo-product" style={{ position: 'relative', flex: 1, width: 'min(102%, 560px)', minHeight: 0, margin: '10px 0 14px' }}>
            <div className="hero-product-shadow" />
            <div className="hero-product-pop" style={{ animationDelay: '0.3s', height: '100%' }}>
              <DeostickProduct />
            </div>
            {/* Light reflection pool under the product */}
            <div aria-hidden="true" style={{
              position: 'absolute', left: '18%', right: '18%', bottom: -8, height: 30,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 55%, transparent 75%)',
              filter: 'blur(7px)', pointerEvents: 'none',
            }} />
          </div>

          <p style={{ fontFamily: fb, fontSize: 13, fontWeight: 500, color: '#554C47', lineHeight: '20px', margin: '0 0 14px' }}>
            {tr.hero.deotext}
          </p>
          <Link href="/kategoria/deo-stikove" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#3F332D', color: '#fff',
            fontFamily: fb, fontSize: 11.5, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '13px 32px', textDecoration: 'none',
            boxShadow: '0 10px 26px -14px rgba(63, 51, 45, 0.45)',
          }}>
            {tr.hero.cta1}
            <span aria-hidden="true">&rarr;</span>
          </Link>
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

        <div className="cat-slider">
          <div className="cat-cards-grid" ref={catSliderRef}>
            {cats.map((cat, catIndex) => (
              <Link key={cat.href} href={cat.href} className="cat-card" aria-label={cat.cta}>
                {cat.images ? (
                  <span className="cat-card-img-stack" aria-hidden="true">
                    {cat.images.map((image, imageIndex) => (
                      <img
                        key={image}
                        src={image}
                        alt=""
                        className="cat-card-img cat-card-img-layer"
                        style={{ opacity: imageIndex === (catImgTick + catIndex) % cat.images.length ? 1 : 0 }}
                      />
                    ))}
                  </span>
                ) : (
                  <img src={cat.img} alt={cat.title} className="cat-card-img" />
                )}
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
          <button type="button" className="cat-slider-arrow left" onClick={() => scrollCats(-1)} aria-label="Предишна категория">‹</button>
          <button type="button" className="cat-slider-arrow right" onClick={() => scrollCats(1)} aria-label="Следваща категория">›</button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 36, fontFamily: fb, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{tr.home.catTrustLine}</p>
      </section>

      {/* merged into HomeMegaCarousel above */}


      {/* ═══ VELVET — banner centered, product cards rotate through side slots ═══ */}
      <section className="velvet-section" style={{ maxWidth: 1800, margin: '0 auto', padding: '0 15px' }}>
        <div className="title-row" style={{ marginBottom: 28 }}>
          <h2 className="section-title">Серия Velvet</h2>
          <Link href="/kategoria/seria-velvet" className="btn-primary">Виж всички →</Link>
        </div>
        <div className="velvet-triptych">
          {/* Banner (first in DOM so it leads when stacked on mobile) */}
          <Link href="/kategoria/seria-velvet" className="group velvet-banner" style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '0.8 / 1', borderRadius: 16, overflow: 'hidden', textDecoration: 'none' }}>
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
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 40px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: fd, fontWeight: 400, fontSize: 'clamp(22px, 2.4vw, 32px)', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{tr.home.velvetTitle}</h2>
              <p style={{ fontFamily: fb, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, margin: 0 }}>{tr.home.velvetBody.split('\n').join(' ')}</p>
            </div>
          </Link>

          {velvetLeftProduct && (
            <div key={`velvet-left-${velvetLeftProduct.id}-${velvetProductIdx}`} className="boj-product-grid velvet-side velvet-side-left">
              <ProductCard product={velvetLeftProduct} variant="bojCategory" />
            </div>
          )}
          {velvetRightProduct && (
            <div key={`velvet-right-${velvetRightProduct.id}-${velvetProductIdx}`} className="boj-product-grid velvet-side velvet-side-right">
              <ProductCard product={velvetRightProduct} variant="bojCategory" />
            </div>
          )}
        </div>
        {velvetProductCount > 2 && (
          <div className="velvet-stage-controls" aria-label="Velvet product slider">
            <input
              type="range"
              min={0}
              max={velvetProductCount - 1}
              value={velvetProductIdx}
              onChange={(e) => setVelvetProductIdx(Number(e.target.value))}
              aria-label="Избери Velvet продукти"
            />
          </div>
        )}
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
            <Link href="/za-kontakti" className="btn-primary" style={{ background: 'transparent', color: '#B08D57', border: '1.5px solid #B08D57', borderRadius: 0 }}>{tr.home.partnersContact}</Link>
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
