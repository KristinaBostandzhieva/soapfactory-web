// Downloads all external blog cover images from soapfactory.bg and updates DB to local URLs.
// Run once before go-live: node scripts/migrate-blog-images.cjs
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const p = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

async function downloadImage(url) {
  // Encode non-ASCII characters in the URL path
  const encoded = url.replace(/[^\x00-\x7F]/g, ch => encodeURIComponent(ch));
  const res = await fetch(encoded, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; soapfactory-migration/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(encoded).pathname).toLowerCase() || '.jpg';
  const filename = `blog-${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buf);
  return `/uploads/${filename}`;
}

async function main() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const posts = await p.post.findMany({
    select: { id: true, slug: true, coverImage: true, content: true },
  });

  const toMigrate = posts.filter(x => x.coverImage && x.coverImage.startsWith('http'));
  console.log(`Found ${toMigrate.length} posts with external cover images.\n`);

  let ok = 0, fail = 0;
  for (const post of toMigrate) {
    try {
      const localUrl = await downloadImage(post.coverImage);
      await p.post.update({ where: { id: post.id }, data: { coverImage: localUrl } });
      console.log(`✓ ${post.slug}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${post.slug}: ${err.message}`);
      fail++;
    }
  }

  // Also fix embedded soapfactory.bg image URLs in post content
  const postsWithEmbedded = posts.filter(x => x.content && x.content.includes('soapfactory.bg'));
  console.log(`\nFound ${postsWithEmbedded.length} posts with embedded soapfactory.bg images in content.`);

  for (const post of postsWithEmbedded) {
    const imgUrls = [...post.content.matchAll(/https?:\/\/soapfactory\.bg\/wp-content\/uploads\/[^\s"')>]+/g)].map(m => m[0]);
    const unique = [...new Set(imgUrls)];
    let content = post.content;
    for (const url of unique) {
      try {
        const localUrl = await downloadImage(url);
        content = content.split(url).join(localUrl);
        console.log(`  ✓ embedded: ${url.split('/').pop()}`);
      } catch (err) {
        console.error(`  ✗ embedded: ${url.split('/').pop()} — ${err.message}`);
      }
    }
    if (content !== post.content) {
      await p.post.update({ where: { id: post.id }, data: { content } });
    }
  }

  console.log(`\nDone. ${ok} cover images migrated, ${fail} failed.`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
