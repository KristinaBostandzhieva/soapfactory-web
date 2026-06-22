'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import FavoriteButton from '@/components/FavoriteButton';
import Stars from '@/components/Stars';
import ReviewForm from '@/components/ReviewForm';
import { useCartStore } from '@/store/cartStore';
import { type UiProduct, type ReviewItem } from '@/lib/catalog';
import { eur, lev } from '@/lib/currency';

const fd = 'var(--font-display), Georgia, serif';
const fb = 'var(--font-body)';

export default function ProductDetail({ product, related, reviews }: { product: UiProduct; related: UiProduct[]; reviews: ReviewItem[] }) {
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'info'>('desc');
  const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div>
      {/* Breadcrumb */}
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { label: 'Начало', href: '/' },
          ...(product.categorySlug && product.categoryTitle
            ? [{ label: product.categoryTitle, href: `/kategoria/${product.categorySlug}` }]
            : []),
          { label: product.name },
        ]}
      />

      {/* Product */}
      <div className="max-w-full mx-auto px-[15px] py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          {/* Main image */}
          <div className="bg-[var(--bg-light)] rounded-md flex items-center justify-center overflow-hidden mb-3" style={{ aspectRatio: '1/1' }}>
            {allImages.length > 0
              ? <img src={allImages[activeImg]} alt={product.name} className="w-full h-full object-contain" style={{ transition: 'opacity 0.2s' }} />
              : <div className="text-[#d8d8d8]"><svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>}
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allImages.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  border: i === activeImg ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: 'var(--bg-light)', padding: 0, cursor: 'pointer',
                }}>
                  <img src={src} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontFamily: fd, fontWeight: 600, fontSize: 30, color: 'var(--text-heading)', marginBottom: 12, lineHeight: 1.2 }}>{product.name}</h1>
          {product.reviewCount ? (
            <a href="#otzivi" className="inline-flex items-center gap-2 mb-3 hover:opacity-80">
              <Stars rating={product.rating!} size={16} />
              <span className="text-[13px] text-[var(--text-muted)]">{product.rating!.toFixed(1)} · {product.reviewCount} {product.reviewCount === 1 ? 'отзив' : 'отзива'}</span>
            </a>
          ) : null}
          {product.inStock
            ? <p className="text-[14px] text-green-600 flex items-center gap-1 mb-4"><span className="text-[var(--primary)]">✓</span> Налично</p>
            : <p className="text-[14px] text-[var(--text-muted)] mb-4">Изчерпано</p>}
          <p style={{ fontFamily: fb }} className="text-[26px] font-bold text-[var(--primary)] mb-6">
            {eur(product.price)} € <span className="text-[var(--text-muted)] font-normal text-[15px]">({lev(product.price)} лв.)</span>
          </p>
          <p className="text-[15px] text-[var(--text-body)] leading-relaxed mb-8">
            {product.shortDescription || product.description || 'Натурален, ръчно изработен продукт със 100% естествени съставки. Без вредни химикали, парабени и консерванти — създаден с грижа за теб и природата.'}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[var(--border)] rounded">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 flex items-center justify-center hover:text-[var(--primary)]"><Minus size={14} /></button>
              <span className="w-10 text-center text-[15px] font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-11 flex items-center justify-center hover:text-[var(--primary)]"><Plus size={14} /></button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) addItem({ id: product.id, name: product.name, price: product.price, slug: product.slug, image: product.image }); }}
              disabled={!product.inStock}
              className="btn-primary"
              style={{ padding: '12px 32px', fontSize: 14, opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}>
              {product.inStock ? 'Добави в количката' : 'Изчерпано'}
            </button>
            <FavoriteButton
              variant="detail"
              product={{ id: product.id, name: product.name, price: product.price, slug: product.slug, image: product.image, inStock: product.inStock }}
            />
          </div>

          {product.categorySlug && product.categoryTitle && (
            <p className="text-[13px] text-[var(--text-muted)]">Категория: <Link href={`/kategoria/${product.categorySlug}`} className="text-[var(--primary)] hover:underline">{product.categoryTitle}</Link></p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-full mx-auto px-[15px] pb-12">
        <div className="flex gap-6 border-b border-[var(--border)] mb-6">
          <button onClick={() => setTab('desc')} style={{ fontFamily: fb }}
            className={`pb-3 text-[15px] font-bold transition-colors ${tab === 'desc' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>Описание</button>
          <button onClick={() => setTab('info')} style={{ fontFamily: fb }}
            className={`pb-3 text-[15px] font-bold transition-colors ${tab === 'info' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>Допълнителна информация</button>
        </div>
        {tab === 'desc' ? (
          <div className="text-[15px] text-[var(--text-body)] leading-relaxed max-w-3xl space-y-4">
            <p>{product.description || product.shortDescription || 'Този продукт е създаден изцяло от натурални съставки, внимателно подбрани с мисъл за твоето здраве и красота.'}</p>
            <p>Подходящ за ежедневна употреба. Веган. Без тестване върху животни.</p>
          </div>
        ) : (
          <table className="text-[14px] text-[var(--text-body)]">
            <tbody>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-8 font-semibold text-[var(--text-dark)]">Тегло</td><td className="py-2">{product.weight || '—'}</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-8 font-semibold text-[var(--text-dark)]">Съставки</td><td className="py-2">100% натурални</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-8 font-semibold text-[var(--text-dark)]">Веган</td><td className="py-2">Да</td></tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Reviews */}
      <section id="otzivi" className="max-w-full mx-auto px-[15px] pb-12">
        <h2 style={{ fontFamily: fd, fontWeight: 600, fontSize: 22, color: 'var(--text-heading)' }} className="mb-1">Отзиви</h2>
        {product.reviewCount ? (
          <div className="flex items-center gap-2 mb-6">
            <Stars rating={product.rating!} size={18} />
            <span className="text-[14px] text-[var(--text-muted)]">{product.rating!.toFixed(1)} от 5 · {product.reviewCount} {product.reviewCount === 1 ? 'отзив' : 'отзива'}</span>
          </div>
        ) : (
          <p className="text-[14px] text-[var(--text-muted)] mb-6">Все още няма отзиви. Бъди първият!</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={r.rating} size={14} />
                  <span className="text-[14px] font-semibold text-[var(--text-dark)]">{r.authorName}</span>
                  <span className="text-[12px] text-[var(--text-muted)]">{new Date(r.createdAt).toLocaleDateString('bg-BG')}</span>
                </div>
                {r.comment && <p className="text-[14px] text-[var(--text-body)]">{r.comment}</p>}
              </div>
            ))}
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="title-row"><h2 className="section-title">Подобни продукти</h2></div>
          <hr className="title-underline-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
