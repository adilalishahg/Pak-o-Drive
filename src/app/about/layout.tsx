import type { Metadata } from 'next';

import { getCachedSiteInfo } from '@/lib/cache';

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getCachedSiteInfo();
  const title = siteInfo?.aboutSeoTitle || "About Pak-o-Drive (Pak Drive) | Pakistan's #1 Car Accessories Brand";
  const description =
    siteInfo?.aboutSeoDescription ||
    "Learn about Pak-o-Drive (Pak Drive / PakDrive) — Pakistan's leading automotive accessories and viral car gadgets brand. Nationwide Cash On Delivery, premium quality and 24/7 customer support.";
  const keywords = Array.isArray(siteInfo?.brandAliases) && siteInfo.brandAliases.length > 0
    ? siteInfo.brandAliases.map((b: string) => `About ${b}`)
    : ['About Pak-o-Drive', 'Pak Drive Pakistan', 'PakDrive about', 'car accessories brand Pakistan', 'pakdrive'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://www.pakodrive.pk/about',
    },
    alternates: {
      canonical: 'https://www.pakodrive.pk/about',
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
