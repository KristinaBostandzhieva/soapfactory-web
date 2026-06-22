// ── Courier configuration & pricing ───────────────────────────────────
// Shared by the checkout UI and the order API. No secrets here — live API
// credentials live in .env and are only used server-side (lib/couriers/*).
//
// NOTE: office/locker lists below are MOCK data for development. They get
// replaced by live Econt/Speedy/BoxNow API lookups once API keys are added.

export type CourierId = 'econt' | 'speedy' | 'boxnow';
export type DeliveryType = 'office' | 'address' | 'locker';

export interface CourierDef {
  id: CourierId;
  name: string;          // display name
  methods: DeliveryType[]; // supported delivery methods
  pickupLabel: string;   // word for the pickup point, e.g. "офис" / "автомат"
}

export const COURIERS: CourierDef[] = [
  { id: 'econt', name: 'Еконт', methods: ['office', 'address'], pickupLabel: 'офис' },
  { id: 'speedy', name: 'Спиди', methods: ['office', 'address'], pickupLabel: 'офис' },
  { id: 'boxnow', name: 'BOX NOW', methods: ['locker'], pickupLabel: 'автомат' },
];

export const FREE_SHIPPING_THRESHOLD = 35; // EUR — free pickup over this subtotal

// Base shipping prices in EUR per courier + method.
const PRICES: Record<CourierId, Partial<Record<DeliveryType, number>>> = {
  econt: { office: 4.99, address: 6.99 },
  speedy: { office: 4.99, address: 6.99 },
  boxnow: { locker: 3.99 },
};

/**
 * Authoritative shipping price. Returns null for an unsupported combination.
 * Pickup (office/locker) is free over the threshold; to-address always charged.
 */
export function shippingPrice(courier: CourierId, deliveryType: DeliveryType, subtotal: number): number | null {
  const base = PRICES[courier]?.[deliveryType];
  if (base == null) return null;
  if (subtotal <= 0) return 0;
  if (deliveryType !== 'address' && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return base;
}

export function getCourier(id: string): CourierDef | undefined {
  return COURIERS.find((c) => c.id === id);
}

export function courierName(id?: string | null): string {
  return COURIERS.find((c) => c.id === id)?.name ?? (id || '—');
}

export function deliveryTypeLabel(t?: string | null): string {
  if (t === 'office') return 'до офис';
  if (t === 'locker') return 'до автомат';
  if (t === 'address') return 'до адрес';
  return '—';
}

// ── MOCK pickup points (replaced by live API later) ───────────────────
export interface PickupPoint {
  code: string;
  name: string;
  city: string;
  address: string;
}

export const MOCK_PICKUP_POINTS: Record<CourierId, PickupPoint[]> = {
  econt: [
    { code: 'ECT-SOF-1', name: 'Еконт Витоша', city: 'София', address: 'бул. Витоша 100' },
    { code: 'ECT-SOF-2', name: 'Еконт Младост', city: 'София', address: 'бул. Александър Малинов 51' },
    { code: 'ECT-PLD-1', name: 'Еконт Център', city: 'Пловдив', address: 'ул. Гладстон 1' },
    { code: 'ECT-VAR-1', name: 'Еконт Чайка', city: 'Варна', address: 'бул. Княз Борис I 115' },
    { code: 'ECT-BGS-1', name: 'Еконт Бургас Център', city: 'Бургас', address: 'ул. Александровска 28' },
  ],
  speedy: [
    { code: 'SPD-SOF-1', name: 'Спиди Лозенец', city: 'София', address: 'бул. Джеймс Баучер 23' },
    { code: 'SPD-SOF-2', name: 'Спиди Люлин', city: 'София', address: 'бул. Царица Йоанна 15' },
    { code: 'SPD-PLD-1', name: 'Спиди Кючук Париж', city: 'Пловдив', address: 'ул. Македония 2' },
    { code: 'SPD-VAR-1', name: 'Спиди Гранд Мол', city: 'Варна', address: 'бул. Владислав Варненчик 186' },
    { code: 'SPD-BGS-1', name: 'Спиди Меден Рудник', city: 'Бургас', address: 'ж.к. Меден Рудник' },
  ],
  boxnow: [
    { code: 'BN-SOF-1', name: 'BOX NOW Mall of Sofia', city: 'София', address: 'бул. Александър Стамболийски 101' },
    { code: 'BN-SOF-2', name: 'BOX NOW Paradise Center', city: 'София', address: 'бул. Черни връх 100' },
    { code: 'BN-PLD-1', name: 'BOX NOW Mall Plovdiv', city: 'Пловдив', address: 'ул. Перущица 8' },
    { code: 'BN-VAR-1', name: 'BOX NOW Delta Planet', city: 'Варна', address: 'бул. Сливница 185' },
  ],
};

export function findPickupPoints(courier: CourierId, query = ''): PickupPoint[] {
  const all = MOCK_PICKUP_POINTS[courier] || [];
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((p) =>
    `${p.name} ${p.city} ${p.address}`.toLowerCase().includes(q)
  );
}
