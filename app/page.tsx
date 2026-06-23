import HomeView from '@/components/HomeView';
import type { UiProduct } from '@/lib/catalog';
import { getFeaturedProducts, getProductsInCategory } from '@/lib/catalog';
import { getRecentPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

const fallbackProducts: UiProduct[] = [
  { id: 'soap-1', name: 'Слънчев сапун', slug: 'slanchev-sapun', price: 3.49, image: '/images/sapuni/slunchev-sapun.png', images: ['/images/sapuni/slunchev-sapun.png'], inStock: true },
  { id: 'soap-2', name: 'Билков сапун', slug: 'bilkov-sapun', price: 3.49, image: '/images/sapuni/bilkov-sapun.png', images: ['/images/sapuni/bilkov-sapun.png'], inStock: true },
  { id: 'soap-3', name: 'Сапун Лавандула', slug: 'sapun-lavandula', price: 3.49, image: '/images/sapuni/lavandula-sapun.png', images: ['/images/sapuni/lavandula-sapun.png'], inStock: true },
  { id: 'soap-4', name: 'Сапун Портокал и канела', slug: 'sapun-portokal-i-kanela', price: 3.49, image: '/images/sapuni/portokal-i-kanela-sapun.png', images: ['/images/sapuni/portokal-i-kanela-sapun.png'], inStock: true },
  { id: 'deo-1', name: 'Део стик Лайм и бергамот', slug: 'deo-laim-bergamot', price: 7.99, image: '/images/deos/lime-deo.png', images: ['/images/deos/lime-deo.png'], inStock: true },
  { id: 'deo-2', name: 'Део стик Сандалово дърво', slug: 'deo-sandalovo', price: 7.99, image: '/images/deos/sandal.png', images: ['/images/deos/sandal.png'], inStock: true },
  { id: 'deo-3', name: 'Део стик Ванилия и лайм', slug: 'deo-vanilia-laim', price: 7.99, image: '/images/deos/vanilla-lime-white-background.png', images: ['/images/deos/vanilla-lime-white-background.png'], inStock: true },
  { id: 'hair-1', name: 'Шампоаново блокче Детокс', slug: 'blokche-detoks', price: 8.99, image: '/images/new4.webp', images: ['/images/new4.webp'], inStock: true },
  { id: 'hair-2', name: 'Шампоаново блокче Алое', slug: 'blokche-aloe', price: 8.99, image: '/images/new2.jpg', images: ['/images/new2.jpg'], inStock: true },
  { id: 'hair-3', name: 'Шампоаново блокче Лавандула', slug: 'blokche-lavandula', price: 8.99, image: '/images/new3.jpg', images: ['/images/new3.jpg'], inStock: true },
  { id: 'velvet-1', name: 'BAKUCHIOL Lift Regeneration Power Serum', slug: 'bakuchiol-lift-regeneration-power-serum', price: 18.99, image: '/images/fscr-care/bakuchiol-serum.png', images: ['/images/fscr-care/bakuchiol-serum.png'], inStock: true },
  { id: 'velvet-2', name: 'BAKUCHIOL Lift Regeneration Power Cream', slug: 'bakuchiol-lift-regeneration-power-cream', price: 19.99, image: '/images/fscr-care/bakuchiol.png', images: ['/images/fscr-care/bakuchiol.png'], inStock: true },
  { id: 'velvet-3', name: 'VITAMIN C Advanced Rejuvenation Serum', slug: 'vitamin-c-advanced-rejuvenation-serum', price: 29.95, image: '/images/fscr-care/vit c serum.png', images: ['/images/fscr-care/vit c serum.png'], inStock: true },
];

export default async function HomePage() {
  let featured: UiProduct[];
  let soaps: UiProduct[];
  let deo: UiProduct[];
  let blocks: UiProduct[];
  let velvet: UiProduct[];
  let recentPosts: Awaited<ReturnType<typeof getRecentPosts>>;

  try {
    [featured, soaps, deo, blocks, velvet, recentPosts] = await Promise.all([
      getFeaturedProducts(8),
      getProductsInCategory('bio-sapuni'),
      getProductsInCategory('deo-stikove'),
      getProductsInCategory('shampoanovi-blokcheta'),
      getProductsInCategory('seria-velvet'),
      getRecentPosts(3),
    ]);
  } catch {
    featured = fallbackProducts.slice(0, 8);
    soaps = fallbackProducts.filter((p) => p.id.startsWith('soap-'));
    deo = fallbackProducts.filter((p) => p.id.startsWith('deo-'));
    blocks = fallbackProducts.filter((p) => p.id.startsWith('hair-'));
    velvet = fallbackProducts.filter((p) => p.id.startsWith('velvet-'));
    recentPosts = [];
  }

  return (
    <HomeView
      newProducts={featured.slice(0, 4)}
      bestSellers={soaps.slice(0, 4)}
      bioSoaps={soaps.slice(4, 8)}
      deoSticks={deo.slice(0, 3)}
      shampooBlocks={blocks.slice(0, 4)}
      velvetProducts={velvet.slice(0, 3)}
      recentPosts={recentPosts}
    />
  );
}
