import React from 'react';
import styles from './trends.module.css';

interface TrendsInsightBannerProps {
  marketSummary?: string;
  generatedAt?: string;
  whatsappStatusMsg?: string | null;
}

export const TrendsInsightBanner: React.FC<TrendsInsightBannerProps> = ({
  marketSummary,
  generatedAt,
  whatsappStatusMsg,
}) => {
  return (
    <>
      {/* WhatsApp Status Toast Alert */}
      {whatsappStatusMsg && (
        <div
          className={`${styles.trendsAlert} ${
            whatsappStatusMsg.startsWith('✅') ? styles.trendsAlertSuccess : styles.trendsAlertWarning
          }`}
        >
          <span>{whatsappStatusMsg}</span>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>⚡ Auto-daily dispatch is also active (10:00 AM PKT)</span>
        </div>
      )}

      {/* Market Insight Banner */}
      {marketSummary && (
        <div className={styles.trendsInsightBanner}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>💡</span>
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h4 className="leading-normal font-bold text-sky-400 m-0" style={{ fontSize: '13.5px' }}>
                Pakistani Market Viral Ad Insight & Algorithm Pulse
              </h4>
              {generatedAt && (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  • Updated {new Date(generatedAt).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>
            <p className="leading-normal text-slate-200 m-0" style={{ fontSize: '13px', lineHeight: 1.5 }}>
              {marketSummary}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
