/**
 * SERVER-SIDE CONVERSION API UTILITY
 * src/utils/conversionApi.ts
 *
 * Sends Purchase events to Meta CAPI + TikTok Events API from the server.
 * All PII is SHA-256 hashed before transmission (Meta & TikTok requirement).
 * Both platform calls run in parallel via Promise.allSettled — a failure
 * in either platform NEVER blocks or throws to the caller.
 *
 * Required .env keys:
 *   META_PIXEL_ID, META_CAPI_ACCESS_TOKEN
 *   TIKTOK_PIXEL_ID, TIKTOK_CAPI_ACCESS_TOKEN
 *   NEXT_PUBLIC_SITE_URL  (e.g. https://pakodrive.com)
 */

import { createHash } from 'crypto';

export interface OrderConversionPayload {
  orderId: string;
  value: number;
  email?: string;
  phone?: string;
  clientIp?: string;
  userAgent?: string;
  fbclid?: string;
  ttclid?: string;
  utmSource?: string;
  contentNames?: string[];
  contentIds?: string[];
}

// ── Hashing helpers ───────────────────────────────────────────────────────────

function sha256(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalisePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  return phone.replace(/\D/g, '');
}

// ── Meta Conversion API ───────────────────────────────────────────────────────

export async function fireMetaConversionEvent(payload: OrderConversionPayload): Promise<void> {
  const pixelId     = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] Skipping — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set.');
    return;
  }

  const metaPayload = {
    data: [{
      event_name:    'Purchase',
      event_time:    Math.floor(Date.now() / 1000),
      event_id:      `order_${payload.orderId}`,   // dedup key vs browser pixel
      action_source: 'website',
      user_data: {
        em:                  sha256(payload.email)           ? [sha256(payload.email)]               : undefined,
        ph:                  sha256(normalisePhone(payload.phone)) ? [sha256(normalisePhone(payload.phone))] : undefined,
        client_ip_address:   payload.clientIp  || undefined,
        client_user_agent:   payload.userAgent || undefined,
        fbc:                 payload.fbclid ? `fb.1.${Date.now()}.${payload.fbclid}` : undefined,
        country:             [sha256('pk')],
      },
      custom_data: {
        value:        payload.value,
        currency:     'PKR',
        order_id:     payload.orderId,
        content_type: 'product',
        content_ids:  payload.contentIds  || [],
        content_name: payload.contentNames?.join(', ') || 'Purchase',
        num_items:    payload.contentIds?.length || 1,
      },
    }],
  };

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

  // Fire-and-forget — caller does NOT await this
  fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(metaPayload),
  })
    .then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('[Meta CAPI] Error response:', JSON.stringify(json));
      } else {
        console.log(`[Meta CAPI] Purchase sent. Events received: ${json.events_received}`);
      }
    })
    .catch((err) => console.error('[Meta CAPI] Network error:', err));
}

// ── TikTok Events API ─────────────────────────────────────────────────────────

export async function fireTikTokConversionEvent(payload: OrderConversionPayload): Promise<void> {
  const pixelId     = process.env.TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('[TikTok CAPI] Skipping — TIKTOK_PIXEL_ID or TIKTOK_CAPI_ACCESS_TOKEN not set.');
    return;
  }

  const tikTokPayload = {
    pixel_code: pixelId,
    event:      'CompletePayment',
    event_id:   `order_${payload.orderId}`,
    timestamp:  new Date().toISOString(),
    context: {
      user: {
        email:        sha256(payload.email)                  || undefined,
        phone_number: sha256(normalisePhone(payload.phone))  || undefined,
        ttclid:       payload.ttclid   || undefined,
        ip:           payload.clientIp || undefined,
        user_agent:   payload.userAgent|| undefined,
      },
      page: {
        url:      `${process.env.NEXT_PUBLIC_SITE_URL || ''}/order-confirmation/${payload.orderId}`,
        referrer: process.env.NEXT_PUBLIC_SITE_URL || '',
      },
    },
    properties: {
      value:        payload.value,
      currency:     'PKR',
      order_id:     payload.orderId,
      content_type: 'product',
      contents: (payload.contentIds || []).map((id, i) => ({
        content_id:   id,
        content_name: payload.contentNames?.[i] || id,
        quantity:     1,
      })),
    },
  };

  const url = 'https://business-api.tiktok.com/open_api/v1.3/pixel/track/';

  fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Access-Token': accessToken },
    body:    JSON.stringify(tikTokPayload),
  })
    .then(async (res) => {
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.code !== 0) {
        console.error('[TikTok CAPI] Error response:', JSON.stringify(json));
      } else {
        console.log('[TikTok CAPI] CompletePayment sent successfully.');
      }
    })
    .catch((err) => console.error('[TikTok CAPI] Network error:', err));
}

// ── Combined dispatcher ────────────────────────────────────────────────────────

/**
 * Fire purchase events to all ad platforms in parallel.
 * Uses Promise.allSettled so a failure from one platform never
 * rejects the whole call or surfaces to the order response.
 */
export async function fireConversionEvent(payload: OrderConversionPayload): Promise<void> {
  await Promise.allSettled([
    fireMetaConversionEvent(payload),
    fireTikTokConversionEvent(payload),
  ]);
}
