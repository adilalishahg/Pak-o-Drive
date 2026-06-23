import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './bootstrap.min.css';
import './animate.min.css';
import './owl.carousel.min.css';
import './style.css';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CartProvider } from '../context/CartContext';
import { LayoutWrapper } from '../components/layout/LayoutWrapper';
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/img/carousel-1.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+92-123-456-7890',
    contactType: 'customer service',
    availableLanguage: ['English', 'Urdu'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Street',
    addressLocality: 'Karachi',
    addressCountry: 'PK',
  },
  sameAs: ['https://wa.me/923001234567'],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');

  // Pre-fetch site settings directly from MongoDB during SSR to prevent FOUC (theme flash)
  let initialTheme = null;
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne({}).lean();
    if (settings) {
      initialTheme = JSON.parse(JSON.stringify(settings));
    }
  } catch (err) {
    console.error('Failed to prefetch site settings during RootLayout SSR:', err);
  }

  return (
    <html lang="en">
      <head>
        {/* Google Web Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

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
            </CartProvider>
          </SiteInfoProvider>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
