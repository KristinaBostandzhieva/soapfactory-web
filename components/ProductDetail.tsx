'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FavoriteButton from '@/components/FavoriteButton';
import Stars from '@/components/Stars';
import ReviewForm from '@/components/ReviewForm';
import { useCartStore } from '@/store/cartStore';
import { useT } from '@/hooks/useT';
import { useLanguageStore } from '@/store/languageStore';
import { type UiProduct, type ReviewItem } from '@/lib/catalog';
import { eur, lev } from '@/lib/currency';

const fd = 'var(--font-display), Georgia, serif';
const fb = 'var(--font-body)';

// "Мария Димитрова" → "Мария Д." (first name + family-name initial)
function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || full;
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export default function ProductDetail({ product, related, reviews }: { product: UiProduct; related: UiProduct[]; reviews: ReviewItem[] }) {
  const { addItem } = useCartStore();
  const trR = useT().reviewsSection;
  const lang = useLanguageStore((s) => s.lang);
  // On EN, use the admin-entered English text; fall back to Bulgarian when empty.
  const name = lang === 'en' && product.nameEn ? product.nameEn : product.name;
  const shortDescription = lang === 'en' && product.shortDescriptionEn ? product.shortDescriptionEn : product.shortDescription;
  const description = lang === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'info'>('desc');
  const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const desktopThumbSlots = allImages.slice(0, 2);
  const [activeImg, setActiveImg] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const mainBtnRef = useRef<HTMLDivElement>(null);

  // BoJ layout for non-soap/shower-gel products
  const isBojLayout = !['bio-sapuni', 'bio-dush-gelove'].includes(product.categorySlug ?? '');

  useEffect(() => {
    const el = mainBtnRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, slug: product.slug, image: product.image });
    }
  };

  return (
    <div className="product-detail-page">
      <style>{`
        .product-detail-thumb-rail,
        .product-detail-pack-options,
        .product-detail-buy-now,
        .product-detail-desktop-related {
          display: none;
        }
        @media (min-width: 901px) {
          .product-detail-main {
            display: grid !important;
            grid-template-columns: minmax(0, 1.08fr) minmax(460px, 0.92fr) !important;
            gap: 40px !important;
            max-width: 1520px !important;
            margin: 0 auto !important;
            padding: 26px 34px 34px !important;
            align-items: start !important;
          }
          .product-detail-media {
            display: grid !important;
            grid-template-columns: 72px minmax(0, 1fr) !important;
            gap: 18px !important;
            align-items: start !important;
            padding: 0 !important;
            min-width: 0 !important;
          }
          .product-detail-thumb-rail {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            position: sticky !important;
            top: 94px !important;
          }
          .product-detail-thumb {
            width: 64px !important;
            height: 64px !important;
            border: 0 !important;
            border-left: 1px solid transparent !important;
            background: #fff !important;
            padding: 0 !important;
            cursor: pointer !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .product-detail-thumb.is-active {
            border-left-color: #1a1a1a !important;
          }
          .product-detail-thumb img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            padding: 5px !important;
          }
          .product-detail-thumb--placeholder {
            cursor: default !important;
            border: 1px dashed #ddd5cb !important;
            background: linear-gradient(135deg, #fbfaf7, #eee8df) !important;
          }
          .product-detail-thumb--placeholder span {
            width: 18px !important;
            height: 18px !important;
            border: 1px solid #d7cec2 !important;
            display: block !important;
          }
          .product-detail-image-frame {
            aspect-ratio: 1 / 1 !important;
            min-height: min(700px, calc(100vh - 150px)) !important;
            max-height: 760px !important;
            background: #f6f1ea !important;
          }
          .product-detail-image-frame img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            padding: 40px !important;
          }
          .product-detail-mobile-thumbs {
            display: none !important;
          }
          .product-detail-info {
            padding: 0 !important;
            position: sticky !important;
            top: 88px !important;
            max-width: none !important;
          }
          .product-detail-info h1 {
            font-family: ${fd} !important;
            font-size: clamp(30px, 2.05vw, 38px) !important;
            font-weight: 500 !important;
            line-height: 1.08 !important;
            margin-bottom: 12px !important;
          }
          .product-detail-info > a {
            margin-bottom: 22px !important;
          }
          .product-detail-pack-options {
            display: block !important;
            border-top: 1px solid #e7e1da !important;
            padding-top: 18px !important;
            margin: 18px 0 16px !important;
          }
          .product-detail-pack-options p {
            font-family: ${fb} !important;
            font-weight: 700 !important;
            font-size: 16px !important;
            margin: 0 0 2px !important;
            color: #111 !important;
          }
          .product-detail-pack-options span {
            display: block !important;
            font-family: ${fb} !important;
            font-size: 13px !important;
            margin-bottom: 12px !important;
            color: #111 !important;
          }
          .product-detail-pack-options button {
            min-width: 68px !important;
            height: 38px !important;
            border: 1px solid #d8d2cb !important;
            background: #fff !important;
            font-family: ${fb} !important;
            font-size: 12px !important;
            letter-spacing: 0.06em !important;
            cursor: default !important;
          }
          .product-detail-pack-options button.is-selected {
            border-color: #d79474 !important;
          }
          .product-detail-buy-now {
            display: block !important;
            width: 100% !important;
            height: 36px !important;
            border: 1px solid #d79474 !important;
            background: #fff !important;
            color: #d79474 !important;
            font-family: ${fb} !important;
            font-size: 12px !important;
            letter-spacing: 0.12em !important;
            text-transform: uppercase !important;
            margin: 10px 0 26px !important;
            cursor: pointer !important;
          }
          .product-detail-desktop-related {
            display: block !important;
            border-top: 1px solid #eee8e0 !important;
            padding-top: 24px !important;
          }
          .product-detail-desktop-related h2 {
            font-family: ${fb} !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            margin: 0 0 14px !important;
          }
          .product-detail-desktop-related-item {
            display: grid !important;
            grid-template-columns: 86px minmax(0, 1fr) 34px !important;
            gap: 16px !important;
            align-items: center !important;
            padding: 14px 0 !important;
          }
          .product-detail-desktop-related-item + .product-detail-desktop-related-item {
            border-top: 1px solid #f0ebe4 !important;
          }
          .product-detail-desktop-related-image {
            width: 86px !important;
            height: 86px !important;
            background: #fff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .product-detail-desktop-related-image img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            padding: 8px !important;
          }
          .product-detail-related--boj-mobile {
            display: none !important;
          }
          .product-detail-tabs,
          .product-detail-reviews,
          .product-detail-related {
            max-width: 1520px !important;
            margin: 0 auto !important;
            padding-left: 34px !important;
            padding-right: 34px !important;
          }
          .product-detail-benefits {
            max-width: 1280px !important;
            margin: 0 auto 36px !important;
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1px !important;
            background: #ede9e4 !important;
            padding: 0 !important;
          }
          .product-detail-benefit {
            border-bottom: 0 !important;
            background: #faf9f7 !important;
          }
          .product-detail-sticky-bar {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Main layout ── */}
      <div className="product-detail-main max-w-full mx-auto" style={{ padding: '0' }}>
        {/* Image section */}
        <div className="product-detail-media" style={{ padding: '0 0 16px' }}>
          <div className="product-detail-thumb-rail" aria-label="Product images">
            {desktopThumbSlots.map((src, i) => (
              src ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`product-detail-thumb ${i === activeImg ? 'is-active' : ''}`}
                  aria-label={`${product.name} image ${i + 1}`}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} />
                </button>
              ) : (
                <div key={i} className="product-detail-thumb product-detail-thumb--placeholder" aria-hidden="true">
                  <span />
                </div>
              )
            ))}
          </div>

          {/* Main image + heart overlay */}
          <div className="product-detail-image-frame" style={{ position: 'relative', background: '#fff', overflow: 'hidden', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {allImages.length > 0
              ? <img src={allImages[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.2s' }} />
              : <div style={{ color: '#ddd' }}><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>}
            {/* Heart — top right of image */}
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <FavoriteButton variant="card"
                product={{ id: product.id, name: product.name, price: product.price, slug: product.slug, image: product.image, inStock: product.inStock }} />
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="product-detail-mobile-thumbs" style={{ display: 'flex', gap: 6, padding: '10px 16px 0', overflowX: 'auto' }}>
              {allImages.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 68, height: 68, flexShrink: 0, padding: 0, cursor: 'pointer',
                  background: '#f8f6f3', border: 'none',
                  outline: i === activeImg ? '2px solid #9B72C7' : '2px solid transparent',
                  outlineOffset: 1,
                }}>
                  <img src={src} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="product-detail-info" style={{ padding: '16px 16px 32px' }}>
          {/* Stars — pink like BoJ, above name */}
          <a href="#otzivi" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, textDecoration: 'none' }}>
            <span style={{ display: 'inline-flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(product.rating ?? 0) ? '#D4899A' : '#e0e0e0'} xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              ))}
            </span>
            {(product.reviewCount ?? 0) > 0 && (
              <span style={{ fontFamily: fb, fontSize: 12, color: '#aaa' }}>
                ({product.reviewCount} отзива)
              </span>
            )}
          </a>

          {/* Name */}
          <h1 style={{ fontFamily: fb, fontWeight: 600, fontSize: 'clamp(20px,5vw,26px)', color: '#1a1a1a', marginBottom: 6, lineHeight: 1.25 }}>{name}</h1>

          {/* Weight */}
          {product.weight && (
            <p style={{ fontFamily: fb, fontSize: 12, color: '#bbb', marginBottom: 10 }}>{product.weight}</p>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontFamily: fb, fontWeight: 700, fontSize: 22, color: '#9B72C7' }}>{eur(product.price)} €</span>
            <span style={{ fontFamily: fb, fontSize: 13, color: '#bbb' }}>({lev(product.price)} лв.)</span>
            {!!(product.priceMax) && product.priceMax > product.price && (
              <>
                <span style={{ fontFamily: fb, fontSize: 15, color: '#ccc', textDecoration: 'line-through' }}>{eur(product.priceMax)} €</span>
                <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, background: '#e74c3c', color: '#fff', padding: '3px 7px', borderRadius: 3 }}>
                  -{Math.round((1 - product.price / product.priceMax) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock — only show if out of stock */}
          {!product.inStock && (
            <p style={{ fontFamily: fb, fontSize: 12, color: '#aaa', marginBottom: 16 }}>Изчерпано</p>
          )}

          {/* Description — BoJ: above button, prominent; standard: below button */}
          {isBojLayout && (shortDescription || description) && (
            <p style={{ fontFamily: fb, fontSize: 13.5, color: '#8B4A3A', lineHeight: 1.72, marginBottom: 22, fontStyle: 'italic' }}>
              {shortDescription || description}
            </p>
          )}


          {/* Quantity + Add to cart */}
          <div ref={mainBtnRef}>
          {isBojLayout ? (
            /* BoJ: dropdown qty + full-width button */
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <select value={qty} onChange={e => setQty(Number(e.target.value))}
                  style={{ border: '1px solid #ddd', padding: '0 12px', height: 52, fontFamily: fb, fontSize: 14, cursor: 'pointer', background: '#fff', minWidth: 80 }}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={handleAdd} disabled={!product.inStock}
                  style={{ flex: 1, height: 52, background: product.inStock ? '#C9A96E' : '#ccc', color: '#fff', border: 'none', fontFamily: fb, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: product.inStock ? 'pointer' : 'not-allowed' }}>
                  {product.inStock ? 'ДОБАВИ В КОЛИЧКАТА' : 'ИЗЧЕРПАНО'}
                </button>
              </div>
            </div>
          ) : (
            /* Standard: +/- stepper */
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', flexShrink: 0 }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: 40, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Minus size={12} />
                </button>
                <span style={{ width: 36, textAlign: 'center', fontFamily: fb, fontSize: 15, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                  style={{ width: 40, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={handleAdd} disabled={!product.inStock}
                style={{ flex: 1, height: 52, background: product.inStock ? '#C9A96E' : '#ccc', color: '#fff', border: 'none', fontFamily: fb, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: product.inStock ? 'pointer' : 'not-allowed' }}>
                {product.inStock ? 'Добави в количката' : 'Изчерпано'}
              </button>
            </div>
          )}

          </div>{/* end mainBtnRef */}


          {isBojLayout && related.length > 0 && (
            <div className="product-detail-desktop-related">
              <h2>Подходящо с:</h2>
              {related.slice(0, 3).map((p) => (
                <div key={p.id} className="product-detail-desktop-related-item">
                  <Link href={`/produkt/${p.slug}`} className="product-detail-desktop-related-image" style={{ textDecoration: 'none' }}>
                    {p.image && <img src={p.image} alt={p.name} />}
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/produkt/${p.slug}`} style={{ fontFamily: fb, fontSize: 15, color: '#111', display: 'block', marginBottom: 6, textDecoration: 'none', lineHeight: 1.3 }}>
                      {p.name}
                    </Link>
                    <p style={{ fontFamily: fb, fontSize: 13, color: '#d64c3c', margin: 0 }}>
                      {eur(p.price)} € {p.priceMax && p.priceMax > p.price && <span style={{ color: '#777', textDecoration: 'line-through', marginLeft: 6 }}>{eur(p.priceMax)} €</span>}
                    </p>
                  </div>
                  <button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, slug: p.slug, image: p.image })}
                    style={{ width: 34, height: 34, border: '0', background: 'none', color: '#d79474', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Standard layout: description below button */}
          {!isBojLayout && (shortDescription || description) && (
            <p style={{ fontFamily: fb, fontSize: 13, color: '#777', lineHeight: 1.7, marginBottom: 24, borderTop: '1px solid #f5f5f5', paddingTop: 14 }}>
              {shortDescription || description}
            </p>
          )}

        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="product-detail-tabs" style={{ padding: '0 16px 32px', maxWidth: '100%' }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #eee', marginBottom: 20 }}>
          {(['desc', 'info'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: tab === t ? '#3F332D' : '#aaa', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #B08D57' : '2px solid transparent', paddingBottom: 10, cursor: 'pointer' }}>
              {t === 'desc' ? 'Описание' : 'Информация'}
            </button>
          ))}
        </div>
        {tab === 'desc' ? (
          <div style={{ fontFamily: fb, fontSize: 14, color: '#555', lineHeight: 1.75 }}>
            <p>{description || shortDescription || 'Натурален, ръчно изработен продукт.'}</p>
          </div>
        ) : (
          <table style={{ fontFamily: fb, fontSize: 13, color: '#555', width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[['Тегло', product.weight || '—'], ['Съставки', '100% натурални'], ['Веган', 'Да']].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 16px 10px 0', fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>{k}</td>
                  <td style={{ padding: '10px 0' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── BoJ benefit blocks (moved before reviews) ── */}
      {isBojLayout && (
        <section className="product-detail-benefits" style={{ padding: '0 0 8px', background: '#faf9f7' }}>
          {[
            { title: 'Предимство 1', body: 'Кратко описание на първото ключово предимство на продукта.' },
            { title: 'Предимство 2', body: 'Кратко описание на второто ключово предимство на продукта.' },
            { title: 'Предимство 3', body: 'Кратко описание на третото ключово предимство на продукта.' },
          ].map((b, i) => (
            <div key={i} className="product-detail-benefit" style={{ textAlign: 'center', padding: '36px 20px', borderBottom: '1px solid #ede9e4' }}>
              <div style={{ width: 180, height: 180, borderRadius: '50%', background: '#e8e4de', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              </div>
              <h3 style={{ fontFamily: fd, fontWeight: 500, fontSize: 18, color: '#1a1a1a', marginBottom: 10 }}>{b.title}</h3>
              <p style={{ fontFamily: fb, fontSize: 13, color: '#888', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>{b.body}</p>
            </div>
          ))}
        </section>
      )}

      {/* ── Reviews ── */}
      <section id="otzivi" className="product-detail-reviews" style={{ padding: '0 16px 32px' }}>
        <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 24, color: '#1a1a1a', marginBottom: 10 }}>{trR.title}</h2>
        {product.reviewCount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Stars rating={product.rating!} size={17} />
            <span style={{ fontFamily: fb, fontSize: 14, color: '#888' }}>{trR.count(product.reviewCount)}</span>
          </div>
        ) : (
          <p style={{ fontFamily: fb, fontSize: 14, color: '#888', marginBottom: 24 }}>{trR.empty}</p>
        )}
        {reviews.length > 0 && (
          <div style={{ borderTop: '1px solid #eaeaea' }}>
            {reviews.map((r) => {
              // Parse [Тип кожа: X · Грижи: Y] prefix from comment into label/value pairs
              const metaMatch = r.comment?.match(/^\[([^\]]+)\]\n?/);
              const metaPairs = (metaMatch ? metaMatch[1].split(' · ') : [])
                .map((tag) => {
                  const i = tag.indexOf(':');
                  return i === -1 ? null : [tag.slice(0, i).trim(), tag.slice(i + 1).trim()] as [string, string];
                })
                .filter(Boolean) as [string, string][];
              const cleanComment = r.comment?.replace(/^\[([^\]]+)\]\n?/, '').trim();
              return (
                <div key={r.id} className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-4 sm:gap-8"
                  style={{ padding: '26px 0', borderBottom: '1px solid #eaeaea' }}>
                  {/* Reviewer card */}
                  <div style={{ border: '1px solid #e8e2da', background: '#fdfcfa', padding: '14px 16px', height: 'fit-content' }}>
                    <p style={{ fontFamily: fb, fontSize: 14, fontWeight: 700, color: '#2b2b2b', margin: 0 }}>{shortName(r.authorName)}</p>
                    {r.verified && (
                      <p style={{ fontFamily: fb, fontSize: 12, fontWeight: 600, color: '#3a3a3a', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {trR.verified}
                        <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 15, height: 15, borderRadius: '50%', background: '#2b2b2b', color: '#fff', fontSize: 9 }}>✓</span>
                      </p>
                    )}
                    {metaPairs.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {metaPairs.map(([label, value]) => (
                          <div key={label}>
                            <p style={{ fontFamily: fb, fontSize: 12, fontWeight: 700, color: '#3a3a3a', margin: 0 }}>{trR.valueMap[label] || label}</p>
                            <p style={{ fontFamily: fb, fontSize: 12, color: '#9B72C7', margin: '2px 0 0' }}>
                              {value.split(', ').map((v) => trR.valueMap[v] || v).join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Review body */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <Stars rating={r.rating} size={17} />
                      <span style={{ fontFamily: fb, fontSize: 13, color: '#a5a5a5', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString(trR.dateLocale)}</span>
                    </div>
                    {cleanComment && <p style={{ fontFamily: fb, fontSize: 15, color: '#4a4a4a', lineHeight: 1.7, margin: 0 }}>{cleanComment}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 32 }}>
          <ReviewForm productId={product.id} showSkinType={isBojLayout} />
        </div>
      </section>

      {/* ── Related products ── */}
      {related.length > 0 && (
        isBojLayout ? (
          /* BoJ "Goes well with" list */
          <section className="product-detail-related product-detail-related--boj-mobile" style={{ padding: '0 16px 48px', borderTop: '1px solid #f0f0f0' }}>
            <h2 style={{ fontFamily: fb, fontWeight: 500, fontSize: 14, color: '#333', marginBottom: 20, paddingTop: 20 }}>Подходящо с:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {related.slice(0, 2).map((p) => (
                <div key={p.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                  <Link href={`/produkt/${p.slug}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                    <div style={{ width: 80, height: 80, background: '#f8f6f3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/produkt/${p.slug}`} style={{ fontFamily: fb, fontSize: 13, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 4, textDecoration: 'none', lineHeight: 1.3 }}>{p.name}</Link>
                    <p style={{ fontFamily: fb, fontSize: 13, color: '#9B72C7' }}>{eur(p.price)} €</p>
                  </div>
                  <button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, slug: p.slug, image: p.image })}
                    style={{ width: 34, height: 34, border: '1px solid #ddd', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Standard grid */
          <section className="product-detail-related" style={{ padding: '0 16px 48px' }}>
            <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 18, color: '#1a1a1a', marginBottom: 16 }}>Подобни продукти</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )
      )}

      {/* ── Sticky Add to Cart bar ── */}
      <div className="product-detail-sticky-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: '#fff', borderTop: '1px solid #eee',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        transform: showSticky ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: fb, fontSize: 12, fontWeight: 600, color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.name}
          </p>
          <p style={{ fontFamily: fb, fontSize: 12, color: '#9B72C7', margin: 0 }}>{eur(product.price)} €</p>
        </div>
        <button onClick={handleAdd} disabled={!product.inStock}
          style={{
            flexShrink: 0, background: product.inStock ? '#C9A96E' : '#ccc',
            color: '#fff', border: 'none', fontFamily: fb, fontSize: 11,
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '12px 20px', cursor: product.inStock ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}>
          {product.inStock ? 'ДОБАВИ' : 'ИЗЧЕРПАНО'}
        </button>
      </div>
    </div>
  );
}
