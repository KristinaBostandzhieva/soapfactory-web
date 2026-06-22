'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { useT } from '@/hooks/useT';

interface Product {
  id: string; name: string; price: number; slug: string;
  image?: string; priceMax?: number;
}

const GAP          = 20;
const NORMAL_SPEED = 0.8;   // px per frame (~48px/s at 60fps)
const FAST_SPEED   = 2.2;   // px per frame at edges
const EDGE_ZONE    = 0.18;  // 18% from each side triggers fast

export default function HomeMegaCarousel({
  newProducts,
  bestSellers,
}: {
  newProducts: Product[];
  bestSellers: Product[];
}) {
  const tr  = useT();
  const all = [
    ...newProducts.map(p => ({ ...p, _group: 'new'  as const })),
    ...bestSellers.map(p => ({ ...p, _group: 'best' as const })),
  ];
  const loop = [...all, ...all, ...all];
  const n    = all.length;

  const [isBest, setIsBest] = useState(false);
  const outerRef     = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const posRef       = useRef(0);
  const speedRef     = useRef(NORMAL_SPEED);
  const rafRef       = useRef<number>(0);
  const singleW      = useRef(0);
  const elapsedMs    = useRef(0);
  const lastTs       = useRef<number | null>(null);

  const newDur  = newProducts.length  * (NORMAL_SPEED > 0 ? 1 : 1); // recalc in RAF
  const phasePx = {
    new:  newProducts.length,
    best: bestSellers.length,
  };

  // Measure single-set width after mount
  useEffect(() => {
    if (trackRef.current) {
      singleW.current = trackRef.current.scrollWidth / 3;
    }
  }, []);

  // RAF loop
  useEffect(() => {
    function tick(ts: number) {
      const dt = lastTs.current !== null ? ts - lastTs.current : 16;
      lastTs.current = ts;

      const spd = speedRef.current;
      if (spd > 0 && singleW.current > 0) {
        // advance time proportional to speed (normalised to NORMAL_SPEED)
        const scaledMs = dt * (spd / NORMAL_SPEED);
        elapsedMs.current += scaledMs;

        // how long one full loop takes at normal speed (≈ px / speed * ms/frame)
        const fullLoopMs = (singleW.current / NORMAL_SPEED) * (1000 / 60);
        const newPhaseMs = (phasePx.new  / n) * fullLoopMs;

        const t = elapsedMs.current % fullLoopMs;
        setIsBest(t >= newPhaseMs);

        posRef.current -= spd;
        if (posRef.current <= -singleW.current) {
          posRef.current += singleW.current;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, phasePx.new]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = outerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = (e.clientX - rect.left) / rect.width;
    // Only far right edge speeds up; everything else pauses
    speedRef.current = pct > 1 - EDGE_ZONE ? FAST_SPEED : 0;
  }

  function handleMouseLeave() {
    speedRef.current = NORMAL_SPEED;
  }

  return (
    <section className="section-pad" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2
          key={String(isBest)}
          className="section-title sf-title-fade"
          style={{ margin: 0 }}
        >
          {isBest ? tr.home.sectionBestsellers : tr.home.sectionNew}
        </h2>
        <Link href="/shop" className="btn-primary">{tr.home.viewAll}</Link>
      </div>
      <hr className="title-underline-full" style={{ marginBottom: 24 }} />

      {/* Marquee */}
      <div
        ref={outerRef}
        className="sf-carousel-outer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={trackRef} className="sf-carousel-track">
          {loop.map((p, i) => (
            <div key={`${p.id}-${i}`} className="sf-carousel-card">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sf-title-fade { animation: sfTitleIn 0.4s ease both; }
        @keyframes sfTitleIn {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .sf-carousel-outer {
          overflow: hidden;
          margin: 0 -15px;
          padding: 0 15px;
          cursor: default;
        }
        .sf-carousel-track {
          display: flex;
          gap: ${GAP}px;
          width: max-content;
          will-change: transform;
        }
        .sf-carousel-card {
          width: calc((100vw - 30px - 3 * ${GAP}px) / 4);
          flex-shrink: 0;
        }
      `}</style>
    </section>
  );
}
