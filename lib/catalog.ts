import { prisma } from './prisma';
import {
  getStaticAllProducts,
  getStaticCategoryBySlug,
  getStaticFeaturedProducts,
  getStaticProductBySlug,
  getStaticProductsBySlugs,
  getStaticProductsInCategory,
  getStaticRelatedProducts,
} from './staticCatalog';

export type UiProduct = {
  id: string;
  sku?: string | null;
  name: string;
  slug: string;
  price: number;
  priceMax?: number;
  image?: string;
  images: string[];
  inStock: boolean;
  shortDescription?: string | null;
  description?: string | null;
  nameEn?: string | null;
  shortDescriptionEn?: string | null;
  descriptionEn?: string | null;
  weight?: string | null;
  stockQty?: number | null;
  rating?: number;
  reviewCount?: number;
  categorySlug?: string;
  categoryTitle?: string;
};

export type ReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  verified: boolean;
  createdAt: Date;
};

const PRODUCT_INCLUDE = {
  categories: { select: { slug: true, name: true, parentId: true } },
  reviews: { where: { approved: true }, select: { rating: true } },
} as const;

type DbProduct = {
  id: string;
  sku?: string | null;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  stockQty: number | null;
  shortDescription: string | null;
  description: string | null;
  nameEn: string | null;
  shortDescriptionEn: string | null;
  descriptionEn: string | null;
  weight: string | null;
  images: string;
  categories: { slug: string; name: string; parentId: string | null }[];
  reviews: { rating: number }[];
};

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
  '137': ['/images/shampoani/red-happyhair.png'],
  '138': ['/images/shampoani/yellow-happyhair.png'],
  '139': ['/images/shampoani/green-happyhair.png'],
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

function applyImageOverride(product: { sku?: string | null }, images: string[]): string[] {
  // Images saved in the DB always win, so the admin panel is the source of truth.
  // The hardcoded override is only a fallback for products that have no images yet.
  if (images.length) return images;
  return product.sku && PRODUCT_IMAGE_OVERRIDES[product.sku] ? PRODUCT_IMAGE_OVERRIDES[product.sku] : images;
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

export function firstImage(images: string): string | undefined {
  try {
    return (JSON.parse(images || '[]')[0] as string) || undefined;
  } catch {
    return undefined;
  }
}

// Parse the raw images JSON column into a clean string array.
export function productImages(images: string): string[] {
  try {
    const arr = JSON.parse(images || '[]');
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string' && x.length > 0) : [];
  } catch {
    return [];
  }
}

function toUi(p: DbProduct): UiProduct {
  let images: string[] = [];
  try {
    images = JSON.parse(p.images || '[]');
  } catch {}
  images = applyImageOverride(p, images);

  const image = images[0];
  const cat = p.categories.find((c) => !c.parentId) || p.categories[0];
  const inStock = p.stockQty != null ? p.stockQty > 0 : p.inStock;
  const reviewCount = p.reviews.length;
  const rating = reviewCount ? p.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : undefined;

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image,
    images,
    inStock,
    shortDescription: p.shortDescription,
    description: p.description,
    nameEn: p.nameEn,
    shortDescriptionEn: p.shortDescriptionEn,
    descriptionEn: p.descriptionEn,
    weight: p.weight,
    stockQty: p.stockQty,
    rating,
    reviewCount,
    categorySlug: cat?.slug,
    categoryTitle: cat?.name,
  };
}

