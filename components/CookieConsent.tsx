'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

const STORAGE_KEY = 'sf_cookie_consent';

// Privacy-first cookie banner. Rendered after mount only, so it never blocks
// page content or affects SEO crawling. Choice is saved in localStorage.
export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const tr = useT();

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch { /* ignore */ }
  }, []);

  function decide(value: 'accepted' | 'rejected') {
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignore */ }
    setShow(false);
    // When analytics is added later, only initialise it if value === 'accepted'.
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Съгласие за бисквитки"
      className="cookie-consent fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="cookie-consent-inner max-w-full mx-auto px-[15px] py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
        <p className="cookie-consent-copy text-[13px] text-[var(--text-body)] flex-1">
          {tr.common.cookieMsg}{' '}
          {tr.common.cookieLearn}{' '}
          <Link href="/poveritelnost" className="cookie-consent-policy text-[var(--primary)] underline">{tr.common.cookiePolicy}</Link>.
        </p>
        <div className="cookie-consent-actions flex gap-2 shrink-0">
          <button
            onClick={() => decide('rejected')}
            className="cookie-consent-reject px-4 py-2 text-[13px] font-semibold border border-[var(--border)] rounded hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            {tr.common.onlyRequired}
          </button>
          <button
            onClick={() => decide('accepted')}
            className="cookie-consent-accept btn-primary"
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            {tr.common.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
