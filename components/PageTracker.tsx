'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const ATTRIB_KEY = 'sf_attrib'; // first-touch attribution for this browsing session

// Captures the first-touch source into sessionStorage (used for order attribution),
// and records page views on the server (only if cookies were accepted).
export default function PageTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');

    // First-touch attribution — store once per session (don't overwrite a later page).
    try {
      if (!sessionStorage.getItem(ATTRIB_KEY)) {
        sessionStorage.setItem(ATTRIB_KEY, JSON.stringify({
          utmSource, utmMedium, utmCampaign, referrer: document.referrer || '',
        }));
      }
    } catch { /* ignore */ }

    if (pathname === lastPath.current) return;

    // Page-view recording — respects cookie consent.
    let consent: string | null = null;
    try { consent = localStorage.getItem('sf_cookie_consent'); } catch { /* ignore */ }
    if (consent !== 'accepted') return;

    lastPath.current = pathname;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer || '', utmSource, utmMedium, utmCampaign });
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
