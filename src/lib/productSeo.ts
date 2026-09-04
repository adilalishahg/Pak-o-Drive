import type { Metadata } from 'next';
import { IProduct } from '@/types';
import { getCachedProduct, getCachedSiteInfo } from './cache';
import { generateAutoProductSeo, generateExpandedKeywords } from './productSeoGenerator';

export function getStaticSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'https://www.pakodrive.pk';
}

export async function generateProductMetadata(id: string): Promise<Metadata> {
  const p = await getCachedProduct(id);
  const siteUrl = getStaticSiteUrl();

  let siteLogoText = 'Pak-o-Drive';
  const siteInfo = await getCachedSiteInfo();

  if (siteInfo && siteInfo.logoText) {
    siteLogoText = siteInfo.logoText as string;
  }

  const fallbackImg = siteInfo?.logoImage
    ? (siteInfo.logoImage.startsWith('http') ? siteInfo.logoImage : `${siteUrl}${siteInfo.logoImage}`)
    : `${siteUrl}/img/carousel-1.jpg`;

  if (!p) {
    const fallbackTitle = siteInfo?.seoTitle || `Order Online | ${siteLogoText}`;
    const fallbackDesc = siteInfo?.seoDescription || 'Shop automotive accessories & electronics on PAKODRIVE.';

    return {
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        url: `${siteUrl}/product/${id}`,
        images: [{ url: fallbackImg }],
      },
    };
  }

  const autoSeo = generateAutoProductSeo({
    name: p.name,
    price: p.price,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description,
  });

  // Ensure title contains the full product name and brand for optimal Google SERP matching
  let metaTitle = p.seoTitle?.trim();
  if (!metaTitle || metaTitle.length < 15 || !metaTitle.toLowerCase().includes(p.name.slice(0, 10).toLowerCase())) {
    metaTitle = autoSeo.seoTitle;
  }
  if (!metaTitle.toLowerCase().includes('pak-o-drive') && !metaTitle.toLowerCase().includes('pak drive')) {
    metaTitle += ' | Pak-o-Drive (Pak Drive)';
  }

  const metaDesc =
    (p.seoDescription && p.seoDescription.length > 30)
      ? p.seoDescription
      : autoSeo.seoDescription;

  // Merge stored keywords with expanded search intent synonyms (spray, air freshener, double ring, etc.)
  const storedKeywords = p.seoKeywords ? p.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];
  const expandedList = generateExpandedKeywords({
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
  });
  const keywords = Array.from(new Set([...storedKeywords, ...expandedList])).filter(Boolean);

  const canonicalSlug = p.slug || id;
  const productUrl = `${siteUrl}/product/${canonicalSlug}`;

  let imageUrl = p.image
    ? p.image.startsWith('http')
      ? p.image
      : `${siteUrl}${p.image.startsWith('/') ? '' : '/'}${p.image}`
    : fallbackImg;

  // Cloudinary WhatsApp / Social Crawler optimization (Standard 1200x630 JPEG under 70KB with true .jpg extension)
  if (imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
    imageUrl = imageUrl.replace('/upload/', '/upload/f_jpg,q_80,w_1200,h_630,c_pad,b_white/');
    imageUrl = imageUrl.replace(/\.(webp|png|jpeg)$/i, '.jpg');
  }

  return {
    title: metaTitle,
    description: metaDesc,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: productUrl,
      type: 'website',
      siteName: siteLogoText,
      locale: 'en_PK',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: p.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [imageUrl],
    },
    other: {
      'image_src': imageUrl,
    },
  };
}

export function buildProductJsonLd(product: IProduct, siteUrl: string, siteLogoText: string) {
  const productUrl = `${siteUrl}/product/${product.slug || product._id}`;
  const brandName = (product.specifications as any)?.Brand || siteLogoText || 'Pak-o-Drive';
  const synonyms = generateExpandedKeywords({
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
  }).slice(0, 10);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: synonyms,
    category: product.category,
    image:
      product.images && product.images.length > 0
        ? product.images.map((img: string) => (img.startsWith('http') ? img : `${siteUrl}${img}`))
        : [product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`],
    description: product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'Pak-o-Drive',
      alternateName: ['Pak Drive', 'PakODrive', 'PakDrive'],
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock !== 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Pak-o-Drive',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 4,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 3,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.9,
      reviewCount: Math.max(product.reviewsCount || 0, 18),
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function buildBreadcrumbJsonLd(product: IProduct, siteUrl: string) {
  const productUrl = `${siteUrl}/product/${product.slug || product._id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `${siteUrl}/shop?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };
}
