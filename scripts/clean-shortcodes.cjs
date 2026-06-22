// One-off cleanup: strip leftover WordPress Visual Composer/WoodMart [vc_*]
// shortcode markup and decode numeric HTML entities from Product.description
// and Post.content. Run with: node scripts/clean-shortcodes.cjs
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function clean(text) {
  let out = text;
  out = out.replace(/\[\/?vc_[^\]]*\]/g, ''); // complete [vc_...] / [/vc_...] tags
  out = out.replace(/\[\/?vc_[^\]]*$/, ''); // dangling/truncated tag at end of string
  out = out.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
  return out;
}

const matchFilter = (field) => ({
  OR: [{ [field]: { contains: 'vc_row' } }, { [field]: { contains: 'accent_color' } }],
});

async function countMatches() {
  const products = await prisma.product.count({ where: matchFilter('description') });
  const posts = await prisma.post.count({ where: matchFilter('content') });
  return { products, posts };
}

async function main() {
  console.log('Before:', await countMatches());

  const products = await prisma.product.findMany({
    where: matchFilter('description'),
    select: { id: true, slug: true, description: true },
  });

  let updatedProducts = 0;
  for (const p of products) {
    const stripped = clean(p.description);
    if (stripped !== p.description) {
      const final = stripped.trim();
      await prisma.product.update({
        where: { id: p.id },
        data: { description: final === '' ? null : final },
      });
      updatedProducts++;
      console.log(`\n[product] ${p.slug}`);
      console.log('  before:', JSON.stringify(p.description.slice(0, 90)));
      console.log('  after :', JSON.stringify(final.slice(0, 90)));
    }
  }

  const posts = await prisma.post.findMany({
    where: matchFilter('content'),
    select: { id: true, slug: true, content: true },
  });

  let updatedPosts = 0;
  for (const post of posts) {
    const stripped = clean(post.content);
    if (stripped !== post.content) {
      const final = stripped.trim();
      await prisma.post.update({ where: { id: post.id }, data: { content: final } });
      updatedPosts++;
      console.log(`\n[post] ${post.slug}`);
      console.log('  before:', JSON.stringify(post.content.slice(0, 90)));
      console.log('  after :', JSON.stringify(final.slice(0, 90)));
    } else {
      console.log(
        `\n[post] ${post.slug}: no [vc_*] brackets or numeric entities found ` +
          `(matched via 'vc_row' as an HTML class name on wrapper <div>s — not shortcode syntax). Skipped.`
      );
    }
  }

  console.log(`\nUpdated ${updatedProducts} product(s), ${updatedPosts} post(s).`);
  console.log('After:', await countMatches());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
