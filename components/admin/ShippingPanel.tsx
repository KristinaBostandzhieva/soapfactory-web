'use client';

import { useTransition } from 'react';
import { generateShippingLabel } from '@/app/admin/actions';
import { courierName, deliveryTypeLabel } from '@/lib/couriers';

export default function ShippingPanel({
  id, courier, deliveryType, officeName, trackingNumber,
}: {
  id: string;
  courier: string | null;
  deliveryType: string | null;
  officeName: string | null;
  trackingNumber: string | null;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="text-[14px] text-[var(--text-body)] space-y-1.5">
      <div><span className="text-[var(--text-muted)]">Куриер:</span> {courierName(courier)}</div>
      <div><span className="text-[var(--text-muted)]">Метод:</span> {deliveryTypeLabel(deliveryType)}</div>
      {officeName && <div><span className="text-[var(--text-muted)]">Офис/автомат:</span> {officeName}</div>}

      <div className="pt-2">
        {trackingNumber ? (
          <div>
            <span className="text-[var(--text-muted)]">Товарителница №:</span>{' '}
            <span className="font-mono font-semibold">{trackingNumber}</span>
          </div>
        ) : (
          <button
            onClick={() => start(() => generateShippingLabel(id))}
            disabled={pending || !courier}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13, opacity: pending || !courier ? 0.6 : 1 }}
          >
            {pending ? 'Генериране…' : 'Генерирай товарителница'}
          </button>
        )}
        {!courier && <p className="text-[12px] text-[var(--text-muted)] mt-1">Няма избран куриер за тази поръчка.</p>}
      </div>
    </div>
  );
}
