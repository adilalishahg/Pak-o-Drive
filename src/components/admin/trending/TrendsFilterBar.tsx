import React from 'react';
import styles from './trends.module.css';

interface TrendsFilterBarProps {
  selectedPlatform: 'All' | 'TikTok' | 'Meta' | 'Instagram';
  onSelectPlatform: (platform: 'All' | 'TikTok' | 'Meta' | 'Instagram') => void;
  filterType: 'all' | 'existing' | 'recommended';
  onSelectFilterType: (filter: 'all' | 'existing' | 'recommended') => void;
}

export const TrendsFilterBar: React.FC<TrendsFilterBarProps> = ({
  selectedPlatform,
  onSelectPlatform,
  filterType,
  onSelectFilterType,
}) => {
  return (
    <div className={styles.trendsFiltersBar}>
      {/* Platform Tabs */}
      <div className={styles.trendsFilterGroup}>
        {(['All', 'TikTok', 'Meta', 'Instagram'] as const).map((plat) => (
          <button
            key={plat}
            onClick={() => onSelectPlatform(plat)}
            className={`${styles.trendsFilterPill} ${selectedPlatform === plat ? styles.active : ''}`}
          >
            {plat === 'All' ? '🌐 All Platforms' : plat === 'TikTok' ? '🎵 TikTok Viral' : plat === 'Meta' ? '📘 Meta / FB' : '📸 Reels'}
          </button>
        ))}
      </div>

      {/* Scope Tabs */}
      <div className={styles.trendsFilterGroup}>
        {[
          { id: 'all', label: 'All Items' },
          { id: 'existing', label: '📦 In Store' },
          { id: 'recommended', label: '✨ High-Demand Recs' },
        ].map((scope) => (
          <button
            key={scope.id}
            onClick={() => onSelectFilterType(scope.id as any)}
            className={`${styles.trendsScopePill} ${filterType === scope.id ? styles.active : ''}`}
          >
            {scope.label}
          </button>
        ))}
      </div>
    </div>
  );
};
