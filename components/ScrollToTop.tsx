'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 380);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Обратно нагоре"
      style={{
        position: 'fixed',
        bottom: 26,
        right: 18,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#fff',
        border: '1px solid rgba(155,114,199,0.28)',
        boxShadow: '0 4px 18px -4px rgba(0,0,0,0.13)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#9B72C7',
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <ChevronUp size={18} strokeWidth={2.2} />
    </button>
  );
}
