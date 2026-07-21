'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, ShoppingBag, Truck, Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/couriers';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';
import { useLanguageStore } from '@/store/languageStore';

const fb = 'var(--font-body)';
const fd = 'var(--font-display)';

// Same soft green-sphere backdrop the product cards use
const tileBackdrop =
  'radial-gradient(circle at 20% 16%, rgba(200, 228, 191, 0.30) 0%, rgba(207, 232, 199, 0.16) 26%, rgba(214, 236, 207, 0.06) 42%, transparent 58%), #FCFBF8';

export default function CartDrawer() {
  const store = useCartStore();
  const { isOpen, closeCart, removeItem, updateQuantity, clearCart } = store;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items   = mounted ? store.items : [];
  const total   = mounted ? store.totalPrice() : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress  = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked  = remaining <= 0;
  const tr = useT();
  const lang = useLanguageStore((s) => s.lang);
  const checkoutLabel = lang === 'bg' ? 'Поръчай' : tr.cart.checkout;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Confetti burst — fires when the drawer opens with free delivery already
  // earned, and again the moment the threshold is crossed while it's open.
  const [burst, setBurst] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCelebrate = useRef(false);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const celebrate = isOpen && unlocked && items.length > 0;
    if (celebrate && !prevCelebrate.current
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBurst((b) => b + 1);
      setShowConfetti(true);
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 3600);
    }
    prevCelebrate.current = celebrate;
  }, [isOpen, unlocked, items.length]);
  useEffect(() => () => { if (confettiTimer.current) clearTimeout(confettiTimer.current); }, []);

  const confettiPieces = useMemo(() => {
    const colors = ['#F2B8C6', '#A8CC9C', '#F6DA8E', '#C9B6E4', '#B08D57', '#7FA871'];
    return Array.from({ length: 30 }, () => ({
      left: Math.random() * 100,
      top: 46 + Math.random() * 46,
      delay: Math.random() * 0.7,
      dur: 1.6 + Math.random() * 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: 300 + Math.random() * 620,
      drift: -60 + Math.random() * 120,
      size: 4 + Math.random() * 4,
      round: Math.random() < 0.35,
    }));
  }, [burst]);

  const stepBtn = {
    width: 28, height: 28, border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#3F332D', padding: 0,
  } as const;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={closeCart} />}

      <div className={`cart-drawer-panel fixed top-0 right-0 h-full w-full max-w-[420px] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#FDFBF7' }}>

        {/* Confetti — celebrates free delivery */}
        {showConfetti && (
          <div key={burst} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 80 }}>
            {confettiPieces.map((p, i) => (
              <span key={i} style={{
                position: 'absolute',
                top: p.top,
                left: `${p.left}%`,
                width: p.size,
                height: p.round ? p.size : p.size * 1.7,
                borderRadius: p.round ? '50%' : 2,
                background: p.color,
                animation: `cartConfettiFall ${p.dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s both`,
                ['--confetti-rot' as string]: `${p.rot}deg`,
                ['--confetti-drift' as string]: `${p.drift}px`,
              } as React.CSSProperties} />
            ))}
          </div>
        )}

        {/* ── Header ── */}
        <div className="cart-drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px', background: 'linear-gradient(120deg, #F9E8EC 0%, #FDFBF7 60%, #EDF5E8 100%)' }}>
          <h2 className="cart-drawer-title" style={{ fontFamily: fb, fontWeight: 600, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3F332D', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            Кошница
            {count > 0 && (
              <span style={{
                background: '#F9E8EC', color: '#3F332D', borderRadius: 999,
                fontSize: 11, fontWeight: 600, letterSpacing: 0,
                padding: '3px 10px',
              }}>{count}</span>
            )}
          </h2>
          <div className="cart-drawer-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {items.length > 0 && (
              <button className="cart-drawer-clear" onClick={clearCart}
                style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A6FA8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Изчисти
              </button>
            )}
            <button className="cart-drawer-close" onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3F332D', display: 'flex', padding: 4 }}>
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div className="cart-drawer-content-card">
        {/* ── Free-shipping milestone card ── */}
        <div className="cart-shipping-milestone" style={{ margin: '0 16px 14px', borderRadius: 14, padding: '14px 16px 16px', background: unlocked
          ? 'linear-gradient(120deg, #E9F3E3 0%, #F2F8EE 100%)'
          : 'linear-gradient(120deg, #F9E8EC 0%, #F3F7EF 100%)' }}>
          <div className="cart-shipping-milestone-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Truck size={15} strokeWidth={1.7} style={{ color: '#3F332D', flexShrink: 0 }} />
            <p style={{ fontFamily: fb, fontSize: 12.5, fontWeight: 600, color: '#3F332D', margin: 0, lineHeight: 1.4 }}>
              {unlocked ? tr.cart.hasFreeShipping : tr.cart.freeShippingMsg(eur(remaining))}
            </p>
          </div>
          {/* track */}
          <div className="cart-shipping-track" style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.75)' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${progress}%`, borderRadius: 999,
              background: 'linear-gradient(90deg, #F2B8C6 0%, #A8CC9C 100%)',
              transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }} />
            {/* milestone dot */}
            <div style={{
              position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)',
              width: 20, height: 20, borderRadius: '50%',
              background: unlocked ? '#7FA871' : '#fff',
              border: unlocked ? 'none' : '1px solid rgba(63,51,45,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'background 0.3s ease',
              boxShadow: '0 2px 6px rgba(63,51,45,0.12)',
            }}>
              {unlocked
                ? <Check size={12} strokeWidth={2.4} />
                : <Truck size={10} strokeWidth={1.8} style={{ color: '#A89A90' }} />}
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="cart-drawer-items-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <div className="cart-drawer-empty-art">
                <ShoppingBag size={34} strokeWidth={1.4} />
              </div>
              <p className="cart-drawer-empty-kicker">Количка</p>
              <h3 style={{ fontFamily: fd }}>{tr.cart.empty}</h3>
              <p>Добави продукт и ще го пазим тук, готов за поръчка.</p>
              <Link href="/shop" onClick={closeCart} className="cart-drawer-empty-link">
                Пазарувай
              </Link>
            </div>
          ) : (
            <ul className="cart-drawer-items" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <li key={item.id} className="cart-drawer-item" style={{
                  display: 'flex', gap: 14, padding: 12,
                  background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(63,51,45,0.06)',
                  position: 'relative',
                }}>
                  {/* image tile */}
                  <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                    className="cart-drawer-item-image"
                    style={{ width: 82, height: 82, flexShrink: 0, borderRadius: 10, overflow: 'hidden', display: 'block', background: tileBackdrop }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                      : <ShoppingBag size={22} style={{ margin: 'auto', opacity: 0.2, display: 'block', marginTop: 29 }} />}
                  </Link>

                  <div className="cart-drawer-item-body" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                      className="cart-drawer-item-title"
                      style={{ fontFamily: fb, fontWeight: 600, fontSize: 13.5, color: '#3F332D', display: 'block', marginBottom: 3, textDecoration: 'none', lineHeight: 1.35, paddingRight: 22 }}>
                      {item.name}
                    </Link>
                    <p className="cart-drawer-item-lev" style={{ fontFamily: fb, fontSize: 12, color: '#A89A90', margin: '0 0 auto' }}>
                      {lev(item.price)} лв.
                    </p>

                    {/* stepper + line price */}
                    <div className="cart-drawer-item-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <div className="cart-drawer-qty" style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(242, 184, 198, 0.7)', borderRadius: 999, padding: '0 2px', background: '#FBF0F3' }}>
                        <button aria-label="Намали" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={stepBtn}>
                          <Minus size={12} strokeWidth={1.8} />
                        </button>
                        <span style={{ width: 26, textAlign: 'center', fontFamily: fb, fontSize: 13, fontWeight: 600, color: '#3F332D' }}>
                          {item.quantity}
                        </span>
                        <button aria-label="Увеличи" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={stepBtn}>
                          <Plus size={12} strokeWidth={1.8} />
                        </button>
                      </div>
                      <span style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: '#3F332D' }}>
                        {eur(item.price * item.quantity)} €
                      </span>
                    </div>
                  </div>

                  {/* remove */}
                  <button aria-label="Премахни" onClick={() => removeItem(item.id)}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#C9BDB5', display: 'flex', padding: 2 }}>
                    <X size={14} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && <div className="cart-drawer-items-spacer" style={{ height: 14 }} />}
        </div>
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="cart-drawer-footer" style={{ padding: '16px 16px 18px', background: '#fff', borderTop: '1px solid rgba(63,51,45,0.08)', borderRadius: '18px 18px 0 0' }}>
            <div className="cart-checkout-shipping cart-checkout-shipping-top">
              <span>Доставка</span>
              <strong>{unlocked ? 'Безплатна' : eur(remaining)}</strong>
            </div>
            <div className="cart-checkout-split">
              <div className="cart-checkout-total">
                <div className="cart-checkout-shipping">
                  <span>Доставка</span>
                  <strong>{unlocked ? 'Безплатна' : eur(remaining)}</strong>
                </div>
                <span className="cart-checkout-kicker">Общо</span>
                <span className="cart-checkout-price">{eur(total)} €</span>
                <span className="cart-checkout-lev">{lev(total)} лв.</span>
              </div>
              <Link href="/poruchka" onClick={closeCart} className="cart-checkout-action">
                <span>{checkoutLabel}</span>
                <span className="cart-checkout-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, background: '#E9F3E3', borderRadius: 10, padding: '11px 14px' }}>
              <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C7350' }}>Общо</span>
              <span style={{ fontFamily: fb, fontSize: 17, fontWeight: 600, color: '#3F332D' }}>
                {eur(total)} € <span style={{ fontSize: 12, color: '#7C8F72', fontWeight: 400 }}>({lev(total)} лв.)</span>
              </span>
            </div>

            <Link href="/poruchka" onClick={closeCart}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#3F332D', color: '#fff',
                fontFamily: fb, fontSize: 13, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '15px 0', textDecoration: 'none',
                borderRadius: 12, marginBottom: 10,
              }}>
              Поръчай
            </Link>
            <p className="cart-drawer-security" style={{ fontFamily: fb, fontSize: 11, color: '#A89A90', textAlign: 'center', marginTop: 12, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={11} strokeWidth={1.8} style={{ color: '#7FA871' }} />
              Сигурно плащане · Доставка и отстъпки се изчисляват при поръчка
            </p>
          </div>
        )}
      </div>
    </>
  );
}
