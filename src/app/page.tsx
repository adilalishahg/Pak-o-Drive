import { getCachedAllProducts, getCachedAllCategories } from '../lib/cache';
import { HomePageClient } from '../components/home/HomePageClient';

export default async function Home() {
  const products = await getCachedAllProducts();
  const categories = await getCachedAllCategories();

  return (
    <HomePageClient
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