export async function getProductReviews(productId: string): Promise<ReviewItem[]> {
  try {
    return await prisma.review.findMany({
      where: { productId, approved: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, authorName: true, rating: true, comment: true, verified: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

export async function getProductsBySlugs(slugs: string[]): Promise<UiProduct[]> {
  try {
    const ps = await prisma.product.findMany({ where: { slug: { in: slugs } }, include: PRODUCT_INCLUDE });
    const dbBySlug = new Map(ps.map((p) => [p.slug, toUi(p)]));
    const staticFallbacks = getStaticProductsBySlugs(slugs);
    const staticBySlug = new Map(staticFallbacks.map((p) => [p.slug, p]));
    return slugs.map((s) => dbBySlug.get(s) ?? staticBySlug.get(s)).filter(Boolean) as UiProduct[];
  } catch {
    return getStaticProductsBySlugs(slugs);
  }
}

export async function getFeaturedProducts(take = 8): Promise<UiProduct[]> {
  try {
    const ps = await prisma.product.findMany({
      where: { featured: true },
      include: PRODUCT_INCLUDE,
      take,
      orderBy: { createdAt: 'desc' },
    });
    const products = ps.map(toUi);
    return products.length ? products : getStaticFeaturedProducts(take);
  } catch {
    return getStaticFeaturedProducts(take);
  }
}

export async function getAllProducts(): Promise<UiProduct[]> {
  try {
    const ps = await prisma.product.findMany({ include: PRODUCT_INCLUDE, orderBy: { createdAt: 'desc' } });
    const products = ps.map(toUi);
    return products.length ? products : getStaticAllProducts();
  } catch {
    return getStaticAllProducts();
  }
}

export async function searchProducts(query: string): Promise<UiProduct[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getAllProducts();
  const words = q.split(/\s+/);
  return all.filter((p) => {
    const hay = `${p.name} ${p.shortDescription || ''} ${p.description || ''} ${p.categoryTitle || ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export async function getProductBySlug(slug: string): Promise<UiProduct | null> {
  try {
    const p = await prisma.product.findUnique({ where: { slug }, include: PRODUCT_INCLUDE });
    return p ? toUi(p) : getStaticProductBySlug(slug);
  } catch {
    return getStaticProductBySlug(slug);
  }
}

export async function getProductsInCategory(catSlug: string): Promise<UiProduct[]> {
  try {
    if (catSlug === 'promotsii') {
      const ps = await prisma.product.findMany({ where: { OR: [{ onSale: true }, { featured: true }] }, include: PRODUCT_INCLUDE });
      const products = cleanCategoryProducts(ps.map(toUi), catSlug);
      return products.length ? products : getStaticProductsInCategory(catSlug);
    }

    const cat = await prisma.category.findUnique({ where: { slug: catSlug }, include: { children: { select: { slug: true } } } });
    if (!cat) return getStaticProductsInCategory(catSlug);

    const slugs = [cat.slug, ...cat.children.map((c) => c.slug)];
    const ps = await prisma.product.findMany({
      where: { categories: { some: { slug: { in: slugs } } } },
      include: PRODUCT_INCLUDE,
      orderBy: { price: 'asc' },
    });
    const products = cleanCategoryProducts(ps.map(toUi), catSlug);
    return products.length ? products : getStaticProductsInCategory(catSlug);
  } catch {
    return getStaticProductsInCategory(catSlug);
  }
}

// Real DB slugs (confirmed via direct query — do not guess, these differ from the static JSON fallback slugs)
const SLUG_FACE_WASH = 'bio-face-wash-chaeno-darvo-za-problemna-kozha'; // sku 162 (only face wash in DB)
const SLUG_ROSE_WATER = 'bio-sertifitsirana-rozova-voda'; // sku 195
const SLUG_BAKUCHIOL_SERUM = 'bakuchiol-lift-regeneration-power-serum'; // sku 190
const SLUG_BAKUCHIOL_CREAM = 'bakuchiol-lift-regeneration-power-2'; // sku 189
const SLUG_HYALURON_SERUM = 'hyaluron-ultimate-hydration-serum'; // sku 194
const SLUG_HYALURON_CREAM = 'hyaluron-intense-hydration-2'; // sku 179
const SLUG_NIACINAMIDE_SERUM = 'niacinamide-radiance-and-illuminating-power-serum'; // sku 193
const SLUG_COENZYME_CREAM = 'coenzyme-q10-powerful-skin-recharge-2'; // sku 178
const SLUG_EYE_CREAM_REVITALIZING = 'revitalizirasht-noshten-krem-za-okoloochniya-kontur'; // sku 180
const SLUG_EYE_CREAM_NOURISHING = 'podhranvasht-noshten-krem-za-okoloochniya-kontur'; // sku 181
const SLUG_SOAP_ORANGE_CINNAMON = 'sapun-portokal-i-kanela'; // sku 104
const SLUG_LIP_BALM_ORANGE_CINNAMON = 'bio-balsam-za-ustni-portokal-i-kanela'; // sku 167
const SLUG_SOS_HAND_BALM = 'sos-balsam-za-ratse'; // sku 198
const SLUG_COCONUT_SUGAR_SCRUB = 'zaharen-eksfoliant-kokos'; // sku 170
const SLUG_LIP_BALM_COCOA_VANILLA = 'bio-balsam-za-ustni-vaniliya-i-kakao'; // sku 171 (confirmed real DB slug)
const SLUG_ORANGE_SUGAR_SCRUB = 'zaharen-eksfoliant-portokal'; // sku 163
const SLUG_LIP_BALM_ORANGE = 'bio-balsam-za-ustni-portokal'; // sku 166
const SLUG_LIP_BALM_HERBAL = 'bio-balsam-za-ustni-bilkov'; // sku 168
const SLUG_SHAMPOO_HERBAL = 'bio-bilkov-shampoan-za-zdrav-skalp'; // sku 132-BG
const SLUG_SOAP_HERBAL = 'bilkov-sapun'; // sku 101
const SLUG_SHOWER_GEL_HERBAL = 'bio-bilkov-dush-gel'; // sku 141_BG
const SLUG_SOAP_SUNNY = 'slanchev-sapun'; // sku 100
const SLUG_SOAP_LAVENDER = 'sapun-lavandula'; // sku 102
const SLUG_SOAP_SANDALWOOD = 'зора-сандалово-дърво'; // sku 103
const SLUG_SOAP_ILANG = 'бриз-иланг-иланг'; // sku 105
const SLUG_ALOE_VERA_GEL = 'био-алое-вера-гел'; // sku 196
const SLUG_DEO_SANDALWOOD = 'део-стик-сандалово-дърво'; // sku 184
const SLUG_DEO_NATURAL = 'део-стик-натурален'; // sku 182
const SLUG_SOAP_PROMO_4PLUS1 = 'сапуни-промо'; // sku 8d1f1aac0dd8 — БИО Сапуни комплект 4+1 подарък
const SLUG_SOAP_BEBCHO = 'сапун-бебчо'; // sku 106
const SLUG_SOAP_TSVETEN = 'цветен-сапун-пачули-иланг-иланг'; // sku 107
const SLUG_SOAP_DETOX = 'sapun-detoks-s-aktiven-vaglen'; // sku 110
const SLUG_SHAMPOO_SUNNY = 'bio-slanchev-shampoan-za-poveche-obem'; // sku 131-BG
const SLUG_SHOWER_GEL_SUNNY = 'bio-dush-gel-tsitrus'; // sku 143_BG (no literal "sunny" gel exists — Citrus is the closest match)
const SLUG_SHAMPOO_BAR_SUNNY = 'bio-slanchevo-shampoanovo-blokche'; // sku 151
const SLUG_SHAMPOO_BAR_VITAMINT = 'bio-shampoanovo-blokche-vitamint'; // sku 153
const SLUG_SHAMPOO_BAR_ALOE = 'bio-shampoanovo-blokche-aloe'; // sku 155
const SLUG_SHAMPOO_BAR_DETOX = 'bio-shampoanovo-blokche-detoks'; // sku 158
const SLUG_COFFEE_SUGAR_SCRUB = 'захарен-скраб-кафе'; // sku 164
const SLUG_HAPPYHAIR_NORMAL = 'happyhair-shampoan-za-normalna-iztoshtena-i-ili-tsaftyashta-kosa'; // sku 137
const SLUG_HAPPYHAIR_OILY = 'happyhair-shampoan-pri-mazna-kosa-i-skalp'; // sku 138
const SLUG_HAPPYHAIR_DRY = 'happyhair-shampoan-za-suha-boyadisana-i-uvredena-kosa'; // sku 139
const SLUG_HAPPYHAIR_HAIRLOSS = 'happyhair-stimulirasht-shampoan-pri-kosopad'; // sku 140
const SLUG_HAPPYHAIR_DANDRUFF = 'shampoan-pri-parhot'; // sku 133-BG

const RELATED_PRODUCT_OVERRIDES: Record<string, string[]> = {
  // Velvet serums pair with their matching cream, rose water, and face wash
  [SLUG_BAKUCHIOL_SERUM]: [SLUG_ROSE_WATER, SLUG_BAKUCHIOL_CREAM, SLUG_FACE_WASH],
  [SLUG_HYALURON_SERUM]: [SLUG_ROSE_WATER, SLUG_HYALURON_CREAM, SLUG_FACE_WASH],
  [SLUG_NIACINAMIDE_SERUM]: [SLUG_ROSE_WATER, SLUG_COENZYME_CREAM, SLUG_FACE_WASH],
  // Velvet creams pair with their matching serum, rose water, and face wash
  [SLUG_BAKUCHIOL_CREAM]: [SLUG_ROSE_WATER, SLUG_BAKUCHIOL_SERUM, SLUG_FACE_WASH],
  [SLUG_HYALURON_CREAM]: [SLUG_ROSE_WATER, SLUG_HYALURON_SERUM, SLUG_FACE_WASH],
  [SLUG_COENZYME_CREAM]: [SLUG_ROSE_WATER, SLUG_BAKUCHIOL_SERUM, SLUG_FACE_WASH],
  // Face wash pairs with a velvet cream, serum, and rose water
  [SLUG_FACE_WASH]: [SLUG_ROSE_WATER, SLUG_BAKUCHIOL_CREAM, SLUG_BAKUCHIOL_SERUM],
  // Rose water pairs with a velvet cream, serum, and face wash
  [SLUG_ROSE_WATER]: [SLUG_BAKUCHIOL_CREAM, SLUG_BAKUCHIOL_SERUM, SLUG_FACE_WASH],
  // Eye creams pair with a velvet cream, serum, and face wash
  [SLUG_EYE_CREAM_REVITALIZING]: [SLUG_BAKUCHIOL_CREAM, SLUG_BAKUCHIOL_SERUM, SLUG_FACE_WASH],
  [SLUG_EYE_CREAM_NOURISHING]: [SLUG_BAKUCHIOL_CREAM, SLUG_BAKUCHIOL_SERUM, SLUG_FACE_WASH],
  // Orange & cinnamon lip balm pairs with the matching soap, a face wash, and SOS hand balm
  // Orange & cinnamon soap pairs with the matching lip balm, SOS hand balm, and face wash
  [SLUG_SOAP_ORANGE_CINNAMON]: [SLUG_LIP_BALM_ORANGE_CINNAMON, SLUG_SOS_HAND_BALM, SLUG_FACE_WASH],
  [SLUG_LIP_BALM_ORANGE_CINNAMON]: [SLUG_SOAP_ORANGE_CINNAMON, SLUG_FACE_WASH, SLUG_SOS_HAND_BALM],
  // Cocoa & vanilla lip balm pairs with the coconut sugar scrub and SOS hand balm
  [SLUG_LIP_BALM_COCOA_VANILLA]: [SLUG_COCONUT_SUGAR_SCRUB, SLUG_SOS_HAND_BALM],
  // Orange lip balm pairs with the orange scrub, orange & cinnamon soap, and SOS hand balm
  [SLUG_LIP_BALM_ORANGE]: [SLUG_ORANGE_SUGAR_SCRUB, SLUG_SOAP_ORANGE_CINNAMON, SLUG_SOS_HAND_BALM],
  // Herbal lip balm pairs with the herbal shampoo, herbal soap, and herbal shower gel
  [SLUG_LIP_BALM_HERBAL]: [SLUG_SHAMPOO_HERBAL, SLUG_SOAP_HERBAL, SLUG_SHOWER_GEL_HERBAL],
  // Herbal shampoo pairs with the herbal soap, herbal lip balm, and herbal shower gel
  [SLUG_SHAMPOO_HERBAL]: [SLUG_SOAP_HERBAL, SLUG_LIP_BALM_HERBAL, SLUG_SHOWER_GEL_HERBAL],
  // Herbal soap pairs with the herbal shampoo, herbal lip balm, and herbal shower gel
  [SLUG_SOAP_HERBAL]: [SLUG_SHAMPOO_HERBAL, SLUG_LIP_BALM_HERBAL, SLUG_SHOWER_GEL_HERBAL],
  // Lavender soap pairs with the 4+1 promo bundle, herbal lip balm, and herbal shower gel
  [SLUG_SOAP_LAVENDER]: [SLUG_SOAP_PROMO_4PLUS1, SLUG_LIP_BALM_HERBAL, SLUG_SHOWER_GEL_HERBAL],
  // Sandalwood soap pairs with the 4+1 promo bundle, sandalwood deo stick, and coconut sugar scrub
  [SLUG_SOAP_SANDALWOOD]: [SLUG_SOAP_PROMO_4PLUS1, SLUG_DEO_SANDALWOOD, SLUG_COCONUT_SUGAR_SCRUB],
  // Ilang ilang soap pairs with the herbal shampoo, herbal lip balm, and aloe vera gel
  [SLUG_SOAP_ILANG]: [SLUG_SHAMPOO_HERBAL, SLUG_LIP_BALM_HERBAL, SLUG_ALOE_VERA_GEL],
  // Sunny soap pairs with the 4+1 promo bundle, sunny shampoo, and citrus shower gel
  [SLUG_SOAP_SUNNY]: [SLUG_SOAP_PROMO_4PLUS1, SLUG_SHAMPOO_SUNNY, SLUG_SHOWER_GEL_SUNNY],
  // Sunny shampoo pairs with the sunny soap, rose water, and sunny (citrus) shower gel
  [SLUG_SHAMPOO_SUNNY]: [SLUG_SOAP_SUNNY, SLUG_ROSE_WATER, SLUG_SHOWER_GEL_SUNNY],
  // Bebcho soap pairs with the natural deo stick, SOS hand balm, and aloe vera gel
  [SLUG_SOAP_BEBCHO]: [SLUG_DEO_NATURAL, SLUG_SOS_HAND_BALM, SLUG_ALOE_VERA_GEL],
  // Tsveten soap pairs with the sunny shampoo, herbal lip balm, and orange sugar scrub
  [SLUG_SOAP_TSVETEN]: [SLUG_SHAMPOO_SUNNY, SLUG_LIP_BALM_HERBAL, SLUG_ORANGE_SUGAR_SCRUB],
  // Detox soap pairs with the detox shampoo bar, aloe vera gel, and coffee sugar scrub
  [SLUG_SOAP_DETOX]: [SLUG_SHAMPOO_BAR_DETOX, SLUG_ALOE_VERA_GEL, SLUG_COFFEE_SUGAR_SCRUB],
  // Sunny shampoo bar pairs with the sunny soap, citrus shower gel, and orange lip balm
  [SLUG_SHAMPOO_BAR_SUNNY]: [SLUG_SOAP_SUNNY, SLUG_SHOWER_GEL_SUNNY, SLUG_LIP_BALM_ORANGE],
  // Vitamint shampoo bar pairs with the herbal soap, face wash, and herbal lip balm
  [SLUG_SHAMPOO_BAR_VITAMINT]: [SLUG_SOAP_HERBAL, SLUG_FACE_WASH, SLUG_LIP_BALM_HERBAL],
  // Aloe shampoo bar pairs with aloe vera gel, rose water, and herbal lip balm (soothing theme)
  [SLUG_SHAMPOO_BAR_ALOE]: [SLUG_ALOE_VERA_GEL, SLUG_ROSE_WATER, SLUG_LIP_BALM_HERBAL],
  // Detox shampoo bar pairs with the detox soap, coffee sugar scrub, and face wash (clarifying theme)
  [SLUG_SHAMPOO_BAR_DETOX]: [SLUG_SOAP_DETOX, SLUG_COFFEE_SUGAR_SCRUB, SLUG_FACE_WASH],
  // Happyhair shampoos each pair with non-shampoo products
  [SLUG_HAPPYHAIR_NORMAL]: [SLUG_ROSE_WATER, SLUG_SOS_HAND_BALM, SLUG_COCONUT_SUGAR_SCRUB],
  [SLUG_HAPPYHAIR_OILY]: [SLUG_FACE_WASH, SLUG_ALOE_VERA_GEL, SLUG_ORANGE_SUGAR_SCRUB],
  [SLUG_HAPPYHAIR_DRY]: [SLUG_LIP_BALM_HERBAL, SLUG_SOS_HAND_BALM, SLUG_COCONUT_SUGAR_SCRUB],
  [SLUG_HAPPYHAIR_HAIRLOSS]: [SLUG_ROSE_WATER, SLUG_ALOE_VERA_GEL, SLUG_COFFEE_SUGAR_SCRUB],
  [SLUG_HAPPYHAIR_DANDRUFF]: [SLUG_FACE_WASH, SLUG_SOS_HAND_BALM, SLUG_ORANGE_SUGAR_SCRUB],
};

export async function getRelatedProducts(product: UiProduct, take = 4): Promise<UiProduct[]> {
  const overrideSlugs = RELATED_PRODUCT_OVERRIDES[product.slug];
  if (overrideSlugs) {
    const overridden = await getProductsBySlugs(overrideSlugs);
    if (overridden.length) return overridden;
  }
  if (!product.categorySlug) return [];
  try {
    const ps = await prisma.product.findMany({
      where: { slug: { not: product.slug }, categories: { some: { slug: product.categorySlug } } },
      include: PRODUCT_INCLUDE,
      take,
    });
    const products = ps.map(toUi);
    return products.length ? products : getStaticRelatedProducts(product, take);
  } catch {
    return getStaticRelatedProducts(product, take);
  }
}

export function sortProducts(products: UiProduct[], sort: string): UiProduct[] {
  const arr = [...products];
  if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
  if (sort === 'newest') arr.reverse();
  return arr;
}

export async function getCategoryBySlug(slug: string) {
  try {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { parent: { select: { slug: true, name: true } } },
    });
    return cat || getStaticCategoryBySlug(slug);
  } catch {
    return getStaticCategoryBySlug(slug);
  }
}

export async function getCategoryOptions(): Promise<{ id: string; name: string; parentName?: string }[]> {
  const cats = await prisma.category.findMany({ include: { parent: { select: { name: true } } }, orderBy: { name: 'asc' } });
  return cats.map((c) => ({ id: c.id, name: c.name, parentName: c.parent?.name }));
}
