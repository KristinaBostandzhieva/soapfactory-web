'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizeCode } from '@/lib/discounts';
import { ORDER_STATUSES } from '@/lib/orders';

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: '', ю: 'yu', я: 'ya',
};

function slugify(s: string): string {
  return (
    s.toLowerCase().split('').map((c) => (TRANSLIT[c] ?? c)).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'produkt'
  );
}

async function ensureAdmin() {
  const a = await requireAdmin();
  if (!a) throw new Error('Unauthorized');
}

// Appends -2, -3, ... until `check` finds no row (or the only match is the
// row being edited, identified by excludeId).
async function uniqueSlug(
  check: (slug: string) => Promise<{ id: string } | null>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = base, i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await check(slug);
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i++}`;
  }
}

function parseProduct(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const price = parseFloat(String(formData.get('price') || '0')) || 0;
  const sku = String(formData.get('sku') || '').trim() || null;
  const shortDescription = String(formData.get('shortDescription') || '').trim() || null;
  const description = String(formData.get('description') || '').trim() || null;
  const nameEn = String(formData.get('nameEn') || '').trim() || null;
  const shortDescriptionEn = String(formData.get('shortDescriptionEn') || '').trim() || null;
  const descriptionEn = String(formData.get('descriptionEn') || '').trim() || null;
  const weight = String(formData.get('weight') || '').trim() || null;
  const imageUrl = String(formData.get('imageUrl') || '').trim();
  const imageUrl2 = String(formData.get('imageUrl2') || '').trim();
  const images = [imageUrl, imageUrl2].filter(Boolean);
  const hoverImage = String(formData.get('hoverImage') || '').trim() || null;
  const categoryId = String(formData.get('categoryId') || '').trim();
  const inStock = formData.get('inStock') === 'on';
  const featured = formData.get('featured') === 'on';
  const slugInput = String(formData.get('slug') || '').trim();
  const stockRaw = String(formData.get('stockQty') || '').trim();
  const stockQty = stockRaw === '' ? null : Math.max(0, parseInt(stockRaw, 10) || 0);
  return { name, price, sku, shortDescription, description, nameEn, shortDescriptionEn, descriptionEn, weight, images, hoverImage, categoryId, inStock, featured, slugInput, stockQty };
}

function revalidateProducts() {
  revalidatePath('/admin/produkti'); revalidatePath('/'); revalidatePath('/shop');
}

export async function createProduct(formData: FormData) {
  await ensureAdmin();
  const d = parseProduct(formData);
  if (!d.name) throw new Error('Името е задължително.');
  const slug = await uniqueSlug(
    async (s) => prisma.product.findUnique({ where: { slug: s } }),
    d.slugInput ? slugify(d.slugInput) : slugify(d.name),
  );

  await prisma.product.create({
    data: {
      name: d.name, slug, price: d.price, sku: d.sku,
      shortDescription: d.shortDescription, description: d.description, weight: d.weight,
      nameEn: d.nameEn, shortDescriptionEn: d.shortDescriptionEn, descriptionEn: d.descriptionEn,
      inStock: d.inStock, featured: d.featured, stockQty: d.stockQty,
      images: JSON.stringify(d.images),
      hoverImage: d.hoverImage,
      categories: d.categoryId ? { connect: { id: d.categoryId } } : undefined,
    },
  });

  revalidateProducts();
  redirect('/admin/produkti');
}

export async function updateProduct(id: string, formData: FormData) {
  await ensureAdmin();
  const d = parseProduct(formData);
  if (!d.name) throw new Error('Името е задължително.');
  const slug = await uniqueSlug(
    async (s) => prisma.product.findUnique({ where: { slug: s } }),
    d.slugInput ? slugify(d.slugInput) : slugify(d.name),
    id,
  );

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name, slug, price: d.price, sku: d.sku,
      shortDescription: d.shortDescription, description: d.description, weight: d.weight,
      nameEn: d.nameEn, shortDescriptionEn: d.shortDescriptionEn, descriptionEn: d.descriptionEn,
      inStock: d.inStock, featured: d.featured, stockQty: d.stockQty,
      images: JSON.stringify(d.images),
      hoverImage: d.hoverImage,
      categories: d.categoryId ? { set: [{ id: d.categoryId }] } : { set: [] },
    },
  });

  revalidateProducts();
  revalidatePath(`/produkt/${slug}`);
  redirect('/admin/produkti');
}

export async function deleteProduct(id: string) {
  await ensureAdmin();
  await prisma.product.delete({ where: { id } });
  revalidateProducts();
}

// Core status transition (no revalidation) — shared by the single and bulk
// actions. Returns true if the cancel→restock path ran.
async function setOrderStatusCore(id: string, status: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, items: { select: { productId: true, quantity: true } } },
  });
  if (!order) throw new Error('Поръчката не е намерена.');

  await prisma.order.update({ where: { id }, data: { status } });

  // Return items to stock when an order becomes cancelled. Guarded on the
  // transition (was-not-cancelled → cancelled) so re-saving a cancelled order
  // never restocks twice. `increment` leaves untracked stock (stockQty = null,
  // i.e. "unlimited") untouched — it stays null — mirroring how order creation
  // only decrements tracked products.
  if (status === 'cancelled' && order.status !== 'cancelled') {
    await Promise.all(
      order.items
        .filter((it) => it.productId)
        .map((it) =>
          prisma.product
            .update({ where: { id: it.productId as string }, data: { stockQty: { increment: it.quantity } } })
            .catch(() => {}) // product may have been deleted since the order — ignore
        )
    );
    return true;
  }
  return false;
}

function revalidateOrder(id: string) {
  revalidatePath('/admin/porachki');
  revalidatePath(`/admin/porachki/${id}`);
  revalidatePath('/admin');
}

export async function updateOrderStatus(id: string, status: string) {
  await ensureAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error('Невалиден статус.');
  const restocked = await setOrderStatusCore(id, status);
  if (restocked) {
    revalidatePath('/admin/produkti');
    revalidatePath('/');
    revalidatePath('/shop');
  }
  revalidateOrder(id);
}

// Bulk status change from the orders list. Reads all checked `ids` from the
// form; the clicked button supplies `status`. Reuses the same transition
// logic as the single-order action (incl. cancel→restock).
export async function bulkUpdateOrderStatus(formData: FormData) {
  await ensureAdmin();
  const status = String(formData.get('status') || '');
  if (!ORDER_STATUSES.includes(status)) throw new Error('Невалиден статус.');
  const ids = formData.getAll('ids').map(String).filter(Boolean);
  if (ids.length === 0) return; // nothing selected — no-op

  let restockedAny = false;
  for (const id of ids) {
    try {
      if (await setOrderStatusCore(id, status)) restockedAny = true;
    } catch { /* an order may have been deleted meanwhile — skip it */ }
  }

  if (restockedAny) {
    revalidatePath('/admin/produkti');
    revalidatePath('/');
    revalidatePath('/shop');
  }
  revalidatePath('/admin/porachki');
  revalidatePath('/admin');
}

// Edit customer / delivery details of an order (typo in address, wrong phone…).
export async function updateOrderDetails(id: string, formData: FormData) {
  await ensureAdmin();
  const customerName = String(formData.get('customerName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const city = String(formData.get('city') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const postcode = String(formData.get('postcode') || '').trim() || null;
  const notes = String(formData.get('notes') || '').trim() || null;
  if (!customerName || !email || !phone || !city || !address) {
    throw new Error('Име, имейл, телефон, град и адрес са задължителни.');
  }
  await prisma.order.update({
    where: { id },
    data: { customerName, email, phone, city, address, postcode, notes },
  });
  revalidateOrder(id);
}

/**
 * Edit item quantities of an order (0 removes the item; at least one must
 * remain). Recomputes subtotal and total, and adjusts tracked product stock
 * by the delta — unless the order is cancelled (its stock was already
 * returned, so quantity edits must not touch inventory again).
 */
export async function updateOrderItems(id: string, formData: FormData) {
  await ensureAdmin();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { id: true, stockQty: true } } } } },
  });
  if (!order) throw new Error('Поръчката не е намерена.');

  const changes = order.items.map((it) => {
    const raw = String(formData.get(`qty-${it.id}`) ?? '').trim();
    const parsed = parseInt(raw, 10);
    const newQty = raw === '' || isNaN(parsed) ? it.quantity : Math.max(0, parsed);
    return { item: it, newQty };
  });

  if (changes.every((c) => c.newQty === 0)) {
    throw new Error('Поръчката трябва да съдържа поне един артикул. За отказ използвай статус „Отказана“.');
  }

  const adjustStock = order.status !== 'cancelled';
  for (const { item, newQty } of changes) {
    const delta = newQty - item.quantity; // >0 more sold, <0 returned
    if (delta === 0) continue;

    if (newQty === 0) {
      await prisma.orderItem.delete({ where: { id: item.id } });
    } else {
      await prisma.orderItem.update({ where: { id: item.id }, data: { quantity: newQty } });
    }

    if (adjustStock && item.product?.stockQty != null) {
      const next = Math.max(0, item.product.stockQty - delta);
      await prisma.product.update({ where: { id: item.product.id }, data: { stockQty: next } }).catch(() => {});
    }
  }

  // Recompute totals from the surviving items (same formula as checkout).
  const subtotal = changes.filter((c) => c.newQty > 0).reduce((s, c) => s + c.item.price * c.newQty, 0);
  const total = Math.max(0, subtotal - order.discountAmount) + order.shipping;
  await prisma.order.update({ where: { id }, data: { subtotal, total } });

  revalidateOrder(id);
  revalidatePath('/admin/produkti');
}

// Mark an order paid / unpaid (e.g. when the cash-on-delivery money is received).
export async function togglePaymentStatus(id: string) {
  await ensureAdmin();
  const o = await prisma.order.findUnique({ where: { id }, select: { paymentStatus: true } });
  if (o) {
    await prisma.order.update({ where: { id }, data: { paymentStatus: o.paymentStatus === 'paid' ? 'pending' : 'paid' } });
  }
  revalidatePath('/admin/porachki');
  revalidatePath(`/admin/porachki/${id}`);
  revalidatePath('/admin'); // dashboard revenue
}

/**
 * Generate a shipping label for an order.
 * MOCK for now — produces a fake tracking number. Once courier API keys are
 * added, this calls the real Econt/Speedy/BoxNow API to create the shipment.
 */
export async function generateShippingLabel(id: string) {
  await ensureAdmin();
  const order = await prisma.order.findUnique({ where: { id }, select: { courier: true, trackingNumber: true } });
  if (!order) throw new Error('Поръчката не е намерена.');
  if (order.trackingNumber) return; // already has one

  const prefix = order.courier === 'speedy' ? 'SP' : order.courier === 'boxnow' ? 'BN' : 'EC';
  const tracking = `${prefix}${Date.now().toString().slice(-9)}`;

  await prisma.order.update({
    where: { id },
    data: {
      trackingNumber: tracking,
      labelUrl: `/api/labels/${id}`, // placeholder; real label PDF comes from courier API
      status: 'processing',
    },
  });
  revalidatePath(`/admin/porachki/${id}`);
  revalidatePath('/admin/porachki');
}

// ── Promo codes ───────────────────────────────────────────────────────
export async function createDiscount(formData: FormData) {
  await ensureAdmin();
  const code = normalizeCode(String(formData.get('code') || ''));
  if (!code) throw new Error('Кодът е задължителен.');
  const type = String(formData.get('type')) === 'fixed' ? 'fixed' : 'percent';
  const value = parseFloat(String(formData.get('value') || '0')) || 0;
  if (value <= 0) throw new Error('Стойността трябва да е по-голяма от 0.');
  if (type === 'percent' && value > 100) throw new Error('Процентът не може да е над 100.');

  const minRaw = String(formData.get('minSubtotal') || '').trim();
  const minSubtotal = minRaw === '' ? null : Math.max(0, parseFloat(minRaw) || 0);
  const maxRaw = String(formData.get('maxUses') || '').trim();
  const maxUses = maxRaw === '' ? null : Math.max(1, parseInt(maxRaw, 10) || 1);
  const expRaw = String(formData.get('expiresAt') || '').trim();
  const expiresAt = expRaw === '' ? null : new Date(expRaw + 'T23:59:59');

  const exists = await prisma.discount.findUnique({ where: { code } });
  if (exists) throw new Error('Този код вече съществува.');

  await prisma.discount.create({ data: { code, type, value, minSubtotal, maxUses, expiresAt, active: true } });
  revalidatePath('/admin/promokodove');
}

export async function toggleDiscount(id: string) {
  await ensureAdmin();
  const d = await prisma.discount.findUnique({ where: { id } });
  if (d) await prisma.discount.update({ where: { id }, data: { active: !d.active } });
  revalidatePath('/admin/promokodove');
}

export async function deleteDiscount(id: string) {
  await ensureAdmin();
  await prisma.discount.delete({ where: { id } });
  revalidatePath('/admin/promokodove');
}

// ── Reviews moderation ────────────────────────────────────────────────
async function revalidateReview(id: string) {
  const r = await prisma.review.findUnique({ where: { id }, select: { product: { select: { slug: true } } } });
  revalidatePath('/admin/otzivi');
  revalidatePath('/'); revalidatePath('/shop');
  if (r?.product?.slug) revalidatePath(`/produkt/${r.product.slug}`);
}

export async function approveReview(id: string) {
  await ensureAdmin();
  await revalidateReview(id);
  await prisma.review.update({ where: { id }, data: { approved: true } });
}

export async function deleteReview(id: string) {
  await ensureAdmin();
  await revalidateReview(id);
  await prisma.review.delete({ where: { id } });
}

// ── Blog posts ────────────────────────────────────────────────────────
// If the author wrote plain text (no HTML), turn blank-line paragraphs into <p>.
function processContent(raw: string): string {
  const c = (raw || '').trim();
  if (!c) return '';
  if (/<[a-z][\s\S]*>/i.test(c)) return c;
  return c.split(/\n{2,}/).map((par) => `<p>${par.trim().replace(/\n/g, '<br/>')}</p>`).join('\n');
}

function parsePost(formData: FormData) {
  return {
    title: String(formData.get('title') || '').trim(),
    slugInput: String(formData.get('slug') || '').trim(),
    excerpt: String(formData.get('excerpt') || '').trim() || null,
    coverImage: String(formData.get('coverImage') || '').trim() || null,
    content: processContent(String(formData.get('content') || '')),
    titleEn: String(formData.get('titleEn') || '').trim() || null,
    excerptEn: String(formData.get('excerptEn') || '').trim() || null,
    contentEn: processContent(String(formData.get('contentEn') || '')) || null,
    published: formData.get('published') === 'on',
  };
}

function revalidatePosts() {
  revalidatePath('/admin/blog'); revalidatePath('/polezno'); revalidatePath('/');
}

export async function createPost(formData: FormData) {
  await ensureAdmin();
  const d = parsePost(formData);
  if (!d.title) throw new Error('Заглавието е задължително.');
  const slug = await uniqueSlug(
    async (s) => prisma.post.findUnique({ where: { slug: s } }),
    d.slugInput ? slugify(d.slugInput) : slugify(d.title),
  );
  await prisma.post.create({ data: { title: d.title, slug, excerpt: d.excerpt, coverImage: d.coverImage, content: d.content, titleEn: d.titleEn, excerptEn: d.excerptEn, contentEn: d.contentEn, published: d.published } });
  revalidatePosts();
  redirect('/admin/blog');
}

export async function updatePost(id: string, formData: FormData) {
  await ensureAdmin();
  const d = parsePost(formData);
  if (!d.title) throw new Error('Заглавието е задължително.');
  const slug = await uniqueSlug(
    async (s) => prisma.post.findUnique({ where: { slug: s } }),
    d.slugInput ? slugify(d.slugInput) : slugify(d.title),
    id,
  );
  await prisma.post.update({ where: { id }, data: { title: d.title, slug, excerpt: d.excerpt, coverImage: d.coverImage, content: d.content, titleEn: d.titleEn, excerptEn: d.excerptEn, contentEn: d.contentEn, published: d.published } });
  revalidatePosts();
  revalidatePath(`/polezno/${slug}`);
  redirect('/admin/blog');
}

export async function deletePost(id: string) {
  await ensureAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePosts();
}

export async function togglePostPublished(id: string) {
  await ensureAdmin();
  const p = await prisma.post.findUnique({ where: { id } });
  if (p) await prisma.post.update({ where: { id }, data: { published: !p.published } });
  revalidatePosts();
}

// ── Categories ────────────────────────────────────────────────────────
function revalidateCategories() {
  revalidatePath('/admin/kategorii'); revalidatePath('/'); revalidatePath('/shop');
}

export async function createCategory(formData: FormData) {
  await ensureAdmin();
  const name = String(formData.get('name') || '').trim();
  if (!name) throw new Error('Името е задължително.');
  const nameEn = String(formData.get('nameEn') || '').trim() || null;
  const parentId = String(formData.get('parentId') || '').trim() || null;
  const slug = await uniqueSlug(async (s) => prisma.category.findUnique({ where: { slug: s } }), slugify(name));
  await prisma.category.create({ data: { name, nameEn, slug, parentId } });
  revalidateCategories();
}

export async function renameCategory(id: string, formData: FormData) {
  await ensureAdmin();
  const name = String(formData.get('name') || '').trim();
  if (!name) throw new Error('Името е задължително.');
  const nameEn = String(formData.get('nameEn') || '').trim() || null;
  await prisma.category.update({ where: { id }, data: { name, nameEn } });
  revalidateCategories();
}

export async function deleteCategory(id: string) {
  await ensureAdmin();
  await prisma.category.delete({ where: { id } });
  revalidateCategories();
}

// Attach an existing product to a category (many-to-many connect).
export async function addProductToCategory(categoryId: string, formData: FormData) {
  await ensureAdmin();
  const productId = String(formData.get('productId') || '').trim();
  if (!productId) throw new Error('Избери продукт.');
  await prisma.category.update({
    where: { id: categoryId },
    data: { products: { connect: { id: productId } } },
  });
  revalidateCategories();
}

export async function removeProductFromCategory(categoryId: string, productId: string) {
  await ensureAdmin();
  await prisma.category.update({
    where: { id: categoryId },
    data: { products: { disconnect: { id: productId } } },
  });
  revalidateCategories();
}
