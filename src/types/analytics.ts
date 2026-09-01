/**
 * Analytics Domain Types & External API Responses
 */

export interface FunnelStep {
  step: number;
  label: string;
  description: string;
  count: number;
  conversionFromPrevious: number;
  conversionToEnd: number;
  rate?: string;
}


export interface AnalyticsData {
  stats: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    conversionRate: number;
    uniqueSessionsCount: number;
    products?: number;
    unreadContacts?: number;
    activePromos?: number;
    pageviews?: number;
    cartClicks?: number;
    whatsappClicks?: number;
    searchesCount?: number;
    abandonedCartLeak?: number;
  };
  marketing: Array<{
    source: string;
    visits: number;
    add_to_carts: number;
    purchases: number;
    revenue: number;
    roas: number;
  }>;
  campaigns?: Array<{
    campaign: string;
    source: string;
    visits: number;
    add_to_carts: number;
    purchases: number;
    revenue: number;
    roas: number;
  }>;
  topProducts?: Array<{
    _id: string;
    name: string;
    image: string;
    quantity: number;
    revenue: number;
  }>;
  funnel?: FunnelStep[];
  insights: {
    searches: Array<{ keyword: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
    devices: { mobile: number; desktop: number };
    demographics?: {
      age: Array<{ range: string; count: number }>;
      gender: Array<{ gender: string; count: number }>;
    };
    platforms?: {
      os: Array<{ os: string; count: number }>;
      browsers: Array<{ browser: string; count: number }>;
    };
    locations?: Array<{ city: string; count: number }>;
  };
  feed: Array<{
    _id: string;
    description: string;
    device: 'Mobile' | 'Desktop';
    source: string;
    timestamp: string;
  }>;
  charts: {
    labels: string[];
    revenue: number[];
    conversion: number[];
    pageviews?: number[];
  };
}

export type AnalyticsTabKey = 'revenue' | 'traffic' | 'cities' | 'funnel' | 'market';

export interface AnalyticsKPIHeaderProps {
  data: AnalyticsData | null;
  timeframe: '7d' | '30d' | '90d' | 'all';
  setTimeframe: (t: '7d' | '30d' | '90d' | 'all') => void;
  activeTab: AnalyticsTabKey;
  setActiveTab: (t: AnalyticsTabKey) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export interface AnalyticsTabItem {
  key: AnalyticsTabKey;
  label: string;
  icon: string;
}

export interface TikTokPostResult {
  id: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  videoUrl?: string;
  video_url?: string;
  caption?: string;
  title?: string;
  item_id?: string;
  viewsCount?: number;
  view_count?: number;
  likesCount?: number;
  like_count?: number;
  commentsCount?: number;
  comment_count?: number;
  sharesCount?: number;
  share_count?: number;
  engagementRate?: number;
  create_time?: number;
  product_name?: string;
  performance_score?: number;
}

export interface TikTokApiResponse {
  success: boolean;
  data: TikTokPostResult[];
  query?: string;
  error?: string;
  nextCursor?: number | string;
  hasMore?: boolean;
  summary?: {
    totalViews: number;
    totalLikes: number;
    totalPosts: number;
  };
}

export interface MetaAdResult {
  id: string;
  adCreativeBody?: string;
  adCreativeLinkTitle?: string;
  ad_title?: string;
  pageName?: string;
  page_name?: string;
  pageId?: string;
  startDate?: string;
  liveDays?: number;
  estimatedSalesConfidence?: 'HIGH (Winning Product)' | 'MEDIUM' | 'LOW' | string;
  impressionsLower?: number;
  impressionsUpper?: number;
  spendLower?: number;
  spendUpper?: number;
  currency?: string;
  ad_snapshot_url?: string;
  impressions_range?: string;
  spend_range?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | string;
  target_interests?: string[];
  product_name?: string;
  creative_type?: 'video' | 'image' | 'carousel' | string;
  estimated_cpm?: number;
}

export interface MetaApiResponse {
  success: boolean;
  data: MetaAdResult[];
  query?: string;
  region?: string;
  error?: string;
  summary?: {
    activeAdsCount: number;
    avgEstimatedCpm: number;
    topAngle: string;
  };
}
