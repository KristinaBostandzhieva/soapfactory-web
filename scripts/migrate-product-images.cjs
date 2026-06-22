// Downloads all external product images from soapfactory.bg and updates DB to local URLs.
// Run once before go-live: node scripts/migrate-product-images.cjs
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const p = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Cache: remote URL → local path (so duplicate images across products share one file)
const cache = new Map();

async function downloadImage(url) {
  if (cache.has(url)) return cache.get(url);
  const encoded = url.replace(/[^\x00-\x7F]/g, ch => encodeURIComponent(ch));
  const res = await fetch(encoded, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; soapfactory-migration/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(encoded).pathname).toLowerCase() || '.jpg';
  const filename = `prod-${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf);
  const local = `/uploads/${filename}`;
  cache.set(url, local);
  return local;
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const products = await p.product.findMany({ select: { id: true, slug: true, images: true } });
  const toMigrate = products.filter(x => {
    const raw = typeof x.images === 'string' ? x.images : JSON.stringify(x.images ?? '[]');
    return raw && raw.includes('soapfactory.bg');
  });

  console.log(`Found ${toMigrate.length} products with external images.\n`);

  let prodOk = 0, prodFail = 0, imgOk = 0, imgFail = 0;

  for (const product of toMigrate) {
    const raw = typeof product.images === 'string' ? product.images : JSON.stringify(product.images ?? '[]');
    let urls;
    try { urls = JSON.parse(raw); } catch { urls = []; }

    const updated = [];
    let changed = false;
    for (const url of urls) {
      if (typeof url === 'string' && url.startsWith('http')) {
        try {
          const local = await downloadImage(url);
          updated.push(local);
          imgOk++;
          changed = true;
        } catch (err) {
          console.error(`  ✗ ${product.slug} — ${url.split('/').pop()}: ${err.message}`);
          updated.push(url); // keep original if download fails
          imgFail++;
        }
      } else {
        updated.push(url);
      }
    }

    if (changed) {
      await p.product.update({
        where: { id: product.id },
        data: { images: JSON.stringify(updated) },
      });
      console.log(`✓ ${product.slug} (${updated.length} image${updated.length !== 1 ? 's' : ''})`);
      prodOk++;
    } else {
      prodFail++;
    }
  }

  console.log(`\nDone. ${prodOk} products updated, ${imgOk} images downloaded, ${imgFail} failed.`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
