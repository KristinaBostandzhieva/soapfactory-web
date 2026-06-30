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
        padding: '24px 28px',
        animation: 'promo-backdrop-in 0.25s ease both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 1120,
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
            position: 'absolute', top: -16, right: -16,
            width: 40, height: 40, borderRadius: '50%',
            background: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}
        >
          <X size={17} color="#333" />
        </button>

        {/* Promo image + overlaid CTA */}
        <div style={{ position: 'relative' }}>
          <img
            src="/images/fscr-care/promo-modal.png"
            alt="Промоция"
            style={{ width: '100%', display: 'block', borderRadius: 12, maxHeight: '84vh', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: '5%', left: 0, right: 0, textAlign: 'center' }}>
            <Link
              href="/kategoria/promotsii"
              onClick={onClose}
              style={{
                display: 'inline-block',
                background: '#9B72C7',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 16,
                padding: '15px 52px',
                borderRadius: 50,
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
              }}
            >
              Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
