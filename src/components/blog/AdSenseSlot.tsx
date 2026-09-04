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

  // If live AdSense Client ID is configured
  if (clientId) {
    return (
      <div className={`my-6 overflow-hidden text-center ${className}`}>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
          Advertisement
        </span>
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

  // Graceful pre-approval placeholder slot
  return (
    <div
      className={`my-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 flex flex-col items-center justify-center text-center transition-all ${className}`}
    >
      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
        <span>Google AdSense Slot</span>
      </div>
      <p className="text-xs font-semibold text-slate-700">{slotLabel}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">
        Set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-orange-600">NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx</code> to activate live ads
      </p>
    </div>
  );
}
