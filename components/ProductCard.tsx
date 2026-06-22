'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import FavoriteButton from '@/components/FavoriteButton';
import Stars from '@/components/Stars';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';

const BESTSELLER_SLUGS = new Set(['slanchev-sapun']);

const BACK_IMAGES: Record<string, string> = {
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
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const inStock = product.inStock !== false;
  const backImage = BACK_IMAGES[product.slug];
  const tr = useT();

  const priceLabel = product.priceMax
    ? `${eur(product.price)} € – ${eur(product.priceMax)} €`
    : `${eur(product.price)} €`;
  const lvLabel = product.priceMax
    ? `${lev(product.price)} – ${lev(product.priceMax)} лв.`
    : `${lev(product.price)} лв.`;

  return (
    <div className="product-card group relative flex flex-col text-left">

      {/* Wishlist */}
      <FavoriteButton product={product} variant="card" />

      {/* Image — portrait ~7:8 */}
      <Link href={`/produkt/${product.slug}`} className="block mb-3">
        <div
          className={`product-card-img-wrap flex items-center justify-center${backImage ? ' product-card-img-wrap--flip' : ''}`}
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
          {backImage ? (
            <div className="product-card-img-flip">
              <div className="product-card-img-flip-front">
                <img src={product.image} alt={product.name} className="product-img w-full h-full object-cover" />
              </div>
              <div className="product-card-img-flip-back">
                <img src={backImage} alt={`${product.name} — гръб`} className="product-img w-full h-full object-cover" />
              </div>
            </div>
          ) : product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-img w-full h-full object-cover"
            />
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

      {/* Title */}
      <Link href={`/produkt/${product.slug}`}>
        <h3
          className="text-[14px] font-extrabold text-[#333] leading-snug mb-1 hover:text-[var(--primary)] transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {product.name}
        </h3>
      </Link>

      {/* Rating */}
      {product.reviewCount ? (
        <div className="flex items-center gap-1 mb-1">
          <Stars rating={product.rating!} size={13} />
          <span className="text-[12px] text-[var(--text-muted)]">({product.reviewCount})</span>
        </div>
      ) : null}

      {/* Stock */}
      {inStock ? (
        <p className="text-[13px] text-[#333] flex items-center gap-1 mb-1">
          <span className="text-[var(--primary)]">✓</span> {tr.product.instock}
        </p>
      ) : (
        <p className="text-[13px] text-[var(--text-muted)] mb-1">{tr.product.outofstock}</p>
      )}

      {/* Price */}
      <p className="text-[14px] font-semibold text-[var(--primary)] mb-3">
        {priceLabel}{' '}
        <span className="text-[var(--text-muted)] font-normal text-[12px]">({lvLabel})</span>
      </p>

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
          className="mt-auto btn-primary text-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {tr.cart.add}
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
