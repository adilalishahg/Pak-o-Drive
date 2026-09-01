/**
 * Market Intelligence, TikTok & Meta Ad Spying Types for Pak-o-Drive Platform
 */

export interface MetaAd {
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
  mediaUrl?: string;
  mediaType?: 'video' | 'image';
  estimatedOrders?: number;
  adSpendEstimate?: string;
  firstSeen?: string;
  viralScore?: number;
  ctaType?: string;
  landingPageUrl?: string;
}

export interface TikTokPost {
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
  videoTitle?: string;
  author?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  soundTrack?: string;
  hookText?: string;
  coverUrl?: string;
  productName?: string;
  potentialMargin?: string;
}

export interface MarketIntelligenceDashboardProps {
  initialQuery?: string;
  metaAds?: MetaAd[];
  tiktokPosts?: TikTokPost[];
  onRefresh?: () => void;
  isLoading?: boolean;
}
