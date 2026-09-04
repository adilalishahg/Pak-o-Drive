'use client';

import React, { useEffect, useRef } from 'react';

interface AdSenseSlotProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  slotLabel?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function AdSenseSlot({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  slotLabel = 'Google AdSense Banner',
}: AdSenseSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense push error:', e);
    }
  }, [clientId, slotId]);

  // If no live AdSense Client ID is configured, return null (NEVER display developer placeholders or error boxes to visitors)
  if (!clientId) {
    return null;
  }

  return (
    <div className={`my-6 overflow-hidden text-center min-h-[50px] ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId || '1234567890'}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
