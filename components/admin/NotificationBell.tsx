'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Volume2, VolumeX } from 'lucide-react';

interface OrderItem { id: string; customerName: string; total: number; createdAt: string; }
interface ReviewItem { id: string; authorName: string; rating: number; createdAt: string; product: { name: string }; }
interface Data { total: number; newOrders: number; pendingReviews: number; recentOrders: OrderItem[]; recentReviews: ReviewItem[]; }

const SOUND_KEY = 'sf_notif_sound';

// Short, pleasant two-note chime generated with the Web Audio API (no file needed).
function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = now + i * 0.16;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.start(t);
      osc.stop(t + 0.34);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* audio blocked — ignore */ }
}

export default function NotificationBell() {
  const [data, setData] = useState<Data | null>(null);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const prevTotal = useRef<number | null>(null);
  const soundRef = useRef(true);

  // Load saved sound preference.
  useEffect(() => {
    try {
      const v = localStorage.getItem(SOUND_KEY);
      const on = v !== 'off';
      setSound(on);
      soundRef.current = on;
    } catch { /* ignore */ }
  }, []);

  async function load() {
    try {
      const r = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!r.ok) return;
      const json: Data = await r.json();
      // Play a chime when the count goes UP (a new order/review arrived).
      if (prevTotal.current !== null && json.total > prevTotal.current && soundRef.current) {
        playChime();
      }
      prevTotal.current = json.total;
      setData(json);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000); // refresh every 30s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleSound() {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* ignore */ }
    if (next) playChime(); // gives a preview + unlocks audio on this click
  }

  const total = data?.total ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Известия" className="relative p-1.5 text-[var(--text-body)] hover:text-[var(--primary)]">
        <Bell size={20} />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[300px] bg-white border border-[var(--border)] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--text-dark)]">Известия</span>
            <button onClick={toggleSound} aria-label={sound ? 'Изключи звука' : 'Включи звука'} title={sound ? 'Звук: вкл.' : 'Звук: изкл.'}
              className="text-[var(--text-muted)] hover:text-[var(--primary)]">
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {total === 0 ? (
            <p className="px-4 py-6 text-[13px] text-[var(--text-muted)] text-center">Няма нови известия 🎉</p>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              {data!.recentOrders.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Нови поръчки</div>
                  {data!.recentOrders.map((o) => (
                    <Link key={o.id} href={`/admin/porachki/${o.id}`} onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-light)] text-[13px]">
                      <span className="truncate">🛒 {o.customerName}</span>
                      <span className="font-semibold whitespace-nowrap ml-2">{o.total.toFixed(2)} €</span>
                    </Link>
                  ))}
                </div>
              )}
              {data!.recentReviews.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Чакащи отзиви</div>
                  {data!.recentReviews.map((r) => (
                    <Link key={r.id} href="/admin/otzivi" onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-light)] text-[13px]">
                      <span className="truncate">⭐ {r.authorName} — {r.product.name}</span>
                      <span className="whitespace-nowrap ml-2 text-amber-500">{r.rating}★</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
