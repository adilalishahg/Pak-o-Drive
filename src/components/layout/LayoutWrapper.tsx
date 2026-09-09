'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { BlogNavbar } from '../blog/BlogNavbar';
import { BlogFooter } from '../blog/BlogFooter';
import { isBlogPath } from '@/lib/constants';
import { SmoothScrollProvider } from '../common/SmoothScrollProvider';

// Lazy-load non-critical floating widgets to slash initial page payload
const WhatsAppSupport = dynamic(
  () => import('../common/WhatsAppSupport').then((m) => m.WhatsAppSupport),
  { ssr: false }
);

const FloatingCartButton = dynamic(
  () => import('../common/FloatingCartButton').then((m) => m.FloatingCartButton),
  { ssr: false }
);

const RecentSalesNotification = dynamic(
  () => import('../common/RecentSalesNotification').then((m) => m.RecentSalesNotification),
  { ssr: false }
);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Strictly isolate Admin Panel: NEVER render storefront navbar, client WhatsApp/StoreChat widget, or footer on /admin
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  const isBlog = isBlogPath(pathname);

  if (isBlog) {
    return (
      <SmoothScrollProvider>
        <div className="blog-publication-wrapper min-h-screen flex flex-col bg-slate-50">
          <BlogNavbar />
          <main className="flex-1 w-full">{children}</main>
          <BlogFooter />
        </div>
      </SmoothScrollProvider>
    );
  }

  return (
    <SmoothScrollProvider>
      <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppSupport />
      <FloatingCartButton />
      <RecentSalesNotification />
    </SmoothScrollProvider>
  );
}
