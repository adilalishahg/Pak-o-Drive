import type { Metadata } from 'next';

import { getCachedSiteInfo } from '@/lib/cache';

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getCachedSiteInfo();
  const title = siteInfo?.contactSeoTitle || 'Contact Customer Support | Pak-o-Drive (Pak Drive)';
  const description =
    siteInfo?.contactSeoDescription ||
    'Need help with your car accessories order? Contact Pak-o-Drive (Pak Drive) customer support via WhatsApp, phone, or email. We are available 24/7.';
  const keywords = Array.isArray(siteInfo?.brandAliases) && siteInfo.brandAliases.length > 0
    ? siteInfo.brandAliases.map((b: string) => `Contact ${b}`)
    : ['Contact Pak-o-Drive', 'Pak Drive contact number', 'PakDrive WhatsApp', 'Pak-o-Drive customer service'];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://www.pakodrive.pk/contact',
    },
    alternates: {
      canonical: 'https://www.pakodrive.pk/contact',
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
