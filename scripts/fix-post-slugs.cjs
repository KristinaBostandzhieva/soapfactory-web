// One-off fix: Post.slug values left over from the WordPress migration are
// literal percent-encoded UTF-8 bytes (e.g. "%d0%b7%d0%b0..."), which never
// match the decoded Cyrillic route params Next.js hands to
// app/polezno/[slug]/page.tsx — every such post 404s ("Статията не е
// намерена"). Decode each one back to Cyrillic and transliterate it to a
// Latin slug, matching the convention already used for the other posts and
// in app/admin/actions.ts. Run with: node scripts/fix-post-slugs.cjs
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: '', ю: 'yu', я: 'ya',
};

function slugify(s) {
  return (
    s.toLowerCase().split('').map((c) => (TRANSLIT[c] ?? c)).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  );
}

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, slug: true } });
  const encoded = posts.filter((p) => /%[0-9a-fA-F]{2}/.test(p.slug));
  const taken = new Set(posts.map((p) => p.slug));

  console.log(`Found ${encoded.length} post(s) with percent-encoded slugs.\n`);

  const rows = [];
  for (const p of encoded) {
    const decoded = decodeURIComponent(p.slug);
    const base = slugify(decoded) || 'statia';
    let candidate = base;
    let i = 2;
    while (taken.has(candidate)) {
      candidate = `${base}-${i}`;
      i++;
    }
    taken.add(candidate);

    await prisma.post.update({ where: { id: p.id }, data: { slug: candidate } });
    rows.push({ old: p.slug, new: candidate });
  }

  console.log('old slug -> new slug');
  console.log('--------------------');
  for (const r of rows) {
    console.log(`${r.old}\n  -> ${r.new}\n`);
  }
  console.log(`Updated ${rows.length} post(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
