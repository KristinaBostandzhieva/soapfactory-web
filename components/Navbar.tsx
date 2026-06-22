'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import PromoModal from '@/components/PromoModal';
import { useLanguageStore } from '@/store/languageStore';
import { useT } from '@/hooks/useT';

// navItems is built inside the component so it can use translations


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const { lang, setLang } = useLanguageStore();
  const tr = useT();

  const navItems = [
    { label: tr.nav.home, href: '/' },
    { label: tr.nav.bodycare, href: '/kategoria/grizha-za-tialoto', children: [
      { label: tr.nav.biosoaps, href: '/kategoria/bio-sapuni' },
      { label: tr.nav.showergels, href: '/kategoria/bio-dush-gelove' },
      { label: tr.nav.deosticks, href: '/kategoria/deo-stikove' },
      { label: tr.nav.scrubs, href: '/kategoria/zaharni-eksfolianti' },
      { label: tr.nav.lotions, href: '/kategoria/losioni-i-masla' },
    ]},
    { label: tr.nav.facecare, href: '/kategoria/grizha-za-litseto', children: [
      { label: tr.nav.lipbalms, href: '/kategoria/bio-balsami-za-ustni' },
      { label: tr.nav.creams, href: '/kategoria/kremove' },
      { label: tr.nav.serums, href: '/kategoria/serumi' },
      { label: tr.nav.cleaners, href: '/kategoria/pochistvashti-grizha-za-litseto' },
      { label: tr.nav.velvet, href: '/kategoria/seria-velvet' },
    ]},
    { label: tr.nav.haircare, href: '/kategoria/grizha-za-kosata', children: [
      { label: tr.nav.shampoos, href: '/kategoria/shampoani' },
      { label: tr.nav.shampoobar, href: '/kategoria/shampoanovi-blokcheta' },
    ]},
    { label: tr.nav.cleaners, href: '/kategoria/pochistvashti-grizha-za-litseto' },
    { label: tr.nav.promotions, href: '/kategoria/promotsii' },
  ];
  const { totalItems, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? totalItems() : 0;
  const favItems = useFavoritesStore((s) => s.items);
  const favCount = mounted ? favItems.length : 0;
  const pathname = usePathname();

  const isActive = (item: typeof navItems[number]) => {
    if (item.href === '/') return pathname === '/';
    if (pathname === item.href) return true;
    if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))) return true;
    return pathname.startsWith(item.href + '/');
  };

  const leftNavItems = navItems.slice(0, 3);
  const rightNavItems = navItems.slice(3);
  const renderNavItem = (item: typeof navItems[number]) => (
    <div key={item.label} style={{ position: 'relative' }}
      onMouseEnter={() => item.children && setOpenDropdown(item.label)}
      onMouseLeave={() => setOpenDropdown(null)}>
      <Link href={item.href}
        onClick={item.href === '/kategoria/grizha-za-tialoto' ? () => setPromoOpen(true) : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '8px 0',
          fontSize: 15,
          fontWeight: 800,
          fontFamily: 'var(--font-body)',
          color: '#111',
          borderBottom: isActive(item) ? '1px solid #111' : '1px solid transparent',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}>
        {item.label}
        {item.children && <ChevronDown size={13} style={{ opacity: 0.65, marginTop: 1 }} />}
      </Link>

      {item.children && openDropdown === item.label && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
          borderRadius: 4, minWidth: 230, zIndex: 100, padding: '8px 0',
        }}>
          {item.children.map((child) => (
            <Link key={child.href} href={child.href} style={{
              display: 'block', padding: '11px 16px',
              fontSize: 14, fontWeight: 700,
              fontFamily: 'var(--font-body)',
              color: '#222', textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#9B72C7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#222')}>
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
  <>
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'linear-gradient(90deg, #dfeedd 0%, #edf6e9 48%, #fff 100%)',
      boxShadow: '0 8px 22px rgba(56, 35, 42, 0.12)',
    }}>
      <div style={{
        maxWidth: '100%', margin: '0 auto',
        padding: '0 42px',
        display: 'flex', alignItems: 'center',
        position: 'relative',
        height: 92, gap: 28,
      }}>
        <Link href="/" className="mobile-brand" style={{
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <img src="/images/soap-factory-logo-transparent.png" alt="Soapfactory" style={{ width: 72, height: 72, objectFit: 'contain', display: 'block' }} />
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 42, flex: 1 }}>
            {leftNavItems.map(renderNavItem)}
          </div>
          <Link href="/" style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <img src="/images/soap-factory-logo-transparent.png" alt="Soapfactory" style={{ width: 82, height: 82, objectFit: 'contain', display: 'block' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 42, flex: 1 }}>
            {rightNavItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Icons */}
        <div style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 18 }}>
          {([
            { icon: <Search size={15} key="s"/>, extra: false, label: 'Търсене', onClick: () => setSearchOpen((o) => !o) },
            { icon: <Heart size={15} key="h"/>, extra: true, label: 'Любими', href: '/lyubimi', badge: favCount },
            { icon: <User size={15} key="u"/>, extra: true, label: 'Профил', href: '/account' },
          ] as { icon: React.ReactNode; extra: boolean; label: string; href?: string; onClick?: () => void; badge?: number }[]).map((it, i) => {
            const style = {
              width: 26, height: 26, borderRadius: '50%',
              background: 'transparent', color: '#111', border: '1.4px solid #111',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, display: 'flex',
            } as const;
            const inner = it.href ? (
              <Link href={it.href} aria-label={it.label} style={style}>{it.icon}</Link>
            ) : (
              <button type="button" aria-label={it.label} onClick={it.onClick} style={style}>{it.icon}</button>
            );
            return (
              <div key={i} className={it.extra ? 'nav-icon-extra' : undefined} style={{ position: 'relative', display: 'flex' }}>
                {inner}
                {it.badge ? (
                  <span style={{
                    position: 'absolute', top: -7, right: -7,
                    background: '#fff', color: '#111', border: '1px solid #111',
                    borderRadius: '50%', width: 17, height: 17,
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{it.badge}</span>
                ) : null}
              </div>
            );
          })}

          <button onClick={openCart} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: '50%',
            background: 'transparent', color: '#111', border: '1.4px solid #111',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-body)',
          }}>
            {count}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}
            style={{
              background: 'transparent', border: '1.4px solid #111',
              borderRadius: 999, padding: '4px 8px',
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              color: '#111', letterSpacing: '0.05em',
              fontFamily: 'var(--font-body)',
              flexShrink: 0,
            }}
          >
            {lang === 'bg' ? 'EN' : 'БГ'}
          </button>

          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Search bar (plain GET form → works without JS, SEO-friendly) */}
      {searchOpen && (
        <div style={{ borderTop: '1px solid #e8e8e8', background: '#fff', padding: '12px 15px' }}>
          <form action="/tarsene" method="get" style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              name="q"
              autoFocus
              placeholder={tr.search.placeholder}
              style={{ flex: 1, border: '1px solid #e8e8e8', borderRadius: 5, padding: '10px 14px', fontSize: 14, outline: 'none' }}
            />
            <button type="submit" className="btn-primary">{tr.search.button}</button>
            <button type="button" aria-label={tr.common.close} onClick={() => setSearchOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ background: '#fff', borderTop: '1px solid #e8e8e8', padding: '0 16px 16px' }}>
          {navItems.map((item) => (
            <div key={item.label}>
              <Link href={item.href}
                onClick={item.href === '/kategoria/grizha-za-tialoto'
                  ? (e) => { e.preventDefault(); setMobileOpen(false); setPromoOpen(true); }
                  : () => setMobileOpen(false)}
                style={{
                display: 'block', padding: '12px 0', fontSize: 14, fontWeight: 800,
                fontFamily: 'var(--font-body)',
                color: '#333', borderBottom: '1px solid #e8e8e8', textDecoration: 'none',
              }}>{item.label}</Link>
              {item.children && (
                <div style={{ paddingLeft: 16 }}>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} style={{
                      display: 'block', padding: '8px 0', fontSize: 13, color: '#777', textDecoration: 'none',
                    }}>{child.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>

    {promoOpen && <PromoModal onClose={() => setPromoOpen(false)} />}
  </>
  );
}
