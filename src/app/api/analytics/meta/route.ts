import { NextResponse } from 'next/server';

// ── Types ──
interface MetaAdResult {
  id: string;
  adCreativeBody: string;
  adCreativeLinkTitle: string;
  pageName: string;
  pageId: string;
  startDate: string;
  liveDays: number;
  estimatedSalesConfidence: 'HIGH (Winning Product)' | 'MEDIUM' | 'LOW';
  impressionsLower?: number;
  impressionsUpper?: number;
  spendLower?: number;
  spendUpper?: number;
  currency?: string;
}

interface MetaApiResponse {
  success: boolean;
  data: MetaAdResult[];
  query: string;
  region: string;
  error?: string;
}

// ── Helpers ──
function daysBetween(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getConfidence(days: number): MetaAdResult['estimatedSalesConfidence'] {
  if (days > 14) return 'HIGH (Winning Product)';
  if (days > 7) return 'MEDIUM';
  return 'LOW';
}

// ── GET Handler ──
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'smartwatch';
    const token = process.env.META_AD_LIBRARY_TOKEN;
    const region = process.env.NEXT_PUBLIC_TARGET_REGION || 'PK';

    if (!token) {
      // Return demo/fallback data when no token is configured
      return NextResponse.json({
        success: true,
        data: generateFallbackData(query),
        query,
        region,
        error: 'META_AD_LIBRARY_TOKEN not configured — showing simulated data for demonstration.',
      } satisfies MetaApiResponse);
    }

    const url = new URL('https://graph.facebook.com/v20.0/ads_archive');
    url.searchParams.set('access_token', token);
    url.searchParams.set('search_terms', query);
    url.searchParams.set('ad_reached_countries', `["${region}"]`);
    url.searchParams.set('ad_active_status', 'ACTIVE');
    url.searchParams.set('fields', 'id,ad_creative_bodies,ad_creative_link_titles,page_name,page_id,ad_delivery_start_time,impressions,spend,currency');
    url.searchParams.set('limit', '15');

    const res = await fetch(url.toString(), { next: { revalidate: 300 } }); // cache 5 min
    const json = await res.json();

    if (!res.ok || json.error) {
      console.error('Meta Ad Library API error:', json.error);
      let errorMsg = json.error?.message || 'Unknown error';
      if (json.error?.code === 10 || json.error?.error_subcode === 2332002) {
        errorMsg = 'Meta Ad Library requires Identity Verification. Please go to facebook.com/ads/library/api to verify your profile ID and accept Meta terms.';
      }
      return NextResponse.json({
        success: true,
        data: generateFallbackData(query),
        query,
        region,
        error: `${errorMsg} — showing simulated data for demonstration.`,
      } satisfies MetaApiResponse);
    }

    const ads: MetaAdResult[] = (json.data || []).map((ad: any) => {
      const startDate = ad.ad_delivery_start_time || new Date().toISOString();
      const liveDays = daysBetween(startDate);
      const impressions = ad.impressions || {};
      const spend = ad.spend || {};

      return {
        id: ad.id,
        adCreativeBody: ad.ad_creative_bodies?.[0] || 'No ad body available',
        adCreativeLinkTitle: ad.ad_creative_link_titles?.[0] || '',
        pageName: ad.page_name || 'Unknown',
        pageId: ad.page_id || '',
        startDate,
        liveDays,
        estimatedSalesConfidence: getConfidence(liveDays),
        impressionsLower: impressions.lower_bound ? parseInt(impressions.lower_bound) : undefined,
        impressionsUpper: impressions.upper_bound ? parseInt(impressions.upper_bound) : undefined,
        spendLower: spend.lower_bound ? parseFloat(spend.lower_bound) : undefined,
        spendUpper: spend.upper_bound ? parseFloat(spend.upper_bound) : undefined,
        currency: ad.currency,
      };
    });

    return NextResponse.json({
      success: true,
      data: ads,
      query,
      region,
    } satisfies MetaApiResponse);

  } catch (err: any) {
    console.error('Meta Ad Library route error:', err);
    return NextResponse.json({
      success: false,
      data: [],
      query: '',
      region: '',
      error: err.message || 'Internal Server Error',
    } satisfies MetaApiResponse, { status: 500 });
  }
}

// ── Fallback Demo Data ──
function generateFallbackData(query: string): MetaAdResult[] {
  const now = new Date();
  const demoAds = [
    { page: 'SmartGadgets PK', body: `🔥 Best ${query} in Pakistan — Free Delivery Nationwide! Limited stock. Order on WhatsApp now.`, days: 22 },
    { page: 'TechZone Official', body: `Premium ${query} — 50% OFF Eid Sale! ✅ Cash on Delivery ✅ 1 Year Warranty`, days: 18 },
    { page: 'GadgetHub Islamabad', body: `New arrival! ${query} with HD display, heart rate monitor & 7-day battery. Rs. 2,499 only.`, days: 11 },
    { page: 'ElectroMart Rawalpindi', body: `Looking for affordable ${query}? Starting from Rs.1,999. DM to order ❤️`, days: 5 },
    { page: 'OnlineDeals.pk', body: `${query} — Trending now! 🔥 Over 500+ sold this month. Free shipping for Islamabad/Rawalpindi.`, days: 31 },
  ];

  return demoAds.map((ad, i) => {
    const startDate = new Date(now.getTime() - ad.days * 86400000).toISOString();
    return {
      id: `demo_${i}`,
      adCreativeBody: ad.body,
      adCreativeLinkTitle: `Shop ${query}`,
      pageName: ad.page,
      pageId: `demo_page_${i}`,
      startDate,
      liveDays: ad.days,
      estimatedSalesConfidence: getConfidence(ad.days),
    };
  });
}
