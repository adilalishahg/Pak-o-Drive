import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import { Inter, Roboto } from 'next/font/google';
import './bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { LayoutWrapper } from '../components/layout/LayoutWrapper';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
});
import TemplateScripts from '../components/common/TemplateScripts';
import AnalyticsTracker from '../components/common/AnalyticsTracker';
import { DynamicThemeProvider } from '../components/common/DynamicThemeProvider';
import { SiteInfoProvider } from '../components/common/SiteInfoProvider';
import { WebVitals } from '../components/common/WebVitals';
import LiveSalesNotification from '../components/common/LiveSalesNotification';
import { getCachedSiteInfo, getCachedSiteSettings } from '../lib/cache';

const SITE_URL = 'https://www.pakodrive.pk';
const SITE_NAME = 'PAKODRIVE';
const SITE_DESC =
  'Pak-o-Drive — Pakistan\'s trusted automotive accessories, car care & tech store. Free Nationwide Cash On Delivery (COD) & 7-Day Warranty.';

export async function generateMetadata(): Promise<Metadata> {
  const activeSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : SITE_URL);

  let siteName = SITE_NAME;
  let defaultTitle = `${SITE_NAME} — Pakistan's #1 Automotive & Tech Store`;
  let description = SITE_DESC;
  let keywords = [
    'automotive accessories Pakistan',
    'car perfume Pakistan',
    'car LED lights',
    'car wax polish',
    'Pak-o-Drive',
    'online shopping Pakistan',
  ];
  let favicon = '/favicon.ico';
  let ogImageUrl = `${activeSiteUrl}/img/carousel-1.jpg`;

  try {
    const info = await getCachedSiteInfo();
    if (info) {
      if (info.siteName) siteName = info.siteName;
      if (info.seoTitle) {
        defaultTitle = info.seoTitle;
      } else if (info.siteName && info.siteTagline) {
        defaultTitle = `${info.siteName} — ${info.siteTagline}`;
      }
      if (info.seoDescription) {
        description = info.seoDescription;
      } else if (info.siteTagline) {
        description = info.siteTagline;
      }
      if (info.seoKeywords) {
        keywords = info.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
      if (info.logoImage && !info.logoImage.toLowerCase().endsWith('.svg')) {
        ogImageUrl = info.logoImage.startsWith('http') ? info.logoImage : `${activeSiteUrl}${info.logoImage}`;
      } else {
        ogImageUrl = `${activeSiteUrl}/img/carousel-1.jpg`;
      }
      if (ogImageUrl.includes('res.cloudinary.com') && ogImageUrl.includes('/upload/')) {
        ogImageUrl = ogImageUrl.replace('/upload/', '/upload/f_jpg,q_80,w_1200,h_630,c_pad,b_white/');
      }
      if (info.favicon) {
        favicon = info.favicon;
      }
    }
  } catch (err) {
    console.error('Error generating dynamic layout metadata:', err);
  }


  return {
    metadataBase: new URL(activeSiteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName, url: activeSiteUrl }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      url: activeSiteUrl,
      siteName: siteName,
      title: defaultTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          type: ogImageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: activeSiteUrl,
    },
    icons: {
      icon: favicon,
      apple: favicon,
    },
    verification: {
      google: 'google-site-verification-token',
    },
  };
}

import { WishlistProvider } from '../context/WishlistContext';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');

  // Pre-fetch site settings and site info directly from MongoDB during SSR
  let initialTheme = null;
  let initialSiteInfo = null;
  let siteName = SITE_NAME;
  let siteUrl = SITE_URL;
  let sitePhone = '03185205667';
  let siteAddress = 'Main Muslim Town, Sadiqabad';
  let siteCity = 'Rawalpindi';
  let siteCountry = 'PK';
  let siteWhatsapp = 'https://wa.me/923185205667';

  try {
    const [settings, info] = await Promise.all([
      getCachedSiteSettings(),
      getCachedSiteInfo()
    ]);

    if (settings) {
      initialTheme = settings;
    }

    if (info) {
      initialSiteInfo = info;
      if (info.siteName) siteName = info.siteName as string;
      if (info.website) {
        const ws = info.website as string;
        siteUrl = ws.startsWith('http') ? ws : `https://${ws}`;
      }
      if (info.phone) sitePhone = info.phone as string;
      if (info.address) siteAddress = info.address as string;
      if (info.city) siteCity = info.city as string;
      if (info.country) {
        const c = info.country as string;
        siteCountry = c === 'Pakistan' ? 'PK' : c;
      }
      if (info.whatsapp) {
        const wa = info.whatsapp as string;
        siteWhatsapp = wa.startsWith('http')
          ? wa
          : `https://wa.me/${wa.replace(/[+\s-]/g, '')}`;
      }
    }
  } catch (err) {
    console.error('Failed to prefetch site settings or info during RootLayout SSR:', err);
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/img/carousel-1.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: sitePhone,
      contactType: 'customer service',
      availableLanguage: ['English', 'Urdu'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteAddress,
      addressLocality: siteCity,
      addressCountry: siteCountry,
    },
    sameAs: [siteWhatsapp],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/shop?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <head>
        {/* Universal Icon Libraries (FontAwesome, Material Icons, Bootstrap Icons, Remix, Phosphor) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round&display=swap" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" />
        <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />
        
        {/* Preconnect to external image domains for ultra-fast LCP */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <DynamicThemeProvider initialTheme={initialTheme}>
          <SiteInfoProvider initialInfo={initialSiteInfo}>
            <WishlistProvider>
              <CartProvider>
                <AnalyticsTracker />
                <WebVitals />
                {isAdmin ? (
                  children
                ) : (
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                )}
                <LiveSalesNotification />
                <TemplateScripts />
                {process.env.NODE_ENV === 'production' && (
                  <>
                    <Analytics />
                    <SpeedInsights />
                  </>
                )}
              </CartProvider>
            </WishlistProvider>
          </SiteInfoProvider>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
