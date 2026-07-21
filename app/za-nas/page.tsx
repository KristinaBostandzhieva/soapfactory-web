import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'За нас',
  description: 'Научете повече за Сапунена работилница — нашата история, мисия и ценности.',
  alternates: { canonical: '/za-nas' },
};

export default function ZaNasPage() {
  return (
    <main className="about-placeholder-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-muted)', textAlign: 'center' }}>
        Страницата се подготвя — очаквайте скоро!
      </p>
    </main>
  );
}
