import PageHeader from '@/components/PageHeader';

// Shared shell for legal/policy pages — consistent heading, breadcrumb and
// readable typography.
export default function LegalLayout({
  title, updated, children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: 'Начало', href: '/' }, { label: title }]}
        subtitle={`Последна актуализация: ${updated}`}
      />

      <article className="max-w-[820px] mx-auto px-[15px] py-12 legal-content text-[15px] text-[var(--text-body)] leading-relaxed">
        {children}
      </article>
    </div>
  );
}
