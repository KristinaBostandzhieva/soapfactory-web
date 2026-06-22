'use client';

import CartDrawer from './CartDrawer';

export default function CartProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
