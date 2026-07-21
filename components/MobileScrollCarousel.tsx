'use client';

import { useEffect, useRef, useState, Children } from 'react';

const CARD_PCT   = 0.91;   // card = 91% of container — peek shows image edge, not button
const GAP        = 14;     // px gap between cards
const VEL_THRESH = 0.20;   // px/ms flick threshold

// Smooth ease-out — decelerates like a premium page-turn
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export default function MobileScrollCarousel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const count = Children.count(children);

  // All animation state as refs to avoid stale closure issues
  const stride   = useRef(0);
  const offset   = useRef(0);
  const idxRef   = useRef(0);
  const rafRef   = useRef(0);
  const snapRef  = useRef<(idx: number, vel?: number) => void>(() => {});
  const touch    = useRef({ startX: 0, startOff: 0, t0: 0 });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const updateIsMobile = () => setIsMobile(media.matches);

    updateIsMobile();
    media.addEventListener('change', updateIsMobile);
    return () => media.removeEventListener('change', updateIsMobile);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    if (!isMobile) {
      track.style.transform = '';
      (Array.from(track.children) as HTMLElement[]).forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        card.style.boxShadow = '';
      });
      return;
    }

    const cw     = outer.offsetWidth * CARD_PCT;
    stride.current = cw + GAP;
    const margin = (outer.offsetWidth - cw) / 2; // centers active card
    outer.style.setProperty('--msc-card-w', `${cw}px`);
    outer.style.setProperty('--msc-indicator-top', `${cw - 1}px`);

    // Render depth: scale + opacity for every card based on current offset
    const render = (off: number) => {
      const visCenter = -off + outer.offsetWidth / 2;
      (Array.from(track.children) as HTMLElement[]).forEach((card, i) => {
        const cardCenter = i * stride.current + cw / 2;
        const dist = Math.abs(visCenter - cardCenter);
        const t    = Math.max(0, 1 - dist / stride.current);

        card.style.transform = `scale(${(0.94 + t * 0.06).toFixed(4)})`;
        card.style.opacity   = `${(0.48 + t * 0.52).toFixed(3)}`;
        card.style.boxShadow = 'none';
      });
    };

    const applyOffset = (off: number) => {
      offset.current = off;
      track.style.transform = `translateX(${off}px)`;
      render(off);
    };

    // Snap to a card index with optional velocity-based duration
    const snapTo = (idx: number, vel = 0) => {
      const target = margin - idx * stride.current; // centered snap
      const from   = offset.current;
      const dur    = Math.max(300, Math.min(620, 500 - vel * 25));
      const t0     = performance.now();

      idxRef.current = idx;
      setActiveIdx(idx);
      cancelAnimationFrame(rafRef.current);

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        applyOffset(from + (target - from) * easeOut(t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    snapRef.current = snapTo;

    // Rubber-band resistance at first and last card
    const clamp = (off: number) => {
      const max =  margin;
      const min =  margin - (count - 1) * stride.current;
      if (off > max) return max + (off - max) * 0.18;
      if (off < min) return min + (off - min) * 0.18;
      return off;
    };

    applyOffset(margin); // start centered on first card

    const onStart = (e: TouchEvent) => {
      cancelAnimationFrame(rafRef.current);
      touch.current = { startX: e.touches[0].clientX, startOff: offset.current, t0: performance.now() };
    };

    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touch.current.startX;
      applyOffset(clamp(touch.current.startOff + dx));
    };

    const onEnd = (e: TouchEvent) => {
      const dx  = e.changedTouches[0].clientX - touch.current.startX;
      const vel = dx / Math.max(1, performance.now() - touch.current.t0);
      const absV = Math.abs(vel);

      let idx = Math.round((margin - offset.current) / stride.current);
      if (absV > VEL_THRESH) {
        idx = vel < 0 ? idxRef.current + 1 : idxRef.current - 1;
      }
      snapTo(Math.max(0, Math.min(count - 1, idx)), absV);
    };

    outer.addEventListener('touchstart', onStart, { passive: true });
    outer.addEventListener('touchmove',  onMove,  { passive: true });
    outer.addEventListener('touchend',   onEnd,   { passive: true });

    return () => {
      outer.removeEventListener('touchstart', onStart);
      outer.removeEventListener('touchmove',  onMove);
      outer.removeEventListener('touchend',   onEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [count, isMobile]);

  const goTo = (idx: number) => snapRef.current(idx);
  const indicatorWidth = count > 0 ? `${100 / count}%` : '100%';
  const indicatorX = count > 0 ? `${activeIdx * 100}%` : '0%';

  return (
    <div ref={outerRef} className="msc-outer">
      <style>{`
        /* ── Outer container ── */
        .msc-outer { position: relative; }
        @media (max-width: 639px) {
          .msc-outer {
            overflow: hidden;
            padding-bottom: 0;
          }
        }

        /* ── Track ── */
        .msc-track { display: grid; }
        @media (max-width: 639px) {
          .msc-track {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: ${GAP}px !important;
            will-change: transform;
            user-select: none;
          }
          .msc-track > * {
            flex: 0 0 ${CARD_PCT * 100}% !important;
            min-width: 0;
            will-change: transform, opacity;
            transition: none;
            background: transparent;
          }
        }

        /* ── Right-edge gradient: hides the peeking card's button (mobile only) ── */
        .msc-fade {
          display: none;
          pointer-events: none;
          position: absolute;
          top: 0; right: -24px; bottom: 0;
          width: 104px;
          background: linear-gradient(to right, transparent 0%, rgba(251,248,243,0.28) 35%, rgba(251,248,243,0.62) 70%, rgba(251,248,243,0.88) 100%);
          z-index: 2;
        }
        @media (max-width: 639px) { .msc-fade { display: block !important; } }
        @media (min-width: 640px) { .msc-fade { display: none !important; } }

        /* ── BoJ-style card polish on mobile ── */
        @media (max-width: 639px) {
          .msc-track .product-card {
            padding: 0 0 12px;
            border-radius: 0;
            box-shadow: none;
            background: transparent;
          }
          .msc-track .product-card-img-wrap {
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid rgba(63, 51, 45, 0.06);
            box-shadow: 0 18px 38px -34px rgba(50, 36, 30, 0.55);
            margin-bottom: 10px;
            background: #fff !important;
          }
          .msc-track .product-card .product-img {
            object-fit: contain !important;
            transform: none !important;
          }
          .msc-track .product-card h3 {
            font-size: 13.5px !important;
            font-weight: 500 !important;
            text-align: left !important;
            margin-bottom: 3px;
            line-height: 1.3;
            color: #3a3035;
          }
          .msc-track .product-card p {
            text-align: left !important;
            margin-bottom: 3px;
          }
          .msc-track .card-desc-mobile {
            text-align: left !important;
            font-size: 11px !important;
            color: #9a9098 !important;
            margin-bottom: 8px !important;
          }
          .msc-track .product-card .btn-primary {
            border-radius: 999px !important;
            padding: 0 14px !important;
            min-height: 40px;
            background: #3f332d !important;
            color: #fff !important;
            opacity: 1 !important;
            width: 100% !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            text-align: left !important;
            letter-spacing: 0.08em;
            font-size: 9.5px !important;
            font-weight: 600 !important;
          }
        }

        /* ── Sliding line indicator ── */
        .msc-indicator {
          display: none;
          position: absolute;
          top: var(--msc-indicator-top, 0);
          left: 50%;
          z-index: 4;
          width: var(--msc-card-w, 100%);
          height: 1px;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.08);
          overflow: hidden;
        }
        @media (max-width: 639px) { .msc-indicator { display: block; } }
        .msc-indicator-thumb {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          border-radius: 0;
          background: #bbb;
          transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }
      `}</style>

      <div ref={trackRef} className={`msc-track ${className}`}>
        {children}
      </div>

      {/* Soft gradient - mobile only */}
      <div className="msc-fade" aria-hidden="true" />

      <div
        className="msc-indicator"
        aria-hidden="true"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const nextIdx = Math.floor(((event.clientX - rect.left) / rect.width) * count);
          goTo(Math.max(0, Math.min(count - 1, nextIdx)));
        }}
      >
        <div
          className="msc-indicator-thumb"
          style={{ width: indicatorWidth, transform: `translateX(${indicatorX})` }}
        />
      </div>
    </div>
  );
}
