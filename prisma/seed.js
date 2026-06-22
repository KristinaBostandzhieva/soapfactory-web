// Seeds the database from the real catalog extracted from soapfactory.bg
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cats = require('../data/sf_categories.json');
const products = require('../data/catalog.json');

const isCyr = (s) => /[а-яА-Я]/.test(s || '');
const strip = (s) => (s || '').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim();

async function main() {
  // Idempotent: clear product/category data (keep users/orders)
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1) Bulgarian categories (skip "Без категория")
  const bgCats = cats.filter((c) => isCyr(c.name) && c.slug !== 'bez-kategoriya');
  const wooToId = {};
  for (const c of bgCats) {
    const created = await prisma.category.create({
      data: { wooId: c.id, name: strip(c.name), slug: c.slug },
    });
    wooToId[c.id] = created.id;
  }
  // set parent relationships
  for (const c of bgCats) {
    if (c.parent && wooToId[c.parent]) {
      await prisma.category.update({ where: { wooId: c.id }, data: { parentId: wooToId[c.parent] } });
    }
  }

  // name -> category id
  const nameToCat = {};
  (await prisma.category.findMany()).forEach((c) => (nameToCat[c.name] = c.id));

  // 2) Products
  const seen = new Set();
  let n = 0;
  for (const p of products) {
    let slug = p.slug || `product-${p.sku || n}`;
    if (seen.has(slug)) slug = `${slug}-${n}`;
    seen.add(slug);

    const catIds = (p.categories || [])
      .map((name) => nameToCat[strip(name)])
      .filter(Boolean);

    await prisma.product.create({
      data: {
        sku: p.sku || null,
        name: strip(p.name),
        slug,
        price: p.price || 0,
        currency: p.currency || 'EUR',
        onSale: !!p.onSale,
        inStock: p.inStock !== false,
        shortDescription: p.shortDescription || null,
        description: p.description || null,
        weight: p.weight || null,
        images: JSON.stringify(p.images || []),
        featured: n < 8,
        categories: catIds.length ? { connect: catIds.map((id) => ({ id })) } : undefined,
      },
    });
    n++;
  }

  const [pc, cc] = [await prisma.product.count(), await prisma.category.count()];
  console.log(`✅ Seeded ${cc} categories and ${pc} products.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
