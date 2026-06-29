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

function toUi(product: RawProduct, index: number): UiProduct {
  const images = product.images || [];
  const cat = primaryCategory(product);
  return {
    id: product.sku || `static-${index}`,
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

  return rawProducts
    .filter((p) => productCategories(p).some((c) => allowed.has(c.id)))
    .map(toUi)
    .sort((a, b) => a.price - b.price);
}

export function getStaticRelatedProducts(product: UiProduct, take = 4): UiProduct[] {
  if (!product.categorySlug) return [];
  return getStaticProductsInCategory(product.categorySlug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, take);
}
