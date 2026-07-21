'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, CreditCard, RotateCcw } from 'lucide-react';
import { useT } from '@/hooks/useT';

const fd = 'var(--font-display), Georgia, serif';
const fb = 'var(--font-body)';
const dark = '#F8E3EA';
const muted = '#171312';
const accent = '#171312';
const rule = '1px solid rgba(23,19,18,0.12)';

export default function Footer() {
  const tr = useT();
  const [nlEmail, setNlEmail] = useState('');
  const [nlMsg, setNlMsg] = useState<'idle' | 'ok' | 'err'>('idle');
  const [nlLoading, setNlLoading] = useState(false);

  async function subscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!nlEmail) return;
    setNlLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      });
      setNlMsg(res.ok ? 'ok' : 'err');
    } catch {
      setNlMsg('err');
    } finally {
      setNlLoading(false);
    }
  }

  return (
    <footer className="site-footer" style={{ background: dark, color: muted }}>

      {/* Newsletter */}
      <div className="footer-newsletter" style={{ borderBottom: rule, padding: '34px 18px 30px', textAlign: 'left' }}>
        <p style={{ fontFamily: fd, fontSize: 19, fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: accent, marginBottom: 12, lineHeight: 1.25 }}>
          {tr.footer.newsletter}
        </p>
        <h3 style={{ fontFamily: fb, fontWeight: 400, fontStyle: 'normal', fontSize: 14, color: '#171312', marginBottom: 26, lineHeight: 1.45, maxWidth: 520 }}>
          {tr.footer.newsletterDesc}
        </h3>
        {nlMsg === 'ok' ? (
          <p style={{ fontFamily: fb, fontSize: 15, color: '#3a8a5a', marginTop: 8 }}>
            ✓ Абонира си се успешно!
          </p>
        ) : (
          <>
            <form className="footer-newsletter-form" style={{ display: 'flex', maxWidth: '100%', margin: '0 auto', borderBottom: '1px solid rgba(23,19,18,0.5)' }} onSubmit={subscribeNewsletter}>
              <input
                type="email"
                required
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder={tr.footer.emailPlaceholder}
                style={{
                  flex: 1, background: 'transparent',
                  border: 'none',
                  borderRadius: 0, padding: '0 0 10px',
                  fontSize: 14, color: '#171312', outline: 'none', fontFamily: fb,
                }}
              />
              <button type="submit" disabled={nlLoading} style={{
                background: 'transparent', color: '#171312', border: 'none',
                borderRadius: 0, padding: '0 0 10px 18px',
                fontSize: 11, fontWeight: 700, fontFamily: fb, cursor: 'pointer', whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                opacity: nlLoading ? 0.7 : 1,
              }}>
                {nlLoading ? '…' : tr.footer.subscribe}
              </button>
            </form>
            {nlMsg === 'err' && (
              <p style={{ fontFamily: fb, fontSize: 12, color: '#f87171', marginTop: 8 }}>
                Грешка. Опитай отново.
              </p>
            )}
            <p style={{ fontFamily: fb, fontSize: 11, color: 'rgba(23,19,18,0.58)', marginTop: 10, lineHeight: 1.4, fontStyle: 'italic' }}>
              {tr.footer.newsletterDisclaimer}
            </p>
          </>
        )}
      </div>

      {/* Main columns */}
      <div className="footer-main-grid">

        {/* Brand */}
        <div className="footer-brand-col" style={{ paddingRight: 40, borderRight: rule }}>
          <Image
            src="/images/SF-logo.webp"
            alt="Soapfactory"
            width={84}
            height={84}
            className="object-contain"
            style={{ marginBottom: 18, opacity: 1 }}
          />
          <p style={{ fontFamily: fb, fontSize: 13, color: 'rgba(23,19,18,0.72)', lineHeight: 1.75, marginBottom: 24 }}>
            {tr.footer.tagline}
          </p>
          <div className="footer-socials" style={{ display: 'flex', gap: 10 }}>
            <a href="https://www.facebook.com/soapfactory.bg" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              style={{ width: 28, height: 28, border: '1px solid rgba(23,19,18,0.34)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#171312', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
              f
            </a>
            <a href="https://www.instagram.com/soapfactorybg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              style={{ width: 28, height: 28, border: '1px solid rgba(23,19,18,0.34)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#171312', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Info */}
        <div>
          <h4 style={{ fontFamily: fd, fontWeight: 500, fontSize: 19, letterSpacing: 0, textTransform: 'none', color: accent, marginBottom: 18 }}>
            {tr.footer.infoTitle}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {tr.footer.infoLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ fontFamily: fb, fontSize: 13, color: '#171312', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 style={{ fontFamily: fd, fontWeight: 500, fontSize: 19, letterSpacing: 0, textTransform: 'none', color: accent, marginBottom: 18 }}>
            {tr.footer.aboutTitle}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {tr.footer.aboutLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ fontFamily: fb, fontSize: 13, color: '#171312', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontFamily: fd, fontWeight: 500, fontSize: 19, letterSpacing: 0, textTransform: 'none', color: accent, marginBottom: 18 }}>
            {tr.footer.contactTitle}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            <li>
              <a href="mailto:info@soapfactory.bg" style={{ fontFamily: fb, fontSize: 13, color: '#171312', textDecoration: 'none' }}>
                info@soapfactory.bg
              </a>
            </li>
            <li>
              <a href="tel:+359988930044" style={{ fontFamily: fb, fontSize: 13, color: '#171312', textDecoration: 'none' }}>
                +359 988 930 044
              </a>
            </li>
            <li style={{ fontFamily: fb, fontSize: 13, color: '#171312', lineHeight: 1.6 }}>
              София, бул. Цариградско шосе 73
            </li>
          </ul>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{ borderTop: rule, borderBottom: rule }}>
        <div className="footer-trust-grid">
          {[
            { Icon: Truck,       title: tr.footer.badgeShipping, desc: tr.footer.badgeShippingDesc },
            { Icon: CreditCard,  title: tr.footer.badgePay,      desc: tr.footer.badgePayDesc      },
            { Icon: RotateCcw,   title: tr.footer.badgeReturn,   desc: tr.footer.badgeReturnDesc   },
          ].map((b, i) => (
            <div key={b.title} className="footer-trust-item" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              paddingLeft: i > 0 ? 32 : 0,
              borderLeft: i > 0 ? rule : 'none',
            }}>
              <b.Icon size={20} strokeWidth={1.4} style={{ color: accent, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: fb, fontWeight: 600, fontSize: 12, color: '#171312', marginBottom: 1 }}>{b.title}</div>
                <div style={{ fontFamily: fb, fontSize: 11, color: 'rgba(23,19,18,0.58)' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom-bar">
        <p style={{ fontFamily: fb, fontSize: 11, color: 'rgba(23,19,18,0.58)' }}>{tr.footer.copyright.replace('2024', new Date().getFullYear().toString())}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: fb, fontSize: 11, color: 'rgba(23,19,18,0.58)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            SSL
          </span>
          <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, color: 'rgba(23,19,18,0.58)', letterSpacing: '0.05em' }}>MASTERCARD</span>
          <span style={{ fontFamily: fb, fontSize: 11, fontWeight: 700, color: 'rgba(23,19,18,0.58)', letterSpacing: '0.05em', fontStyle: 'italic' }}>VISA</span>
        </div>
      </div>

    </footer>
  );
}
