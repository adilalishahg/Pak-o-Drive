'use client';

import React from 'react';
import { MetaAd } from '@/types/marketIntelligence';
import { CalendarIcon } from './MarketIntelligenceIcons';

export interface CompetitorAdCardProps {
  ad: MetaAd;
}

export const CompetitorAdCard: React.FC<CompetitorAdCardProps> = ({ ad }) => {
  return (
    <div
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
          <span
            className={`badge px-2 py-0.5 rounded-pill text-[0.62rem] fw-bold ${
              ad.liveDays > 14
                ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10'
                : 'bg-success bg-opacity-10 text-success border border-success border-opacity-10'
            }`}
          >
            {ad.liveDays} Days Active
          </span>

          <span
            className={`badge px-2 py-0.5 rounded text-[9px] fw-black tracking-wider uppercase ${
              ad.estimatedSalesConfidence === 'HIGH (Winning Product)'
                ? 'bg-success text-white'
                : ad.estimatedSalesConfidence === 'MEDIUM'
                ? 'bg-warning text-dark'
                : 'bg-secondary text-white'
            }`}
            style={{
              background: ad.estimatedSalesConfidence === 'HIGH (Winning Product)' ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
            }}
          >
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
  );
};
