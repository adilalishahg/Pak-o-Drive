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

  const preloadUrls: string[] = [];
  if (heroBigImg) {
    if (heroBigImg.includes('res.cloudinary.com')) {
      const uploadIndex = heroBigImg.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const prefix = heroBigImg.substring(0, uploadIndex + 8);
        let suffix = heroBigImg.substring(uploadIndex + 8);
        suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match: string) => {
          const versionMatch = match.match(/(v\d+\/)/);
          return versionMatch ? versionMatch[1] : '';
        });
        preloadUrls.push(`${prefix}f_auto,q_70,w_256,c_limit/${suffix}`);
        preloadUrls.push(`${prefix}f_auto,q_70,w_384,c_limit/${suffix}`);
      }
    } else {
      preloadUrls.push(`/_next/image?url=${encodeURIComponent(heroBigImg)}&w=256&q=75`);
      preloadUrls.push(`/_next/image?url=${encodeURIComponent(heroBigImg)}&w=384&q=75`);
    }
  }

  return (
    <>
      {preloadUrls.map((url, i) => (
        <link key={i} rel="preload" as="image" href={url} fetchPriority="high" />
      ))}
      <HomePageClient
        initialProducts={products}
        initialCategories={categories}
      />
    </>
  );
}
