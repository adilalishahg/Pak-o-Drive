'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { Navbar } from './Navbar';
import { NavbarClassic } from './NavbarClassic';
import { Footer } from './Footer';
import { FooterClassic } from './FooterClassic';
import { WhatsAppSupport } from '../common/WhatsAppSupport';
import { AnnouncementBar } from './AnnouncementBar';
import { FloatingCartButton } from '../common/FloatingCartButton';
import { RecentSalesNotification } from '../common/RecentSalesNotification';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useSiteTheme();
  const isClassic = theme.layoutTheme === 'classic';

  return (
    <>
      <AnnouncementBar />
      {isClassic ? <NavbarClassic /> : <Navbar />}
      <main>{children}</main>
      {isClassic ? <FooterClassic /> : <Footer />}
      <WhatsAppSupport />
      <FloatingCartButton />
      <RecentSalesNotification />
    </>
  );
}
