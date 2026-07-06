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
const NORMAL_SPEED = 0.18;  // super slow auto-scroll
const FAST_SPEED   = 2.2;
const EDGE_ZONE    = 0.18;

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
  const [showHint, setShowHint] = useState(true);
  const outerRef       = useRef<HTMLDivElement>(null);
  const trackRef       = useRef<HTMLDivElement>(null);
  const posRef         = useRef(0);
  const speedRef       = useRef(NORMAL_SPEED);
  const rafRef         = useRef<number>(0);
  const singleW        = useRef(0);
  const elapsedMs      = useRef(0);
  const lastTs         = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartPos  = useRef(0);

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
    if (window.innerWidth >= 640) {
      if (trackRef.current) trackRef.current.style.transform = 'none';
      return;
    }

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

  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartPos.current = posRef.current;
    speedRef.current = 0;
    setShowHint(false);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    let newPos = touchStartPos.current + delta;
    const sw = singleW.current;
    if (sw > 0) {
      while (newPos > 0) newPos -= sw;
      while (newPos <= -sw) newPos += sw;
    }
    posRef.current = newPos;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${newPos}px)`;
  }

  function handleTouchEnd() {
    touchStartXRef.current = null;
    speedRef.current = NORMAL_SPEED;
  }

  return (
    <section className="section-pad home-mega-products" style={{ paddingBottom: 28 }}>
      {/* Header */}
      <div className="title-row">
        <h2 className="section-title">{tr.home.sectionBestsellers}</h2>
      </div>

      {/* Marquee */}
      <div
        ref={outerRef}
        className="sf-carousel-outer boj-product-grid"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} className="sf-carousel-track">
          {loop.map((p, i) => (
            <div key={`${p.id}-${i}`} className="sf-carousel-card">
              <ProductCard product={p} variant="bojCategory" />
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
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 0;
          cursor: default;
        }
        @keyframes sf-swipe-anim {
          0%   { opacity: 0; transform: translateX(80px) translateY(-50%); }
          10%  { opacity: 1; transform: translateX(80px) translateY(-50%); }
          72%  { opacity: 1; transform: translateX(-80px) translateY(-50%); }
          83%  { opacity: 0; transform: translateX(-100px) translateY(-50%); }
          84%  { opacity: 0; transform: translateX(90px) translateY(-50%); }
          100% { opacity: 0; transform: translateX(90px) translateY(-50%); }
        }
        @media (max-width: 639px) {
          .sf-swipe-hint {
            position: absolute;
            top: 38%;
            left: 50%;
            z-index: 8;
            pointer-events: none;
            filter: drop-shadow(0 3px 8px rgba(0,0,0,0.45));
            animation: sf-swipe-anim 3s ease-in-out 0.4s infinite;
          }
        }
        @media (min-width: 640px) { .sf-swipe-hint { display: none; } }
        .sf-carousel-track {
          display: flex;
          gap: ${GAP}px;
          width: max-content;
          will-change: transform;
        }
        .sf-carousel-card {
          width: calc((min(100vw, 1800px) - 80px - 3 * ${GAP}px) / 4);
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .sf-carousel-card { width: calc((100vw - 30px) * 0.72) !important; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .sf-carousel-card { width: calc((100vw - 36px - 1 * ${GAP}px) / 2); }
        }
      `}</style>
    </section>
  );
}
