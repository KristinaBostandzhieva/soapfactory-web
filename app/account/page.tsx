import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
import PageHeader from '@/components/PageHeader';

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
    <div>
      <PageHeader
        title="Моят профил"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'Моят профил' }]}
      />

      <div className="max-w-[760px] mx-auto px-[15px] py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 20, color: '#333' }}>Здравей, {user.name || user.email.split('@')[0]}!</h2>
          <LogoutButton />
        </div>

        {user.role === 'admin' && (
          <Link href="/admin" className="btn-primary inline-block mb-8">Към админ панела</Link>
        )}

        <div className="bg-[var(--bg-light)] rounded-md p-6 mb-8">
          <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 16, color: '#333' }} className="mb-4">Данни за профила</h3>
          <dl className="divide-y divide-[var(--border)]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 text-[14px]">
                <dt className="text-[var(--text-muted)]">{label}</dt>
                <dd className="text-[var(--text-dark)] font-medium">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/account/porachki" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Моите поръчки →</Link>
          <Link href="/account/nastroiki" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Редактирай профила →</Link>
          <Link href="/account/promyana-parola" className="text-[14px] text-[var(--primary)] font-semibold hover:underline">Смяна на парола →</Link>
        </div>
      </div>
    </div>
  );
}
