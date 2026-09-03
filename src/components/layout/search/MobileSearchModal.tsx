'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useMobileSmartSearch, SmartSearchResultProduct } from '../../../hooks/useMobileSmartSearch';

interface MobileSearchModalProps {
  searchState: ReturnType<typeof useMobileSmartSearch>;
}

const POPULAR_SUGGESTIONS = [
  'Mehran Side Mirror',
  'Solar Air Freshener',
  'Ambient LED Lights',
  'Fast Car Charger',
  '3M Double Sided Tape',
  'Cosmic Car Wax',
];

export function MobileSearchModal({ searchState }: MobileSearchModalProps) {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    suggestions,
    categories,
    isLoading,
    isAiAssisted,
    hasSearched,
    getWhatsappInquiryUrl,
    handleSubmitSearch,
    handleSelectProduct,
    handleSelectCategory,
    handleClear,
  } = searchState;

  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Handle opening live chat widget with warehouse inquiry
  const handleOpenLiveAgentChat = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pakodrive:open-chat', {
          detail: { query: query.trim() },
        })
      );
    }
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── 1. Top Sticky Search Header Bar (Always 100% visible above everything) ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: '#ffffff',
          borderBottom: '2px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Back to store"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-arrow-left" />
          </button>

          {/* High-Contrast Search Input Container */}
          <form
            onSubmit={handleSubmitSearch}
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              border: '2px solid #ea580c',
              borderRadius: '9999px',
              padding: '0 14px',
              height: '46px',
            }}
          >
            <i
              className="fas fa-search"
              style={{ color: '#ea580c', fontSize: '16px', marginRight: '10px', flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Auto parts, accessories ya gadget likhein..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '16px', // 16px prevents mobile iOS auto-zoom
                color: '#0f172a',
                fontWeight: 600,
                width: '100%',
              }}
            />

            {/* Spinner or Clear Button */}
            {isLoading ? (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
                style={{ width: '16px', height: '16px', marginLeft: '8px', flexShrink: 0 }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear text"
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#64748b',
                  fontSize: '18px',
                  padding: '4px',
                  cursor: 'pointer',
                  marginLeft: '6px',
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-times-circle" />
              </button>
            ) : null}
          </form>

          {/* Submit Search Button */}
          {query.trim() && (
            <button
              type="button"
              onClick={() => handleSubmitSearch()}
              style={{
                height: '42px',
                padding: '0 14px',
                borderRadius: '9999px',
                border: 'none',
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span>Search</span>
            </button>
          )}
        </div>

        {/* Typed Status Indicator so user immediately knows what they typed */}
        {query.trim() && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 6px',
              fontSize: '12px',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span>
                Searching for: <strong style={{ color: '#0f172a' }}>&ldquo;{query}&rdquo;</strong>
              </span>
            </div>
            {suggestions.length > 0 && (
              <span style={{ color: '#ea580c', fontWeight: 600 }}>
                {suggestions.length} items found
              </span>
            )}
          </div>
        )}
      </header>

      {/* ── 2. Scrollable Body Content ────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '16px',
          background: '#f8fafc',
        }}
      >
        {/* State A: EMPTY QUERY — Show Popular Suggestions & Warehouse Help Banner */}
        {!query.trim() && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <i className="fas fa-fire" style={{ color: '#ea580c', fontSize: '14px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Popular Searches in Pakistan
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {POPULAR_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '11px' }} />
                  <span>{item}</span>
                </button>
              ))}
            </div>

            {/* Warehouse Stock Assistance Banner */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  <i className="fas fa-warehouse" />
                </div>
                <div>
                  <h6 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    15,000+ Items in Central Warehouse
                  </h6>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Rozana hazaron naye parts aur gadgets update hotay hain.
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                Agar aapko specific auto part ya accessory chahiye, aap direct hamaray Live Support Agent se chat mein pooch saktay hain!
              </p>

              <button
                type="button"
                onClick={handleOpenLiveAgentChat}
                style={{
                  width: '100%',
                  padding: '10px 16px',
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
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                <i className="fas fa-comments" />
                <span>Live Support Agent Se Poochhein</span>
              </button>
            </div>
          </div>
        )}

        {/* State B: MATCHING SUGGESTIONS FOUND */}
        {query.trim() && suggestions.length > 0 && (
          <div>
            {/* Category Tags */}
            {categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>Categories:</span>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '12px',
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

            {/* AI Smart Intent Badge */}
            {isAiAssisted && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                <i className="fas fa-magic" />
                <span>AI Smart Intent Active</span>
              </div>
            )}

            {/* Products List */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
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
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    border: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
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
                      sizes="56px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginBottom: '2px',
                      }}
                    >
                      {product.category}
                    </span>
                    <h6
                      style={{
                        margin: '2px 0',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.name}
                    </h6>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#c2410c' }}>
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
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
              onClick={() => handleSubmitSearch()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                border: '2px solid #0f172a',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '14px',
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

        {/* State C: ZERO RESULTS FOUND — Central Warehouse Check & Live Chat Trigger */}
        {query.trim() && !isLoading && hasSearched && suggestions.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px 12px',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            {/* Warehouse Badge & Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                marginBottom: '14px',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.15)',
              }}
            >
              <i className="fas fa-warehouse" />
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              🏢 Central Warehouse Inventory Check
            </span>

            {/* Product Title */}
            <h4
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '10px',
                lineHeight: 1.3,
              }}
            >
              &ldquo;{query}&rdquo; Website Par Abhi Listed Nahi Hai
            </h4>

            {/* Warehouse-Focused Explanation (Rule: No 'market se arrange', focus on Central Warehouse) */}
            <p
              style={{
                fontSize: '13.5px',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Hamare main <b>Central Warehouse</b> mein 15,000+ unlisted auto parts, accessories aur gadgets mojood hain jo rozana system mein add hotay hain.
              <br />
              <br />
              Aap abhi hamaray <b>Live Support Agent</b> se rabta karein — agent 2 minute mein warehouse system se stock check kar ke aapko foran bata dein ge!
            </p>

            {/* Action 1: Open Live Agent Chat Widget Directly */}
            <button
              type="button"
              onClick={handleOpenLiveAgentChat}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
                marginBottom: '10px',
              }}
            >
              <i className="fas fa-comments" style={{ fontSize: '18px' }} />
              <span>Live Agent Se Chat Mein Poochhein</span>
            </button>

            {/* Action 2: WhatsApp Live Agent Option */}
            <a
              href={getWhatsappInquiryUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                marginBottom: '20px',
              }}
            >
              <i className="fab fa-whatsapp" style={{ fontSize: '18px' }} />
              <span>WhatsApp Par Warehouse Stock Check Karwayein</span>
            </a>

            {/* Trust Badges Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 600,
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <span>⚡ 2-Minute Reply</span>
              <span>•</span>
              <span>📦 Central Warehouse</span>
              <span>•</span>
              <span>🇵🇰 Nationwide COD</span>
            </div>

            {/* Popular items fallback */}
            <div
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <i className="fas fa-fire" style={{ color: '#ea580c', fontSize: '12px' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Popular Searches:
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_SUGGESTIONS.slice(0, 4).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(item)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      fontSize: '12px',
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
