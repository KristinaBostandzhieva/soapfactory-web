// ── Order status ────────────────────────────────────────────────────
// Single source of truth for order status keys, Bulgarian labels, and
// badge colors — used by the admin order lists, customer order history,
// the status dropdown, the CSV export, and status-update validation.
export const ORDER_STATUSES: readonly string[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABELS: Record<string, string> = {
  new: 'Нова', processing: 'Обработва се', shipped: 'Изпратена', delivered: 'Доставена', cancelled: 'Отказана',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700', processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
};

export function orderStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function orderStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? '';
}

// Short customer-facing order reference: last 6 chars of the id, uppercased.
export function orderNumber(id: string): string {
  return id.slice(-6).toUpperCase();
}
