'use client';

import { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const GAP   = 16;
const SPEED = 0.55; // px per frame — smooth but clearly moving

interface Product {
  id: string; name: string; price: number; slug: string;
  image?: string; priceMax?: number; inStock?: boolean;
  rating?: number; reviewCount?: number; shortDescription?: string | null;
}

export default function InfiniteProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);
  const rafRef   = useRef(0);
  const singleW  = useRef(0);

  const loop = [...products, ...products, ...products];

  useEffect(() => {
    if (window.innerWidth >= 640) return;

    // Measure after a frame so DOM is fully painted
    const measure = () => {
      if (trackRef.current) singleW.current = trackRef.current.scrollWidth / 3;
    };
    requestAnimationFrame(measure);

    function tick() {
      if (singleW.current > 0) {
        posRef.current -= SPEED;
        if (posRef.current <= -singleW.current) posRef.current += singleW.current;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    // Start loop
    rafRef.current = requestAnimationFrame(tick);

    // Resume when tab regains focus
    const onVisible = () => {
      if (!document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <>
      {/* Mobile: infinite marquee */}
      <div className="ipc-outer">
        <div ref={trackRef} className="ipc-track">
          {loop.map((p, i) => (
            <div key={`${p.id}-${i}`} className="ipc-card">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: normal grid (hidden on mobile) */}
      <div className="ipc-grid grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <style>{`
        /* Mobile marquee */
        .ipc-outer {
          overflow: hidden;
          margin: 0 -15px;
          padding: 0 15px;
        }
        .ipc-track {
          display: flex;
          gap: ${GAP}px;
          width: max-content;
          will-change: transform;
        }
        .ipc-card {
          width: calc((100vw - 30px) * 0.68);
          flex-shrink: 0;
        }

        /* Show marquee only on mobile */
        @media (min-width: 640px) {
          .ipc-outer { display: none; }
          .ipc-grid  { display: grid; }
        }
        @media (max-width: 639px) {
          .ipc-outer { display: block; }
          .ipc-grid  { display: none; }
        }
      `}</style>
    </>
  );
}
