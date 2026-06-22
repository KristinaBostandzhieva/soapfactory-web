'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/couriers';
import { eur, lev } from '@/lib/currency';
import { useT } from '@/hooks/useT';

const hf = 'var(--font-body)';

export default function CartDrawer() {
  const store = useCartStore();
  const { isOpen, closeCart, removeItem, updateQuantity } = store;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = mounted ? store.items : [];
  const total = mounted ? store.totalPrice() : 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const tr = useT();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, letterSpacing: '0.03em' }} className="text-[var(--text-dark)] uppercase">
            {tr.cart.button}
          </h2>
          <button onClick={closeCart} className="flex items-center gap-1.5 text-[14px] text-[var(--text-dark)] hover:text-[var(--primary)] transition-colors">
            <X size={18} /> {tr.common.close}
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-muted)] px-6">
              <ShoppingBag size={48} className="mb-3 opacity-30" />
              <p>{tr.cart.empty}</p>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} className="relative flex gap-4 px-6 py-5 border-b border-[var(--border)]">
                  {/* image */}
                  <div className="w-[70px] h-[70px] bg-[var(--bg-light)] rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag size={22} className="opacity-20" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-5">
                    <Link href={`/produkt/${item.slug}`} onClick={closeCart}
                      style={{ fontFamily: hf }} className="block font-bold text-[14px] text-[var(--text-dark)] leading-snug mb-2 hover:text-[var(--primary)] transition-colors">
                      {item.name}
                    </Link>

                    {/* qty stepper */}
                    <div className="flex items-center border border-[var(--border)] rounded w-fit mb-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:text-[var(--primary)]"><Minus size={12} /></button>
                      <span className="w-8 text-center text-[14px] font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:text-[var(--primary)]"><Plus size={12} /></button>
                    </div>

                    {/* qty × price */}
                    <p className="text-[13px] text-[var(--text-muted)]">
                      {item.quantity} × <span className="text-[var(--primary)] font-semibold">{item.price.toFixed(2)} €</span> ({lev(item.price)} лв.)
                    </p>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="absolute top-5 right-6 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[var(--border)]">
            <div className="flex justify-between items-baseline mb-4">
              <span style={{ fontFamily: hf }} className="font-bold text-[16px] text-[var(--text-dark)]">{tr.cart.total}</span>
              <span style={{ fontFamily: hf }} className="font-bold text-[18px] text-[var(--primary)]">
                {eur(total)} €<span className="text-[13px] text-[var(--text-muted)] font-normal">({lev(total)} лв.)</span>
              </span>
            </div>

            {/* free shipping progress */}
            {remaining > 0 ? (
              <>
                <p className="text-[13px] text-[var(--text-body)] mb-2">
                  {tr.cart.freeShippingMsg(eur(remaining))}
                </p>
                <div className="h-2.5 rounded-full bg-[var(--bg-light)] overflow-hidden mb-5">
                  <div className="h-full rounded-full" style={{
                    width: `${progress}%`,
                    backgroundImage: 'repeating-linear-gradient(45deg, #9B72C7, #9B72C7 8px, #a23e69 8px, #a23e69 16px)',
                  }} />
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[var(--secondary)] font-semibold mb-5">{tr.cart.hasFreeShipping}</p>
            )}

            <Link href="/checkout" onClick={closeCart}
              className="block w-full text-center text-white font-bold rounded mb-3 py-3 transition-colors hover:opacity-95"
              style={{ background: '#9B72C7', fontFamily: hf, fontSize: 15 }}>
              {tr.cart.viewCart}
            </Link>
            <Link href="/poruchka" onClick={closeCart}
              className="block w-full text-center text-white font-bold uppercase rounded py-3 transition-colors"
              style={{ background: '#81763E', fontFamily: hf, fontSize: 14 }}>
              {tr.cart.placeOrder}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
