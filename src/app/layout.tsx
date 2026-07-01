import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { headers } from 'next/headers';
import { Inter, Roboto } from 'next/font/google';
import './bootstrap.min.css';
import './style.css';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CartProvider } from '../context/CartContext';
import { LayoutWrapper } from '../components/layout/LayoutWrapper';

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
import dbConnect from '../lib/mongodb';
import SiteSettings from '../models/SiteSettings';
import SiteInfo from '../models/SiteInfo';

const SITE_URL = 'https://pakodrive.com';
const SITE_NAME = 'PAKODRIVE Electronics';
const SITE_DESC =
  'PAKODRIVE — Pakistan\'s trusted electronics store. Shop headphones, chargers, smartwatches, automotive electronics & more with free shipping and 30-day returns.';

export async function generateMetadata(): Promise<Metadata> {
  let siteName = SITE_NAME;
  let defaultTitle = `${SITE_NAME} — Best Electronics Store in Pakistan`;
  let description = SITE_DESC;
  let keywords = [
    'electronics Pakistan',
    'buy headphones Pakistan',
    'smartwatches online',
    'chargers cables Pakistan',
    'automotive electronics',
    'PAKODRIVE',
    'online shopping Pakistan',
  ];
  let siteUrl = SITE_URL;
  let favicon = '/favicon.ico';

  try {
    await dbConnect();
    const info = await SiteInfo.findOne({}).lean();
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
      if (info.website) {
        siteUrl = info.website.startsWith('http') ? info.website : `https://${info.website}`;
      }
      if (info.favicon) {
        favicon = info.favicon;
      }
    }
  } catch (err) {
    console.error('Error generating dynamic layout metadata:', err);
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description,
    keywords,
    authors: [{ name: siteName, url: siteUrl }],
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
      url: siteUrl,
      siteName: siteName,
      title: defaultTitle,
      description,
      images: [{ url: '/img/carousel-1.png', width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description,
      images: ['/img/carousel-1.png'],
    },
    alternates: {
      canonical: siteUrl,
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
  let siteName = SITE_NAME;
  let siteUrl = SITE_URL;
  let sitePhone = '+92-123-456-7890';
  let siteAddress = '123 Street';
  let siteCity = 'Karachi';
  let siteCountry = 'PK';
  let siteWhatsapp = 'https://wa.me/923001234567';

  try {
    await dbConnect();
    const [settings, info] = await Promise.all([
      SiteSettings.findOne({}).lean(),
      SiteInfo.findOne({}).lean()
    ]);

    if (settings) {
      initialTheme = JSON.parse(JSON.stringify(settings));
    }

    if (info) {
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
          <SiteInfoProvider>
            <CartProvider>
              <AnalyticsTracker />
              {isAdmin ? (
                children
              ) : (
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              )}
              <TemplateScripts />
              <Analytics />
              <SpeedInsights />
            </CartProvider>
          </SiteInfoProvider>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
