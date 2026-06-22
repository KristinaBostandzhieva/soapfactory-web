import type { UiProduct } from './catalog';
import { COMPANY } from './company';

// ── Site-wide constants ───────────────────────────────────────────────
// Production domain. Override via NEXT_PUBLIC_SITE_URL in the environment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.soapfactory.bg').replace(/\/$/, '');
export const SITE_NAME = 'Сапунена работилница';
export const SITE_TAGLINE = 'Натурална козметика';
export const SITE_DESCRIPTION =
  'Натурална козметика за тяло, лице и коса. 100% натурални, ръчно изработени продукти — без парабени и вредни химикали. Веган и без тестване върху животни.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/MainBannerHome.jpeg`;

// Official social profiles — used for the Organization `sameAs` brand signal.
export const SOCIAL_PROFILES = [
  'https://www.facebook.com/soapfactory.bg',
  'https://www.instagram.com/soapfactorybg/',
];

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Next.js route params arrive URL-encoded for non-ASCII (Cyrillic) slugs; decode safely. */
export function decodeSlug(raw: string): string {
  try { return decodeURIComponent(raw); } catch { return raw; }
}

/** Trim text to a clean meta-description length (~160 chars), no mid-word cuts. */
export function metaDescription(text?: string | null, fallback = SITE_DESCRIPTION): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

// ── Structured data (JSON-LD) builders ────────────────────────────────

/** schema.org Product — lets Google show price, availability & ⭐ in results. */
export function productJsonLd(product: UiProduct) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: metaDescription(product.description || product.shortDescription),
    ...(product.image ? { image: [product.image] } : {}),
    ...(product.id ? { sku: product.id } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.categoryTitle,
    ...(product.reviewCount && product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/produkt/${product.slug}`),
      priceCurrency: 'EUR',
      price: product.price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

/** schema.org BreadcrumbList — the Начало › Категория › Продукт trail. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** schema.org Organization — identifies the brand to Google (richer for the Knowledge Panel). */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address,
      addressCountry: 'BG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phone,
      email: COMPANY.email,
      contactType: 'customer service',
      areaServed: 'BG',
      availableLanguage: ['Bulgarian'],
    },
    sameAs: SOCIAL_PROFILES,
  };
}

/** schema.org WebSite — includes a SearchAction so Google can show a sitelinks search box. */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'bg-BG',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tarsene?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Render a JSON-LD object as a <script> tag (use inside a Server Component). */
export function jsonLdScript(data: object) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}
