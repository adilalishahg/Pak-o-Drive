'use client';

import React, { useRef, useEffect } from 'react';
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

  // Auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column z-3"
      style={{
        zIndex: 2050,
        background: '#ffffff',
        animation: 'fadeInDown 0.2s ease-out',
      }}
    >
      {/* ── 1. Top Search Header Bar ──────────────────────────────── */}
      <div
        className="p-2.5 px-3 border-bottom d-flex align-items-center gap-2 bg-white"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="btn btn-sm btn-light rounded-circle border-0 d-flex align-items-center justify-content-center p-2"
          style={{ width: '38px', height: '38px', color: '#475569' }}
          aria-label="Back"
        >
          <i className="fas fa-arrow-left fs-6" />
        </button>

        {/* Search Input Form */}
        <form onSubmit={handleSubmitSearch} className="flex-grow-1 position-relative">
          <div
            className="d-flex align-items-center rounded-pill bg-light border px-3 py-1.5"
            style={{ borderColor: '#e2e8f0' }}
          >
            <i className="fas fa-search text-muted me-2" style={{ fontSize: '0.85rem' }} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, parts, gadgets..."
              className="form-control border-0 bg-transparent p-0 shadow-none"
              style={{ fontSize: '0.92rem', color: '#1e293b' }}
            />
            {/* Loading Spinner or Clear Button */}
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-primary ms-2" role="status" style={{ width: '14px', height: '14px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-link p-0 text-muted ms-2 text-decoration-none"
                style={{ fontSize: '0.85rem' }}
                aria-label="Clear text"
              >
                <i className="fas fa-times-circle" />
              </button>
            ) : null}
          </div>
        </form>

        {/* Submit Search Button */}
        <button
          type="button"
          onClick={() => handleSubmitSearch()}
          disabled={!query.trim()}
          className="btn btn-sm text-white rounded-pill px-3 fw-bold"
          style={{
            background: query.trim() ? 'linear-gradient(135deg, #ea580c, #c2410c)' : '#94a3b8',
            fontSize: '0.82rem',
            height: '38px',
          }}
        >
          Search
        </button>
      </div>

      {/* ── 2. Content Body (Suggestions or Zero-Result Recovery) ── */}
      <div className="flex-grow-1 overflow-y-auto p-3 bg-light">
        {/* State A: Empty Query (Popular Searches) */}
        {!query.trim() && (
          <div className="container-fluid px-0" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2.5">
              <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                🔥 Popular Searches in Pakistan
              </span>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {POPULAR_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1.5 text-dark fw-semibold shadow-xs d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.82rem' }}
                >
                  <i className="fas fa-search text-muted" style={{ fontSize: '0.75rem' }} />
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <div className="card border-0 rounded-4 p-3 bg-white shadow-xs">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '40px', height: '40px', background: 'rgba(37, 211, 102, 0.12)', color: '#25D366' }}
                >
                  <i className="fab fa-whatsapp fs-5" />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 leading-normal py-0.5">Need a specific automotive part?</h6>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                    Type above to search or chat directly with our support team on WhatsApp!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State B: Has Live Results */}
        {query.trim() && suggestions.length > 0 && (
          <div className="container-fluid px-0" style={{ maxWidth: '650px' }}>
            {/* Category Quick Jump Chips */}
            {categories.length > 0 && (
              <div className="d-flex align-items-center gap-1.5 flex-wrap mb-3">
                <span className="text-muted small me-1" style={{ fontSize: '0.75rem' }}>Categories:</span>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="btn btn-xs btn-white bg-white border rounded-pill px-2.5 py-1 text-dark small fw-semibold shadow-xs"
                    style={{ fontSize: '0.72rem' }}
                  >
                    <i className="fas fa-tag me-1 text-primary" />
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* AI Smart Suggestion Badge if active */}
            {isAiAssisted && (
              <div className="d-flex align-items-center gap-1.5 mb-2.5 px-2 py-1 bg-primary bg-opacity-10 text-primary rounded-pill small" style={{ width: 'fit-content', fontSize: '0.7rem' }}>
                <i className="fas fa-magic" />
                <span className="fw-bold">AI Smart Intent Matching Active</span>
              </div>
            )}

            {/* Products List */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white mb-3">
              <div className="p-2 border-bottom bg-light d-flex align-items-center justify-content-between px-3">
                <span className="small text-muted fw-bold" style={{ fontSize: '0.72rem' }}>
                  MATCHING PRODUCTS ({suggestions.length})
                </span>
                <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                  Tap to view
                </span>
              </div>

              <div className="list-group list-group-flush">
                {suggestions.map((product: SmartSearchResultProduct) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.slug || product.id)}
                    className="list-group-item list-group-item-action p-2.5 px-3 d-flex align-items-center gap-3 border-0 border-bottom"
                  >
                    {/* Uncropped Thumbnail with Blur (Rule #3) */}
                    <div
                      className="position-relative rounded-3 overflow-hidden d-flex align-items-center justify-content-center bg-light border flex-shrink-0"
                      style={{ width: '56px', height: '56px' }}
                    >
                      <Image
                        src={product.image || '/img/product-placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="56px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-grow-1 text-start">
                      <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5 mb-0.5" style={{ fontSize: '0.65rem' }}>
                        {product.category}
                      </span>
                      <h6 className="fw-bold text-dark mb-0.5 text-truncate leading-normal py-0.5" style={{ fontSize: '0.88rem' }}>
                        {product.name}
                      </h6>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="fw-bold" style={{ color: '#c2410c', fontSize: '0.85rem' }}>
                          Rs. {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.75rem' }}>
                            Rs. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <i className="fas fa-chevron-right text-muted small ms-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* View All In Shop Button */}
            <button
              type="button"
              onClick={() => handleSubmitSearch()}
              className="btn btn-outline-dark w-100 rounded-pill py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs"
              style={{ fontSize: '0.85rem' }}
            >
              <span>See all results for &ldquo;{query}&rdquo;</span>
              <i className="fas fa-arrow-right" />
            </button>
          </div>
        )}

        {/* State C: ZERO RESULTS FOUND (Unfulfilled Lead & WhatsApp Inquire Recovery!) */}
        {query.trim() && !isLoading && hasSearched && suggestions.length === 0 && (
          <div className="container-fluid px-0 text-center py-4" style={{ maxWidth: '520px' }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                width: '68px',
                height: '68px',
                background: 'rgba(234, 88, 12, 0.1)',
                color: '#ea580c',
              }}
            >
              <i className="fas fa-search-minus fs-2" />
            </div>

            <h5 className="fw-bold text-dark mb-1 leading-normal py-0.5">
              &ldquo;{query}&rdquo; Website Par Listed Nahi Hai
            </h5>

            <p className="text-muted small mb-3 leading-normal py-0.5" style={{ fontSize: '0.84rem' }}>
              Hamari website par rozana naye auto parts aur gadgets update hotay hain.
              Aap abhi <b>WhatsApp par hamaray agent</b> se pooch saktay hain — hum direct warehouse ya market se yeh product arrange karwa dein ge!
            </p>

            {/* 1-Click WhatsApp Instant Inquire Button */}
            <a
              href={getWhatsappInquiryUrl(query)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success rounded-pill py-2.5 px-4 w-100 d-flex align-items-center justify-content-center gap-2 shadow fw-bold text-decoration-none mb-3"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none',
                fontSize: '0.92rem',
              }}
            >
              <i className="fab fa-whatsapp fs-5" />
              <span>WhatsApp Par Ye Item Mangwayein</span>
            </a>

            <div className="p-3 bg-white rounded-4 border shadow-xs text-start">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="fas fa-fire text-danger" />
                <span className="small fw-bold text-dark">Try searching popular items instead:</span>
              </div>
              <div className="d-flex flex-wrap gap-1.5">
                {POPULAR_SUGGESTIONS.slice(0, 4).map((pop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(pop)}
                    className="btn btn-xs btn-light rounded-pill px-2.5 py-1 text-muted small"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {pop}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
