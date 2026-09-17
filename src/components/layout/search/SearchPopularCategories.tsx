'use client';

import React from 'react';

const POPULAR_SUGGESTIONS = [
  'Mehran Side Mirror',
  'Solar Air Freshener',
  'Ambient LED Lights',
  'Fast Car Charger',
  '3M Double Sided Tape',
  'Cosmic Car Wax',
];

interface SearchPopularCategoriesProps {
  setQuery: (query: string) => void;
  handleOpenLiveAgentChat: () => void;
}

export function SearchPopularCategories({ setQuery, handleOpenLiveAgentChat }: SearchPopularCategoriesProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <i className="fas fa-fire" style={{ color: '#ea580c', fontSize: '13px' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Popular Searches in Pakistan
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '18px' }}>
        {POPULAR_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(item)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '10px' }} />
            <span>{item}</span>
          </button>
        ))}
      </div>

      {/* Warehouse Assistance Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏢</span>
          <div>
            <h6 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              15,000+ Items in Central Warehouse
            </h6>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
              Thousands of auto parts and gadgets updated daily.
            </p>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
          Looking for a specific part not shown on the website? Chat directly with our Live Support Agent right now!
        </p>

        <button
          type="button"
          onClick={handleOpenLiveAgentChat}
          style={{
            width: '100%',
            padding: '9px 14px',
            borderRadius: '9999px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
          }}
        >
          <i className="fas fa-comments" />
          <span>Live Support Agent Se Poochhein</span>
        </button>
      </div>
    </div>
  );
}
