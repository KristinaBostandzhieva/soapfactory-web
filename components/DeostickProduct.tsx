'use client';

import { useRef } from 'react';

const images = [
  '/images/hero-carousel/deostick.webp',
  '/images/hero-carousel/promo-deostick-2.webp',
  '/images/hero-carousel/promo-deostick-3.webp',
  '/images/hero-carousel/promo-deostick-4.webp',
];

export default function DeostickProduct() {
  const imgRef = useRef<HTMLImageElement>(null);
  const busy = useRef(false);
  const indexRef = useRef(0);

  const handleMouseEnter = () => {
    const el = imgRef.current;
    if (!el) return;
    el.classList.remove('hero-product-img--sway');
    void el.offsetWidth;
    el.classList.add('hero-product-img--sway');
  };

  const handleMouseLeave = () => {
    if (busy.current) return;
    busy.current = true;
    const el = imgRef.current;
    if (!el) return;
    el.classList.remove('hero-product-img--sway');

    const next = (indexRef.current + 1) % images.length;

    el.style.transition = 'opacity 0.18s ease';
    el.style.opacity = '0';

    setTimeout(() => {
      el.src = images[next];
      indexRef.current = next;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        setTimeout(() => {
          el.style.transition = '';
          busy.current = false;
        }, 180);
      }));
    }, 180);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        ref={imgRef}
        src={images[0]}
        alt="Натурален део стик"
        className="hero-product-img"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom center' }}
      />
    </div>
  );
}
