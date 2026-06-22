'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

// Empties the cart once, after a successful card payment redirect.
export default function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => { clearCart(); }, [clearCart]);
  return null;
}
