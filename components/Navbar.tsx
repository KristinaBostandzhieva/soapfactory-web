'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Heart, User, Menu, X, ChevronDown, ArrowRight, ShoppingBag } from 'lucide-react';
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
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { lang, setLang } = useLanguageStore();
  const tr = useT();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/kategoria/bio-sapuni' && !sessionStorage.getItem('soap-promo-seen')) {
      setPromoOpen(true);
      sessionStorage.setItem('soap-promo-seen', '1');
    }
  }, [pathname]);

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
      { label: 'Почистващи за лице', href: '/kategoria/pochistvashti-grizha-za-litseto' },
      { label: tr.nav.creams, href: '/kategoria/kremove' },
      { label: tr.nav.serums, href: '/kategoria/serumi' },
    ]},
    { label: tr.nav.haircare, href: '/kategoria/grizha-za-kosata', children: [
      { label: tr.nav.shampoos, href: '/kategoria/shampoani' },
      { label: tr.nav.shampoobar, href: '/kategoria/shampoanovi-blokcheta' },
    ]},
    { label: tr.nav.forHome, href: '/kategoria/za-doma' },
    { label: tr.nav.promotions, href: '/kategoria/promotsii' },
  ];
  const { totalItems, openCart } = useCartStore();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuClosing, setMenuClosing] = useState(false);
  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (closeAnimTimer.current) clearTimeout(closeAnimTimer.current);
    setMenuClosing(false);
    setOpenDropdown(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (closeAnimTimer.current) clearTimeout(closeAnimTimer.current);
    // Grace period, then play the exit animation before unmounting
    closeTimer.current = setTimeout(() => {
      setMenuClosing(true);
      closeAnimTimer.current = setTimeout(() => {
        setOpenDropdown(null);
        setMenuClosing(false);
      }, 300);
    }, 160);
  };

  // Featured image tiles shown on the right side of the mega menu, per category
  const megaFeatures: Record<string, { img: string; label: string; href: string }[]> = {
    '/kategoria/grizha-za-tialoto': [
      { img: '/images/cat-tialo.jpeg', label: tr.nav.bodycare, href: '/kategoria/grizha-za-tialoto' },
      { img: '/images/promo-soaps.png', label: tr.nav.biosoaps, href: '/kategoria/bio-sapuni' },
    ],
    '/kategoria/grizha-za-litseto': [
      { img: '/images/cat-litse.jpeg', label: tr.nav.facecare, href: '/kategoria/grizha-za-litseto' },
      { img: '/images/hero2/grizha-litseto.png', label: tr.nav.lipbalms, href: '/kategoria/bio-balsami-za-ustni' },
    ],
    '/kategoria/grizha-za-kosata': [
      { img: '/images/cat-kosa.jpeg', label: tr.nav.haircare, href: '/kategoria/grizha-za-kosata' },
      { img: '/images/shampoo-promo.png', label: tr.nav.shampoobar, href: '/kategoria/shampoanovi-blokcheta' },
    ],
  };
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? totalItems() : 0;
  const favItems = useFavoritesStore((s) => s.items);
  const favCount = mounted ? favItems.length : 0;

  const isActive = (item: typeof navItems[number]) => {
    if (item.href === '/') return pathname === '/';
    if (pathname === item.href) return true;
    if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))) return true;
    return pathname.startsWith(item.href + '/');
  };

  const leftNavItems = navItems.slice(0, 3);
  const rightNavItems = navItems.slice(3);
  const headerIconButtonStyle = {
    width: 30, height: 30, borderRadius: '50%',
    background: 'transparent', color: '#3F332D', border: 'none',
    alignItems: 'center', justifyContent: 'center', padding: 0,
    cursor: 'pointer', flexShrink: 0, display: 'flex',
  } as const;
  const languageButtonStyle = {
    background: 'transparent', border: 'none',
    padding: '4px 2px',
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    color: '#3F332D', letterSpacing: '0.18em',
    fontFamily: 'var(--font-body)',
    flexShrink: 0,
  } as const;
  const renderNavItem = (item: typeof navItems[number]) => (
    <div key={item.label} style={{ position: 'relative' }}
      onMouseEnter={() => (item.children ? openMenu(item.label) : scheduleClose())}
      onMouseLeave={() => item.children && scheduleClose()}>
      <Link href={item.href}
        onClick={() => setOpenDropdown(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '9px 0',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          color: '#3F332D',
          borderBottom: isActive(item) ? '1px solid rgba(63,51,45,0.75)' : '1px solid transparent',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}>
        {item.label}
        {item.children && (
          <ChevronDown size={13} strokeWidth={1.6} style={{
            opacity: 0.5, marginTop: 1,
            transform: openDropdown === item.label ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        )}
      </Link>
    </div>
  );

  return (
  <>
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(253, 251, 247, 0.94)',
      backdropFilter: 'blur(14px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
      borderBottom: '1px solid rgba(63, 51, 45, 0.10)',
    }}>
      <div className="nav-header-inner" style={{
        maxWidth: '100%', margin: '0 auto',
        padding: '22px 42px',
        display: 'flex', alignItems: 'center',
        position: 'relative',
        height: 92, gap: 28,
      }}>
        {/* Mobile left: hamburger + search */}
        <div className="nav-left-mobile" style={{ display: 'none', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button type="button" aria-label="Търсене" onClick={() => setSearchOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}
            style={languageButtonStyle}
          >
            {lang === 'bg' ? 'EN' : 'BG'}
          </button>
        </div>

        {/* Logo — centered on mobile, left on desktop */}
        <Link href="/" className="mobile-brand nav-logo-center" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src="/images/soap-factory-logo-transparent.png" alt="Soapfactory" style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }} />
        </Link>

        <div className="nav-desktop-left-tools" style={{ position: 'absolute', left: 42, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 18 }}>
          <span aria-hidden="true" style={{ width: 32, flexShrink: 0 }} />
          <button type="button" aria-label="Search" onClick={() => setSearchOpen((o) => !o)} style={headerIconButtonStyle}>
            <Search size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}
            style={languageButtonStyle}
          >
            {lang === 'bg' ? 'EN' : 'BG'}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 42, flex: 1, paddingLeft: 140, minWidth: 0 }}>
            {leftNavItems.map(renderNavItem)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Link href="/" style={{
              textDecoration: 'none',
              flexShrink: 0,
            }}>
              <img src="/images/soap-factory-logo-transparent.png" alt="Soapfactory" style={{ width: 82, height: 82, objectFit: 'contain', display: 'block' }} />
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 42, flex: 1, paddingRight: 160, minWidth: 0 }}>
            {rightNavItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Icons */}
        <div className="nav-icons-bar" style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 18 }}>
          {([
            { icon: <Search size={18} strokeWidth={1.5} key="s"/>, extra: false, mobileHide: true, label: 'Търсене', onClick: () => setSearchOpen((o) => !o) },
            { icon: <Heart size={18} strokeWidth={1.5} key="h"/>, extra: true, mobileHide: true, label: 'Любими', href: '/lyubimi', badge: favCount },
            // Profile stays visible on mobile (next to the cart) — the only
            // secondary icon that isn't collapsed into the hamburger menu.
            { icon: <User size={18} strokeWidth={1.5} key="u"/>, extra: false, mobileHide: false, label: 'Профил', href: '/account' },
          ] as { icon: React.ReactNode; extra: boolean; mobileHide?: boolean; label: string; href?: string; onClick?: () => void; badge?: number }[]).map((it, i) => {
            const style = headerIconButtonStyle;
            const inner = it.href ? (
              <Link href={it.href} aria-label={it.label} style={style}>{it.icon}</Link>
            ) : (
              <button type="button" aria-label={it.label} onClick={it.onClick} style={style}>{it.icon}</button>
            );
            return (
              <div key={i} className={[i === 0 ? 'nav-icon-moved' : '', it.extra ? 'nav-icon-extra' : '', it.mobileHide ? 'nav-icon-mobile-hide' : ''].join(' ').trim()} style={{ position: 'relative', display: 'flex' }}>
                {inner}
                {it.badge ? (
                  <span style={{
                    position: 'absolute', top: -3, right: -5,
                    background: '#3F332D', color: '#FDFBF7', border: 'none',
                    borderRadius: '50%', width: 15, height: 15,
                    fontSize: 9, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{it.badge}</span>
                ) : null}
              </div>
            );
          })}

          <div style={{ position: 'relative', display: 'flex' }}>
            <button onClick={openCart} aria-label="Кошница" style={headerIconButtonStyle}>
              <ShoppingBag size={18} strokeWidth={1.5} />
            </button>
            {count ? (
              <span style={{
                position: 'absolute', top: -3, right: -5,
                background: '#3F332D', color: '#FDFBF7',
                borderRadius: '50%', width: 15, height: 15,
                fontSize: 9, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{count}</span>
            ) : null}
          </div>

          {/* Language toggle */}
          <button
            className="nav-language-moved"
            onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}
            style={languageButtonStyle}
          >
            {lang === 'bg' ? 'EN' : 'БГ'}
          </button>

          <button className="nav-hamburger-right lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mega menu — full-width panel with category links + featured imagery */}
      {(() => {
        const active = navItems.find((n) => n.label === openDropdown && n.children);
        if (!active || !active.children) return null;
        const feats = megaFeatures[active.href] ?? [];
        return (
          <div
            className={menuClosing ? 'mega-panel mega-panel-closing' : 'mega-panel'}
            onMouseEnter={() => openMenu(active.label)}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#FDFBF7',
              borderTop: '1px solid rgba(63,51,45,0.07)',
              borderBottom: '1px solid rgba(63,51,45,0.09)',
              boxShadow: '0 34px 64px rgba(63,51,45,0.16)',
              zIndex: 99, overflow: 'hidden',
            }}
          >
            <style>{`
              @keyframes megaPanelIn {
                from { opacity: 0; transform: translateY(-12px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .mega-panel { animation: megaPanelIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
              @keyframes megaPanelOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
              }
              .mega-panel-closing { animation: megaPanelOut 0.3s cubic-bezier(0.4, 0, 0.6, 1) both; }
              @keyframes megaItemIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .mega-item { animation: megaItemIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
              .mega-link { color: #554C47; }
              .mega-link:hover { color: #3F332D; padding-left: 6px; }
              .mega-tile img { transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
              .mega-tile:hover img { transform: scale(1.06); }
            `}</style>
            <div style={{
              maxWidth: 1180, margin: '0 auto',
              padding: '40px 42px 46px',
              display: 'flex', gap: 56, alignItems: 'flex-start',
            }}>
              {/* Link column */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="mega-item" style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: '#756B65',
                  fontFamily: 'var(--font-body)', marginBottom: 18,
                  animationDelay: '0.05s',
                }}>
                  {active.label}
                </div>
                {active.children.map((child, i) => (
                  <Link key={child.href} href={child.href}
                    className="mega-item mega-link"
                    onClick={() => setOpenDropdown(null)}
                    style={{
                      display: 'block', padding: '9px 0',
                      fontSize: 14, fontWeight: 500,
                      letterSpacing: '0.02em',
                      fontFamily: 'var(--font-body)',
                      textDecoration: 'none',
                      transition: 'color 0.2s, padding-left 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                      animationDelay: `${0.08 + i * 0.045}s`,
                    }}>
                    {child.label}
                  </Link>
                ))}
                <Link href={active.href}
                  className="mega-item"
                  onClick={() => setOpenDropdown(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    marginTop: 20, padding: '9px 0',
                    fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-body)',
                    color: '#3F332D', textDecoration: 'none',
                    borderBottom: '1px solid rgba(63,51,45,0.45)',
                    animationDelay: `${0.1 + active.children.length * 0.045}s`,
                  }}>
                  {lang === 'bg' ? 'Виж всички' : 'View all'}
                  <ArrowRight size={14} strokeWidth={1.6} />
                </Link>
              </div>

              {/* Featured image tiles — wide editorial cards with the label on the image */}
              {feats.map((f, i) => (
                <Link key={f.href + i} href={f.href}
                  className="mega-item mega-tile"
                  onClick={() => setOpenDropdown(null)}
                  style={{
                    display: 'block', width: 340, flexShrink: 0,
                    textDecoration: 'none',
                    animationDelay: `${0.14 + i * 0.08}s`,
                  }}>
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 3, aspectRatio: '4 / 3', background: '#EFE9E1' }}>
                    <img src={f.img} alt={f.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(30, 23, 18, 0.52) 0%, rgba(30, 23, 18, 0.10) 42%, transparent 62%)',
                    }} />
                    <div style={{
                      position: 'absolute', left: 18, right: 18, bottom: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    }}>
                      <span style={{
                        fontSize: 11.5, fontWeight: 600,
                        letterSpacing: '0.16em', textTransform: 'uppercase',
                        color: '#FDFBF7', fontFamily: 'var(--font-body)',
                        textShadow: '0 1px 8px rgba(30, 23, 18, 0.35)',
                      }}>
                        {f.label}
                      </span>
                      <ArrowRight size={15} strokeWidth={1.6} style={{ color: '#FDFBF7', flexShrink: 0 }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Search bar (plain GET form → works without JS, SEO-friendly) */}
      {searchOpen && (
        <div className="search-panel" style={{ borderTop: '1px solid rgba(23,19,18,0.10)', background: '#fff', padding: '0 18px', boxShadow: '0 12px 28px rgba(23,19,18,0.10)' }}>
          <style>{`
            @keyframes searchPanelIn {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .search-panel { animation: searchPanelIn 0.24s ease both; }
            .search-panel-input::placeholder { color: #171312; opacity: 1; }
          `}</style>
          <form action="/tarsene" method="get" style={{ maxWidth: '100%', margin: '0 auto', height: 64, display: 'flex', gap: 16, alignItems: 'center' }}>
            <Search size={23} strokeWidth={1.45} style={{ color: '#171312', flexShrink: 0 }} />
            <input
              name="q"
              autoFocus
              className="search-panel-input"
              placeholder="Search"
              style={{ flex: 1, border: 'none', background: 'transparent', padding: 0, fontSize: 14, fontWeight: 600, color: '#171312', outline: 'none', fontFamily: 'var(--font-body)' }}
            />
            <button type="button" aria-label={tr.common.close} onClick={() => setSearchOpen(false)}
              style={{ width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#171312', flexShrink: 0 }}>
              <X size={20} strokeWidth={1.55} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden mobile-menu-backdrop" onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(27, 22, 25, 0.38)' }}>
          <style>{`
            @keyframes mobileMenuBackdropIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes mobileMenuPanelIn {
              from { transform: translateX(-24px); opacity: 0.6; }
              to { transform: translateX(0); opacity: 1; }
            }
            .mobile-menu-backdrop {
              animation: mobileMenuBackdropIn 0.28s ease both;
            }
            .mobile-menu-panel {
              animation: mobileMenuPanelIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
          `}</style>
          <div className="mobile-menu-panel" onClick={e => e.stopPropagation()} style={{
            width: 'min(86vw, 360px)',
            height: '100%',
            background: '#F8E3EA',
            boxShadow: '18px 0 44px rgba(48, 29, 37, 0.18)',
            padding: '18px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <button
              type="button"
              aria-label={tr.common.close}
              onClick={() => setMobileOpen(false)}
              style={{ width: 32, height: 32, margin: '0 0 22px -6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#181210', cursor: 'pointer' }}
            >
              <X size={21} strokeWidth={1.7} />
            </button>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    /* Items with subcategories — tap to expand */
                    <button
                      type="button"
                      onClick={() => setExpandedMobile(expandedMobile === item.label ? null : item.label)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 0', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-body)',
                        color: '#171312', background: 'none', border: 'none', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.02em',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                      <span>{item.label}</span>
                      <span style={{ transition: 'transform 0.25s', transform: expandedMobile === item.label ? 'rotate(90deg)' : 'none', display: 'flex' }}>
                        <ArrowRight size={16} strokeWidth={1.6} />
                      </span>
                    </button>
                  ) : (
                    <Link href={item.href} onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 0', fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-body)',
                        color: '#171312', textDecoration: 'none', textTransform: 'uppercase',
                        letterSpacing: '0.02em', borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Subcategories — always rendered, animate with max-height */}
                  {item.children && (
                    <div style={{
                      maxHeight: expandedMobile === item.label ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
                    }}>
                      <div style={{ paddingLeft: 14, paddingBottom: 8, paddingTop: 4 }}>
                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                          style={{ display: 'block', padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#9B72C7', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
                          Всички
                        </Link>
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                            style={{ display: 'block', padding: '8px 0', fontSize: 13, color: '#555', textDecoration: 'none', fontFamily: 'var(--font-body)', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <Link
              href="/kategoria/grizha-za-litseto"
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'relative',
                display: 'block',
                marginTop: 28,
                minHeight: 380,
                overflow: 'hidden',
                textDecoration: 'none',
                background: '#E9F0E4',
              }}
            >
              <img
                src="/images/hero2/grizha-litseto.png"
                alt={tr.nav.facecare}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,23,18,0.22) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', color: '#fff', textShadow: '0 1px 10px rgba(35, 24, 20, 0.24)' }}>
                <span style={{
                  display: 'inline-block',
                  border: '1px solid rgba(255,255,255,0.78)',
                  borderRadius: 999,
                  padding: '4px 18px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  marginBottom: 8,
                  background: 'rgba(255,255,255,0.10)',
                }}>
                  New
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 24, lineHeight: 1.1 }}>
                  Velvet care
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>

    {promoOpen && <PromoModal onClose={() => setPromoOpen(false)} />}
  </>
  );
}
