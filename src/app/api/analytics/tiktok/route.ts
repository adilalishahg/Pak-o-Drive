import { NextResponse } from 'next/server';

// ── Types ──
interface TikTokPostResult {
  id: string;
  creatorHandle: string;
  creatorAvatar?: string;
  videoUrl?: string;
  caption: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  engagementRate: number;
}

interface TikTokApiResponse {
  success: boolean;
  data: TikTokPostResult[];
  query: string;
  error?: string;
}

// ── GET Handler ──
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'smartwatch';
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      // Return simulated trending dataset if RapidAPI key is not configured
      return NextResponse.json({
        success: true,
        data: generateFallbackTikTokData(query),
        query,
        error: 'RAPIDAPI_KEY not configured — showing simulated data for demonstration.',
      } satisfies TikTokApiResponse);
    }

    const host = process.env.RAPIDAPI_HOST || 'tiktok-all-in-one-api.p.rapidapi.com';
    const path = host.includes('tiktok-api23') ? '/api/search/video' : '/api/v1/search/post';
    const url = new URL(`https://${host}${path}`);
    
    url.searchParams.set('keywords', query);
    url.searchParams.set('keyword', query); // Set both parameter formats to be safe
    url.searchParams.set('count', '10');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': host,
      },
      next: { revalidate: 300 } // cache 5 min
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json || json.error || json.message === "Endpoint '/api/search/post' does not exist") {
      console.error('TikTok API error response:', json);
      return NextResponse.json({
        success: true,
        data: generateFallbackTikTokData(query),
        query,
        error: `TikTok API error: ${json?.message || json?.msg || 'Failed to fetch'} — showing simulated data.`,
      } satisfies TikTokApiResponse);
    }

    // Parse the API results (adapting for common TikTok search responses)
    const items = json.item_list || json.itemList || json.data?.itemList || json.data?.posts || json.data || [];
    const posts: TikTokPostResult[] = items.map((post: any) => {
      const statsObj = post.statistics || post.stats || {};
      const views = statsObj.play_count || statsObj.playCount || post.play_count || 1000;
      const likes = statsObj.digg_count || statsObj.diggCount || post.digg_count || 0;
      const comments = statsObj.comment_count || statsObj.commentCount || post.comment_count || 0;
      const shares = statsObj.share_count || statsObj.shareCount || post.share_count || 0;
      
      // Exact engagement rate calculation: ((likes + comments + shares) / views) * 100
      const er = views > 0 ? parseFloat((((likes + comments + shares) / views) * 100).toFixed(2)) : 0;

      const idVal = post.aweme_id || post.id || '';
      const handleVal = post.author?.unique_id || post.author?.uniqueId || post.author?.nickname || 'tiktok_creator';
      const webVideoUrl = idVal ? `https://www.tiktok.com/@${handleVal}/video/${idVal}` : (post.video?.play_addr?.url_list?.[0] || '');

      return {
        id: idVal || Math.random().toString(),
        creatorHandle: handleVal,
        creatorAvatar: post.author?.avatar_thumb?.url_list?.[0] || '',
        videoUrl: webVideoUrl,
        caption: post.desc || 'No caption available',
        viewsCount: views,
        likesCount: likes,
        commentsCount: comments,
        sharesCount: shares,
        engagementRate: er,
      };
    });

    return NextResponse.json({
      success: true,
      data: posts,
      query,
    } satisfies TikTokApiResponse);

  } catch (err: any) {
    console.error('TikTok API route error:', err);
    return NextResponse.json({
      success: false,
      data: [],
      query: '',
      error: err.message || 'Internal Server Error',
    } satisfies TikTokApiResponse, { status: 500 });
  }
}

// ── Fallback TikTok Data Generator ──
function generateFallbackTikTokData(query: string): TikTokPostResult[] {
  const demoPosts = [
    { creator: 'tech_reviews_pk', caption: `Unboxing the ultimate budget ${query} in Pakistan 🇵🇰! Must buy? #pakistan #tech`, views: 125000, likes: 9800, comments: 450, shares: 1200 },
    { creator: 'gadget_unboxing_official', caption: `Is this the best ${query} for Rs. 2,500? Let's test it out! #review #gadget`, views: 89000, likes: 6200, comments: 280, shares: 890 },
    { creator: 'islamabad_trends', caption: `Ordering random ${query} from local online store. You won't believe the quality! 😱`, views: 245000, likes: 18900, comments: 1100, shares: 3200 },
    { creator: 'karachi_deals', caption: `Top 3 ${query} under 3K in Pakistan! Link in bio. #sale #shopping`, views: 42000, likes: 2100, comments: 95, shares: 150 },
    { creator: 'lahori_retailer', caption: `Wholesale market price of ${query} in Shah Alam market Lahore! Direct delivery available.`, views: 167000, likes: 11200, comments: 850, shares: 2100 },
  ];

  return demoPosts.map((post, i) => {
    const totalEngagements = post.likes + post.comments + post.shares;
    const er = post.views > 0 ? parseFloat(((totalEngagements / post.views) * 100).toFixed(2)) : 0;
    
    return {
      id: `demo_tiktok_${i}`,
      creatorHandle: post.creator,
      caption: post.caption,
      viewsCount: post.views,
      likesCount: post.likes,
      commentsCount: post.comments,
      sharesCount: post.shares,
      engagementRate: er,
    };
  });
}
