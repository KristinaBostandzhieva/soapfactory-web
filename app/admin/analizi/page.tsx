import Link from 'next/link';
import { getAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

const RANGES = [[7, '7 дни'], [30, '30 дни'], [90, '90 дни']] as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: daysParam } = await searchParams;
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30;
  const a = await getAnalytics(days);

  const maxViews = Math.max(1, ...a.series.map((d) => d.views));

  const cards = [
    { label: 'Посещения', value: a.totalViews.toLocaleString('bg-BG') },
    { label: 'Брой посетители', value: a.uniqueVisitors.toLocaleString('bg-BG') },
    { label: 'Поръчки', value: a.ordersCount.toLocaleString('bg-BG') },
    { label: 'Приходи', value: `${a.revenue.toFixed(2)} €` },
    { label: 'Конверсия', value: `${a.conversion.toFixed(1)} %` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }}>Анализи</h1>
        <div className="flex gap-2">
          {RANGES.map(([val, label]) => (
            <Link key={val} href={`/admin/analizi?days=${val}`}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${days === val ? 'bg-[var(--primary)] text-white' : 'bg-white border border-[var(--border)] text-[var(--text-dark)] hover:border-[var(--primary)]'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-[var(--border)] rounded-lg p-4">
            <p className="text-[12px] text-[var(--text-muted)] mb-1">{c.label}</p>
            <p style={{ fontFamily: hf }} className="text-[22px] font-extrabold text-[var(--text-dark)]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Visitors chart */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-5 mb-8">
        <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 15 }} className="mb-4">Посещения по дни</h3>
        {a.totalViews === 0 ? (
          <p className="text-[14px] text-[var(--text-muted)] py-8 text-center">
            Все още няма данни за посещения. Те се събират при съгласие за бисквитки от посетителите.
          </p>
        ) : (
          <div className="flex items-end gap-[3px] h-44">
            {a.series.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative" style={{ minWidth: 0 }}>
                <div className="w-full rounded-t" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views ? 3 : 0, background: 'var(--primary)' }} />
                <span className="absolute -top-7 hidden group-hover:block bg-[var(--text-dark)] text-white text-[11px] rounded px-2 py-1 whitespace-nowrap z-10">
                  {d.label}: {d.views} посещения, {d.visitors} посетители
                </span>
              </div>
            ))}
          </div>
        )}
        {a.totalViews > 0 && (
          <div className="flex justify-between text-[11px] text-[var(--text-muted)] mt-2">
            <span>{a.series[0]?.label}</span><span>{a.series[a.series.length - 1]?.label}</span>
          </div>
        )}
      </div>

      {/* Traffic sources & ad performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnalyticsTable title="Източници на трафик" rows={a.trafficSources} unit="посещения" empty="Няма данни за източници." />
        <AnalyticsTable title="Продажби по източник 📣" rows={a.salesBySource} unit="поръчки" empty="Все още няма продажби по източник." />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsTable title="Най-разглеждани продукти" rows={a.topProducts} unit="прегледа" empty="Няма данни за прегледи." />
        <AnalyticsTable title="Най-продавани продукти" rows={a.bestSellers} unit="бр." empty="Няма продажби в периода." />
      </div>

      {a.topReferrers.length > 0 && (
        <div className="mt-6">
          <AnalyticsTable title="Откъде идват посетителите" rows={a.topReferrers} unit="посещения" empty="" />
        </div>
      )}
    </div>
  );
}

function AnalyticsTable({ title, rows, unit, empty }: { title: string; rows: { name: string; slug?: string; value: number; sub?: string }[]; unit: string; empty: string }) {
  const hf2 = 'var(--font-body)';
  return (
    <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
      <h3 style={{ fontFamily: hf2, fontWeight: 800, fontSize: 15 }} className="px-5 pt-5 pb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[14px] text-[var(--text-muted)] px-5 pb-5">{empty}</p>
      ) : (
        <table className="w-full text-[14px]">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-5 py-2.5 text-[var(--text-muted)] w-6">{i + 1}</td>
                <td className="px-2 py-2.5">
                  {r.slug ? <Link href={`/produkt/${r.slug}`} target="_blank" className="hover:text-[var(--primary)]">{r.name}</Link> : r.name}
                </td>
                <td className="px-5 py-2.5 text-right font-semibold whitespace-nowrap">
                  {r.value} <span className="text-[12px] text-[var(--text-muted)] font-normal">{unit}</span>
                  {r.sub && <div className="text-[12px] text-[var(--text-muted)] font-normal">{r.sub}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
