import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
import PageHeader from '@/components/PageHeader';
import AccountMobileFrame from '@/components/AccountMobileFrame';
import { Mail, MapPin } from 'lucide-react';

const hf = 'var(--font-body)';

export default async function AccountPage() {
  const user = await getCurrentUser();
  // middleware guarantees a session, but guard anyway
  if (!user) return null;

  const rows: [string, string | null][] = [
    ['Имейл', user.email],
    ['Име', user.name],
    ['Телефон', user.phone],
    ['Адрес', [user.address, user.postcode, user.city].filter(Boolean).join(', ') || null],
  ];

  return (
    <div className="account-page">
      <div className="account-desktop-view">
        <PageHeader
          title="Моят профил"
          breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Моят профил' }]}
        />

        <div className="account-page-content max-w-[760px] mx-auto px-[15px] py-12">
        <div className="account-welcome flex items-center justify-between mb-6">
          <h2 className="account-welcome-title" style={{ fontFamily: hf, fontWeight: 800, fontSize: 20, color: '#333' }}>Здравей, {user.name || user.email.split('@')[0]}!</h2>
          <LogoutButton />
        </div>

        {user.role === 'admin' && (
          <Link href="/admin" className="account-admin-link btn-primary inline-block mb-8">Към админ панела</Link>
        )}

        <div className="account-details-card bg-[var(--bg-light)] rounded-md p-6 mb-8">
          <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 16, color: '#333' }} className="account-details-title mb-4">Данни за профила</h3>
          <dl className="account-details-list divide-y divide-[var(--border)]">
            {rows.map(([label, value]) => (
              <div key={label} className="account-details-row flex justify-between py-2.5 text-[14px]">
                <dt className="text-[var(--text-muted)]">{label}</dt>
                <dd className="text-[var(--text-dark)] font-medium">
                  {value || (
                    <span className="text-[var(--text-muted)]">
                      Нямаме данни,{' '}
                      <Link href="/account/nastroiki" className="text-[var(--primary)] font-semibold hover:underline">
                        кликни за да добавиш
                      </Link>
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="account-links flex flex-col gap-3">
          <Link href="/lyubimi" className="account-mobile-favorites text-[14px] text-[var(--primary)] font-semibold hover:underline">Любими продукти ♥</Link>
          <Link href="/account/porachki" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Моите поръчки →</Link>
          <Link href="/account/nastroiki" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Редактирай профила →</Link>
          <Link href="/account/promyana-parola" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Смяна на парола →</Link>
        </div>
        </div>
      </div>

      <main className="account-mobile-view">
        <AccountMobileFrame active="profile">

        <div className="account-mobile-section-heading">
          <h1>Контакт</h1>
          <Link href="/account/nastroiki">Редактирай</Link>
        </div>

        <dl className="account-mobile-info-card">
          <div className="account-mobile-info-row">
            <dt>Имейл</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>

        <div className="account-mobile-section-heading account-mobile-address-heading">
          <h2>Адреси</h2>
          <Link href="/account/nastroiki">{rows[3][1] ? 'Редактирай' : 'Добави'}</Link>
        </div>

        <Link href="/account/nastroiki" className="account-mobile-address-card">
          <span className="account-mobile-address-icon" aria-hidden="true"><MapPin size={22} /></span>
          <span>{rows[3][1] || 'Няма добавен адрес'}</span>
        </Link>

        <div className="account-mobile-marketing">
          <h2>Маркетингови предпочитания</h2>
          <div className="account-mobile-marketing-card">
            <span><Mail size={21} /> Имейл</span>
            <span className="account-mobile-toggle" aria-hidden="true"><i /></span>
          </div>
        </div>
        </AccountMobileFrame>
      </main>
      </div>
  );
}
