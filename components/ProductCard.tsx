'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import FavoriteButton from '@/components/FavoriteButton';
import Stars from '@/components/Stars';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';
import { useLanguageStore } from '@/store/languageStore';

const BESTSELLER_SLUGS = new Set<string>([]);

// Second photo shown with a crossfade when the card is hovered, keyed by slug
const HOVER_IMAGES: Record<string, string> = {
  // Face care
  'bakuchiol-lift-regeneration-power':        '/images/fscr-care/bakuchiol-cream-hover.png',
  'bakuchiol-lift-regeneration-power-serum':  '/images/fscr-care/bakuchiol-serum-texture-hover.png',
  'bakuchiol-lift-regeneration-power-serum-2': '/images/fscr-care/bakuchiol-serum-texture-hover.png',
  'coenzyme-q10-powerful-skin-recharge-2':    '/images/fscr-care/coenzyme-cream-hover.png',
  'hyaluron-intense-hydration-2':             '/images/fscr-care/hyalouron-cream-hover.png',
  'hyaluron-ultimate-hydration-serum':        '/images/fscr-care/hyalouron-serum-texture-hover.png',
  'bio-face-wash-chaeno-darvo-za-problemna-kozha': '/images/fscr-care/facewash-hover-texture.png',
  // Lip balms
  'bio-balsam-za-ustni-vaniliya-i-kakao':     '/images/fscr-care/lipbalm/cocoa-lipbalm-hover.png',
  'bio-balsam-za-ustni-bilkov':               '/images/fscr-care/lipbalm/herbal-lipbalm-hover.png',
  'bio-balsam-za-ustni-portokal':             '/images/fscr-care/lipbalm/orange-lipbalm-hover.png',
  'bio-balsam-za-ustni-portokal-i-kanela':    '/images/fscr-care/lipbalm/orangeandcinnamon-lipbalm-hover.png',
  // Shampoos (label colours matched to the HappyHair range)
  'happyhair-shampoan-za-normalna-iztoshtena-i-ili-tsaftyashta-kosa': '/images/shampoani/greenhappyhair-hover.png',
  'happyhair-shampoan-pri-mazna-kosa-i-skalp':                        '/images/shampoani/yellowhappyhair-hover.png',
  'happyhair-shampoan-za-suha-boyadisana-i-uvredena-kosa':            '/images/shampoani/red-happyhair-hover.png',
  'happyhair-stimulirasht-shampoan-pri-kosopad':                      '/images/shampoani/bluehappyhair-hover.png',
  'shampoan-pri-parhot':                                              '/images/shampoani/purhot-jappyhair-hover.png',
  'bio-slanchev-shampoan-za-poveche-obem':                            '/images/shampoani/slunchev-hover.png',
  'bio-bilkov-shampoan-za-zdrav-skalp':                               '/images/shampoani/bilkov-techen-shampoan-hover.png',
  // Body care
  'bio-aloe-vera-gel':        '/images/fscr-care/aloeveragel-hover.png',
  'zaharen-eksfoliant-kafe':  '/images/scrubs/coffee-scrub-hover.png',
  'zaharen-eksfoliant-portokal': '/images/scrubs/orange-crub-hover.png',
  // Soaps (pre-existing back shots)
  'bilkov-sapun':          '/images/sapuni/bilkov-back.webp',
  'sapun-lavandula':       '/images/sapuni/lavandula-back.webp',
  'sapun-sandalovo-darvo': '/images/sapuni/sandal-back.webp',
  'sapun-tsveten':         '/images/sapuni/tsvenetn-back.webp',
};

interface Product {
  id: string;
  name: string;
  price: number;
  priceMax?: number;
  slug: string;
  image?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  shortDescription?: string | null;
  nameEn?: string | null;
  shortDescriptionEn?: string | null;
}

