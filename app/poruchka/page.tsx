'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { lev } from '@/lib/currency';
import { orderNumber } from '@/lib/orders';
import CourierSelector, { type CourierSelection } from '@/components/CourierSelector';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[rgba(63,51,45,0.16)] rounded-[10px] bg-white px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--primary)] transition-colors';

// Section headings — same serif voice as the shop
const sectionH = { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, color: '#3F332D', marginBottom: 18 } as const;

// Same soft green-sphere backdrop the product cards use
const thumbBackdrop =
  'radial-gradient(circle at 20% 16%, rgba(200, 228, 191, 0.30) 0%, rgba(207, 232, 199, 0.16) 26%, rgba(214, 236, 207, 0.06) 42%, transparent 58%), #FCFBF8';

export default function OrderPage() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = mounted ? store.items : [];
  const total = mounted ? store.totalPrice() : 0;

  const [delivery, setDelivery] = useState<CourierSelection | null>(null);
  const shipping = delivery?.shipping ?? 0;
  const addressRequired = delivery?.deliveryType === 'address';

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
      else { setPromo(null); setPromoMsg(d.error || 'Невалиден код.'); }
    } catch { setPromoMsg('Грешка. Опитай пак.'); }
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
  const formRef = useRef<HTMLFormElement>(null);
  const [detailsComplete, setDetailsComplete] = useState(false);

  function updateDetailsProgress(form: HTMLFormElement | null = formRef.current) {
    if (!form) return;
    const data = new FormData(form);
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city'];
    const requiredFilled = requiredFields.every((name) => String(data.get(name) || '').trim().length > 0);
    const addressFilled = !addressRequired || String(data.get('address') || '').trim().length > 0;
    setDetailsComplete(requiredFilled && addressFilled);
  }

  useEffect(() => {
    updateDetailsProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressRequired]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!delivery) { setError('Моля, избери начин на доставка.'); return; }
    if (!delivery.valid) {
      setError(delivery.deliveryType === 'address'
        ? 'Моля, въведи адрес за доставка.'
        : 'Моля, избери офис/автомат за доставка.');
      return;
    }
    const customer = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (delivery.deliveryType === 'address' && !String(customer.address || '').trim()) {
      setError('Моля, въведи адрес за доставка.'); return;
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
      if (!res.ok) { setError(data.error || 'Възникна грешка.'); return; }

      // Card payment ? create a Stripe Checkout session and redirect to it.
      if (paymentMethod === 'stripe') {
        const pr = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        const pd = await pr.json().catch(() => ({}));
        if (!pr.ok || !pd.url) { setError(pd.error || 'Грешка при създаване на плащането.'); return; }
        window.location.href = pd.url; // cart is cleared on the success page
        return;
      }

      // Cash on delivery ? done.
      store.clearCart();
      setOrderId(data.orderId);
      setPlaced(true);
    } catch {
      setError('Възникна грешка. Опитай отново.');
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="max-w-[700px] mx-auto px-[15px] py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 34, color: '#3F332D', marginBottom: 12 }}>Благодарим за поръчката!</h1>
        <p className="text-[var(--text-body)] mb-2">Номер на поръчката: <strong>#{orderNumber(orderId)}</strong></p>
        <p className="text-[var(--text-body)] mb-6">Ще се свържем с теб за потвърждение. Плащане при доставка (наложен платеж).</p>
        <Link href="/" className="btn-primary inline-block">Обратно към начало</Link>
      </div>
    );
  }

  if (mounted && items.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-[15px] py-24 text-center">
        <p className="text-[var(--text-body)] mb-6">Количката ти е празна.</p>
        <Link href="/shop" className="btn-primary inline-block">Към магазина</Link>
      </div>
    );
  }

  const deliveryComplete = !!delivery?.valid;
  const paymentComplete = detailsComplete && deliveryComplete && !!paymentMethod;
  const detailsStepClass = detailsComplete ? 'is-done' : 'is-active';
  const deliveryStepClass = deliveryComplete ? 'is-done' : detailsComplete ? 'is-active' : '';
  const paymentStepClass = paymentComplete ? 'is-done' : deliveryComplete ? 'is-active' : '';

  return (
    <div className="checkout-page" style={{
      background:
        'radial-gradient(ellipse 28% 75% at 0% 50%, rgba(244, 178, 197, 0.20) 0%, transparent 72%), ' +
        'radial-gradient(ellipse 28% 75% at 100% 50%, rgba(244, 178, 197, 0.20) 0%, transparent 72%)',
    }}>
      <PageHeader
        title="Поръчка"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Количка', href: '/checkout' }, { label: 'Поръчка' }]}
      />

      <div className="checkout-shell max-w-[1240px] mx-auto px-[15px] py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14">
        {/* Billing form */}
        <form ref={formRef} onSubmit={submit} onChange={(event) => updateDetailsProgress(event.currentTarget)} className="checkout-form">
          <div className="checkout-progress" aria-label="Checkout progress">
            <a href="#checkout-summary" className="is-done"><span>1</span> Количка</a>
            <a href="#checkout-details" className={detailsStepClass}><span>2</span> Данни</a>
            <a href="#checkout-delivery" className={deliveryStepClass}><span>3</span> Доставка</a>
            <a href="#checkout-payment" className={paymentStepClass}><span>4</span> Плащане</a>
          </div>
          <div id="checkout-details" className="checkout-card checkout-card--contact">
          <h3 style={sectionH}>Данни за доставка</h3>
          {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input name="firstName" required placeholder="Име *" aria-label="Име" className={inputCls} />
            <input name="lastName" required placeholder="Фамилия *" aria-label="Фамилия" className={inputCls} />
          </div>
          <div className="mb-3"><input name="email" required type="email" placeholder="Имейл *" aria-label="Имейл" className={inputCls} /></div>
          <div className="mb-3"><input name="phone" required type="tel" placeholder="Телефон *" aria-label="Телефон" className={inputCls} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input name="city" required placeholder="Град *" aria-label="Град" className={inputCls} />
            <input name="postcode" placeholder="Пощенски код" aria-label="Пощенски код" className={inputCls} />
          </div>
          <div className="mb-3">
            <input name="address" placeholder={addressRequired ? 'Адрес *' : 'Адрес (при доставка до адрес)'} aria-label="Адрес" className={inputCls} />
          </div>
          <div className="mb-0"><textarea name="notes" rows={3} placeholder="Бележки към поръчката" aria-label="Бележки към поръчката" className={inputCls} /></div>
          </div>

          {/* Courier / delivery */}
          <div id="checkout-delivery" className="checkout-card checkout-card--delivery">
            <CourierSelector subtotal={total} onChange={setDelivery} />
          </div>

          {/* Payment method */}
          <div id="checkout-payment" className="checkout-card checkout-card--payment">
            <h3 style={sectionH}>Начин на плащане</h3>
            <label className="flex items-center gap-3 border rounded-xl px-4 py-3.5 mb-3 cursor-pointer transition-colors"
              style={{ borderColor: paymentMethod === 'cod' ? '#3F332D' : 'rgba(63,51,45,0.16)', background: paymentMethod === 'cod' ? '#F9F1F4' : '#fff' }}>
              <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: '#3F332D' }} />
              <span className="text-[14px]"><strong>Наложен платеж</strong> — плащане в брой при доставка</span>
            </label>
            <label className="flex items-center gap-3 border rounded-xl px-4 py-3.5 cursor-pointer transition-colors"
              style={{ borderColor: paymentMethod === 'stripe' ? '#3F332D' : 'rgba(63,51,45,0.16)', background: paymentMethod === 'stripe' ? '#F9F1F4' : '#fff', opacity: stripeEnabled ? 1 : 0.55 }}>
              <input type="radio" name="payment" disabled={!stripeEnabled} checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} style={{ accentColor: '#3F332D' }} />
              <span className="text-[14px]">
                <strong>Плащане с карта</strong> (Visa / Mastercard, чрез Stripe)
                {!stripeEnabled && <span className="text-[var(--text-muted)]"> — нужен API ключ</span>}
              </span>
            </label>
          </div>

          <div className="checkout-submit-card">
          <button type="submit" disabled={loading} className="checkout-submit-button" style={{
            background: '#3F332D', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer',
            padding: '16px 46px', fontSize: 13, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            fontFamily: hf, borderRadius: 12, opacity: loading ? 0.65 : 1,
            transition: 'opacity 0.2s ease, background 0.25s ease',
          }}>
            {loading ? 'Обработка…' : paymentMethod === 'stripe' ? 'Плати с карта' : 'Изпрати поръчката'}
          </button>
          <p className="text-[12px] text-[var(--text-muted)] mt-3">При плащане с карта те пренасочваме сигурно към Stripe — данните на картата не минават през нашия сайт.</p>
          </div>
        </form>

        {/* Summary */}
        <aside id="checkout-summary" className="checkout-summary h-fit lg:sticky lg:top-[110px] rounded-2xl p-6"
          style={{ background: '#fff', border: '1px solid rgba(63,51,45,0.08)', boxShadow: '0 18px 44px -28px rgba(63,51,45,0.25)' }}>
          <h3 style={sectionH}>Твоята поръчка</h3>
          <ul className="mb-4">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-2.5 border-b border-[rgba(63,51,45,0.07)]">
                <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', background: thumbBackdrop }}>
                    {it.image && (
                      <img src={it.image} alt={it.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                    )}
                  </div>
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    minWidth: 19, height: 19, borderRadius: 999, padding: '0 5px',
                    background: '#3F332D', color: '#FDFBF7',
                    fontSize: 10.5, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: hf,
                  }}>{it.quantity}</span>
                </div>
                <span className="flex-1 min-w-0 text-[13px] leading-snug text-[#3F332D] font-medium">{it.name}</span>
                <span className="text-[14px] font-semibold text-[#3F332D]">{(it.price * it.quantity).toFixed(2)} €</span>
              </li>
            ))}
          </ul>
          {/* Promo code */}
          <div className="py-2 border-b border-[var(--border)] mb-1">
            {promo ? (
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-green-700">Код <strong>{promo.code}</strong> ({promo.label}) приложен</span>
                <button type="button" onClick={() => { setPromo(null); setPromoInput(''); }} className="text-[12px] text-[var(--text-muted)] underline">Премахни</button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Промокод"
                    className="flex-1 border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)] uppercase" />
                  <button type="button" onClick={applyPromo} disabled={promoLoading}
                    className="px-4 rounded-[10px] text-[13px] font-semibold border border-[#3F332D] text-[#3F332D] hover:bg-[#3F332D] hover:text-white transition-colors">
                    {promoLoading ? '…' : 'Приложи'}
                  </button>
                </div>
                {promoMsg && <p className="text-[12px] text-red-600 mt-1">{promoMsg}</p>}
              </>
            )}
          </div>

          <div className="flex justify-between text-[14px] py-1"><span className="text-[var(--text-body)]">Междинна сума</span><span>{total.toFixed(2)} €</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-[14px] py-1 text-green-700">
              <span>Отстъпка ({promo?.code})</span><span>- {discount.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] py-1">
            <span className="text-[var(--text-body)]">Доставка{delivery ? ` (${delivery.courier === 'boxnow' ? 'BOX NOW' : delivery.courier === 'speedy' ? 'Спиди' : 'Еконт'})` : ''}</span>
            <span style={shipping === 0 ? { color: '#5C7350', fontWeight: 600 } : undefined}>{shipping === 0 ? 'Безплатна' : `${shipping.toFixed(2)} €`}</span>
          </div>
          <div className="flex justify-between items-baseline mt-3 rounded-[10px] px-3.5 py-3" style={{ background: '#E9F3E3' }}>
            <span style={{ fontFamily: hf, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C7350' }}>Общо</span>
            <span style={{ fontFamily: hf }} className="font-semibold text-[18px] text-[#3F332D]">{grandTotal.toFixed(2)} € <span className="text-[12px] text-[#7C8F72] font-normal">({lev(grandTotal)} лв.)</span></span>
          </div>
          <p className="text-[11px] text-[#A89A90] text-center mt-4 mb-0" style={{ fontFamily: hf }}>
            🔒 Сигурно плащане · Данните ти са защитени
          </p>
        </aside>
      </div>
    </div>
  );
}
