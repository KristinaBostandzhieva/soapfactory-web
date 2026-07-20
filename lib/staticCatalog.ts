import productsJson from '@/data/catalog.json';
import categoriesJson from '@/data/sf_categories.json';
import type { UiProduct } from './catalog';

type RawProduct = {
  sku?: string;
  name: string;
  slug: string;
  price?: number;
  onSale?: boolean;
  inStock?: boolean;
  categories?: string[];
  shortDescription?: string | null;
  description?: string | null;
  weight?: string | null;
  images?: string[];
};

type RawCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
};

export type StaticCategory = {
  name: string;
  slug: string;
  parent: { name: string; slug: string } | null;
};

const rawProducts = productsJson as RawProduct[];
const rawCategories = categoriesJson as RawCategory[];

const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'slanchev-sapun': 'слънчев-сапун',
  'bilkov-sapun': 'билков-сапун',
  'sapun-lavandula': 'сапун-лавандула-и-мак',
  'sapun-portokal-i-kanela': 'сапун-портокал-и-канела',
  'deo-stik-vaniliya-i-laym': 'део-стик-ванилия-лайм',
  'deo-vanilia-laim': 'део-стик-ванилия-лайм',
  'bakuchiol-lift-regeneration-power-serum': 'bakuchiol-lift-regeneration-power-serum',
  'bakuchiol-lift-regeneration-power-cream': 'bakuchiol-lift-regeneration-power',
  'coconut-sugar-scrub': 'захарен-ексфолиант-кокос',
  'face-wash-ylang-ylang': 'face-wash-иланг-иланг',
  'face-wash-tea-tree': 'чаено-дърво-портокал-и-мента',
  'hyaluron-ultimate-hydration-serum': 'серум-за-лице-с-хиалурон-2',
  'niacinamide-radiance-serum': 'серум-за-лице-ниацинамид-2',
  'eye-cream-revitalizing': 'ревитализиращ-крем-за-околоочна-лини',
  'eye-cream-nourishing': 'подхранващ-крем-за-околоочна-линия',
  'hyaluron-deep-moisturizing-cream': 'hyaluron-intense-hydration-2',
  'coenzyme-q10-powerful-skin-recharge': 'coenzyme-q10-powerful-skin-recharge-2',
};

function isCyrillic(value: string): boolean {
  return /[а-яА-Я]/.test(value || '');
}

