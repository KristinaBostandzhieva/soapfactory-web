'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/couriers';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';

const fb = 'var(--font-body)';
const fd = 'var(--font-display)';

export default function CartDrawer() {
  const store = useCartStore();
  const { isOpen, closeCart, removeItem, updateQuantity } = store;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items   = mounted ? store.items : [];
  const total   = mounted ? store.totalPrice() : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress  = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const tr = useT();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={closeCart} />}

      <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 18px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontFamily: fb, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#222' }}>
            КОШНИЦА{items.length > 0 ? ` (${items.reduce((s, i) => s + i.quantity, 0)})` : ''}
          </h2>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Items ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', padding: 32, gap: 20 }}>
              <ShoppingBag size={42} style={{ opacity: 0.25 }} />
              <p style={{ fontFamily: fb, fontSize: 14 }}>{tr.cart.empty}</p>
              <Link href="/" onClick={closeCart} style={{
                display: 'inline-block', border: '1px solid #222', color: '#222',
                fontFamily: fb, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '11px 36px', textDecoration: 'none',
              }}>
                ПАЗАРУВАЙ
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', padding: '14px 24px 6px' }}>Продукти</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {items.map((item) => (
                  <li key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 24px', borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
                    {/* image */}
                    <div style={{ width: 80, height: 80, flexShrink: 0, background: '#f8f6f3', overflow: 'hidden' }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <ShoppingBag size={22} style={{ margin: 'auto', opacity: 0.2, display: 'block', marginTop: 29 }} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                        style={{ fontFamily: fb, fontWeight: 500, fontSize: 14, color: '#222', display: 'block', marginBottom: 4, textDecoration: 'none', lineHeight: 1.35 }}>
                        {item.name}
                      </Link>
                      <p style={{ fontFamily: fb, fontSize: 13, color: '#888', marginBottom: 10 }}>
                        {eur(item.price)} € · {lev(item.price)} лв.
                      </p>

                      {/* quantity stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: 30, height: 30, border: '1px solid #ddd', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ width: 36, textAlign: 'center', fontFamily: fb, fontSize: 14, fontWeight: 600, borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', height: 30, lineHeight: '30px', display: 'inline-block' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: 30, height: 30, border: '1px solid #ddd', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={11} />
                        </button>
                      </div>

                      <button onClick={() => removeItem(item.id)}
                        style={{ fontFamily: fb, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Премахни
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #eee' }}>

            {/* free shipping bar */}
            {remaining > 0 ? (
              <>
                <p style={{ fontFamily: fb, fontSize: 12, color: '#777', marginBottom: 8 }}>
                  {tr.cart.freeShippingMsg(eur(remaining))}
                </p>
                <div style={{ height: 3, background: '#f0f0f0', marginBottom: 18, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: '#9B72C7', transition: 'width 0.4s ease' }} />
                </div>
              </>
            ) : (
              <p style={{ fontFamily: fb, fontSize: 12, color: '#6a9e6a', fontWeight: 600, marginBottom: 18 }}>
                {tr.cart.hasFreeShipping}
              </p>
            )}

            {/* subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>Общо</span>
              <span style={{ fontFamily: fb, fontSize: 16, fontWeight: 600, color: '#222' }}>
                {eur(total)} € <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>({lev(total)} лв.)</span>
              </span>
            </div>

            {/* checkout button */}
            <Link href="/poruchka" onClick={closeCart}
              style={{ display: 'block', width: '100%', textAlign: 'center', background: '#C9A96E', color: '#fff', fontFamily: fb, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 0', textDecoration: 'none', marginBottom: 12 }}>
              Поръчай
            </Link>
            <Link href="/checkout" onClick={closeCart}
              style={{ display: 'block', textAlign: 'center', fontFamily: fb, fontSize: 12, color: '#888', textDecoration: 'underline' }}>
              {tr.cart.viewCart}
            </Link>

            <p style={{ fontFamily: fb, fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 12 }}>
              Доставка и отстъпки се изчисляват при поръчка
            </p>
          </div>
        )}
      </div>
    </>
  );
}
