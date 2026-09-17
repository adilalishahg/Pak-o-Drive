import React from 'react';
import { TrendingAdIntelligence } from '@/lib/intelligenceEngine';
import styles from './trends.module.css';

interface TrendDetailModalProps {
  selectedItem: TrendingAdIntelligence | null;
  onClose: () => void;
  onCopyScript: (script: string, id: string) => void;
  copiedId: string | null;
}

export const TrendDetailModal: React.FC<TrendDetailModalProps> = ({
  selectedItem,
  onClose,
  onCopyScript,
  copiedId,
}) => {
  if (!selectedItem) return null;

  return (
    <div className={styles.trendsModalBackdrop} onClick={onClose}>
      <div
        className={styles.trendsModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: '20px' }}>🎬</span>
              <h2 className="leading-normal font-bold text-slate-900 m-0" style={{ fontSize: '17px' }}>
                {selectedItem.productName}
              </h2>
            </div>
            <p className="leading-normal text-slate-500 m-0" style={{ fontSize: '12.5px' }}>
              Concept: <strong>{selectedItem.videoProductionGuide?.conceptOverview}</strong>
            </p>
            {/* Live Ad Links in Modal */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <a
                href={
                  selectedItem.liveAdLinks?.metaAdLibraryPk ||
                  `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(
                    selectedItem.productName
                  )}&search_type=keyword_unordered&media_type=all`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.trendAdLink} ${styles.meta}`}
              >
                <span>📘</span> Live Meta Ads (PK) ↗
              </a>
              <a
                href={
                  selectedItem.liveAdLinks?.tiktokSearchPk ||
                  `https://www.tiktok.com/search?q=${encodeURIComponent(
                    selectedItem.productName + ' pakistan'
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.trendAdLink} ${styles.tiktok}`}
              >
                <span>🎵</span> TikTok Viral (PK) ↗
              </a>
              <a
                href={
                  selectedItem.liveAdLinks?.youtubeSearchPk ||
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    selectedItem.productName + ' pakistan review unboxing'
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.trendAdLink} ${styles.youtube}`}
              >
                <span>🎬</span> YouTube Demo ↗
              </a>
            </div>
          </div>

          <button onClick={onClose} className={styles.trendsModalCloseBtn}>
            ✕
          </button>
        </div>

        {/* Smartphone Camera Setup Guide */}
        <div className={styles.trendsCameraGuideBox}>
          <div className="flex items-start gap-1.5">
            <span style={{ fontSize: '15px' }}>📱</span>
            <div>
              <strong style={{ fontSize: '12px', color: '#0f172a' }}>Camera & Lighting: </strong>
              <span style={{ fontSize: '12px', color: '#475569' }}>
                {selectedItem.videoProductionGuide?.cameraSetup}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 mt-1">
            <span style={{ fontSize: '15px' }}>💡</span>
            <div>
              <strong style={{ fontSize: '12px', color: '#0f172a' }}>Shooting Tips: </strong>
              <span style={{ fontSize: '12px', color: '#059669' }}>
                {selectedItem.videoProductionGuide?.shootingTipsUrdu}
              </span>
            </div>
          </div>
        </div>

        {/* Scene-by-Scene Shot List Table */}
        <h4 className="leading-normal font-bold text-slate-900 mb-2" style={{ fontSize: '14px' }}>
          🎥 Scene-by-Scene Shot List (0:00 - 0:30s Viral Video)
        </h4>
        <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '460px' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Time</th>
                <th style={{ padding: '8px 10px' }}>Angle</th>
                <th style={{ padding: '8px 10px' }}>Visual Action</th>
                <th style={{ padding: '8px 10px' }}>Voiceover (Urdu)</th>
              </tr>
            </thead>
            <tbody>
              {(selectedItem.videoProductionGuide?.sceneBreakdown || []).map((scene, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                    {scene.timeSeconds}
                  </td>
                  <td style={{ padding: '8px 10px', color: '#475569', fontWeight: 600 }}>{scene.cameraAngle}</td>
                  <td style={{ padding: '8px 10px', color: '#1e293b' }}>{scene.visualShot}</td>
                  <td style={{ padding: '8px 10px', color: '#059669', fontStyle: 'italic' }}>
                    "{scene.audioVoiceover}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Complete Voiceover Script Card */}
        <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h4 className="leading-normal font-bold text-slate-900 m-0" style={{ fontSize: '13px' }}>
              🎙️ Complete Voiceover Script (Roman Urdu)
            </h4>
            <button
              onClick={() => onCopyScript(selectedItem.voiceoverScriptUrdu, 'modal_script')}
              className={styles.trendBtnCopy}
              style={{ padding: '4px 10px', fontSize: '11.5px' }}
            >
              {copiedId === 'modal_script' ? '✓ Copied' : '📋 Copy Voiceover'}
            </button>
          </div>
          <p className="leading-normal text-slate-700 m-0" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
            "{selectedItem.voiceoverScriptUrdu}"
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={styles.trendBtnPrimary}
            style={{ width: 'auto', padding: '8px 18px', fontSize: '12.5px' }}
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
