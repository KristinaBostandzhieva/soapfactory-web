import Link from 'next/link';

const hf = 'var(--font-display), Georgia, serif';

interface Crumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  title,
  breadcrumbs,
  subtitle,
}: {
  title: string;
  breadcrumbs: Crumb[];
  subtitle?: string;
}) {
  return (
    <div className="page-header">
      <svg
        className="page-header-pattern"
        viewBox="0 0 360 220"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
          <path d="M 60 200 C 90 140 110 90 180 30" />
          <path d="M 110 160 C 130 145 145 135 165 110" />
          <ellipse cx="165" cy="106" rx="16" ry="8" transform="rotate(-40 165 106)" />
          <path d="M 95 175 C 115 165 128 158 145 140" />
          <ellipse cx="145" cy="138" rx="14" ry="7" transform="rotate(-35 145 138)" />
          <path d="M 130 130 C 145 120 155 112 170 95" />
          <ellipse cx="170" cy="93" rx="13" ry="6.5" transform="rotate(-42 170 93)" />
          <path d="M 75 188 C 95 180 108 172 125 155" />
          <ellipse cx="125" cy="153" rx="13" ry="6.5" transform="rotate(-38 125 153)" />

          <path d="M 230 210 C 250 160 265 120 320 60" />
          <path d="M 250 185 C 268 172 280 162 298 142" />
          <ellipse cx="298" cy="140" rx="15" ry="7.5" transform="rotate(-40 298 140)" />
          <path d="M 240 200 C 258 188 270 178 286 160" />
          <ellipse cx="286" cy="158" rx="13" ry="6.5" transform="rotate(-38 286 158)" />
          <path d="M 270 160 C 285 148 296 138 310 120" />
          <ellipse cx="310" cy="118" rx="13" ry="6.5" transform="rotate(-42 310 118)" />
        </g>
      </svg>

      <div className="page-header-content">
        <nav className="page-header-breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i}>
              {b.href ? (
                <Link href={b.href}>{b.label}</Link>
              ) : (
                <span className="current">{b.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </nav>
        <h1 style={{ fontFamily: hf }} className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
