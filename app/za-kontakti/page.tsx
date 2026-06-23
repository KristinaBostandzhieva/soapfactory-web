'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const hf = 'var(--font-body)';
const inputCls = 'w-full border border-[var(--border)] rounded px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--primary)]';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <PageHeader
        title="?? ????????"
        breadcrumbs={[{ label: '??????', href: '/' }, { label: '?? ????????' }]}
      />

      <div className="max-w-full mx-auto px-[15px] py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 style={{ fontFamily: hf, fontWeight: 800, fontSize: 24, color: '#333', marginBottom: 20 }}>?????? ?? ? ???</h2>
          <p className="text-[15px] text-[var(--text-body)] leading-relaxed mb-8">
            ???? ?????? ?? ?????? ???????? ??? ????? ?? ?????? ??? ????????? ???? ?? — ?? ?? ??????? ?? ?? ????????!
          </p>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0"><Mail size={18} /></span>
              <div><p className="font-semibold text-[var(--text-dark)]">?????</p><a href="mailto:info@soapfactory.bg" className="text-[var(--text-body)] hover:text-[var(--primary)]">info@soapfactory.bg</a></div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0"><Phone size={18} /></span>
              <div><p className="font-semibold text-[var(--text-dark)]">???????</p><a href="tel:+359988930044" className="text-[var(--text-body)] hover:text-[var(--primary)]">+359 988 930 044</a></div>
            </li>
            <li className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0"><MapPin size={18} /></span>
              <div><p className="font-semibold text-[var(--text-dark)]">?????</p><p className="text-[var(--text-body)]">?????, ???. ??????????? ???? 73</p></div>
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-[var(--bg-light)] rounded-md p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">?</div>
              <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 20, color: '#9B72C7' }}>??????????!</h3>
              <p className="text-[var(--text-body)] mt-2">??????????? ?? ? ?????????. ?? ?? ??????? ? ??? ?????.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <h3 style={{ fontFamily: hf, fontWeight: 800, fontSize: 18, color: '#333', marginBottom: 16 }}>??????? ?????????</h3>
              <div className="mb-4"><label className="block text-[13px] mb-1">??? *</label><input required className={inputCls} /></div>
              <div className="mb-4"><label className="block text-[13px] mb-1">????? *</label><input required type="email" className={inputCls} /></div>
              <div className="mb-4"><label className="block text-[13px] mb-1">????????? *</label><textarea required rows={5} className={inputCls} /></div>
              <button type="submit" className="btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>???????</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
