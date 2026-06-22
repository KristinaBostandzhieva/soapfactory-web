// Optimize the new product photos and set them on the matching products.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SRC = path.join('C:', 'Users', 'krist', 'Desktop', 'soap factory', 'website');
const OUT = path.join(__dirname, '..', 'public', 'uploads');

// [folder, file, product slug]
const map = [
  ['sapuni', 'bebcho-sapun.png', 'sapun-bebcho'],
  ['sapuni', 'bilkov-sapun.png', 'bilkov-sapun'],
  ['sapuni', 'detoks-sapun.png', 'sapun-detoks-s-aktiven-vaglen'],
  ['sapuni', 'ilang-sapun.png', 'sapun-ilang-ilang'],
  ['sapuni', 'lavandula-sapun.png', 'sapun-lavandula'],
  ['sapuni', 'portokal-i-kanela-sapun.png', 'sapun-portokal-i-kanela'],
  ['sapuni', 'sandalovo-durvo-sapun.png', 'sapun-sandalovo-darvo'],
  ['sapuni', 'slunchev-sapun.png', 'slanchev-sapun'],
  ['sapuni', 'tsveten-sapun.png', 'sapun-tsveten'],
  ['dush-gel', 'dush-gel-bilkov.png', 'bio-bilkov-dush-gel'],
  ['dush-gel', 'dush-gel-citrus.png', 'bio-dush-gel-tsitrus'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let ok = 0, fail = 0;
  for (const [folder, file, slug] of map) {
    const src = path.join(SRC, folder, file);
    if (!fs.existsSync(src)) { console.log('✗ missing file:', src); fail++; continue; }
    const prod = await prisma.product.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (!prod) { console.log('✗ no product for slug:', slug); fail++; continue; }

    const outName = `${slug}.webp`;
    const out = await sharp(fs.readFileSync(src)).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    fs.writeFileSync(path.join(OUT, outName), out);
    await prisma.product.update({ where: { id: prod.id }, data: { images: JSON.stringify(['/uploads/' + outName]) } });
    console.log(`✓ ${prod.name} → /uploads/${outName} (${(out.length / 1024).toFixed(0)} KB)`);
    ok++;
  }
  console.log(`\nDone: ${ok} applied, ${fail} failed.`);
  await prisma.$disconnect();
})();
