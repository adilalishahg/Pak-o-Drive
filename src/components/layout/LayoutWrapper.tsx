'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { Navbar } from './Navbar';
import { NavbarClassic } from './NavbarClassic';
import { Footer } from './Footer';
import { FooterClassic } from './FooterClassic';
import { WhatsAppSupport } from '../common/WhatsAppSupport';
import { FloatingCartButton } from '../common/FloatingCartButton';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useSiteTheme();
  const isClassic = theme.layoutTheme === 'classic';

  return (
    <>
      {isClassic ? <NavbarClassic /> : <Navbar />}
      {children}
      {isClassic ? <FooterClassic /> : <Footer />}
      <WhatsAppSupport />
      <FloatingCartButton />
    </>
  );
}
