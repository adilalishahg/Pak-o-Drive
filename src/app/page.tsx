import { getCachedAllProducts, getCachedAllCategories } from '../lib/cache';
import { HomePageClient } from '../components/home/HomePageClient';

export default async function Home() {
  const products = await getCachedAllProducts();
  const categories = await getCachedAllCategories();

  return (
    <>
      <link rel="preload" as="image" href="/img/product-1.png" fetchPriority="high" />
      <HomePageClient
        initialProducts={products}
        initialCategories={categories}
      />
    </>
  );
}
