'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MetaAd, TikTokPost, MarketIntelligenceDashboardProps } from '@/types/marketIntelligence';
import {
  SparklesIcon,
  SearchIcon,
  LoaderIcon,
  FacebookIcon,
  VideoIcon,
  AlertCircleIcon,
  ShoppingBagIcon,
} from './market-intelligence/MarketIntelligenceIcons';
import { CompetitorAdCard } from './market-intelligence/CompetitorAdCard';
import { TikTokTrendingCard } from './market-intelligence/TikTokTrendingCard';

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
    if (tiktokLoadingMore || !tiktokHasMore || !query.trim()) return;
    setTiktokLoadingMore(true);
    try {
      const res = await fetch(`/api/analytics/tiktok?q=${encodeURIComponent(query)}&cursor=${tiktokCursor}`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setTikTokPosts(prev => [...prev, ...data.data]);
        setTiktokCursor(data.nextCursor || '0');
        setTiktokHasMore(data.hasMore !== false);
      } else {
        setTiktokHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more TikTok videos:', err);
    } finally {
      setTiktokLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchIntelligence(initialQuery);
  }, [initialQuery, fetchIntelligence]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntelligence(query);
  };

  const handleChipClick = (keyword: string) => {
    setQuery(keyword);
    fetchIntelligence(keyword);
  };

  return (
    <div className="bg-white rounded-4 border p-4 shadow-sm flex flex-col gap-4" style={{ borderColor: '#f1f5f9' }}>
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="fw-bold text-dark text-base mb-0">
              Live Product Market Intelligence
            </h4>
            <span className="badge bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-pill text-[0.68rem] font-bold flex items-center gap-1">
              <SparklesIcon /> AI Sourced
            </span>
          </div>
          <p className="text-muted text-xs mb-0 mt-0.5">
            Monitor real-time competitor ad spend on Meta and consumer viral engagement on TikTok in Pakistan.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g., smartwatch, earbuds)..."
              className="form-control form-control-sm rounded-pill pl-8 pr-3 text-xs bg-slate-50 border-slate-200 focus:bg-white"
              style={{ fontSize: '0.78rem' }}
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-sm btn-dark rounded-pill px-3 font-bold text-xs flex-shrink-0 flex items-center gap-1.5"
            style={{ fontSize: '0.75rem', background: '#0f172a' }}
          >
            {loading ? <LoaderIcon /> : 'Scan Market'}
          </button>
        </form>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-muted text-[11px] font-bold flex-shrink-0 uppercase tracking-wider">Top Niches:</span>
        {['smartwatch', 'tws earbuds', 'car charger', 'mobile holder', 'magnetic cable', 'dash cam'].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className={`badge rounded-pill px-2.5 py-1 text-[0.7rem] font-medium border flex-shrink-0 transition-all ${
              query.toLowerCase() === chip 
                ? 'bg-dark text-white border-dark' 
                : 'bg-light text-dark border-slate-200 hover:bg-slate-100'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Market Pulse Status Sub-header */}
      <div className="bg-slate-50 border border-slate-100 rounded-3 px-3 py-2 text-xs flex items-center gap-2">
        <i className="fas fa-chart-line text-primary" />
        <span className="text-muted">Analyzing Ads & Viral Content for:</span>
        <strong className="text-dark">&quot;{query}&quot;</strong>
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
                <CompetitorAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="p-5 bg-light rounded-4 text-center text-muted text-xs border border-dashed">
              <ShoppingBagIcon />
              No active Meta ads found for &quot;{query}&quot;.
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
                <TikTokTrendingCard key={post.id} post={post} />
              ))}

              {tiktokHasMore && (
                <button
                  type="button"
                  onClick={fetchMoreTikTok}
                  disabled={tiktokLoadingMore}
                  className="btn btn-sm btn-outline-dark rounded-pill py-1.5 mt-2 font-bold text-xs flex items-center justify-center gap-2"
                >
                  {tiktokLoadingMore ? (
                    <>
                      <LoaderIcon />
                      Loading more TikTok videos...
                    </>
                  ) : (
                    'Load More TikTok Trends ⬇'
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 bg-light rounded-4 text-center text-muted text-xs border border-dashed">
              <ShoppingBagIcon />
              No viral TikTok content found for &quot;{query}&quot;.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
