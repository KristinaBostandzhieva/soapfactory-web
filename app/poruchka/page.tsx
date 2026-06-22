'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { lev } from '@/lib/currency';
import { orderNumber } from '@/lib/orders';
import CourierSelector, { type CourierSelection } from '@/components/CourierSelector';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function OrderPage() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = mounted ? store.items : [];
  const total = mounted ? store.totalPrice() : 0;

  const [delivery, setDelivery] = useState<CourierSelection | null>(null);
  const shipping = delivery?.shipping ?? 0;

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<{ amount: number; code: string; label?: string } | null>(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const discount = promo?.amount ?? 0;
  const grandTotal = Math.max(0, total - discount) + shipping;

  async function applyPromo() {
    setPromoMsg('');
    if (!promoInput.trim()) { setPromo(null); return; }
    setPromoLoading(true);
    try {
      const r = await fetch('/api/discount/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal: total }),
      });
      const d = await r.json();
      if (d.valid) { setPromo({ amount: d.amount, code: d.code, label: d.label }); setPromoMsg(''); }
      else { setPromo(null); setPromoMsg(d.error || '????????? ???.'); }
    } catch { setPromoMsg('??????. ?????? ???.'); }
    finally { setPromoLoading(false); }
  }

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  useEffect(() => {
    fetch('/api/payments/stripe').then((r) => r.json()).then((d) => setStripeEnabled(!!d.configured)).catch(() => {});
  }, []);

  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!delivery) { setError('???? ?????? ????? ?? ????????.'); return; }
    if (!delivery.valid) {
      setError(delivery.deliveryType === 'address'
        ? '???? ??????? ????? ?? ????????.'
        : '???? ?????? ????/??????? ?? ????????.');
      return;
    }
    const customer = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (delivery.deliveryType === 'address' && !String(customer.address || '').trim()) {
      setError('???? ??????? ????? ?? ????????.'); return;
    }

    setLoading(true);
    let attribution: unknown = null;
    try { const a = sessionStorage.getItem('sf_attrib'); if (a) attribution = JSON.parse(a); } catch { /* ignore */ }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer,
          paymentMethod,
          discountCode: promo?.code,
          attribution,
          delivery: {
            courier: delivery.courier,
            deliveryType: delivery.deliveryType,
            officeCode: delivery.officeCode,
            officeName: delivery.officeName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '???????? ??????.'); return; }

      // Card payment ? create a Stripe Checkout session and redirect to it.
      if (paymentMethod === 'stripe') {
        const pr = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        const pd = await pr.json().catch(() => ({}));
        if (!pr.ok || !pd.url) { setError(pd.error || '?????? ??? ?????????? ?? ?????????.'); return; }
        window.location.href = pd.url; // cart is cleared on the success page
        return;
      }

      // Cash on delivery ? done.
      store.clearCart();
      setOrderId(data.orderId);
      setPlaced(true);
    } catch {
      setError('???????? ??????. ?????? ??????.');
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="max-w-[700px] mx-auto px-[15px] py-24 text-center">
        <div className="text-5xl mb-4">?</div>
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7', marginBottom: 12 }}>?????????? ?? ?????????!</h1>
        <p className="text-[var(--text-body)] mb-2">????? ?? ?????????: <strong>#{orderNumber(orderId)}</strong></p>
        <p className="text-[var(--text-body)] mb-6">?? ?? ??????? ? ??? ?? ????????????. ??????? ??? ???????? (??????? ??????).</p>
        <Link href="/" className="btn-primary inline-block">??????? ??? ??????</Link>
      </div>
    );
  }

  if (mounted && items.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-[15px] py-24 text-center">
        <p className="text-[var(--text-body)] mb-6">????????? ?? ? ??????.</p>
        <Link href="/shop" className="btn-primary inline-block">??? ????????</Link>
      </div>
    );
  }

  const addressRequired = delivery?.deliveryType === 'address';

  return (
    <div>
      <PageHeader
        title="???????"
        breadcrumbs={[{ label: '??????', href: '/' }, { label: '???????', href: '/checkout' }, { label: '???????' }]}
      />

      <div className="max-w-full mx-auto px-[15px] py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Billing form */}
        <form onSubmit={submit}>
          <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>????? ?? ????????</h3>
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-[13px] mb-1">??? *</label><input name="firstName" required className={inputCls} /></div>
            <div><label className="block text-[13px] mb-1">??????? *</label><input name="lastName" required className={inputCls} /></div>
          </div>
          <div className="mb-4"><label className="block text-[13px] mb-1">????? *</label><input name="email" required type="email" className={inputCls} /></div>
          <div className="mb-4"><label className="block text-[13px] mb-1">??????? *</label><input name="phone" required type="tel" className={inputCls} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-[13px] mb-1">???? *</label><input name="city" required className={inputCls} /></div>
            <div><label className="block text-[13px] mb-1">???????? ???</label><input name="postcode" className={inputCls} /></div>
          </div>
          <div className="mb-4">
            <label className="block text-[13px] mb-1">????? {addressRequired ? '*' : <span className="text-[var(--text-muted)]">(??? ???????? ?? ?????)</span>}</label>
            <input name="address" className={inputCls} />
          </div>
          <div className="mb-8"><label className="block text-[13px] mb-1">??????? ??? ?????????</label><textarea name="notes" rows={3} className={inputCls} /></div>

          {/* Courier / delivery */}
          <div className="border-t border-[var(--border)] pt-6 mb-8">
            <CourierSelector subtotal={total} onChange={setDelivery} />
          </div>

          {/* Payment method */}
          <div className="border-t border-[var(--border)] pt-6 mb-8">
            <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>????? ?? ???????</h3>
            <label className="flex items-center gap-3 border rounded-md px-4 py-3 mb-3 cursor-pointer"
              style={{ borderColor: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)' }}>
              <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: 'var(--primary)' }} />
              <span className="text-[14px]"><strong>??????? ??????</strong> — ??????? ? ???? ??? ????????</span>
            </label>
            <label className="flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer"
              style={{ borderColor: paymentMethod === 'stripe' ? 'var(--primary)' : 'var(--border)', opacity: stripeEnabled ? 1 : 0.55 }}>
              <input type="radio" name="payment" disabled={!stripeEnabled} checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} style={{ accentColor: 'var(--primary)' }} />
              <span className="text-[14px]">
                <strong>??????? ? ?????</strong> (Visa / Mastercard, ???? Stripe)
                {!stripeEnabled && <span className="text-[var(--text-muted)]"> — ?????? API ????</span>}
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px 36px', fontSize: 14 }}>
            {loading ? '?????????…' : paymentMethod === 'stripe' ? '????? ? ?????' : '??????? ?????????'}
          </button>
          <p className="text-[12px] text-[var(--text-muted)] mt-3">?? ????????? ???????? ?? ?????????? ??????? ?? Stripe — ??????? ?? ??????? ?? ??????? ???? ???? ????.</p>
        </form>

        {/* Summary */}
        <aside className="bg-[var(--bg-light)] rounded-md p-6 h-fit">
          <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>?????? ???????</h3>
          <ul className="mb-4">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between text-[14px] py-2 border-b border-[var(--border)]">
                <span className="text-[var(--text-body)]">{it.name} × {it.quantity}</span>
                <span className="font-semibold">{(it.price * it.quantity).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          {/* Promo code */}
          <div className="py-2 border-b border-[var(--border)] mb-1">
            {promo ? (
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-green-700">??? <strong>{promo.code}</strong> ({promo.label}) ????????</span>
                <button type="button" onClick={() => { setPromo(null); setPromoInput(''); }} className="text-[12px] text-[var(--text-muted)] underline">????????</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="????????"
                    className="flex-1 border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)] uppercase" />
                  <button type="button" onClick={applyPromo} disabled={promoLoading}
                    className="px-4 rounded text-[13px] font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">
                    {promoLoading ? '…' : '???????'}
                  </button>
                </div>
                {promoMsg && <p className="text-[12px] text-red-600 mt-1">{promoMsg}</p>}
              </>
            )}
          </div>

          <div className="flex justify-between text-[14px] py-1"><span className="text-[var(--text-body)]">???????? ????</span><span>{total.toFixed(2)} €</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-[14px] py-1 text-green-700">
              <span>???????? ({promo?.code})</span><span>- {discount.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] py-1">
            <span className="text-[var(--text-body)]">????????{delivery ? ` (${delivery.courier === 'boxnow' ? 'BOX NOW' : delivery.courier === 'speedy' ? '?????' : '?????'})` : ''}</span>
            <span>{shipping === 0 ? '?????????' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between py-3 mt-2 border-t border-[var(--border)]">
            <span style={{ fontFamily: hf }} className="font-bold">????</span>
            <span style={{ fontFamily: hf }} className="font-bold text-[18px] text-[var(--primary)]">{grandTotal.toFixed(2)} € <span className="text-[12px] text-[var(--text-muted)] font-normal">({lev(grandTotal)} ??.)</span></span>
          </div>
        </aside>
      </div>
    </div>
  );
}
