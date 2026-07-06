'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * logInteraction — safe to call from any client component.
 * Guards all window/sessionStorage access so SSR/build never crashes.
 */
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
  // ── SSR / build-time safety guard ────────────────────────────────────────
  if (typeof window === 'undefined') return;

  try {
    const utmSource  = sessionStorage.getItem('utm_source')   || '';
    const utmMedium  = sessionStorage.getItem('utm_medium')   || '';
    const utmCampaign= sessionStorage.getItem('utm_campaign') || '';
    const sessionId  = sessionStorage.getItem('pako_session_id') || '';
    const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';

    // Log to MongoDB (fire-and-forget — no await needed here)
    fetch('/api/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:            'interaction',
        path,
        interactionType: type,
        utm_source:      utmSource,
        utm_medium:      utmMedium,
        utm_campaign:    utmCampaign,
        session_id:      sessionId,
        device:          deviceType,
        metadata,
      }),
    }).catch((err) => console.error('[Analytics] fetch error:', err));

    // PostHog — loaded dynamically client-side only when tracking is active
    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (phKey) {
      const posthog = (await import('posthog-js')).default;
      if ((posthog as any).__loaded) {
        posthog.capture(type, {
          path,
          utm_source:   utmSource,
          utm_medium:   utmMedium,
          utm_campaign: utmCampaign,
          session_id:   sessionId,
          device:       deviceType,
          ...metadata,
        });
      }
    }
    // Facebook Pixel interaction events tracking
    if (typeof (window as any).fbq === 'function') {
      if (type === 'add_to_cart') {
        (window as any).fbq('track', 'AddToCart', {
          content_name: metadata.product_name,
          content_ids: [metadata.product_id],
          content_type: 'product',
          value: metadata.price,
          currency: 'PKR'
        });
      } else if (type === 'begin_checkout') {
        (window as any).fbq('track', 'InitiateCheckout', {
          value: metadata.value,
          currency: 'PKR',
          num_items: metadata.num_items
        });
      } else if (type === 'search_intent') {
        (window as any).fbq('track', 'Search', {
          search_string: metadata.keyword
        });
      } else if (type === 'view_product') {
        (window as any).fbq('track', 'ViewContent', {
          content_name: metadata.product_name,
          content_ids: [metadata.product_id],
          content_type: 'product',
          value: metadata.price,
          currency: 'PKR'
        });
      }
    }
  } catch (err) {
    console.error('[Analytics] logInteraction error:', err);
  }
}

// ─── Inner tracker component (needs Suspense for useSearchParams) ─────────────

function TrackerInner() {
  const pathname    = usePathname();
  const searchParams= useSearchParams();

  // 1. Session + UTM initialisation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Meta Pixel injection logic
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const w = window as any;
    if (pixelId && !w.fbq) {
      w.fbq = function(...args: any[]) {
        if (w.fbq.callMethod) {
          w.fbq.callMethod.apply(w.fbq, args);
        } else {
          w.fbq.queue.push(args);
        }
      };
      if (!w._fbq) w._fbq = w.fbq;
      w.fbq.push = w.fbq;
      w.fbq.loaded = true;
      w.fbq.version = '2.0';
      w.fbq.queue = [];
      
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
      
      w.fbq('init', pixelId);
    }

    // PostHog — init only once dynamically
    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (phKey) {
      import('posthog-js').then(({ default: posthog }) => {
        if (!(posthog as any).__loaded) {
          posthog.init(phKey, {
            api_host: 'https://us.i.posthog.com',
            loaded: (ph) => {
              const sid = sessionStorage.getItem('pako_session_id');
              if (sid) {
                ph.identify(sid, {
                  device:        window.innerWidth < 768 ? 'Mobile' : 'Desktop',
                  screen_width:  window.innerWidth,
                  screen_height: window.innerHeight,
                });
              }
            },
          });
        }
      });
    }

    // Generate session ID if missing
    if (!sessionStorage.getItem('pako_session_id')) {
      sessionStorage.setItem(
        'pako_session_id',
        'sess_' + Math.random().toString(36).substring(2, 15)
      );
    }

    // Persist UTM params for the lifetime of the session
    if (searchParams) {
      const src = searchParams.get('utm_source');
      const med = searchParams.get('utm_medium');
      const cam = searchParams.get('utm_campaign');
      if (src) sessionStorage.setItem('utm_source',   src);
      if (med) sessionStorage.setItem('utm_medium',   med);
      if (cam) sessionStorage.setItem('utm_campaign', cam);
    }
  }, [searchParams]);

  // 2. Pageview logger
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const fullPath   = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const utmSource  = sessionStorage.getItem('utm_source')      || '';
    const utmMedium  = sessionStorage.getItem('utm_medium')      || '';
    const utmCampaign= sessionStorage.getItem('utm_campaign')    || '';
    const sessionId  = sessionStorage.getItem('pako_session_id') || '';
    const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';

    fetch('/api/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:         'pageview',
        path:         fullPath,
        utm_source:   utmSource,
        utm_medium:   utmMedium,
        utm_campaign: utmCampaign,
        session_id:   sessionId,
        device:       deviceType,
        landing_page: sessionStorage.getItem('pako_landing_page') || fullPath,
      }),
    }).catch((err) => console.error('[Analytics] pageview error:', err));

    // Meta PageView Tracking
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView');
    }

    if (!sessionStorage.getItem('pako_landing_page')) {
      sessionStorage.setItem('pako_landing_page', fullPath);
    }

    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (phKey) {
      import('posthog-js').then(({ default: posthog }) => {
        if ((posthog as any).__loaded) {
          posthog.capture('$pageview', {
            path:         fullPath,
            utm_source:   utmSource,
            utm_medium:   utmMedium,
            utm_campaign: utmCampaign,
            session_id:   sessionId,
          });
        }
      });
    }
  }, [pathname, searchParams]);

  // 3. Scroll-depth tracker (60 % threshold)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      if ((window.scrollY / total) * 100 > 60) {
        fired = true;
        logInteraction('scroll_depth', pathname || '', { depth: '60%' });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
