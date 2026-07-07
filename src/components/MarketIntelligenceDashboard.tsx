'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ── Types ──
interface MetaAd {
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

interface TikTokPost {
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

interface MarketIntelligenceDashboardProps {
  initialQuery?: string;
}

// ── Custom SVGs ──
const SparklesIcon = () => (
  <svg className="w-4 h-4 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813zM19.071 4.929l-.707 3.535-3.536.708 3.536.707.707 3.536 3.536-3.536.707-.707-3.536-.708-3.536-.707z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.16 1.02.99 2.4 1.6 3.86 1.68v3.91a8.941 8.941 0 01-5.49-1.89v8.52a8.382 8.382 0 01-13.9 6.22 8.382 8.382 0 014.28-14.77c.05 1.25.43 2.5 1.16 3.5a4.472 4.472 0 00-.54 4.87c.72 1.45 2.2 2.37 3.82 2.37 2.43 0 4.41-1.98 4.41-4.41V0h.67z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8L13 14l-4-4-6 6" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default function MarketIntelligenceDashboard({ initialQuery = 'smartwatch' }: MarketIntelligenceDashboardProps) {
  const [query, setQuery] = useState(initialQuery);
  const [metaAds, setMetaAds] = useState<MetaAd[]>([]);
  const [tiktokPosts, setTikTokPosts] = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [tiktokError, setTikTokError] = useState<string | null>(null);

  // Pagination states
  const [tiktokLoadingMore, setTiktokLoadingMore] = useState(false);
  const [tiktokHasMore, setTiktokHasMore] = useState(true);
  const [tiktokCursor, setTiktokCursor] = useState<string | number>('0');

  const fetchIntelligence = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setMetaError(null);
    setTikTokError(null);
    setTiktokHasMore(true);
    setTiktokCursor('0');

    try {
      const [metaRes, tiktokRes] = await Promise.all([
        fetch(`/api/analytics/meta?q=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/analytics/tiktok?q=${encodeURIComponent(searchQuery)}&cursor=0`),
      ]);

      const metaJson = await metaRes.json();
      const tiktokJson = await tiktokRes.json();

      if (metaJson.success) {
        setMetaAds(metaJson.data || []);
        if (metaJson.error) {
          setMetaError(metaJson.error);
        }
      } else {
        setMetaError(metaJson.error || 'Failed to fetch Meta ads');
      }

      if (tiktokJson.success) {
        setTikTokPosts(tiktokJson.data || []);
        setTiktokCursor(tiktokJson.nextCursor || '0');
        setTiktokHasMore(tiktokJson.hasMore !== false);
        if (tiktokJson.error) {
          setTikTokError(tiktokJson.error);
        }
      } else {
        setTikTokError(tiktokJson.error || 'Failed to fetch TikTok engagement metrics');
      }
    } catch (err: any) {
      console.error('Error fetching market intelligence data:', err);
      setMetaError('Network error connecting to intelligence servers.');
      setTikTokError('Network error connecting to TikTok database.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreTikTok = async () => {
    if (tiktokLoadingMore || !tiktokHasMore) return;
    setTiktokLoadingMore(true);
    setTikTokError(null);
    try {
      const res = await fetch(`/api/analytics/tiktok?q=${encodeURIComponent(query)}&cursor=${tiktokCursor}`);
      const json = await res.json();
      if (json.success) {
        const newPosts = json.data || [];
        setTikTokPosts((prev) => [...prev, ...newPosts]);
        setTiktokCursor(json.nextCursor || '0');
        setTiktokHasMore(json.hasMore !== false && newPosts.length > 0);
        if (json.error) {
          setTikTokError(json.error);
        }
      } else {
        setTikTokError(json.error || 'Failed to fetch more TikTok data');
      }
    } catch (err) {
      console.error('Error loading more TikTok content:', err);
      setTikTokError('Failed to load more TikTok creative posts.');
    } finally {
      setTiktokLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchIntelligence(initialQuery);
  }, [initialQuery, fetchIntelligence]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntelligence(query);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-4 shadow-sm border p-3 p-md-4 mb-3 border-slate-100 text-slate-800">
      
      {/* Title & Filters Row */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between border-bottom pb-2 mb-3 gap-2">
        <div>
          <h6 className="fw-black text-dark mb-0 font-extrabold text-sm tracking-wider uppercase flex items-center gap-1.5">
            <SparklesIcon />
            🚀 AI Ads Finder & Viral TikTok Intelligence
          </h6>
          <p className="text-muted mb-0 mt-1 text-[0.72rem]">
            Cross-reference live competitor Meta ad creatives and trending high-engagement TikTok campaigns to source items.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="d-flex align-items-center w-full md:w-auto max-w-sm gap-2">
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g. smartwatch, earbuds)..."
              className="form-control form-control-sm rounded-pill pl-9 pr-3 text-xs text-dark"
              style={{ fontSize: '0.78rem' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 font-bold text-white text-xs flex-shrink-0 flex items-center gap-1"
            style={{
              background: 'linear-gradient(to right, #ea580c, #f97316)',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            {loading ? (
              <>
                <LoaderIcon />
                Analyzing
              </>
            ) : (
              'Apply'
            )}
          </button>
        </form>
      </div>

      {/* Target Status Indicator */}
      <div className="alert alert-light border d-flex flex-wrap align-items-center gap-1.5 py-2 px-3 mb-3 rounded-3 text-[0.75rem]">
        <i className="fas fa-chart-line text-primary" />
        <span className="text-muted">Analyzing Ads & Viral Content for:</span>
        <strong className="text-dark">"{query}"</strong>
        <span className="text-muted">in</span>
        <strong className="text-dark">Pakistan & TikTok Global</strong>
      </div>

      {/* Double Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* Left Column: Meta Competitor Ads Archive */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FacebookIcon />
              </div>
              <div>
                <span className="fw-bold text-xs text-dark block">Meta Competitor Ads</span>
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Active Ad Library Archive</span>
              </div>
            </div>
            {metaAds.length > 0 && (
              <span className="badge bg-light text-muted border px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                {metaAds.length} Active Ads
              </span>
            )}
          </div>

          {metaError && (
            <div className="alert alert-light border-warning text-warning d-flex flex-column gap-2 py-2 px-3 rounded-3 text-[0.7rem] mb-0">
              <div className="d-flex align-items-start gap-2">
                <AlertCircleIcon />
                <span className="flex-grow-1" style={{ wordBreak: 'break-word' }}>{metaError}</span>
              </div>
              <a
                href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-warning w-100 rounded-pill py-1 mt-1 font-bold text-center flex align-items-center justify-content-center gap-1.5"
                style={{ fontSize: '0.68rem', fontWeight: 600 }}
              >
                <i className="fab fa-facebook-f" />
                Search Public Meta Ad Library (No verification needed)
              </a>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-50 border border-slate-100 animate-pulse rounded-3" />
              ))}
            </div>
          ) : metaAds.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {metaAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-light border rounded-4 p-3 hover:shadow-sm transition-all duration-200 flex flex-col gap-2.5"
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <strong className="text-dark text-xs block">
                        {ad.pageName}
                      </strong>
                      <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                        <CalendarIcon />
                        Started {new Date(ad.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-1">
                      <span className={`badge px-2 py-0.5 rounded-pill text-[0.62rem] fw-bold ${
                        ad.liveDays > 14 
                          ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10' 
                          : 'bg-success bg-opacity-10 text-success border border-success border-opacity-10'
                      }`}>
                        {ad.liveDays} Days Active
                      </span>
                      
                      <span className={`badge px-2 py-0.5 rounded text-[9px] fw-black tracking-wider uppercase ${
                        ad.estimatedSalesConfidence === 'HIGH (Winning Product)'
                          ? 'bg-success text-white'
                          : ad.estimatedSalesConfidence === 'MEDIUM'
                          ? 'bg-warning text-dark'
                          : 'bg-secondary text-white'
                      }`} style={{
                        background: ad.estimatedSalesConfidence === 'HIGH (Winning Product)' ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined
                      }}>
                        {ad.estimatedSalesConfidence === 'HIGH (Winning Product)' ? '🔥 Winning Ad' : `${ad.estimatedSalesConfidence} Demand`}
                      </span>
                    </div>
                  </div>

                  <p className="text-dark text-[0.75rem] leading-relaxed whitespace-pre-line border-top border-slate-200 border-opacity-40 pt-2.5 mb-0" style={{ color: '#4a5568' }}>
                    {ad.adCreativeBody}
                  </p>

                  {ad.adCreativeLinkTitle && (
                    <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-slate-200 border-opacity-40 mt-1">
                      <span className="text-[11px] font-bold text-dark truncate pr-2">
                        {ad.adCreativeLinkTitle}
                      </span>
                      <a
                        href={`https://facebook.com/ads/library/?id=${ad.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline flex-shrink-0"
                      >
                        View Ad
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 bg-light rounded-4 text-center text-muted text-xs border border-dashed">
              <ShoppingBagIcon />
              No active Meta ads found for "{query}".
            </div>
          )}
        </div>

        {/* Right Column: TikTok Consumer Engagement */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <VideoIcon />
              </div>
              <div>
                <span className="fw-bold text-xs text-dark block">TikTok Viral Trends</span>
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">User Engagement Analytics</span>
              </div>
            </div>
            {tiktokPosts.length > 0 && (
              <span className="badge bg-light text-muted border px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                {tiktokPosts.length} Videos
              </span>
            )}
          </div>

          {tiktokError && (
            <div className="alert alert-light border-warning text-warning d-flex gap-2 align-items-center py-2 px-3 rounded-3 text-[0.7rem] mb-0">
              <AlertCircleIcon />
              <span>{tiktokError}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-50 border border-slate-100 animate-pulse rounded-3" />
              ))}
            </div>
          ) : tiktokPosts.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {tiktokPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-light border rounded-4 p-3 hover:shadow-sm transition-all duration-200 flex flex-col gap-2.5"
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="w-7 h-7 rounded-circle bg-primary bg-opacity-10 text-primary fw-bold text-[10px] d-flex align-items-center justify-content-center shadow-sm uppercase">
                        {post.creatorHandle.slice(0, 2)}
                      </div>
                      <div>
                        <strong className="text-dark text-xs block">
                          @{post.creatorHandle}
                        </strong>
                        <span className="text-[9px] text-muted uppercase tracking-widest font-black">Creator</span>
                      </div>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-1">
                      <span className={`badge px-2 py-0.5 rounded-pill text-[0.62rem] fw-black border ${
                        post.engagementRate >= 5 
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        ER: {post.engagementRate}%
                      </span>
                      {post.engagementRate >= 5 && (
                        <span className="badge bg-purple text-white font-black uppercase px-1 rounded-sm text-[8px] tracking-wider flex align-items-center gap-0.5 shadow-sm" style={{ background: '#7c3aed' }}>
                          <TrendingUpIcon />
                          Viral Engagement
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-dark text-[0.75rem] leading-relaxed line-clamp-2 border-top border-slate-200 border-opacity-40 pt-2.5 mb-1" style={{ color: '#4a5568' }}>
                    {post.caption}
                  </p>

                  {/* Grid Metrics */}
                  <div className="grid grid-cols-4 gap-1 bg-white p-2 rounded-3 border border-slate-200 border-opacity-40 text-center">
                    <div className="d-flex flex-column align-items-center">
                      <span className="text-[9px] text-muted fw-bold d-flex align-items-center gap-1 mb-0.5">
                        <EyeIcon /> Views
                      </span>
                      <strong className="text-dark text-[10px]">
                        {formatNumber(post.viewsCount)}
                      </strong>
                    </div>

                    <div className="d-flex flex-column align-items-center">
                      <span className="text-[9px] text-muted fw-bold d-flex align-items-center gap-1 mb-0.5">
                        <HeartIcon /> Likes
                      </span>
                      <strong className="text-dark text-[10px]">
                        {formatNumber(post.likesCount)}
                      </strong>
                    </div>

                    <div className="d-flex flex-column align-items-center">
                      <span className="text-[9px] text-muted fw-bold d-flex align-items-center gap-1 mb-0.5">
                        <MessageIcon /> Comments
                      </span>
                      <strong className="text-dark text-[10px]">
                        {formatNumber(post.commentsCount)}
                      </strong>
                    </div>

                    <div className="d-flex flex-column align-items-center">
                      <span className="text-[9px] text-muted fw-bold d-flex align-items-center gap-1 mb-0.5">
                        <ShareIcon /> Shares
                      </span>
                      <strong className="text-dark text-[10px]">
                        {formatNumber(post.sharesCount)}
                      </strong>
                    </div>
                  </div>

                  {/* Watch Video link */}
                  {post.videoUrl && (
                    <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-slate-200 border-opacity-40 mt-1">
                      <span className="text-[11px] font-bold text-dark truncate pr-2">
                        TikTok Creative Content
                      </span>
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-rose-600 uppercase tracking-wider hover:underline flex-shrink-0"
                      >
                        Watch Video
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {tiktokHasMore && (
                <div className="text-center pt-2 pb-1">
                  <button
                    type="button"
                    disabled={tiktokLoadingMore}
                    onClick={fetchMoreTikTok}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-1.5 font-bold"
                    style={{ fontSize: '0.72rem', fontWeight: 600 }}
                  >
                    {tiktokLoadingMore ? (
                      <span className="spinner-border spinner-border-sm me-1.5 animate-spin" role="status" aria-hidden="true" />
                    ) : null}
                    {tiktokLoadingMore ? 'Loading More...' : 'Load More Video Creative'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-light rounded-4 text-center text-muted text-xs border border-dashed">
              <VideoIcon />
              No viral TikTok content matches "{query}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
