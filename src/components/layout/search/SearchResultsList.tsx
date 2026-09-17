'use client';

import React from 'react';
import Image from 'next/image';
import { SmartSearchResultProduct } from '../../../hooks/useMobileSmartSearch';

const POPULAR_SUGGESTIONS = [
  'Mehran Side Mirror',
  'Solar Air Freshener',
  'Ambient LED Lights',
  'Fast Car Charger',
  '3M Double Sided Tape',
  'Cosmic Car Wax',
];

interface SearchResultsListProps {
  query: string;
  setQuery: (query: string) => void;
  suggestions: SmartSearchResultProduct[];
  categories: string[];
  isLoading: boolean;
  hasSearched: boolean;
  handleSelectProduct: (slugOrId: string) => void;
  handleSelectCategory: (cat: string) => void;
  handleExecuteSearch: (e?: React.FormEvent) => void;
  handleOpenLiveAgentChat: () => void;
  getWhatsappInquiryUrl: (query: string) => string;
}

export function SearchResultsList({
  query,
  setQuery,
  suggestions,
  categories,
  isLoading,
  hasSearched,
  handleSelectProduct,
  handleSelectCategory,
  handleExecuteSearch,
  handleOpenLiveAgentChat,
  getWhatsappInquiryUrl,
}: SearchResultsListProps) {
  return (
    <>
      {/* State B: MATCHING SUGGESTIONS FOUND */}
      {query.trim() && suggestions.length > 0 && (
        <div>
          {/* Category Tags */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b', marginRight: '2px' }}>Categories:</span>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <i className="fas fa-tag" style={{ color: '#ea580c', fontSize: '10px' }} />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          )}

          {/* Products List */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b' }}>
                MATCHING PRODUCTS ({suggestions.length})
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tap to view</span>
            </div>

            {suggestions.map((product: SmartSearchResultProduct) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelectProduct(product.slug || product.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#ffffff',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f1f5f9',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={product.image || '/img/product-placeholder.png'}
                    alt={product.name}
                    fill
                    sizes="50px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '10.5px',
                      fontWeight: 600,
                    }}
                  >
                    {product.category}
                  </span>
                  <h6
                    style={{
                      margin: '2px 0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </h6>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#c2410c' }}>
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <i className="fas fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '12px' }} />
              </button>
            ))}
          </div>

          {/* View all in shop */}
          <button
            type="button"
            onClick={handleExecuteSearch}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '9999px',
              border: '2px solid #0f172a',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <span>See all results for &ldquo;{query}&rdquo;</span>
            <i className="fas fa-arrow-right" />
          </button>
        </div>
      )}

      {/* State C: ZERO RESULTS FOUND — COMPACT WAREHOUSE CARD */}
      {query.trim() && !isLoading && hasSearched && suggestions.length === 0 && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #ea580c',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.12)',
              marginBottom: '14px',
            }}
          >
            {/* Badge & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🏢</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#c2410c',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Central Warehouse Stock Check
              </span>
            </div>

            <h5
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 6px 0',
                lineHeight: 1.25,
              }}
            >
              &ldquo;{query}&rdquo; Is Not Yet Listed Online
            </h5>

            <p
              style={{
                fontSize: '12.5px',
                color: '#475569',
                lineHeight: 1.45,
                margin: '0 0 12px 0',
              }}
            >
              Our Central Warehouse stocks <b>15,000+ unlisted</b> auto parts. Check real-time inventory with a live agent right now:
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleOpenLiveAgentChat}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                <i className="fas fa-comments" style={{ fontSize: '16px' }} />
                <span>💬 Live Agent Se Chat Mein Poochhein</span>
              </button>

              <a
                href={getWhatsappInquiryUrl(query)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '16px' }} />
                <span>📱 WhatsApp Par Warehouse Stock Check</span>
              </a>
            </div>

            {/* Trust badges strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 600,
                marginTop: '10px',
              }}
            >
              <span>⚡ 2-Min Reply</span>
              <span>•</span>
              <span>📦 15,000+ Warehouse Stock</span>
              <span>•</span>
              <span>🇵🇰 COD</span>
            </div>
          </div>

          {/* Popular Items Fallback */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <i className="fas fa-fire" style={{ color: '#ea580c', fontSize: '11px' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                Popular Available Searches:
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {POPULAR_SUGGESTIONS.slice(0, 4).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(item)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '9999px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
