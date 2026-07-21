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
  const [mobileMenuSearchOpen, setMobileMenuSearchOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const { lang, setLang } = useLanguageStore();
  const tr = useT();
  const pathname = usePathname();
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) setMobileMenuSearchOpen(false);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const panel = mobileMenuPanelRef.current;
      if (!panel) return;

      const gamma = Math.max(-45, Math.min(45, event.gamma ?? 0));
      const beta = Math.max(-35, Math.min(35, (event.beta ?? 45) - 45));
      panel.style.setProperty('--menu-light-x', `${50 + gamma * 0.8}%`);
      panel.style.setProperty('--menu-light-y', `${36 - beta * 0.45}%`);
      panel.style.setProperty('--menu-reflection-x', `${50 + gamma * 0.72}%`);
      panel.style.setProperty('--menu-reflection-angle', `${9 + gamma * 0.12}deg`);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [mobileOpen]);

  const toggleMobileMenu = async () => {
    const opening = !mobileOpen;
    if (opening && typeof window !== 'undefined') {
      const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof orientationEvent?.requestPermission === 'function') {
        try { await orientationEvent.requestPermission(); } catch { /* static reflection fallback */ }
      }
    }
    setMobileOpen(opening);
  };

  useEffect(() => {
    if (pathname !== '/kategoria/bio-sapuni' || sessionStorage.getItem('soap-promo-seen')) return;
    // Don't ambush the visitor: show the promo after 4s of browsing, or once
    // they've scrolled a little — whichever happens first, only once.
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      setPromoOpen(true);
      sessionStorage.setItem('soap-promo-seen', '1');
      cleanup();
    };
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 320) fire();
    };
    const timer = setTimeout(fire, 4000);
    window.addEventListener('scroll', onScroll, { passive: true });
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
    return cleanup;
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
  const mobileNavLabel = (href: string, fallback: string) => {
    const shortLabels: Record<string, { bg: string; en: string }> = {
      '/kategoria/grizha-za-tialoto': { bg: 'За тялото', en: 'Body' },
      '/kategoria/grizha-za-litseto': { bg: 'За лицето', en: 'Face' },
      '/kategoria/grizha-za-kosata': { bg: 'За косата', en: 'Hair' },
    };
    return shortLabels[href]?.[lang] ?? fallback;
  };
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
      { img: '/images/banner-body-care-menu.png', label: tr.nav.deosticks, href: '/kategoria/deo-stikove' },
      { img: '/images/banner-body-care-menu-2.png', label: tr.nav.biosoaps, href: '/kategoria/bio-sapuni' },
    ],
    '/kategoria/grizha-za-litseto': [
      { img: '/images/banner-face-2.png', label: lang === 'bg' ? 'Почистващи' : 'Cleansers', href: '/kategoria/pochistvashti-grizha-za-litseto' },
      { img: '/images/velvet-menu-banner.png', label: 'Серия Velvet', href: '/kategoria/seria-velvet' },
    ],
    '/kategoria/grizha-za-kosata': [
      { img: '/images/banner-hair-1.png', label: tr.nav.shampoos, href: '/kategoria/shampoani' },
      { img: '/images/banner-hairmenu-2.png', label: tr.nav.shampoobar, href: '/kategoria/shampoanovi-blokcheta' },
    ],
  };
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const headerRef = useRef<HTMLElement>(null);
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

  const menuOpen = Boolean(openDropdown) && !menuClosing;

  return (
  <>
    <header ref={headerRef} className="site-header" style={{
      position: 'sticky', top: 0, zIndex: 30,
      background:
        // Tinted rose glass: the body of the pane is deep enough that white
        // highlights actually read against it (white-on-white shows nothing).
        'linear-gradient(176deg, rgba(255,255,255,0.72) 0%, rgba(249,222,231,0.62) 26%, rgba(243,206,219,0.66) 55%, rgba(250,228,236,0.6) 82%, rgba(255,255,255,0.55) 100%), ' +
        'radial-gradient(ellipse 65% 180% at 12% 130%, rgba(238, 150, 180, 0.4) 0%, transparent 68%), ' +
        'radial-gradient(ellipse 60% 170% at 88% -30%, rgba(240, 170, 196, 0.34) 0%, transparent 68%), ' +
        'rgba(250, 232, 238, 0.72)',
      backdropFilter: 'blur(26px) saturate(1.9)',
      WebkitBackdropFilter: 'blur(26px) saturate(1.9)',
      borderBottom: `1px solid ${menuOpen ? 'rgba(63, 51, 45, 0)' : 'rgba(63, 51, 45, 0.08)'}`,
      boxShadow: menuOpen
        ? 'inset 0 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 14px 22px -18px rgba(255, 255, 255, 0.9)'
        : 'inset 0 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 14px 22px -18px rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.55), 0 10px 34px -12px rgba(150, 80, 105, 0.3)',
      transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    }}>
      {/* Glass gloss — a wide diagonal highlight raking across the surface,
          plus a crisp lit top edge, so it reads as polished glass */}
      <div className="header-gloss" aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
        background:
          'linear-gradient(102deg, transparent 6%, rgba(255,255,255,0.75) 22%, rgba(255,255,255,0.3) 38%, transparent 46%), ' +
          'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 14%, transparent 34%)',
      }} />

      {/* Colour wash — fades in when a mega menu is open so header + panel
          merge into one continuous surface */}
      <div className="header-wash" aria-hidden="true" style={{ opacity: menuOpen ? 1 : 0 }} />

      {/* Mirror sweep — a slow reflection glides across the glass now and then */}
      <div className="header-mirror" aria-hidden="true" />

      <div className="nav-header-inner" style={{
        maxWidth: '100%', margin: '0 auto',
        padding: '22px 42px',
        display: 'flex', alignItems: 'center',
        position: 'relative', zIndex: 1,
        height: 92, gap: 28,
      }}>
        {/* Mobile left: hamburger + language. Search lives inside the menu. */}
        <div className="nav-left-mobile" style={{ display: 'none', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <button aria-label="Меню" onClick={toggleMobileMenu}
            style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            className="nav-mobile-language"
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

          <button className="nav-hamburger-right lg:hidden" onClick={toggleMobileMenu}
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
              background:
                'radial-gradient(ellipse 45% 90% at 0% 50%, rgba(244, 178, 197, 0.16) 0%, transparent 70%), ' +
                'radial-gradient(ellipse 40% 85% at 100% 60%, rgba(178, 214, 165, 0.13) 0%, transparent 70%), ' +
                '#FDFBF7',
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
              .mega-link:hover { color: #B08D57; padding-left: 6px; }
              .mega-tile { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
              .mega-tile:hover { transform: translateY(-3px); }
              .mega-tile-frame { box-shadow: 0 10px 30px -18px rgba(63, 51, 45, 0.25); transition: box-shadow 0.4s ease; }
              .mega-tile:hover .mega-tile-frame { box-shadow: 0 18px 38px -18px rgba(63, 51, 45, 0.34); }
              /* Mirror shine — a glossy streak sweeps across on hover */
              .mega-tile-frame::after {
                content: '';
                position: absolute;
                inset: 0;
                pointer-events: none;
                background: linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.4) 48%, rgba(255, 255, 255, 0.15) 52%, transparent 65%);
                transform: translateX(-130%);
              }
              .mega-tile:hover .mega-tile-frame::after {
                transform: translateX(130%);
                transition: transform 0.85s cubic-bezier(0.3, 0.6, 0.3, 1);
              }
              .mega-tile-arrow { transition: transform 0.3s ease; }
              .mega-tile:hover .mega-tile-arrow,
              .mega-viewall:hover .mega-tile-arrow { transform: translateX(5px); }
              .mega-viewall { transition: color 0.2s ease, border-color 0.2s ease; }
              .mega-viewall:hover { color: #B08D57 !important; border-bottom-color: #B08D57 !important; }
            `}</style>
            <div style={{
              maxWidth: 1180, margin: '0 auto',
              padding: '36px 42px 32px',
              display: 'flex', gap: 56, alignItems: 'flex-start',
              position: 'relative', zIndex: 1,
              // Fixed (not min-) so every category's menu is exactly the same
              // height, whatever its number of links or how they wrap.
              height: 360,
            }}>
              {/* Link column */}
              <div style={{ flex: '0 0 250px', paddingRight: 44, borderRight: '1px solid rgba(63, 51, 45, 0.08)', alignSelf: 'stretch' }}>
                <div className="mega-item" style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: '#756B65',
                  fontFamily: 'var(--font-body)',
                  animationDelay: '0.05s',
                }}>
                  {active.label}
                  <span aria-hidden="true" style={{ display: 'block', width: 28, height: 2, background: '#B08D57', margin: '10px 0 16px' }} />
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
                  className="mega-item mega-viewall"
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
                  <ArrowRight size={14} strokeWidth={1.6} className="mega-tile-arrow" />
                </Link>
              </div>

              {/* Featured image tiles — wide editorial cards with the label on the image */}
              {feats.map((f, i) => (
                <Link key={f.href + i} href={f.href}
                  className="mega-item mega-tile"
                  onClick={() => setOpenDropdown(null)}
                  style={{
                    display: 'block', width: 385, flexShrink: 0,
                    textDecoration: 'none',
                    animationDelay: `${0.14 + i * 0.08}s`,
                  }}>
                  <div className="mega-tile-frame" style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, aspectRatio: '4 / 3', background: '#EFE9E1' }}>
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
                      <ArrowRight size={15} strokeWidth={1.6} className="mega-tile-arrow" style={{ color: '#FDFBF7', flexShrink: 0 }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom trust strip — anchored footer band of the panel */}
            <div className="mega-item" style={{
              position: 'relative', zIndex: 1,
              borderTop: '1px solid rgba(63, 51, 45, 0.06)',
              background: 'rgba(63, 51, 45, 0.025)',
              padding: '11px 42px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 10, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#A89A90',
              animationDelay: '0.3s',
            }}>
              {lang === 'bg'
                ? 'Безплатна доставка над 35 € · 100% натурална козметика · Ръчно изработено в България'
                : 'Free shipping over €35 · 100% natural cosmetics · Handmade in Bulgaria'}
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
          <div ref={mobileMenuPanelRef} className="mobile-menu-panel" onClick={e => e.stopPropagation()} style={{
            width: 'min(86vw, 360px)',
            height: '100%',
            background: 'radial-gradient(circle at 92% 4%, rgba(236,150,181,0.5), transparent 42%), linear-gradient(155deg, rgba(255,241,246,0.88) 0%, rgba(246,202,218,0.8) 100%)',
            backdropFilter: 'blur(28px) saturate(1.45)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.45)',
            borderRight: '1px solid rgba(255,255,255,0.72)',
            boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.48), inset 0 1px 0 rgba(255,255,255,0.82), 18px 0 44px rgba(88, 46, 62, 0.24)',
            padding: '18px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* Header: close button + logo */}
            <div className="mobile-menu-top">
              <div className="mobile-menu-top-actions">
                <button
                  type="button"
                  aria-label={tr.common.close}
                  onClick={() => setMobileOpen(false)}
                  className="mobile-menu-close-btn"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
                {!mobileMenuSearchOpen && (
                  <button
                    type="button"
                    className="mobile-menu-search-trigger"
                    aria-label={lang === 'bg' ? 'Отвори търсенето' : 'Open search'}
                    onClick={() => setMobileMenuSearchOpen(true)}
                  >
                    <Search size={18} strokeWidth={1.6} />
                  </button>
                )}
                <Link
                  href="/lyubimi"
                  className="mobile-menu-favorites-trigger"
                  aria-label={lang === 'bg' ? 'Любими продукти' : 'Favorite products'}
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart size={18} strokeWidth={1.6} />
                </Link>
              </div>
            </div>

            {mobileMenuSearchOpen && (
              <form
                action="/tarsene"
                method="get"
                className="mobile-menu-search"
                onSubmit={() => setMobileOpen(false)}
              >
                <Search size={17} strokeWidth={1.6} aria-hidden="true" />
                <input
                  name="q"
                  type="search"
                  autoFocus
                  aria-label={lang === 'bg' ? 'Търсене' : 'Search'}
                  placeholder={lang === 'bg' ? 'Търси продукт…' : 'Search products…'}
                />
                <button type="submit" aria-label={lang === 'bg' ? 'Търси' : 'Search'}>
                  <ArrowRight size={16} strokeWidth={1.7} />
                </button>
              </form>
            )}

            <nav className="mobile-menu-nav">
              {navItems.filter((item) => item.href !== '/').map((item, idx) => (
                <div key={item.label} className="mobile-menu-nav-item" style={{ animationDelay: `${0.06 + idx * 0.04}s` }}>
                  {item.children ? (
                    <button
                      type="button"
                      onClick={() => setExpandedMobile(expandedMobile === item.label ? null : item.label)}
                      className={`mobile-menu-nav-btn${expandedMobile === item.label ? ' is-open' : ''}${isActive(item) ? ' is-active' : ''}`}
                    >
                      <span>{mobileNavLabel(item.href, item.label)}</span>
                      <ChevronDown size={16} strokeWidth={1.6} className="mobile-menu-chevron" />
                    </button>
                  ) : (
                    <Link href={item.href} onClick={() => setMobileOpen(false)}
                      className={`mobile-menu-nav-link${isActive(item) ? ' is-active' : ''}`}>
                      <span>{mobileNavLabel(item.href, item.label)}</span>
                    </Link>
                  )}

                  {item.children && (
                    <div className={`mobile-menu-sub${expandedMobile === item.label ? ' is-open' : ''}`}>
                      <div className="mobile-menu-sub-inner">
                        <Link href={item.href} onClick={() => setMobileOpen(false)}
                          className="mobile-menu-sub-all">
                          {lang === 'bg' ? 'Виж всички' : 'View all'}
                          <ArrowRight size={12} strokeWidth={1.8} />
                        </Link>
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                            className={`mobile-menu-sub-link${pathname === child.href ? ' is-current' : ''}`}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Promo card */}
            <div className="mobile-menu-promo-wrap">
              <Link
                href="/kategoria/seria-velvet"
                onClick={() => setMobileOpen(false)}
                className="mobile-menu-promo"
              >
                <img
                  src="/images/fscr-care/velvet-banner/model-velvet.png"
                  alt="Velvet"
                  className="mobile-menu-promo-img"
                />
                <div className="mobile-menu-promo-overlay" />
                <div className="mobile-menu-promo-content">
                  <span className="mobile-menu-promo-badge">New</span>
                  <span className="mobile-menu-promo-title">Серия Velvet</span>
                  <span className="mobile-menu-promo-cta">
                    {lang === 'bg' ? 'Разгледай' : 'Explore'} <ArrowRight size={13} strokeWidth={1.8} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>

    {promoOpen && <PromoModal onClose={() => setPromoOpen(false)} />}
  </>
  );
}