function strip(value?: string | null): string {
  return (value || '').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function slugMatches(actual: string, requested: string): boolean {
  const a = decodeSlug(actual);
  const r = decodeSlug(requested);
  return a === r || actual === requested || PRODUCT_SLUG_ALIASES[r] === a || PRODUCT_SLUG_ALIASES[r] === actual;
}

const bgCategories = rawCategories.filter((c) => isCyrillic(c.name) && c.slug !== 'bez-kategoriya');

const PRODUCT_IMAGE_OVERRIDES: Record<string, string[]> = {
  '141': ['/images/dush-gel/bilkov-showegel.png'],
  '141_BG': ['/images/dush-gel/bilkov-showegel.png'],
  '143': ['/images/dush-gel/citrus-showergel.png'],
  '143_BG': ['/images/dush-gel/citrus-showergel.png'],
  '166': ['/images/fscr-care/lipbalm/orange-lip-balm-1stt-clean.png?v=3'],
  '167': ['/images/fscr-care/lipbalm/orange-and-cinammon-1st-clean.png?v=3'],
  '168': ['/images/fscr-care/lipbalm/herbal-lip-balm-1st-clean.png?v=3'],
  '171': ['/images/fscr-care/lipbalm/cocoa-and-vanilla-1st-clean.png?v=3'],
  '178': ['/images/velvet/conezyme-cream-square.png'],
  '179': ['/images/velvet/hyal-cream-square.png'],
  '189': ['/images/velvet/bakuchiol-cream-square.png'],
  '189-1': ['/images/velvet/bakuchiol-cream-square.png'],
  '174': ['/images/deos/deo-sunny-2.png'],
  '175': ['/images/deos/deo-vanilla-lime-2.png'],
  '182': ['/images/deos/natural-deo-2.png'],
  '183': ['/images/deos/deo-lime-2.png'],
  '184': ['/images/deos/sandal-deo-2.png'],
  '163': ['/images/scrubs/coffee-orange.png'],
  '164': ['/images/scrubs/coffee-scrub.png'],
  '170': ['/images/scrubs/coconut.png'],
  '131-BG': ['/images/hair-bars/slunchev-shampoan.png'],
  '132-BG': ['/images/hair-bars/bilkov-shampoan.png'],
  '133-BG': ['/images/hair-bars/happyhair-dandruff0shampoo.png'],
  '8d1f1aac0dd8': ['/images/promo-soaps.png'],
  '137-140': ['/images/shampoo-promo.png'],
  '137': ['/images/shampoani/green-happyhair.png'],
  '138': ['/images/shampoani/yellow-happyhair.png'],
  '139': ['/images/shampoani/red-happyhair.png'],
  '140': ['/images/shampoani/happyhair-blue.png'],
  '195': ['/images/fscr-care/rose-water.png'],
  '196': ['/images/fscr-care/aloe - vera-gel.png'],
  '198': ['/images/sos-balsam.png'],
  '199': ['/images/fscr-care/petna-sapunche.png'],
  '190': ['/images/velvet/bakuchiol-serum.png'],
  '190-91': ['/images/velvet/bakuchiol-serum.png'],
  '194': ['/images/velvet/hyalouron-serum.png'],
  '100': ['/images/sapuni/slunchev-sapun.png'],
  '101': ['/images/sapuni/bilkov-sapun.png'],
  '102': ['/images/sapuni/lavandula-sapun.png'],
  '103': ['/images/sapuni/sandalovo-durvo-sapun.png'],
  '104': ['/images/sapuni/portokal-i-kanela-sapun.png'],
  '105': ['/images/sapuni/ilang-sapun.png'],
  '106': ['/images/sapuni/bebcho-sapun.png'],
  '107': ['/images/sapuni/tsveten-sapun.png'],
  '110': ['/images/sapuni/detoks-sapun.png'],
  '151': ['/images/hair-bars/sunny-poo-bar.png'],
  '153': ['/images/hair-bars/vitamint-poo-bar.png'],
  '155': ['/images/hair-bars/aloe-poo-bar.png'],
  '158': ['/images/hair-bars/detox-poo-bar.png'],
};

function categoryByName(name: string): RawCategory | undefined {
  const clean = strip(name);
  return bgCategories.find((c) => strip(c.name) === clean);
}

function categoryBySlug(slug: string): RawCategory | undefined {
  const decoded = decodeSlug(slug);
  return bgCategories.find((c) => c.slug === decoded || c.slug === slug);
}

function toStaticCategory(cat: RawCategory): StaticCategory {
  const parent = cat.parent ? bgCategories.find((c) => c.id === cat.parent) : undefined;
  return {
    name: strip(cat.name),
    slug: cat.slug,
    parent: parent ? { name: strip(parent.name), slug: parent.slug } : null,
  };
}

function productCategories(product: RawProduct): RawCategory[] {
  return (product.categories || []).map(categoryByName).filter(Boolean) as RawCategory[];
}

function primaryCategory(product: RawProduct): RawCategory | undefined {
  const cats = productCategories(product);
  return cats.find((c) => c.parent === 0) || cats[0];
}

const GLOBALLY_HIDDEN_SKUS = new Set(['134', '142', '192']);

function isHiddenFromCategory(product: UiProduct, catSlug: string): boolean {
  if (product.sku && GLOBALLY_HIDDEN_SKUS.has(product.sku)) return true;
  if (catSlug !== 'seria-velvet') return false;
  return product.slug === 'bakuchiol-lift-regeneration-power';
}

function cleanCategoryProducts(products: UiProduct[], catSlug: string): UiProduct[] {
  const seen = new Set<string>();
  const dedupeByName = catSlug === 'seria-velvet' || catSlug === 'grizha-za-litseto';
  return products.filter((product) => {
    if (isHiddenFromCategory(product, catSlug)) return false;
    if (!dedupeByName) return true;
    const key = product.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toUi(product: RawProduct, index: number): UiProduct {
  const images = product.sku && PRODUCT_IMAGE_OVERRIDES[product.sku] ? PRODUCT_IMAGE_OVERRIDES[product.sku] : product.images || [];
  const cat = primaryCategory(product);
  return {
    id: product.sku || `static-${index}`,
    sku: product.sku || null,
    name: strip(product.name),
    slug: decodeSlug(product.slug),
    price: product.price || 0,
    image: images[0],
    images,
    inStock: product.inStock !== false,
    shortDescription: strip(product.shortDescription),
    description: strip(product.description),
    weight: product.weight || null,
    categorySlug: cat?.slug,
    categoryTitle: cat ? strip(cat.name) : undefined,
  };
}

export function getStaticCategoryBySlug(slug: string): StaticCategory | null {
  const cat = categoryBySlug(slug);
  return cat ? toStaticCategory(cat) : null;
}

export function getStaticAllProducts(): UiProduct[] {
  return rawProducts.map(toUi);
}

export function getStaticFeaturedProducts(take = 8): UiProduct[] {
  return getStaticAllProducts().slice(0, take);
}

export function getStaticProductsBySlugs(slugs: string[]): UiProduct[] {
  const all = getStaticAllProducts();
  return slugs.map((slug) => all.find((p) => slugMatches(p.slug, slug))).filter(Boolean) as UiProduct[];
}

export function getStaticProductBySlug(slug: string): UiProduct | null {
  const match = rawProducts.find((p) => slugMatches(p.slug, slug));
  return match ? toUi(match, rawProducts.indexOf(match)) : null;
}

export function getStaticProductsInCategory(slug: string): UiProduct[] {
  if (slug === 'promotsii') {
    return rawProducts
      .filter((p) => p.onSale || (p.categories || []).some((name) => categoryByName(name)?.slug === 'promotsii'))
      .map(toUi);
  }

  const cat = categoryBySlug(slug);
  if (!cat) return [];
  const allowed = new Set([cat.id, ...bgCategories.filter((c) => c.parent === cat.id).map((c) => c.id)]);

  const products = rawProducts
    .filter((p) => productCategories(p).some((c) => allowed.has(c.id)))
    .map(toUi)
    .sort((a, b) => a.price - b.price);
  return cleanCategoryProducts(products, slug);
}

export function getStaticRelatedProducts(product: UiProduct, take = 4): UiProduct[] {
  if (!product.categorySlug) return [];
  return getStaticProductsInCategory(product.categorySlug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, take);
}
