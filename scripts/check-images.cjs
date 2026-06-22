const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({ select: { slug: true, images: true, name: true } })
  .then(r => {
    r.forEach(x => console.log(x.slug, '|', x.images));
    return p.$disconnect();
  })
  .catch(e => { console.error(e.message); return p.$disconnect(); });