export default function ProductCard({
  product,
  variant = 'default',
}: {
  product: Product;
  variant?: 'default' | 'bojCategory';
}) {
  const { addItem } = useCartStore();
  const inStock = product.inStock !== false;

  // Entrance animation: when the card first scrolls into view, the photo
  // settles from extra-zoomed down to its resting zoom.
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Already on screen at mount → animate right away (also covers
    // environments where IntersectionObserver is unreliable).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setEntered(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntered(true);
        obs.disconnect();
      }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const tr = useT();
  const lang = useLanguageStore((s) => s.lang);
  const name = lang === 'en' && product.nameEn ? product.nameEn : product.name;
  const shortDescription = lang === 'en' && product.shortDescriptionEn ? product.shortDescriptionEn : product.shortDescription;
  const isBojCategory = variant === 'bojCategory';
  const isLipBalmImage = product.image?.includes('/lipbalm/');
  const isPhotoImage = product.image?.includes('/fscr-care/') || product.image?.includes('/blog') || product.image?.includes('/deos/');

  const lvLabel = product.priceMax
    ? `${lev(product.price)} – ${lev(product.priceMax)} лв.`
    : `${lev(product.price)} лв.`;

  return (
    <div ref={rootRef} className={`product-card group relative flex flex-col text-left${isBojCategory ? ' product-card--boj-category' : ''}${isPhotoImage ? ' product-card--photo-image' : ''}${isLipBalmImage ? ' product-card--lipbalm-image' : ''}${entered ? ' card-img-enter' : ''}`}>

      {/* Wishlist */}
      <FavoriteButton product={product} variant="card" />

      {/* Image — portrait ~7:8 */}
      <Link href={`/produkt/${product.slug}`} className="block mb-3">
        <div
          className="product-card-img-wrap flex items-center justify-center"
          style={{ aspectRatio: '7 / 8', position: 'relative' }}
        >
          {BESTSELLER_SLUGS.has(product.slug) && (
            <div style={{
              position: 'absolute', top: 10, left: 10, zIndex: 3, pointerEvents: 'none',
              background: '#9B72C7', color: '#fff',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
              padding: '5px 10px', borderRadius: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              ★ Бестселър
            </div>
          )}
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.name}
                className="product-img w-full h-full object-cover"
              />
              {HOVER_IMAGES[product.slug] && (
                <img
                  src={HOVER_IMAGES[product.slug]}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="product-img product-card-hover-img w-full h-full object-cover"
                />
              )}
            </>
          ) : (
            <div className="product-img w-full h-full flex items-center justify-center text-[#d8d8d8]">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Stars — row is always rendered (fixed height) so titles align across cards;
          the stars themselves only show once a product has real reviews */}
      <div className="product-card-rating flex items-center gap-1 mb-1" style={{ justifyContent: 'flex-start', minHeight: 18 }}>
        {(product.reviewCount ?? 0) > 0 && (
          <>
            <Stars rating={product.rating ?? 0} size={12} />
            <span className="text-[11px] text-[var(--text-muted)]">({product.reviewCount} отзива)</span>
          </>
        )}
      </div>

      {/* Title */}
      <Link href={`/produkt/${product.slug}`}>
        <h3 className="card-title text-[14px] font-medium text-[#3F332D] leading-snug mb-1 hover:text-[var(--primary-dark)] transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}>
          {name}
        </h3>
      </Link>

      {/* Short description — desktop */}
      {shortDescription && (
        <p className="card-desc-all text-[12px] leading-snug mb-2 line-clamp-1"
          style={{ color: '#999', fontFamily: 'var(--font-body)' }}>
          {shortDescription}
        </p>
      )}

      {/* Mobile-only short description (different class for mobile specifics) */}
      {shortDescription && (
        <p className="card-desc-mobile text-[11px] text-[var(--text-muted)] mb-1 line-clamp-1 leading-snug">
          {shortDescription}
        </p>
      )}

      {/* Price — BoJ style: Save badge + strikethrough + current */}
      {!isBojCategory && <div className="card-price-desktop mb-3">
        {product.priceMax && product.priceMax > product.price ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#A4574F' }}>
              Спести {Math.round((1 - product.price / product.priceMax) * 100)}%
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#B4A99F', textDecoration: 'line-through' }}>
              {eur(product.priceMax)} €
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#3F332D' }}>
              {eur(product.price)} €
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#3F332D' }}>
            {eur(product.price)} €{' '}
            <span style={{ fontSize: 12, color: '#756B65', fontWeight: 400 }}>({lvLabel})</span>
          </span>
        )}
      </div>}

      {/* Add to cart — appears on hover */}
      {inStock ? (
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              slug: product.slug,
              image: product.image,
            })
          }
          className={`mt-auto btn-primary text-left w-full transition-opacity duration-200${isBojCategory ? ' boj-price-strip' : ''}${isBojCategory && product.priceMax && product.priceMax > product.price ? ' boj-strip-sale' : ''}`}
        >
          {isBojCategory ? (
            product.priceMax && product.priceMax > product.price ? (
              <>
                <span className="boj-save">Спести {Math.round((1 - product.price / product.priceMax) * 100)}%</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="boj-old">{eur(product.priceMax)} €</span>
                  <span className="boj-current">{eur(product.price)} €</span>
                </span>
              </>
            ) : (
              <span className="boj-current">{eur(product.price)} €</span>
            )
          ) : (
            <>
              <span className="btn-text-full">{tr.cart.add}</span>
              <span className="btn-text-mobile"><span>ДОБАВИ</span><span>{eur(product.price)} лв.</span></span>
            </>
          )}
        </button>
      ) : (
        <button
          disabled
          className="mt-auto text-center w-full rounded text-[13px] font-semibold py-[5px] px-5 bg-[var(--bg-light)] text-[var(--text-muted)] cursor-not-allowed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {tr.cart.outofstock}
        </button>
      )}
    </div>
  );
}
