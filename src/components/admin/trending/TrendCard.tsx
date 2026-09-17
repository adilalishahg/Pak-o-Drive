import React from 'react';
import { TrendingAdIntelligence } from '@/lib/intelligenceEngine';
import styles from './trends.module.css';

interface TrendCardProps {
  trend: TrendingAdIntelligence;
  onSelect: (trend: TrendingAdIntelligence) => void;
  onCopyScript: (script: string, id: string) => void;
  isCopied: boolean;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  trend,
  onSelect,
  onCopyScript,
  isCopied,
}) => {
  return (
    <div className={styles.trendCard}>
      {/* Card Header: Badges */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`${styles.trendStoreBadge} ${
                trend.isExistingInStore ? styles.inStore : styles.opportunity
              }`}
            >
              {trend.isExistingInStore ? '📦 IN YOUR STORE' : '✨ OPPORTUNITY'}
            </span>
            <span className={styles.trendPlatformTag}>
              {trend.platform}
            </span>
          </div>

          {/* Demand Score */}
          <span className={styles.trendDemandBadge}>
            🔥 {trend.estimatedDemandScore}% Demand
          </span>
        </div>

        {/* Product Title */}
        <h3 className={`leading-normal py-0.5 font-bold ${styles.trendProductTitle}`}>
          {trend.productName}
        </h3>
        <p className="leading-normal text-slate-500 mb-3" style={{ fontSize: '12px' }}>
          Category: <strong style={{ color: '#334155' }}>{trend.category}</strong>
        </p>

        {/* Economics Matrix */}
        <div className={styles.trendEconomicsMatrix}>
          <div className={styles.trendEconCol}>
            <span className={styles.trendEconLabel}>Sourcing Cost</span>
            <strong className={`${styles.trendEconVal} text-slate-700`}>
              Rs. {trend.estimatedSourcingCostPKR?.toLocaleString()}
            </strong>
          </div>
          <div className={styles.trendEconCol}>
            <span className={styles.trendEconLabel}>Suggested Price</span>
            <strong className={`${styles.trendEconVal} text-slate-900`}>
              Rs. {trend.suggestedRetailPricePKR?.toLocaleString()}
            </strong>
          </div>
          <div className={`${styles.trendEconCol} ${styles.profitCol}`}>
            <span className={`${styles.trendEconLabel} text-emerald-600 font-bold`}>Est. Profit</span>
            <strong className={`${styles.trendEconVal} text-emerald-700`}>
              +Rs. {trend.estimatedProfitMarginPKR?.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Viral 0-3s Hook Preview Box */}
        <div className={styles.trendViralHookBox}>
          <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
              🎯 0-3s Hook ({trend.viralHook?.hookStyle})
            </span>
            <span style={{ fontSize: '10px', color: '#92400e', background: 'rgba(255,255,255,0.8)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
              On-Screen Text
            </span>
          </div>
          <p className="leading-normal font-bold text-amber-950 mb-1" style={{ fontSize: '12.5px' }}>
            "{trend.viralHook?.textOnScreen}"
          </p>
          <p className="leading-normal text-amber-900 m-0" style={{ fontSize: '11.5px', fontStyle: 'italic', lineHeight: 1.4 }}>
            🎙️ Spoken: "{trend.viralHook?.verbalHookUrdu}"
          </p>
        </div>

        {/* Competitor Strategy Angle */}
        <div className="mb-3">
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
            🧠 Competitor Winning Strategy:
          </span>
          <p className="leading-normal text-slate-700 m-0" style={{ fontSize: '12px', lineHeight: 1.4 }}>
            {trend.competitorAdAngle}
          </p>
        </div>

        {/* Target Keywords Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(trend.adTargetingKeywords || []).slice(0, 4).map((k, idx) => (
            <span key={idx} className={styles.trendKeywordTag}>
              #{k}
            </span>
          ))}
        </div>

        {/* Live Competitor Ads in Pakistan Links */}
        <div className={styles.trendLiveAdsBox}>
          <span className={styles.trendLiveAdsLabel}>
            🇵🇰 Live Competitor Ads (Pakistan):
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <a
              href={trend.liveAdLinks?.metaAdLibraryPk || `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(trend.productName)}&search_type=keyword_unordered&media_type=all`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.trendAdLink} ${styles.meta}`}
              title="View active competitor ads in Meta Ad Library (Pakistan)"
            >
              <span>📘</span> Meta Ads (PK) ↗
            </a>
            <a
              href={trend.liveAdLinks?.tiktokSearchPk || `https://www.tiktok.com/search?q=${encodeURIComponent(trend.productName + ' pakistan')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.trendAdLink} ${styles.tiktok}`}
              title="View viral video ads on TikTok Pakistan"
            >
              <span>🎵</span> TikTok (PK) ↗
            </a>
            <a
              href={trend.liveAdLinks?.youtubeSearchPk || `https://www.youtube.com/results?search_query=${encodeURIComponent(trend.productName + ' pakistan review unboxing')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.trendAdLink} ${styles.youtube}`}
              title="Watch product video reviews in Pakistan"
            >
              <span>🎬</span> YouTube ↗
            </a>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className={styles.trendCardFooter}>
        <button
          onClick={() => onSelect(trend)}
          className={styles.trendBtnPrimary}
        >
          <span>🎬</span> View Shot List & Script
        </button>

        <button
          onClick={() => onCopyScript(trend.voiceoverScriptUrdu, trend.id)}
          title="Copy Full Roman Urdu Voiceover Script"
          className={`${styles.trendBtnCopy} ${isCopied ? styles.copied : ''}`}
        >
          {isCopied ? '✓ Copied' : '📋 Copy Script'}
        </button>
      </div>
    </div>
  );
};
