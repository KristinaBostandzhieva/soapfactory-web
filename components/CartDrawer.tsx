'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, ShoppingBag, Truck, Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/couriers';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';

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
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const stepBtn = {
    width: 28, height: 28, border: 'none', background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#3F332D', padding: 0,
  } as const;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={closeCart} />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#FDFBF7' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px', background: 'linear-gradient(120deg, #F9E8EC 0%, #FDFBF7 60%, #EDF5E8 100%)' }}>
          <h2 style={{ fontFamily: fb, fontWeight: 600, fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3F332D', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            Кошница
            {count > 0 && (
              <span style={{
                background: '#F9E8EC', color: '#3F332D', borderRadius: 999,
                fontSize: 11, fontWeight: 600, letterSpacing: 0,
                padding: '3px 10px',
              }}>{count}</span>
            )}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {items.length > 0 && (
              <button onClick={clearCart}
                style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A6FA8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Изчисти
              </button>
            )}
            <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3F332D', display: 'flex', padding: 4 }}>
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        {/* ── Free-shipping milestone card ── */}
        <div style={{ margin: '0 16px 14px', borderRadius: 14, padding: '14px 16px 16px', background: unlocked
          ? 'linear-gradient(120deg, #E9F3E3 0%, #F2F8EE 100%)'
          : 'linear-gradient(120deg, #F9E8EC 0%, #F3F7EF 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Truck size={15} strokeWidth={1.7} style={{ color: '#3F332D', flexShrink: 0 }} />
            <p style={{ fontFamily: fb, fontSize: 12.5, fontWeight: 600, color: '#3F332D', margin: 0, lineHeight: 1.4 }}>
              {unlocked ? tr.cart.hasFreeShipping : tr.cart.freeShippingMsg(eur(remaining))}
            </p>
          </div>
          {/* track */}
          <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.75)' }}>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32, gap: 18 }}>
              <div style={{ width: 86, height: 86, borderRadius: '50%', background: '#F9E8EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={32} strokeWidth={1.4} style={{ color: '#3F332D', opacity: 0.6 }} />
              </div>
              <p style={{ fontFamily: fd, fontSize: 19, color: '#3F332D', margin: 0 }}>{tr.cart.empty}</p>
              <Link href="/" onClick={closeCart} style={{
                display: 'inline-block', background: '#3F332D', color: '#fff',
                fontFamily: fb, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em',
                textTransform: 'uppercase', padding: '13px 38px', textDecoration: 'none',
                borderRadius: 10,
              }}>
                Пазарувай
              </Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <li key={item.id} style={{
                  display: 'flex', gap: 14, padding: 12,
                  background: '#fff', borderRadius: 14,
                  border: '1px solid rgba(63,51,45,0.06)',
                  position: 'relative',
                }}>
                  {/* image tile */}
                  <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                    style={{ width: 82, height: 82, flexShrink: 0, borderRadius: 10, overflow: 'hidden', display: 'block', background: tileBackdrop }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                      : <ShoppingBag size={22} style={{ margin: 'auto', opacity: 0.2, display: 'block', marginTop: 29 }} />}
                  </Link>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                      style={{ fontFamily: fb, fontWeight: 600, fontSize: 13.5, color: '#3F332D', display: 'block', marginBottom: 3, textDecoration: 'none', lineHeight: 1.35, paddingRight: 22 }}>
                      {item.name}
                    </Link>
                    <p style={{ fontFamily: fb, fontSize: 12, color: '#A89A90', margin: '0 0 auto' }}>
                      {lev(item.price)} лв.
                    </p>

                    {/* stepper + line price */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(242, 184, 198, 0.7)', borderRadius: 999, padding: '0 2px', background: '#FBF0F3' }}>
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
          {items.length > 0 && <div style={{ height: 14 }} />}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div style={{ padding: '16px 16px 18px', background: '#fff', borderTop: '1px solid rgba(63,51,45,0.08)', borderRadius: '18px 18px 0 0' }}>
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
            <Link href="/checkout" onClick={closeCart}
              style={{ display: 'block', textAlign: 'center', fontFamily: fb, fontSize: 12, color: '#756B65', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {tr.cart.viewCart}
            </Link>

            <p style={{ fontFamily: fb, fontSize: 11, color: '#A89A90', textAlign: 'center', marginTop: 12, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Lock size={11} strokeWidth={1.8} style={{ color: '#7FA871' }} />
              Сигурно плащане · Доставка и отстъпки се изчисляват при поръчка
            </p>
          </div>
        )}
      </div>
    </>
  );
}
