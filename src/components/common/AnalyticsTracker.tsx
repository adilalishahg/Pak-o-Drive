'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

// Global utility helper to easily log interactions from other components
export async function logInteraction(
  type: 
    | 'view_product' 
    | 'add_to_cart' 
    | 'search_intent' 
    | 'scroll_depth' 
    | 'checkout_abandonment' 
    | 'begin_checkout' 
    | 'checkout_success'
    | 'whatsapp_click',
  path: string,
  metadata: Record<string, any> = {}
) {
  try {
    // Retrieve tracking helpers from session storage
    const utmSource = sessionStorage.getItem('utm_source') || '';
    const utmMedium = sessionStorage.getItem('utm_medium') || '';
    const utmCampaign = sessionStorage.getItem('utm_campaign') || '';
    const sessionId = sessionStorage.getItem('pako_session_id') || '';
    const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';

    // Log to MongoDB API
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interaction',
        path,
        interactionType: type,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        session_id: sessionId,
        device: deviceType,
        metadata,
      }),
    });

    // Log to PostHog if initialized
    if (typeof window !== 'undefined' && (posthog as any).__loaded) {
      posthog.capture(type, {
        path,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        session_id: sessionId,
        device: deviceType,
        ...metadata,
      });
    }
  } catch (err) {
    console.error('Error logging analytics interaction:', err);
  }
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Initialize PostHog asynchronously (non-blocking)
    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (phKey && !(posthog as any).__loaded) {
      posthog.init(phKey, {
        api_host: 'https://us.i.posthog.com',
        loaded: (ph) => {
          // Identify call with user details
          const existingSessionId = sessionStorage.getItem('pako_session_id');
          if (existingSessionId) {
            ph.identify(existingSessionId, {
              device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
              screen_width: window.innerWidth,
              screen_height: window.innerHeight,
            });
          }
        }
      });
    }

    // 2. Setup Session ID
    if (!sessionStorage.getItem('pako_session_id')) {
      const newSessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('pako_session_id', newSessionId);
    }

    // 3. Capture UTM parameters
    if (searchParams) {
      const utmSrc = searchParams.get('utm_source');
      const utmMed = searchParams.get('utm_medium');
      const utmCam = searchParams.get('utm_campaign');

      if (utmSrc) sessionStorage.setItem('utm_source', utmSrc);
      if (utmMed) sessionStorage.setItem('utm_medium', utmMed);
      if (utmCam) sessionStorage.setItem('utm_campaign', utmCam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const utmSource = sessionStorage.getItem('utm_source') || '';
    const utmMedium = sessionStorage.getItem('utm_medium') || '';
    const utmCampaign = sessionStorage.getItem('utm_campaign') || '';
    const sessionId = sessionStorage.getItem('pako_session_id') || '';
    const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';

    // Log Pageview to MongoDB
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        path: fullPath,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        session_id: sessionId,
        device: deviceType,
        landing_page: sessionStorage.getItem('pako_landing_page') || fullPath,
      }),
    }).catch((err) => {
      console.error('Error logging pageview:', err);
    });

    // Save landing page
    if (!sessionStorage.getItem('pako_landing_page')) {
      sessionStorage.setItem('pako_landing_page', fullPath);
    }

    // Capture Pageview in PostHog
    if ((posthog as any).__loaded) {
      posthog.capture('$pageview', {
        path: fullPath,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        session_id: sessionId,
      });
    }
  }, [pathname, searchParams]);

  // 4. Scroll Depth Tracker
  useEffect(() => {
    let scrollLogged = false;
    const handleScroll = () => {
      if (scrollLogged) return;
      
      // Track scroll to 60% of page height
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = (window.scrollY / totalHeight) * 100;
      if (scrolled > 60) {
        scrollLogged = true;
        logInteraction('scroll_depth', pathname || '', { depth: '60%' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
