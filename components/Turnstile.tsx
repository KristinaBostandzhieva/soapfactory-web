'use client';

import { useEffect, useRef } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, any>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Cloudflare Turnstile widget. Calls `onVerify(token)` when solved and
 * `onExpire()` when the token expires or errors (so the parent can clear it).
 * Renders nothing if no site key is configured (dev without keys).
 */
export default function Turnstile({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Keep latest callbacks without re-running the render effect.
  const cbs = useRef({ onVerify, onExpire });
  cbs.current = { onVerify, onExpire };

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    function render() {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => cbs.current.onVerify(token),
        'expired-callback': () => cbs.current.onExpire?.(),
        'error-callback': () => cbs.current.onExpire?.(),
      });
    }

    if (window.turnstile) {
      render();
    } else if (!document.querySelector('script[data-turnstile]')) {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-turnstile', '');
      s.onload = render;
      document.head.appendChild(s);
    } else {
      // Script tag exists but not ready yet — poll briefly.
      const t = setInterval(() => {
        if (window.turnstile) {
          clearInterval(t);
          render();
        }
      }, 100);
      return () => clearInterval(t);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* noop */ }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="turnstile-wrap my-4 flex justify-center" />;
}
