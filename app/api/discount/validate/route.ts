import { NextResponse } from 'next/server';
import { validateDiscount } from '@/lib/discounts';

// Live promo-code check from the checkout page.
export async function POST(req: Request) {
  const { code, subtotal } = await req.json().catch(() => ({}));
  const result = await validateDiscount(String(code || ''), Number(subtotal) || 0);
  return NextResponse.json(result);
}
