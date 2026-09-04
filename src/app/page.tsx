import { getCachedAllProducts, getCachedAllCategories, getCachedSiteSettings, getCachedSiteInfo } from '../lib/cache';
import { HomePageClient } from '../components/home/HomePageClient';

export default async function Home() {
  const [products, categories, settings, siteInfo] = await Promise.all([
    getCachedAllProducts(),
    getCachedAllCategories(),
    getCachedSiteSettings(),
    getCachedSiteInfo(),
  ]);

  const preloadUrls: string[] = [];

  const getPreloadUrl = (imgUrl: string, width = 384) => {
    if (!imgUrl) return null;
    if (imgUrl.includes('res.cloudinary.com')) {
      const uploadIndex = imgUrl.indexOf('/upload/');
      if (uploadIndex !== -1) {
        const prefix = imgUrl.substring(0, uploadIndex + 8);
        let suffix = imgUrl.substring(uploadIndex + 8);
        suffix = suffix.replace(/^(?:[a-z_]+[,/])*(?:v\d+\/)?/, (match: string) => {
          const versionMatch = match.match(/(v\d+\/)/);
          return versionMatch ? versionMatch[1] : '';
        });
        return `${prefix}f_auto,q_75,w_${width},c_limit/${suffix}`;
      }
    }
    return `/_next/image?url=${encodeURIComponent(imgUrl)}&w=${width}&q=75`;
  };

  const heroBigImg =
    settings?.homepageSections?.heroBig?.imageUrl ||
    'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80';

  if (heroBigImg) {
    const url256 = getPreloadUrl(heroBigImg, 256);
    const url384 = getPreloadUrl(heroBigImg, 384);
    if (url256) preloadUrls.push(url256);
    if (url384) preloadUrls.push(url384);
  }

  // Also preload custom hero slides if configured
  if (Array.isArray(settings?.heroSlides)) {
    settings.heroSlides.filter((s: any) => s.enabled && s.imageUrl).slice(0, 3).forEach((s: any) => {
      const url = getPreloadUrl(s.imageUrl, 400);
      if (url && !preloadUrls.includes(url)) {
        preloadUrls.push(url);
      }
    });
  }

  return (
    <>
      {preloadUrls.map((url, i) => (
        <link key={i} rel="preload" as="image" href={url} fetchPriority="high" />
      ))}
      <h1 className="visually-hidden">
        {siteInfo?.h1Heading || "Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's #1 Car Accessories, Viral Auto Gadgets & LED Lights Store"}
      </h1>
      <HomePageClient
        initialProducts={products}
        initialCategories={categories}
      />
    </>
  );
}
