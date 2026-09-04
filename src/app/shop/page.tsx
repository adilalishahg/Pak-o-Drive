import React from 'react';
import type { Metadata } from 'next';
import { getCachedAllProducts, getCachedSiteInfo } from '../../lib/cache';
import { ShopClient } from '../../components/shop/ShopClient';

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getCachedSiteInfo();
  const title = siteInfo?.shopSeoTitle || 'Shop Car Accessories & Auto Gadgets in Pakistan | Pak-o-Drive (Pak Drive)';
  const description =
    siteInfo?.shopSeoDescription ||
    'Browse all viral car accessories, LED headlights, ambient lighting, car perfumes, vacuum cleaners, and car care on Pak-o-Drive (Pak Drive). Cash on Delivery nationwide.';
  const brandKeywords = Array.isArray(siteInfo?.brandAliases) && siteInfo.brandAliases.length > 0
    ? siteInfo.brandAliases
    : ['pakdrive', 'pak drive', 'pakodrive', 'pak o drive', 'pakdrives'];

  const keywords = [
    ...brandKeywords,
    'car accessories online store Pakistan',
    'buy car gadgets Pakistan',
    'car parts accessories online',
    'car perfumes spray air freshener',
    'LED car headlights Pakistan',
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: 'https://www.pakodrive.pk/shop',
    },
    alternates: {
      canonical: 'https://www.pakodrive.pk/shop',
    },
  };
}

export default async function ShopPage() {
  const initialProducts = await getCachedAllProducts();

  return (
    <ShopClient initialProducts={initialProducts} />
  );
}
