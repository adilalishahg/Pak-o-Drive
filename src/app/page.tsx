import { getCachedAllProducts, getCachedAllCategories, getCachedSiteSettings } from '../lib/cache';
import { HomePageClient } from '../components/home/HomePageClient';

export default async function Home() {
  const [products, categories, settings] = await Promise.all([
    getCachedAllProducts(),
    getCachedAllCategories(),
    getCachedSiteSettings(),
  ]);

  const heroBigImg =
    settings?.homepageSections?.heroBig?.imageUrl ||
    'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80';

  return (
    <>
      {heroBigImg && (
        <link rel="preload" as="image" href={heroBigImg} fetchPriority="high" />
      )}
      <HomePageClient
        initialProducts={products}
        initialCategories={categories}
      />
    </>
  );
}
