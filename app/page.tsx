import HomeView from '@/components/HomeView';
import { getFeaturedProducts, getProductsInCategory } from '@/lib/catalog';
import { getRecentPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, soaps, deo, blocks, velvet, recentPosts] = await Promise.all([
    getFeaturedProducts(8),
    getProductsInCategory('bio-sapuni'),
    getProductsInCategory('deo-stikove'),
    getProductsInCategory('shampoanovi-blokcheta'),
    getProductsInCategory('seria-velvet'),
    getRecentPosts(3),
  ]);

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
