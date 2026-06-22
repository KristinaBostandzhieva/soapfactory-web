// One-time import of WordPress blog posts from data/wp-posts.json into the Post table.
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();

function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '…').replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—');
}
const stripTags = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Remove WordPress page-builder (WPBakery / Woodmart) shortcodes left in the content.
function cleanContent(html) {
  return (html || '')
    .replace(/\[\/?(?:vc_|woodmart_|mfn_|trx_)[a-z0-9_]*[^\]]*\]/gi, '')
    .replace(/ /g, ' ')
    .replace(/(\r?\n){3,}/g, '\n\n')
    .trim();
}

(async () => {
  const posts = require(path.join('..', 'data', 'wp-posts.json'));
  let imported = 0;
  for (const p of posts) {
    const title = decodeEntities(p.title?.rendered || '').trim();
    const slug = p.slug;
    const content = cleanContent(p.content?.rendered || '');
    const excerpt = decodeEntities(stripTags(p.excerpt?.rendered || '')).slice(0, 260);
    const media = p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0];
    const coverImage = media?.source_url || null;
    const publishedAt = p.date ? new Date(p.date) : new Date();
    if (!title || !slug || !content) { console.log('  skipped (incomplete):', slug); continue; }

    await prisma.post.upsert({
      where: { wpId: p.id },
      create: { wpId: p.id, title, slug, excerpt, content, coverImage, published: true, publishedAt },
      update: { title, slug, excerpt, content, coverImage, publishedAt },
    });
    imported++;
  }
  console.log(`✓ Imported/updated ${imported} blog posts.`);
  await prisma.$disconnect();
})();
