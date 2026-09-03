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

  // Lock body scroll when modal is open
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

  // 1-Click: Open Live Agent Chat (Option 4) with prefilled warehouse stock query
  const handleOpenLiveAgentChat = () => {
    inputRef.current?.blur();
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pakodrive:open-chat', {
          detail: { query: query.trim() },
        })
      );
    }
  };

  // When user clicks the Search button or presses Enter
  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    inputRef.current?.blur();

    const q = query.trim();
    if (!q) return;

    // If product is NOT in inventory (0 suggestions), clicking Search directly connects to the Live Agent!
    if (suggestions.length === 0) {
      handleOpenLiveAgentChat();
      return;
    }

    // Otherwise, submit search and go to shop
    handleSubmitSearch(e);
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
      {/* ── 1. Top Search Header Bar ──────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Back to store"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-arrow-left" />
          </button>

          {/* High-Contrast Search Input Container */}
          <form
            onSubmit={handleExecuteSearch}
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              border: '2px solid #ea580c',
              borderRadius: '9999px',
              padding: '0 12px',
              height: '44px',
            }}
          >
            <i
              className="fas fa-search"
              style={{ color: '#ea580c', fontSize: '15px', marginRight: '8px', flexShrink: 0 }}
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
                fontSize: '16px', // prevents mobile iOS zoom
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
                style={{ width: '15px', height: '15px', marginLeft: '6px', flexShrink: 0 }}
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
                  fontSize: '17px',
                  padding: '4px',
                  cursor: 'pointer',
                  marginLeft: '4px',
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-times-circle" />
              </button>
            ) : null}
          </form>

          {/* Submit Search Button (Orange) */}
          {query.trim() && (
            <button
              type="button"
              onClick={handleExecuteSearch}
              style={{
                height: '42px',
                padding: '0 15px',
                borderRadius: '9999px',
                border: 'none',
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span>{suggestions.length === 0 && !isLoading ? 'Chat' : 'Search'}</span>
            </button>
          )}
        </div>

        {/* Typed Status Indicator */}
        {query.trim() && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px',
              fontSize: '11.5px',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              <span>
                Searching for: <strong style={{ color: '#0f172a' }}>&ldquo;{query}&rdquo;</strong>
              </span>
            </div>
            {suggestions.length > 0 && (
              <span style={{ color: '#ea580c', fontWeight: 700 }}>
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
          padding: '12px 14px',
          background: '#f8fafc',
        }}
      >
        {/* State A: EMPTY QUERY — Popular Searches & Help */}
        {!query.trim() && (
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
                    Rozana hazaron naye spare parts aur gadgets update hotay hain.
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                Agar aapko koi specific product chahiye jo website par na mil rahi ho, aap direct hamaray Live Support Agent se chat mein pooch saktay hain!
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
        )}

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

        {/* State C: ZERO RESULTS FOUND — COMPACT, HIGH-CONVERTING WAREHOUSE CARD (BUTTONS 100% VISIBLE ABOVE KEYBOARD) */}
        {query.trim() && !isLoading && hasSearched && suggestions.length === 0 && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {/* Primary Action Card placed AT THE VERY TOP so keyboard never hides it! */}
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
                &ldquo;{query}&rdquo; Website Par Abhi Listed Nahi Hai
              </h5>

              <p
                style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: '0 0 12px 0',
                }}
              >
                Hamare Central Warehouse mein <b>15,000+ unlisted</b> auto parts mojood hain. Live agent se foran inventory check karwayein:
              </p>

              {/* ── ACTION BUTTONS: PLACED PROMINENTLY RIGHT HERE (NEVER HIDDEN BY KEYBOARD!) ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 1. Primary: Live Agent Chat Trigger (Option 4) */}
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

                {/* 2. Secondary: Direct WhatsApp Option */}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
