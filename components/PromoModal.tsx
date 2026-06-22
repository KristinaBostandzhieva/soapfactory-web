'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PromoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'promo-backdrop-in 0.25s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 680,
          width: '100%',
          animation: 'promo-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Затвори"
          style={{
            position: 'absolute', top: -14, right: -14,
            width: 36, height: 36, borderRadius: '50%',
            background: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          <X size={17} color="#333" />
        </button>

        {/* Promo image */}
        <img
          src="/images/promo-popup.webp"
          alt="Промоция"
          style={{ width: '100%', display: 'block', borderRadius: 12 }}
        />

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link
            href="/kategoria/promotsii"
            onClick={onClose}
            style={{
              display: 'inline-block',
              background: '#9B72C7',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              padding: '14px 44px',
              borderRadius: 50,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 18px rgba(141,85,60,0.35)',
            }}
          >
            Get it Now
          </Link>
        </div>
      </div>
    </div>
  );
}
