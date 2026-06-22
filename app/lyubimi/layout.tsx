import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Любими продукти',
  description: 'Твоите любими продукти от Сапунена работилница.',
  alternates: { canonical: '/lyubimi' },
  // Personal page — not indexed.
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
