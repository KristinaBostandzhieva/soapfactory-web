'use client';

import { useTransition } from 'react';
import { updateOrderStatus } from '@/app/admin/actions';
import { ORDER_STATUSES, orderStatusLabel } from '@/lib/orders';

export default function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOrderStatus(id, e.target.value))}
      className="border border-[var(--border)] rounded px-3 py-2 text-[14px] bg-white focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
    >
      {ORDER_STATUSES.map((value) => <option key={value} value={value}>{orderStatusLabel(value)}</option>)}
    </select>
  );
}
