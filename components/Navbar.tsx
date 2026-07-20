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
  // Sun orbs: at rest they gather at their base positions (clustered behind the
  // centered logo). While the cursor is over the header they glide out and take
  // up a loose ring around it, then drift back into a sun when it leaves.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const orbs = Array.from(header.querySelectorAll<HTMLElement>('.header-orb'));
    if (!orbs.length) return;
    const ringSpot = [
      { x: -95, y: -6 },
      { x: 92, y: 10 },
      { x: -30, y: -22 },
      { x: 44, y: 26 },
    ];
    const ease = [0.05, 0.04, 0.06, 0.045];
    const base = orbs.map((o) => ({ x: o.offsetLeft + o.offsetWidth / 2, y: o.offsetTop + o.offsetHeight / 2 }));
    const cur = orbs.map(() => ({ x: 0, y: 0 }));
    let mx = 0, my = 0, hover = false, raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = header.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      hover = true;
    };
    const onLeave = () => { hover = false; };
    const tick = () => {
      orbs.forEach((o, i) => {
        const spot = ringSpot[i % ringSpot.length];
        const gx = hover ? mx + spot.x - base[i].x : 0;
        const gy = hover ? my + spot.y - base[i].y : 0;
        const k = ease[i % ease.length];
        cur[i].x += (gx - cur[i].x) * k;
        cur[i].y += (gy - cur[i].y) * k;
        o.style.setProperty('--mx', `${cur[i].x.toFixed(1)}px`);
        o.style.setProperty('--my', `${cur[i].y.toFixed(1)}px`);
      });
      raf = requestAnimationFrame(tick);
    };
    header.addEventListener('mousemove', onMove);
    header.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      header.removeEventListener('mousemove', onMove);
      header.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);
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
    <header ref={headerRef} style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(253, 251, 247, 0.94)',
      backdropFilter: 'blur(14px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
      borderBottom: `1px solid ${menuOpen ? 'rgba(63, 51, 45, 0)' : 'rgba(63, 51, 45, 0.10)'}`,
      transition: 'border-color 0.4s ease',
    }}>
      {/* Colour wash — fades in when a mega menu is open so header + panel
          merge into one continuous surface */}
      <div className="header-wash" aria-hidden="true" style={{ opacity: menuOpen ? 1 : 0 }} />

      {/* Sun orbs — warm yellow spheres that rest behind the centered logo and
          glide out to chase the cursor while it's over the header */}
      <div className="header-orbs" aria-hidden="true" style={{ opacity: menuOpen ? 0 : 1 }}>
        <span className="header-orb" style={{ width: 128, height: 128, left: '50%', top: '50%', marginLeft: -64, marginTop: -64, background: 'radial-gradient(circle, rgba(255, 205, 92, 0.55) 0%, rgba(255, 205, 92, 0) 68%)', animationDuration: '7s' }} />
        <span className="header-orb" style={{ width: 96, height: 96, left: '50%', top: '50%', marginLeft: -74, marginTop: -54, background: 'radial-gradient(circle, rgba(255, 224, 138, 0.5) 0%, rgba(255, 224, 138, 0) 68%)', animationDuration: '8.5s', animationDirection: 'reverse' }} />
        <span className="header-orb" style={{ width: 92, height: 92, left: '50%', top: '50%', marginLeft: 8, marginTop: -38, background: 'radial-gradient(circle, rgba(255, 190, 74, 0.45) 0%, rgba(255, 190, 74, 0) 68%)', animationDuration: '7.8s', animationDelay: '-2s' }} />
        <span className="header-orb" style={{ width: 78, height: 78, left: '50%', top: '50%', marginLeft: -22, marginTop: 2, background: 'radial-gradient(circle, rgba(255, 236, 170, 0.5) 0%, rgba(255, 236, 170, 0) 68%)', animationDuration: '9.5s', animationDirection: 'reverse', animationDelay: '-4s' }} />
      </div>

      <div className="nav-header-inner" style={{
        maxWidth: '100%', margin: '0 auto',
        padding: '22px 42px',
        display: 'flex', alignItems: 'center',
        position: 'relative', zIndex: 1,
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
            }}>
              {/* Link column */}
              <div style={{ flex: '0 0 250px', paddingRight: 44, borderRight: '1px solid rgba(63, 51, 45, 0.08)' }}>
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
