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
        viewBox="-75 0 510 160"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {/* Faint mini-doodles flanking the main scene */}
        <g strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5">
          {/* left side */}
          <path stroke="#D9C08A" d="M -52 38 L -50.5 42 L -46.5 43.5 L -50.5 45 L -52 49 L -53.5 45 L -57.5 43.5 L -53.5 42 Z" />
          <path stroke="#D8A5B5" d="M -20 22 C -22 19.5 -26 21 -25 24 C -24.3 26 -20 28.5 -20 28.5 C -20 28.5 -15.7 26 -15 24 C -14 21 -18 19.5 -20 22 Z" />
          <circle stroke="#9DB08F" cx="-34" cy="72" r="2.2" />
          <ellipse stroke="#9DB08F" cx="-48" cy="106" rx="7" ry="3.5" transform="rotate(-24 -48 106)" />
          <circle stroke="#D9C08A" cx="-12" cy="128" r="1.8" />
          <path stroke="#D9C08A" d="M -8 92 L -6.8 95 L -4 96.2 L -6.8 97.4 L -8 100.4 L -9.2 97.4 L -12 96.2 L -9.2 95 Z" />
          {/* right side */}
          <path stroke="#D9C08A" d="M 400 28 L 401.5 32 L 405.5 33.5 L 401.5 35 L 400 39 L 398.5 35 L 394.5 33.5 L 398.5 32 Z" />
          <circle stroke="#D8A5B5" cx="416" cy="66" r="2.2" />
          <ellipse stroke="#9DB08F" cx="404" cy="98" rx="7" ry="3.5" transform="rotate(28 404 98)" />
          <path stroke="#D8A5B5" d="M 388 124 C 386 121.5 382 123 383 126 C 383.7 128 388 130.5 388 130.5 C 388 130.5 392.3 128 393 126 C 394 123 390 121.5 388 124 Z" />
          <circle stroke="#9DB08F" cx="424" cy="132" r="1.8" />
        </g>
        <g strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Lucky four-leaf clover */}
          <g stroke="#6F9862" fill="#E3F0DB" transform="rotate(-8 60 60)">
            <ellipse cx="60" cy="47" rx="6.5" ry="9.5" />
            <ellipse cx="60" cy="73" rx="6.5" ry="9.5" />
            <ellipse cx="47" cy="60" rx="9.5" ry="6.5" />
            <ellipse cx="73" cy="60" rx="9.5" ry="6.5" />
            <path fill="none" d="M 60 73 C 58 86 55 92 50 100" />
          </g>

          {/* Sparkle stars — golden */}
          <g stroke="#CFA84F" fill="#F6E7BF">
            <path d="M 118 26 L 120.5 33 L 127 35.5 L 120.5 38 L 118 45 L 115.5 38 L 109 35.5 L 115.5 33 Z" />
            <path d="M 150 74 L 152 79 L 157 81 L 152 83 L 150 88 L 148 83 L 143 81 L 148 79 Z" />
            <path d="M 96 120 L 98.4 126 L 104 128.4 L 98.4 130.8 L 96 137 L 93.6 130.8 L 88 128.4 L 93.6 126 Z" />
          </g>

          {/* Little heart — pink */}
          <path stroke="#CE7F97" fill="#F8DCE4" transform="rotate(6 145 122)"
            d="M 145 118 C 141.5 113 133.5 116 135.5 122.5 C 137 127 145 132 145 132 C 145 132 153 127 154.5 122.5 C 156.5 116 148.5 113 145 118 Z" />

          {/* Daisy — lilac petals, golden heart */}
          <g transform="rotate(10 190 55)">
            <ellipse stroke="#9B87B8" fill="#EBE3F4" cx="190" cy="43" rx="5" ry="8" />
            <ellipse stroke="#9B87B8" fill="#EBE3F4" cx="190" cy="43" rx="5" ry="8" transform="rotate(72 190 55)" />
            <ellipse stroke="#9B87B8" fill="#EBE3F4" cx="190" cy="43" rx="5" ry="8" transform="rotate(144 190 55)" />
            <ellipse stroke="#9B87B8" fill="#EBE3F4" cx="190" cy="43" rx="5" ry="8" transform="rotate(216 190 55)" />
            <ellipse stroke="#9B87B8" fill="#EBE3F4" cx="190" cy="43" rx="5" ry="8" transform="rotate(288 190 55)" />
            <circle stroke="#CFA84F" fill="#F6E7BF" cx="190" cy="55" r="4.5" />
          </g>

          {/* Leafy sprig — green */}
          <g stroke="#7FA871">
            <path fill="none" d="M 342 14 C 350 36 355 58 356 84" />
            <ellipse fill="#E3F0DB" cx="345" cy="30" rx="9" ry="4.5" transform="rotate(-32 345 30)" />
            <ellipse fill="#E3F0DB" cx="357" cy="48" rx="9" ry="4.5" transform="rotate(38 357 48)" />
            <ellipse fill="#E3F0DB" cx="350" cy="66" rx="9" ry="4.5" transform="rotate(-30 350 66)" />
          </g>

          {/* Sailboat — cream sails, terracotta hull, teal waves */}
          <g>
            <path stroke="#A9705A" fill="none" d="M 265 48 L 265 106" />
            <path stroke="#B08D57" fill="#FBF2DF" d="M 262 56 L 262 100 L 232 100 Z" />
            <path stroke="#B08D57" fill="#FBF2DF" d="M 269 64 L 269 100 L 293 100 Z" />
            <path stroke="#A9705A" fill="#EFD6CB" d="M 226 108 Q 265 128 304 108 L 296 119 Q 265 130 234 119 Z" />
            <path stroke="#7FAEBC" fill="none" d="M 206 132 q 9 5.5 18 0 q 9 -5.5 18 0" />
            <path stroke="#7FAEBC" fill="none" d="M 254 141 q 9 5.5 18 0 q 9 -5.5 18 0" />
            <path stroke="#7FAEBC" fill="none" d="M 302 131 q 8 5 16 0" />
          </g>
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
