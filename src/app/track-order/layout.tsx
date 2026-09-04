import type { Metadata } from 'next';

import { getCachedSiteInfo } from '@/lib/cache';

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getCachedSiteInfo();
  const title = siteInfo?.trackOrderSeoTitle || 'Track Your Order Status | Pak-o-Drive (Pak Drive)';
  const description =
    siteInfo?.trackOrderSeoDescription ||
    'Track your Pak-o-Drive parcel in real time. Enter your Order ID and phone number to see live courier tracking and delivery status.';
  const keywords = Array.isArray(siteInfo?.brandAliases) && siteInfo.brandAliases.length > 0
    ? siteInfo.brandAliases.map((b: string) => `${b} tracking`)
    : ['Pak-o-Drive tracking', 'Pak Drive track order', 'PakDrive order status Pakistan'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://www.pakodrive.pk/track-order',
    },
    alternates: {
      canonical: 'https://www.pakodrive.pk/track-order',
    },
  };
}

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
