import Link from 'next/link';

// Server component. Renders Prev / page numbers / Next, preserving any other
// query params (e.g. the search box `q`). Hidden when there's only one page.
export default function Pagination({
  basePath,
  page,
  totalPages,
  params = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== 'page') sp.set(k, v);
    }
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Compact window of page numbers around the current page.
  const nums: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let i = from; i <= to; i++) nums.push(i);

  const cell =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded text-[13px] font-semibold border transition-colors';
  const idle = 'bg-white border-[var(--border)] text-[var(--text-dark)] hover:border-[var(--primary)] hover:text-[var(--primary)]';
  const active = 'bg-[var(--primary)] border-[var(--primary)] text-white';
  const disabled = 'bg-white border-[var(--border)] text-[var(--text-muted)] opacity-50 pointer-events-none';

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-6" aria-label="Страници">
      <Link href={href(page - 1)} className={`${cell} ${page <= 1 ? disabled : idle}`} aria-label="Предишна">←</Link>
      {from > 1 && (
        <>
          <Link href={href(1)} className={`${cell} ${idle}`}>1</Link>
          {from > 2 && <span className="px-1 text-[var(--text-muted)]">…</span>}
        </>
      )}
      {nums.map((n) => (
        <Link key={n} href={href(n)} className={`${cell} ${n === page ? active : idle}`} aria-current={n === page ? 'page' : undefined}>
          {n}
        </Link>
      ))}
      {to < totalPages && (
        <>
          {to < totalPages - 1 && <span className="px-1 text-[var(--text-muted)]">…</span>}
          <Link href={href(totalPages)} className={`${cell} ${idle}`}>{totalPages}</Link>
        </>
      )}
      <Link href={href(page + 1)} className={`${cell} ${page >= totalPages ? disabled : idle}`} aria-label="Следваща">→</Link>
    </nav>
  );
}
