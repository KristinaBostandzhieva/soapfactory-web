import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default function AccountMobileFrame({ active, children }: {
  active: 'orders' | 'profile';
  children: React.ReactNode;
}) {
  return (
    <div className="account-mobile-frame">
      <header className="account-mobile-brandbar">
        <Link href="/" aria-label="Soap Factory">
          <Image src="/images/SF-logo.webp" alt="Soap Factory" width={78} height={78} priority />
        </Link>
        <span className="account-mobile-user-icon" aria-hidden="true"><UserRound size={27} strokeWidth={1.6} /></span>
      </header>
      <nav className="account-mobile-tabs" aria-label="Акаунт">
        {active === 'orders' ? <span aria-current="page">Поръчки</span> : <Link href="/account/porachki">Поръчки</Link>}
        {active === 'profile' ? <span aria-current="page">Профил</span> : <Link href="/account">Профил</Link>}
      </nav>
      <div className="account-mobile-main-content">{children}</div>
      <div className="account-mobile-signout">
        <LogoutButton label="Изход" className="account-mobile-signout-primary" />
        <LogoutButton label="Изход от всички устройства" className="account-mobile-signout-all" />
      </div>
      <nav className="account-mobile-legal" aria-label="Правна информация">
        <span>България⌄</span>
        <Link href="/poveritelnost">Настройки за бисквитки</Link>
        <Link href="/dostavka">Политика за връщане</Link>
        <Link href="/dostavka">Доставка</Link>
        <Link href="/poveritelnost">Поверителност</Link>
        <Link href="/obshti-uslovia">Общи условия</Link>
        <Link href="/za-kontakti">Контакти</Link>
      </nav>
    </div>
  );
}
