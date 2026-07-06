import Link from 'next/link';

const hf = 'var(--font-body)';

export default function NotFound() {
  return (
    <div className="max-w-[640px] mx-auto px-[15px] py-24 text-center">
      <div style={{ fontFamily: hf, fontWeight: 800, fontSize: 90, color: '#9B72C7', lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 26, color: '#333' }} className="mt-2 mb-3">
        Страницата не е намерена
      </h1>
      <p className="text-[15px] text-[var(--text-body)] mb-8">
        Опа! Тази страница не съществува или е била преместена. Но имаме много ароматни продукти, които те очакват. 🧼
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary inline-block">Към начало</Link>
        <Link href="/shop" className="inline-block px-5 py-[9px] rounded text-[13px] font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors uppercase">
          Към магазина
        </Link>
      </div>
    </div>
  );
}
