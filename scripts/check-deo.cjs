const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({
  where: { categories: { some: { slug: 'deo-stikove' } } },
  select: { name: true, slug: true, images: true }
}).then(r => { console.log(JSON.stringify(r, null, 2)); p.$disconnect(); });
