'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/admin/actions';
import { ORDER_STATUSES, orderStatusLabel } from '@/lib/orders';

export default function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) =>
          startTransition(async () => {
            await updateOrderStatus(id, e.target.value);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          })
        }
        className="border border-[var(--border)] rounded px-3 py-2 text-[14px] bg-white focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
      >
        {ORDER_STATUSES.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}
      </select>
      {pending && <span className="text-[12px] text-[var(--text-muted)]">Запазване…</span>}
      {saved && !pending && <span className="text-[12px] font-semibold text-green-600">✓ Запазено</span>}
    </div>
  );
}
