'use client';

import React from 'react';
import { TikTokPost } from '@/types/marketIntelligence';
import {
  TrendingUpIcon,
  EyeIcon,
  HeartIcon,
  MessageIcon,
  ShareIcon,
} from './MarketIntelligenceIcons';

export interface TikTokTrendingCardProps {
  post: TikTokPost;
}

export const TikTokTrendingCard: React.FC<TikTokTrendingCardProps> = ({ post }) => {
  const views = post.views ?? post.viewsCount ?? 0;
  const likes = post.likes ?? post.likesCount ?? 0;
  const comments = post.comments ?? post.commentsCount ?? 0;
  const shares = post.shares ?? post.sharesCount ?? 0;
  const videoUrl = post.videoUrl || `https://www.tiktok.com/@${post.creatorHandle}`;

  return (
    <div
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
          <span
            className={`badge px-2 py-0.5 rounded-pill text-[0.62rem] fw-black border ${
              post.engagementRate >= 5
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            ER: {post.engagementRate}%
          </span>
          {post.engagementRate >= 5 && (
            <span
              className="badge text-white font-black uppercase px-1 rounded-sm text-[8px] tracking-wider flex align-items-center gap-0.5 shadow-sm"
              style={{ background: '#7c3aed' }}
            >
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
      <div className="grid grid-cols-4 gap-1 py-1.5 px-2 bg-white rounded-3 border border-slate-200 border-opacity-40 text-center">
        <div>
          <span className="text-[10px] text-muted flex items-center justify-center gap-1 font-semibold">
            <EyeIcon /> Views
          </span>
          <strong className="text-dark text-[11px] block mt-0.5">
            {views >= 1000000 ? `${(views / 1000000).toFixed(1)}M` : views >= 1000 ? `${(views / 1000).toFixed(0)}k` : views}
          </strong>
        </div>

        <div>
          <span className="text-[10px] text-muted flex items-center justify-center gap-1 font-semibold">
            <HeartIcon /> Likes
          </span>
          <strong className="text-dark text-[11px] block mt-0.5">
            {likes >= 1000000 ? `${(likes / 1000000).toFixed(1)}M` : likes >= 1000 ? `${(likes / 1000).toFixed(0)}k` : likes}
          </strong>
        </div>

        <div>
          <span className="text-[10px] text-muted flex items-center justify-center gap-1 font-semibold">
            <MessageIcon /> Comments
          </span>
          <strong className="text-dark text-[11px] block mt-0.5">
            {comments >= 1000 ? `${(comments / 1000).toFixed(1)}k` : comments}
          </strong>
        </div>

        <div>
          <span className="text-[10px] text-muted flex items-center justify-center gap-1 font-semibold">
            <ShareIcon /> Shares
          </span>
          <strong className="text-dark text-[11px] block mt-0.5">
            {shares >= 1000 ? `${(shares / 1000).toFixed(1)}k` : shares}
          </strong>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center pt-1 mt-auto">
        <span className="text-[10px] text-muted">
          Engagement: {post.engagementRate}%
        </span>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black text-rose-600 uppercase tracking-wider hover:underline flex items-center gap-1"
        >
          Watch on TikTok ➔
        </a>
      </div>
    </div>
  );
};
