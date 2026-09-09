'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { StoreChatWidget } from './StoreChatWidget';

export const WhatsAppSupport: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return <StoreChatWidget />;
};

export default WhatsAppSupport;

