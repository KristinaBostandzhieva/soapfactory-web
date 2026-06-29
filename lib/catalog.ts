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
  name: string;
  slug: string;
  price: number;
  priceMax?: number;
  image?: string;
  images: string[];
  inStock: boolean;
  shortDescription?: string | null;
  description?: string | null;
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
  createdAt: Date;
};

const PRODUCT_INCLUDE = {
  categories: { select: { slug: true, name: true, parentId: true } },
  reviews: { where: { approved: true }, select: { rating: true } },
} as const;

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  stockQty: number | null;
  shortDescription: string | null;
  description: string | null;
  weight: string | null;
  images: string;
  categories: { slug: string; name: string; parentId: string | null }[];
  reviews: { rating: number }[];
};

export function firstImage(images: string): string | undefined {
  try {
    return (JSON.parse(images || '[]')[0] as string) || undefined;
  } catch {
    return undefined;
  }
}

function toUi(p: DbProduct): UiProduct {
  let images: string[] = [];
  try {
    images = JSON.parse(p.images || '[]');
  } catch {}

  const image = images[0];
  const cat = p.categories.find((c) => !c.parentId) || p.categories[0];
  const inStock = p.stockQty != null ? p.stockQty > 0 : p.inStock;
  const reviewCount = p.reviews.length;
  const rating = reviewCount ? p.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : undefined;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image,
    images,
    inStock,
    shortDescription: p.shortDescription,
    description: p.description,
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
      select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

export async function getProductsBySlugs(slugs: string[]): Promise<UiProduct[]> {
  try {
    const ps = await prisma.product.findMany({ where: { slug: { in: slugs } }, include: PRODUCT_INCLUDE });
    const found = slugs.map((s) => ps.find((p) => p.slug === s)).filter(Boolean).map((p) => toUi(p!));
    return found.length ? found : getStaticProductsBySlugs(slugs);
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
      const products = ps.map(toUi);
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
    const products = ps.map(toUi);
    return products.length ? products : getStaticProductsInCategory(catSlug);
  } catch {
    return getStaticProductsInCategory(catSlug);
  }
}

export async function getRelatedProducts(product: UiProduct, take = 4): Promise<UiProduct[]> {
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
