import { prisma } from './prisma';
import { deriveChannel } from './attribution';
import { decodeSlug } from './seo';

export interface DayStat { date: string; label: string; views: number; visitors: number; }
export interface NamedCount { name: string; slug?: string; value: number; sub?: string; }

export interface Analytics {
  days: number;
  totalViews: number;
  uniqueVisitors: number;
  ordersCount: number;
  revenue: number;
  conversion: number; // %
  series: DayStat[];
  topProducts: NamedCount[];
  bestSellers: NamedCount[];
  topReferrers: NamedCount[];
  trafficSources: NamedCount[];
  salesBySource: NamedCount[];
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

export async function getAnalytics(days = 30): Promise<Analytics> {
  const since = new Date(Date.now() - days * 86_400_000);
  since.setHours(0, 0, 0, 0);

  const [views, orders, orderItems, products] = await Promise.all([
    prisma.pageView.findMany({ where: { createdAt: { gte: since } }, select: { path: true, referrer: true, sessionId: true, createdAt: true, utmSource: true, utmMedium: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { total: true, createdAt: true, source: true } }),
    prisma.orderItem.findMany({ where: { order: { createdAt: { gte: since } } }, select: { name: true, quantity: true, price: true } }),
    prisma.product.findMany({ select: { slug: true, name: true } }),
  ]);

  const slugToName = new Map(products.map((p) => [p.slug, p.name]));

  // Daily series (oldest → newest)
  const series: DayStat[] = [];
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const v of views) {
    const k = dayKey(v.createdAt);
    if (!byDay.has(k)) byDay.set(k, { views: 0, visitors: new Set() });
    const e = byDay.get(k)!;
    e.views++;
    if (v.sessionId) e.visitors.add(v.sessionId);
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const k = dayKey(d);
    const e = byDay.get(k);
    series.push({
      date: k,
      label: d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' }),
      views: e?.views ?? 0,
      visitors: e?.visitors.size ?? 0,
    });
  }

  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map((v) => v.sessionId).filter(Boolean)).size;
  const ordersCount = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const conversion = uniqueVisitors > 0 ? (ordersCount / uniqueVisitors) * 100 : 0;

  // Most-viewed products (paths like /produkt/<slug>)
  const prodViews = new Map<string, number>();
  for (const v of views) {
    const m = v.path.match(/^\/produkt\/([^/?#]+)/);
    if (!m) continue;
    const slug = decodeSlug(m[1]);
    prodViews.set(slug, (prodViews.get(slug) ?? 0) + 1);
  }
  const topProducts: NamedCount[] = [...prodViews.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([slug, value]) => ({ name: slugToName.get(slug) ?? slug, slug, value }));

  // Best sellers (by quantity sold)
  const sold = new Map<string, { qty: number; revenue: number }>();
  for (const it of orderItems) {
    const e = sold.get(it.name) ?? { qty: 0, revenue: 0 };
    e.qty += it.quantity;
    e.revenue += it.price * it.quantity;
    sold.set(it.name, e);
  }
  const bestSellers: NamedCount[] = [...sold.entries()]
    .sort((a, b) => b[1].qty - a[1].qty).slice(0, 8)
    .map(([name, e]) => ({ name, value: e.qty, sub: `${e.revenue.toFixed(2)} €` }));

  // Top referrers (where visitors came from)
  const refs = new Map<string, number>();
  for (const v of views) {
    if (!v.referrer) continue;
    let host = 'друго';
    try { host = new URL(v.referrer).hostname.replace(/^www\./, ''); } catch { /* keep */ }
    if (!host || host.includes('localhost')) continue; // skip internal
    refs.set(host, (refs.get(host) ?? 0) + 1);
  }
  const topReferrers: NamedCount[] = [...refs.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Traffic sources — visits grouped by channel (UTM tag or referrer).
  const srcViews = new Map<string, number>();
  for (const v of views) {
    const ch = deriveChannel(v.utmSource, v.utmMedium, v.referrer);
    srcViews.set(ch, (srcViews.get(ch) ?? 0) + 1);
  }
  const trafficSources: NamedCount[] = [...srcViews.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Sales by source — which channel actually produced orders & revenue (ad success!).
  const srcSales = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const src = o.source || 'Директно';
    const e = srcSales.get(src) ?? { count: 0, revenue: 0 };
    e.count++; e.revenue += o.total;
    srcSales.set(src, e);
  }
  const salesBySource: NamedCount[] = [...srcSales.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8)
    .map(([name, e]) => ({ name, value: e.count, sub: `${e.revenue.toFixed(2)} €` }));

  return { days, totalViews, uniqueVisitors, ordersCount, revenue, conversion, series, topProducts, bestSellers, topReferrers, trafficSources, salesBySource };
}
