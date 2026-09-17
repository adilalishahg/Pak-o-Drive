import React from 'react';
import styles from './trends.module.css';

interface TrendsHeaderProps {
  limit: number;
  onUpdateLimit: (limit: number) => void;
  isUpdatingLimit: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onDownloadCSV: () => void;
  onDownloadBrief: () => void;
  hasReport: boolean;
  isSendingWhatsApp: boolean;
  onSendWhatsApp: () => void;
  onOpenLinkedIn: () => void;
}

export const TrendsHeader: React.FC<TrendsHeaderProps> = ({
  limit,
  onUpdateLimit,
  isUpdatingLimit,
  isLoading,
  isRefreshing,
  onRefresh,
  onDownloadCSV,
  onDownloadBrief,
  hasReport,
  isSendingWhatsApp,
  onSendWhatsApp,
  onOpenLinkedIn,
}) => {
  return (
    <div className={styles.trendsLabHeader}>
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <span style={{ fontSize: '26px' }}>🔥</span>
          <h1 className={`leading-normal py-0.5 font-bold ${styles.trendsLabTitle}`}>
            Viral Ad & Trends Intelligence Lab
          </h1>
          <span className={styles.trendsAiBadge}>
            AI Live Suite
          </span>
        </div>
        <p className="leading-normal text-slate-500 mt-1" style={{ fontSize: '13px', margin: 0 }}>
          Real-time competitor ads analysis, TikTok/Meta hooks, video blueprints & daily WhatsApp dispatch.
        </p>
      </div>

      {/* Action Buttons Toolbar */}
      <div className={styles.trendsLabActions}>
        {/* Daily Products Limit Selector */}
        <div className={styles.trendsLimitPill}>
          <span style={{ fontSize: '13px' }}>📊</span>
          <span>Limit:</span>
          <select
            value={limit}
            onChange={(e) => onUpdateLimit(parseInt(e.target.value, 10))}
            disabled={isUpdatingLimit || isLoading}
            className={styles.trendsLimitSelect}
          >
            <option value="5">5 Trends</option>
            <option value="10">10 Trends (Default)</option>
            <option value="15">15 Trends</option>
            <option value="20">20 Trends</option>
            <option value="21">21 Trends</option>
            <option value="25">25 Trends</option>
            <option value="30">30 Trends</option>
            <option value="50">50 Trends</option>
          </select>
        </div>

        {/* Refresh AI Analysis */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className={styles.trendsActionBtn}
        >
          <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s infinite linear' : 'none' }}>
            🔄
          </span>
          <span>{isRefreshing ? 'Analyzing...' : 'Refresh AI'}</span>
        </button>

        {/* Download CSV (Excel) */}
        <button
          onClick={onDownloadCSV}
          disabled={isLoading || !hasReport}
          className={`${styles.trendsActionBtn} text-emerald-700`}
        >
          <span>📥</span> <span>Excel CSV</span>
        </button>

        {/* Download Creative Brief */}
        <button
          onClick={onDownloadBrief}
          disabled={isLoading || !hasReport}
          className={`${styles.trendsActionBtn} text-indigo-700`}
        >
          <span>📄</span> <span>Brief (MD)</span>
        </button>

        {/* Send to WhatsApp Now */}
        <button
          onClick={onSendWhatsApp}
          disabled={isSendingWhatsApp || isLoading || !hasReport}
          className={styles.trendsWhatsappBtn}
        >
          <span>📲</span> <span>{isSendingWhatsApp ? 'Sending...' : 'Send to WhatsApp'}</span>
        </button>

        {/* AI LinkedIn Carousel Trigger Button */}
        <button
          type="button"
          onClick={onOpenLinkedIn}
          className={`${styles.trendsActionBtn} font-semibold`}
          style={{
            background: 'linear-gradient(135deg, #0a66c2 0%, #1e40af 100%)',
            color: '#ffffff',
            border: 'none',
          }}
          title="Generate and publish dynamic technical carousel to LinkedIn"
        >
          <span>🚀</span> <span>Post AI LinkedIn Carousel</span>
        </button>
      </div>
    </div>
  );
};
