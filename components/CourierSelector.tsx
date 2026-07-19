'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  COURIERS, type CourierId, type DeliveryType,
  shippingPrice, findPickupPoints, deliveryTypeLabel,
} from '@/lib/couriers';

const hf = 'var(--font-body)';

export interface CourierSelection {
  courier: CourierId;
  deliveryType: DeliveryType;
  officeCode: string | null;
  officeName: string | null;
  shipping: number;
  valid: boolean;
}

export default function CourierSelector({
  subtotal,
  onChange,
}: {
  subtotal: number;
  onChange: (s: CourierSelection) => void;
}) {
  const [courier, setCourier] = useState<CourierId>('econt');
  const def = COURIERS.find((c) => c.id === courier)!;
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(def.methods[0]);
  const [query, setQuery] = useState('');
  const [point, setPoint] = useState<{ code: string; label: string } | null>(null);

  // When courier changes, reset method + chosen point to valid defaults.
  function pickCourier(id: CourierId) {
    const next = COURIERS.find((c) => c.id === id)!;
    setCourier(id);
    setDeliveryType(next.methods[0]);
    setPoint(null);
    setQuery('');
  }

  function pickMethod(m: DeliveryType) {
    setDeliveryType(m);
    setPoint(null);
    setQuery('');
  }

  const needsPoint = deliveryType !== 'address';
  const shipping = shippingPrice(courier, deliveryType, subtotal) ?? 0;
  const valid = needsPoint ? point !== null : true;

  const results = useMemo(
    () => (needsPoint ? findPickupPoints(courier, query) : []),
    [courier, query, needsPoint]
  );

  // Report selection upward whenever it changes.
  useEffect(() => {
    onChange({
      courier,
      deliveryType,
      officeCode: point?.code ?? null,
      officeName: point?.label ?? null,
      shipping,
      valid,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courier, deliveryType, point, shipping, valid]);

  return (
    <div className="courier-selector">
      <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>Доставка</h3>

      {/* Courier choice */}
      <div className="courier-grid grid grid-cols-3 gap-3 mb-5">
        {COURIERS.map((c) => {
          const active = c.id === courier;
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => pickCourier(c.id)}
              className="courier-card border rounded-md py-3 px-2 text-center transition-colors"
              style={{
                borderColor: active ? 'var(--primary)' : 'var(--border)',
                background: active ? 'rgba(155, 114, 199,0.05)' : '#fff',
                color: active ? 'var(--primary)' : 'var(--text-body)',
                fontWeight: active ? 700 : 500,
                fontSize: 14,
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Delivery method */}
      <div className="courier-methods flex flex-wrap gap-4 mb-4">
        {def.methods.map((m) => (
          <label key={m} className="flex items-center gap-2 text-[14px] cursor-pointer">
            <input
              type="radio"
              name="deliveryType"
              checked={deliveryType === m}
              onChange={() => pickMethod(m)}
              style={{ accentColor: 'var(--primary)' }}
            />
            {deliveryTypeLabel(m)}
          </label>
        ))}
      </div>

      {/* Pickup point picker (office / locker) */}
      {needsPoint && (
        <div className="mb-2">
          {point ? (
            <div className="flex items-center justify-between border border-[var(--primary)] rounded px-4 py-3 mb-2 bg-[rgba(155, 114, 199,0.04)]">
              <span className="text-[14px]"><strong>{point.label}</strong></span>
              <button type="button" onClick={() => setPoint(null)} className="text-[13px] text-[var(--primary)] underline">Промени</button>
            </div>
          ) : (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Търси ${def.pickupLabel} по град или адрес…`}
                className="w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)] mb-2"
              />
              <div className="max-h-56 overflow-y-auto border border-[var(--border)] rounded divide-y divide-[var(--border)]">
                {results.map((p) => (
                  <button
                    type="button"
                    key={p.code}
                    onClick={() => setPoint({ code: p.code, label: `${p.name}, ${p.city} (${p.address})` })}
                    className="w-full text-left px-4 py-2.5 text-[14px] hover:bg-[var(--bg-light)]"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[var(--text-muted)]"> — {p.city}, {p.address}</span>
                  </button>
                ))}
                {results.length === 0 && (
                  <p className="px-4 py-3 text-[13px] text-[var(--text-muted)]">Няма намерени резултати.</p>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">Демо списък — реалните {def.pickupLabel}и ще се зареждат от {def.name} след свързване на API.</p>
            </>
          )}
        </div>
      )}

      {/* Shipping price line */}
      <div className="flex justify-between text-[14px] pt-3 border-t border-[var(--border)] mt-3">
        <span className="text-[var(--text-body)]">Цена за доставка</span>
        <span className="font-semibold">{shipping === 0 ? 'Безплатна' : `${shipping.toFixed(2)} €`}</span>
      </div>
    </div>
  );
}
