'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus, X, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { lev } from '@/lib/currency';
import { shippingPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/couriers';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';

export default function CheckoutPage() {
  const store = useCartStore();
  const { updateQuantity, removeItem } = store;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = mounted ? store.items : [];
  const total = mounted ? store.totalPrice() : 0;
  // Estimate using the cheapest delivery option (BOX NOW locker) — the real
  // price is finalized on the next step once a courier is chosen.
  const shipping = shippingPrice('boxnow', 'locker', total) ?? 0;
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const freeShippingUnlocked = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="cart-page-view">
      <PageHeader
        title="Количка"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Количка' }]}
      />

      <div className="cart-page max-w-[1400px] mx-auto px-[15px] py-12">
        {items.length === 0 ? (
          <div className="sf-empty-state">
            <div className="sf-empty-art" aria-hidden="true">
              <ShoppingBag size={38} strokeWidth={1.4} />
            </div>
            <p className="sf-empty-kicker">Количка</p>
            <h2>Количката ти е празна</h2>
            <p>Добави любим продукт и ще го подготвим за поръчка тук.</p>
            <div className="sf-empty-actions">
              <Link href="/shop" className="sf-empty-primary">Към магазина</Link>
              <Link href="/kategoria/promotsii" className="sf-empty-secondary">Виж промоции</Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            {/* Items */}
            <div className="cart-items">
              <table className="cart-table w-full text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="py-3 font-semibold">Продукт</th>
                    <th className="py-3 font-semibold">Цена</th>
                    <th className="py-3 font-semibold">Количество</th>
                    <th className="py-3 font-semibold text-right">Общо</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="cart-item-row border-b border-[var(--border)]">
                      <td className="cart-product-cell py-4">
                        <div className="cart-product flex items-center gap-3">
                          <div className="cart-product-image-shell w-16 h-16 bg-[var(--bg-light)] rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {it.image ? <img src={it.image} alt={it.name} className="cart-product-image w-full h-full object-cover" /> : <ShoppingBag size={20} className="opacity-20" />}
                          </div>
                          <span className="cart-product-name font-semibold text-[var(--text-dark)]">{it.name}</span>
                        </div>
                      </td>
                      <td className="cart-unit-price py-4 text-[var(--primary)] font-semibold">{it.price.toFixed(2)} €</td>
                      <td className="cart-quantity-cell py-4">
                        <div className="cart-quantity-control flex items-center border border-[var(--border)] rounded w-fit">
                          <button onClick={() => updateQuantity(it.id, it.quantity - 1)} className="cart-quantity-button w-8 h-9 flex items-center justify-center hover:text-[var(--primary)]"><Minus size={12} /></button>
                          <span className="cart-quantity-value w-8 text-center font-semibold">{it.quantity}</span>
                          <button onClick={() => updateQuantity(it.id, it.quantity + 1)} className="cart-quantity-button w-8 h-9 flex items-center justify-center hover:text-[var(--primary)]"><Plus size={12} /></button>
                        </div>
                      </td>
                      <td className="cart-line-total py-4 text-right font-semibold text-[var(--text-dark)]">{(it.price * it.quantity).toFixed(2)} €</td>
                      <td className="cart-remove-cell py-4 text-right"><button onClick={() => removeItem(it.id)} className="cart-remove-button text-[var(--text-muted)] hover:text-[var(--primary)]"><X size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <aside className="cart-summary bg-[var(--bg-light)] rounded-md p-6 h-fit">
              <h3 className="cart-summary-title" style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>Обобщение</h3>
              <div className={`cart-mobile-shipping-progress${freeShippingUnlocked ? ' is-unlocked' : ''}`}>
                <div className="cart-mobile-shipping-copy">
                  <span className="cart-mobile-shipping-icon" aria-hidden="true">
                    {freeShippingUnlocked ? <Check size={14} strokeWidth={2.2} /> : <Truck size={14} strokeWidth={1.8} />}
                  </span>
                  <span>{freeShippingUnlocked ? 'Безплатната доставка е активна' : `Още ${(FREE_SHIPPING_THRESHOLD - total).toFixed(2)} € до безплатна доставка`}</span>
                </div>
                <div className="cart-mobile-shipping-track" aria-hidden="true">
                  <span style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>
              <div className="cart-summary-row flex justify-between text-[14px] py-2 border-b border-[var(--border)]">
                <span className="text-[var(--text-body)]">Междинна сума</span>
                <span className="font-semibold">{total.toFixed(2)} €</span>
              </div>
              <div className="cart-summary-row flex justify-between text-[14px] py-2 border-b border-[var(--border)]">
                <span className="text-[var(--text-body)]">Доставка</span>
                <span className="font-semibold">{shipping === 0 ? 'Безплатна' : `${shipping.toFixed(2)} €`}</span>
              </div>
              <div className="cart-summary-total flex justify-between py-3">
                <span style={{ fontFamily: hf }} className="font-bold text-[var(--text-dark)]">Общо</span>
                <span style={{ fontFamily: hf }} className="font-bold text-[18px] text-[var(--primary)]">
                  {(total + shipping).toFixed(2)} € <span className="text-[12px] text-[var(--text-muted)] font-normal">({lev(total + shipping)} лв.)</span>
                </span>
              </div>
              {total < FREE_SHIPPING_THRESHOLD && total > 0 && (
                <p className="cart-shipping-note text-[12px] text-[var(--text-muted)] mb-4">Добави още {(FREE_SHIPPING_THRESHOLD - total).toFixed(2)} € за безплатна доставка.</p>
              )}
              <Link href="/poruchka" className="cart-checkout-link btn-primary w-full text-center block" style={{ padding: '12px' }}>Към плащане</Link>
              <p className="cart-payment-note text-[11px] text-[var(--text-muted)] text-center mt-3">Сигурно плащане чрез Stripe</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
