import { prisma } from './prisma';

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export interface DiscountResult {
  valid: boolean;
  amount: number;       // EUR discount applied
  code?: string;
  label?: string;       // e.g. "10%" or "5.00 €"
  error?: string;
}

function describe(type: string, value: number): string {
  return type === 'percent' ? `${value}%` : `${value.toFixed(2)} €`;
}

/**
 * Validate a promo code against an order subtotal and compute the discount.
 * Authoritative — used both by the live checkout check and the order API.
 */
export async function validateDiscount(rawCode: string, subtotal: number): Promise<DiscountResult> {
  const code = normalizeCode(rawCode || '');
  if (!code) return { valid: false, amount: 0, error: 'Въведи код.' };

  const d = await prisma.discount.findUnique({ where: { code } });
  if (!d || !d.active) return { valid: false, amount: 0, error: 'Невалиден код.' };
  if (d.expiresAt && d.expiresAt < new Date()) return { valid: false, amount: 0, error: 'Кодът е изтекъл.' };
  if (d.maxUses != null && d.usedCount >= d.maxUses) return { valid: false, amount: 0, error: 'Кодът вече не е активен.' };
  if (d.minSubtotal != null && subtotal < d.minSubtotal) {
    return { valid: false, amount: 0, error: `Кодът важи за поръчки над ${d.minSubtotal.toFixed(2)} €.` };
  }

  let amount = d.type === 'percent' ? (subtotal * d.value) / 100 : d.value;
  amount = Math.min(amount, subtotal);            // never exceed the subtotal
  amount = Math.round(amount * 100) / 100;        // 2 decimals

  return { valid: true, amount, code, label: describe(d.type, d.value) };
}
