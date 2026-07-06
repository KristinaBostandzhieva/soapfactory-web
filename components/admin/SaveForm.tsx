'use client';

import { useState, useTransition } from 'react';

// Drop-in replacement for <form action={serverAction}> that shows a floating
// "Запазено" toast when the action completes (and the error message if it
// throws, instead of the error page).
export default function SaveForm({
  action, className, children, onSaved,
}: {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
  onSaved?: () => void;
}) {
  const [state, setState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className={className}
      action={(fd) =>
        start(async () => {
          try {
            await action(fd);
            setState('saved');
            onSaved?.();
            setTimeout(() => setState('idle'), 2500);
          } catch (err) {
            // Let Next.js redirects pass through untouched.
            const digest = (err as { digest?: string })?.digest || '';
            if (digest.startsWith('NEXT_REDIRECT')) throw err;
            const m = err instanceof Error ? err.message : '';
            setMsg(m && !m.includes('Server Components') ? m : 'Грешка при запазване.');
            setState('error');
            setTimeout(() => setState('idle'), 4500);
          }
        })
      }
    >
      {children}
      {(pending || state !== 'idle') && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-semibold text-white ${
            pending ? 'bg-[var(--text-dark)]' : state === 'saved' ? 'bg-green-600' : 'bg-red-500'
          }`}
        >
          {pending ? 'Запазване…' : state === 'saved' ? '✓ Запазено' : `⚠ ${msg}`}
        </div>
      )}
    </form>
  );
}
