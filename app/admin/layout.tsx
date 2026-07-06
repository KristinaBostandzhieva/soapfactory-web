import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Users, BarChart3, Ticket, Star, FileText, ExternalLink } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import NotificationBell from '@/components/admin/NotificationBell';

const hf = 'var(--font-body)';

const nav = [
  { href: '/admin', label: 'Табло', icon: LayoutDashboard },
  { href: '/admin/produkti', label: 'Продукти', icon: Package },
  { href: '/admin/kategorii', label: 'Категории', icon: FolderTree },
  { href: '/admin/porachki', label: 'Поръчки', icon: ShoppingBag },
  { href: '/admin/potrebiteli', label: 'Потребители', icon: Users },
  { href: '/admin/promokodove', label: 'Промокодове', icon: Ticket },
  { href: '/admin/otzivi', label: 'Отзиви', icon: Star },
  { href: '/admin/blog', label: 'Блог', icon: FileText },
  { href: '/admin/analizi', label: 'Анализи', icon: BarChart3 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // DB-backed: role + session version checked fresh, so a demoted admin or a
  // revoked token is locked out immediately (not after the token expires).
  const admin = await requireAdmin();
  if (!admin) redirect('/vhod?next=/admin');

  const [newOrders, pendingReviews] = await Promise.all([
    prisma.order.count({ where: { status: 'new' } }),
    prisma.review.count({ where: { approved: false } }),
  ]);
  const badgeFor = (href: string) => (href === '/admin/porachki' ? newOrders : href === '/admin/otzivi' ? pendingReviews : 0);
  const Badge = ({ n }: { n: number }) => (
    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{n > 99 ? '99+' : n}</span>
  );

  return (
    <div className="min-h-screen flex bg-[#faf7f8]">
      {/* Sidebar */}
      <aside className="w-[230px] bg-white border-r border-[var(--border)] flex-col hidden md:flex sticky top-0 h-screen print:!hidden">
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-start justify-between gap-2">
          <div>
            <span style={{ fontFamily: hf, fontWeight: 800, color: '#9B72C7' }} className="text-lg">Soapfactory</span>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Админ панел</p>
          </div>
          <NotificationBell />
        </div>
        <nav className="flex-1 py-4">
          {nav.map((n) => {
            const b = badgeFor(n.href);
            return (
              <Link key={n.href} href={n.href}
                className="flex items-center gap-3 px-6 py-2.5 text-[14px] text-[var(--text-body)] hover:text-[var(--primary)] hover:bg-[var(--bg-light)] transition-colors">
                <n.icon size={17} /> <span className="flex-1">{n.label}</span>
                {b > 0 && <Badge n={b} />}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-[var(--border)] space-y-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--primary)]">
            <ExternalLink size={14} /> Виж сайта
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="md:hidden flex items-center gap-4 px-4 h-14 bg-white border-b border-[var(--border)] overflow-x-auto print:!hidden">
          {nav.map((n) => {
            const b = badgeFor(n.href);
            return (
              <Link key={n.href} href={n.href} className="text-[13px] font-semibold whitespace-nowrap text-[var(--text-body)] flex items-center gap-1">
                {n.label}{b > 0 && <Badge n={b} />}
              </Link>
            );
          })}
        </div>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
