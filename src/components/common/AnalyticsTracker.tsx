'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * logInteraction — safe to call from any client component.
 * Guards all window/sessionStorage access so SSR/build never crashes.
 */
export async function logInteraction(
  type:
    | 'view_product'
    | 'add_to_cart'
    | 'add_to_wishlist'
    | 'remove_from_wishlist'
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

    // 1. Log to MongoDB Analytics asynchronously via sendBeacon (zero blocking)
    const payload = JSON.stringify({
      type:            'interaction',
      path,
      interactionType: type,
      utm_source:      utmSource,
      utm_medium:      utmMedium,
      utm_campaign:    utmCampaign,
      session_id:      sessionId,
      device:          deviceType,
      metadata,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    // 2. PostHog Event Tracking
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

    // 3. Meta Pixel (Facebook & Instagram)
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      if (type === 'add_to_cart') {
        fbq('track', 'AddToCart', {
          content_name: metadata.product_name || metadata.name,
          content_ids: [metadata.product_id || metadata.id],
          content_type: 'product',
          value: metadata.price,
          currency: 'PKR',
        });
      } else if (type === 'begin_checkout') {
        fbq('track', 'InitiateCheckout', {
          value: metadata.value || metadata.amount,
          currency: 'PKR',
          num_items: metadata.num_items || metadata.itemsCount,
        });
      } else if (type === 'checkout_success') {
        fbq('track', 'Purchase', {
          value: metadata.amount,
          currency: 'PKR',
          content_type: 'product',
          num_items: metadata.itemsCount,
          order_id: metadata.orderId,
        });
      } else if (type === 'search_intent') {
        fbq('track', 'Search', {
          search_string: metadata.keyword,
        });
      } else if (type === 'view_product') {
        fbq('track', 'ViewContent', {
          content_name: metadata.name || metadata.product_name,
          content_ids: [metadata.id || metadata.product_id],
          content_type: 'product',
          value: metadata.price,
          currency: 'PKR',
        });
      }
    }

    // 4. TikTok Pixel (ttq)
    const ttq = (window as any).ttq;
    if (typeof ttq === 'object' && typeof ttq.track === 'function') {
      if (type === 'view_product') {
        ttq.track('ViewContent', {
          content_id: metadata.id || metadata.product_id,
          content_type: 'product',
          content_name: metadata.name || metadata.product_name,
          value: metadata.price,
          currency: 'PKR',
        });
      } else if (type === 'add_to_cart') {
        ttq.track('AddToCart', {
          content_id: metadata.product_id || metadata.id,
          content_type: 'product',
          content_name: metadata.product_name || metadata.name,
          value: metadata.price,
          currency: 'PKR',
        });
      } else if (type === 'begin_checkout') {
        ttq.track('InitiateCheckout', {
          value: metadata.value || metadata.amount,
          currency: 'PKR',
        });
      } else if (type === 'checkout_success') {
        ttq.track('CompletePayment', {
          value: metadata.amount,
          currency: 'PKR',
        });
      }
    }

    // 5. Google Tag Manager / DataLayer
    const dataLayer = (window as any).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({
        event: type,
        event_path: path,
        ecommerce: {
          currency: 'PKR',
          ...metadata,
        },
      });
    }

  } catch (err) {
    console.error('[Analytics] logInteraction error:', err);
  }
}

// ─── Inner tracker component ──────────────────────────────────────────────────

function TrackerInner() {
  const pathname    = usePathname();
  const searchParams= useSearchParams();
  const lastTrackedPathRef = useRef<string | null>(null);

  // 1. Session + UTM + Pixels initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as any;

    // Meta Pixel injection
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
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

    // TikTok Pixel injection
    const ttPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    if (ttPixelId && !w.ttq) {
      w.TiktokAnalyticsObject = 'ttq';
      const ttq: any = (w.ttq = w.ttq || []);
      ttq.methods = ['page', 'track', 'identify', 'instances', 'load'];
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${ttPixelId}&lib=ttq`;
      const f = document.getElementsByTagName('script')[0];
      if (f && f.parentNode) f.parentNode.insertBefore(s, f);
      ttq.load(ttPixelId);
      ttq.page();
    }

    // PostHog init
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

    // Session ID
    if (!sessionStorage.getItem('pako_session_id')) {
      sessionStorage.setItem(
        'pako_session_id',
        'sess_' + Math.random().toString(36).substring(2, 15)
      );
    }

    // UTM Params
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
    if (lastTrackedPathRef.current === fullPath) return;
    lastTrackedPathRef.current = fullPath;
    const utmSource  = sessionStorage.getItem('utm_source')      || '';
    const utmMedium  = sessionStorage.getItem('utm_medium')      || '';
    const utmCampaign= sessionStorage.getItem('utm_campaign')    || '';
    const sessionId  = sessionStorage.getItem('pako_session_id') || '';
    const deviceType = window.innerWidth < 768 ? 'Mobile' : 'Desktop';

    const payload = JSON.stringify({
      type:         'pageview',
      path:         fullPath,
      utm_source:   utmSource,
      utm_medium:   utmMedium,
      utm_campaign: utmCampaign,
      session_id:   sessionId,
      device:       deviceType,
      metadata: {
        referrer:     document.referrer || '',
        screen_width: window.innerWidth,
      },
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }

    // Trigger Meta Pixel PageView
    const w = window as any;
    if (typeof w.fbq === 'function') {
      w.fbq('track', 'PageView');
    }
    if (typeof w.ttq === 'object' && typeof w.ttq.page === 'function') {
      w.ttq.page();
    }
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
