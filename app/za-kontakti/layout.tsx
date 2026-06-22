import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакти',
  description: 'Свържи се със Сапунена работилница — въпроси за поръчки, продукти и сътрудничество. Натурална козметика, ръчно изработена в България.',
  alternates: { canonical: '/za-kontakti' },
  openGraph: { type: 'website', url: '/za-kontakti', title: 'Контакти | Сапунена работилница' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
