'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const fb = 'var(--font-body)';
const fd = 'var(--font-display), Georgia, serif';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', agree: false });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="contact-page">
      <PageHeader
        title="За контакти"
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: 'За контакти' }]}
      />

      <div className="contact-layout max-w-full mx-auto px-[15px] py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left — info */}
        <div className="contact-info-panel">
          {/* Contact info */}
          <h2 className="contact-section-title" style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 26, color: 'var(--text-heading)', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            За контакти
          </h2>
          <ul className="contact-info-list" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
            <li className="contact-info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span className="contact-info-icon" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(155,114,199,0.1)', border: '1px solid rgba(155,114,199,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9B72C7' }}>
                <Phone size={17} />
              </span>
              <div className="contact-info-copy">
                <p className="contact-info-label" style={{ fontFamily: fb, fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Телефон</p>
                <a className="contact-info-value" href="tel:+359988930044" style={{ fontFamily: fb, fontSize: 16, color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 500 }}>+359 988 930 044</a>
              </div>
            </li>
            <li className="contact-info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span className="contact-info-icon" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(155,114,199,0.1)', border: '1px solid rgba(155,114,199,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9B72C7' }}>
                <Mail size={17} />
              </span>
              <div className="contact-info-copy">
                <p className="contact-info-label" style={{ fontFamily: fb, fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Имейл</p>
                <a className="contact-info-value" href="mailto:info@soapfactory.bg" style={{ fontFamily: fb, fontSize: 16, color: 'var(--text-heading)', textDecoration: 'none', fontWeight: 500 }}>info@soapfactory.bg</a>
              </div>
            </li>
            <li className="contact-info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span className="contact-info-icon" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(155,114,199,0.1)', border: '1px solid rgba(155,114,199,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9B72C7' }}>
                <MapPin size={17} />
              </span>
              <div className="contact-info-copy">
                <p className="contact-info-label" style={{ fontFamily: fb, fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Адрес</p>
                <p className="contact-info-value" style={{ fontFamily: fb, fontSize: 16, color: 'var(--text-heading)', fontWeight: 500 }}>гр. София, бул. Цариградско шосе 73</p>
              </div>
            </li>
          </ul>

          {/* Partnership */}
          <h2 className="contact-partnership-title" style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 26, color: 'var(--text-heading)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Да работим заедно
          </h2>
          <p className="contact-partnership-copy" style={{ fontFamily: fb, fontSize: 15, color: 'var(--text-body)', lineHeight: 1.75, marginBottom: 0 }}>
            Нашите изцяло натурални продукти могат да бъдат открити в големите вериги магазини.
            А защо не и в твоя? Пиши ни или ни се обади, за да обсъдим бъдещо партньорство.
          </p>
        </div>

        {/* Right — form */}
        <div className="contact-form-panel">
          <h2 className="contact-form-title" style={{ fontFamily: fd, fontWeight: 600, fontStyle: 'italic', fontSize: 26, color: 'var(--text-heading)', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Пиши ни
          </h2>

          {sent ? (
            <div className="contact-form-success" style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h3 style={{ fontFamily: fd, fontWeight: 600, fontSize: 22, color: '#9B72C7', marginBottom: 8 }}>Благодарим!</h3>
              <p style={{ fontFamily: fb, fontSize: 15, color: 'var(--text-body)' }}>Съобщението ти е получено. Ще се свържем с теб в най-скоро.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="contact-form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="contact-form-field">
                  <label className="contact-form-label" style={{ fontFamily: fb, fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Твоето име</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="contact-form-input"
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: fb, fontSize: 14, outline: 'none' }}
                  />
                </div>
                <div className="contact-form-field">
                  <label className="contact-form-label" style={{ fontFamily: fb, fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Твоят имейл</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="contact-form-input"
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: fb, fontSize: 14, outline: 'none' }}
                  />
                </div>
              </div>
              <div className="contact-form-field">
                <label className="contact-form-label" style={{ fontFamily: fb, fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Съобщение</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="contact-form-textarea"
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontFamily: fb, fontSize: 14, outline: 'none', resize: 'vertical' }}
                />
              </div>
              <label className="contact-form-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  checked={form.agree}
                  onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))}
                  style={{ marginTop: 3, accentColor: '#9B72C7' }}
                />
                <span style={{ fontFamily: fb, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Потвърждавам, че предоставям доброволно личните си данни и съм запознат/а с{' '}
                  <a href="/poveritelnost" style={{ color: '#9B72C7', textDecoration: 'underline' }}>политиката за поверителност</a>.
                </span>
              </label>
              <button
                type="submit"
                className="contact-form-submit btn-primary"
                style={{ alignSelf: 'flex-start', padding: '12px 32px', fontSize: 14, background: '#B08D57' }}
              >
                Изпрати
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="contact-map" style={{ height: 380, width: '100%', marginTop: 16 }}>
        <iframe
          className="contact-map-frame"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2934.1!2d23.37!3d42.68!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z0KHQvtGE0LjRjw!5e0!3m2!1sbg!2sbg!4v1234567890&q=%D0%B1%D1%83%D0%BB.+%D0%A6%D0%B0%D1%80%D0%B8%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%BE+%D1%88%D0%BE%D1%81%D0%B5+73%2C+%D0%A1%D0%BE%D1%84%D0%B8%D1%8F"
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Сапунена работилница — локация"
        />
      </div>
    </div>
  );
}
