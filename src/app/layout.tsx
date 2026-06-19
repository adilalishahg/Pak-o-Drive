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
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { WhatsAppSupport } from '../components/common/WhatsAppSupport';
import TemplateScripts from '../components/common/TemplateScripts';
import AnalyticsTracker from '../components/common/AnalyticsTracker';
import { DynamicThemeProvider } from '../components/common/DynamicThemeProvider';
import { SiteInfoProvider } from '../components/common/SiteInfoProvider';
import dbConnect from '../lib/mongodb';
import SiteSettings from '../models/SiteSettings';

const SITE_URL = 'https://pakodrive.com';
const SITE_NAME = 'PAKODRIVE Electronics';
const SITE_DESC =
  'PAKODRIVE — Pakistan\'s trusted electronics store. Shop headphones, chargers, smartwatches, automotive electronics & more with free shipping and 30-day returns.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Best Electronics Store in Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    'electronics Pakistan',
    'buy headphones Pakistan',
    'smartwatches online',
    'chargers cables Pakistan',
    'automotive electronics',
    'PAKODRIVE',
    'online shopping Pakistan',
  ],
  authors: [{ name: 'PAKODRIVE', url: SITE_URL }],
  creator: 'PAKODRIVE',
  publisher: 'PAKODRIVE',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Best Electronics Store in Pakistan`,
    description: SITE_DESC,
    images: [{ url: '/img/carousel-1.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Best Electronics Store in Pakistan`,
    description: SITE_DESC,
    images: ['/img/carousel-1.png'],
    creator: '@pakodrive',
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  verification: {
    google: 'google-site-verification-token',
  },
};

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
      <body>
        <DynamicThemeProvider initialTheme={initialTheme}>
          <SiteInfoProvider>
            <CartProvider>
              <AnalyticsTracker />
              {isAdmin ? (
                children
              ) : (
                <>
                  <Navbar />
                  {children}
                  <Footer />
                  <WhatsAppSupport />
                </>
              )}
              <TemplateScripts />
            </CartProvider>
          </SiteInfoProvider>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
