export type ProductAdsScope = 'my_products' | 'all';
export type ProductAdsSortBy = 'ads_desc' | 'sales_desc' | 'demand_desc' | 'price_asc' | 'price_desc';

export interface IProductAdAnalytics {
  id: string;
  name: string;
  slug?: string;
  image: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  isStoreProduct: boolean;
  
  // Sales Metrics
  totalSold: number;
  totalRevenuePKR: number;
  ordersCount: number;

  // Pakistan Ad Intelligence
  activeAdsCountPK: number;
  estimatedDailySpendPKR: number;
  demandScore: number; // 1-100
  platforms: ('Meta' | 'TikTok' | 'Instagram' | 'Google')[];
  topAdAngle: string;
  competitorPricePKR: number;
  
  // Links
  metaAdLibraryPkUrl: string;
  tiktokSearchPkUrl: string;
  youtubeReviewPkUrl: string;
}

export interface ISingleProductAdDetails extends IProductAdAnalytics {
  viralHook: {
    textOnScreen: string;
    verbalHookUrdu: string;
    hookStyle: string;
  };
  voiceoverScriptUrdu: string;
  videoProductionGuide: {
    conceptOverview: string;
    cameraSetup: string;
    sceneBreakdown: Array<{
      timeSeconds: string;
      visualShot: string;
      audioVoiceover: string;
      cameraAngle: string;
    }>;
    shootingTipsUrdu: string;
  };
  adTargetingKeywords: string[];
  referenceAdStyle: string;
  estimatedSourcingCostPKR: number;
  estimatedProfitMarginPKR: number;
}

export interface ProductAdsAnalyticsSummary {
  totalActiveAdsPK: number;
  totalTrackedSalesPKR: number;
  totalUnitsSold: number;
  topPerformingCategory: string;
  activeCampaignsCount: number;
}

export interface ProductAdsAnalyticsResponse {
  success: boolean;
  scope: ProductAdsScope;
  summary: ProductAdsAnalyticsSummary;
  categories: string[];
  products: IProductAdAnalytics[];
  error?: string;
}
