'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';

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
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppSupport />
      <FloatingCartButton />
      <RecentSalesNotification />
    </>
  );
}
