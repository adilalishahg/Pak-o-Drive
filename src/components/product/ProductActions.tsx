'use client';

import React from 'react';
import Link from 'next/link';
import { ProductActionsProps } from '@/types/product';
import { useProductActions } from '@/hooks/useProductActions';

export const ProductActions: React.FC<ProductActionsProps> = ({ product, selectedVariant }) => {
  const {
    quantity,
    added,
    showSticky,
    copied,
    stockLimit,
    outOfStock,
    isUnlimited,
    finalPrice,
    cartCount,
    isInWishlist,
    toggleWishlist,
    handleAdd,
    handleBuyNow,
    handleWhatsApp,
    handleNativeShare,
    incrementQuantity,
    decrementQuantity,
  } = useProductActions({ product, selectedVariant });

  return (
    <div>
      {/* Quantity & Stock Urgency */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151' }}>Quantity:</span>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff',
          }}>
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || outOfStock}
              style={{
                width: '38px', height: '38px', border: 'none', background: '#f8fafc',
                cursor: (quantity <= 1 || outOfStock) ? 'not-allowed' : 'pointer', fontSize: '1.1rem',
                color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span style={{ width: '42px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              {outOfStock ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={(!isUnlimited && quantity >= stockLimit) || outOfStock}
              style={{
                width: '38px', height: '38px', border: 'none', background: '#f8fafc',
                cursor: ((!isUnlimited && quantity >= stockLimit) || outOfStock) ? 'not-allowed' : 'pointer', fontSize: '1.1rem',
                color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {stockLimit <= 5 && stockLimit > 0 ? (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            fontSize: '0.74rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <i className="fas fa-fire text-danger" />
            <span>Only {stockLimit} items left in stock!</span>
          </div>
        ) : (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534',
            fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <i className="fas fa-check-circle" />
            <span>Ready for Immediate Dispatch</span>
          </div>
        )}
      </div>

      {/* Live Social Viewing Urgency */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.76rem',
        color: '#334155',
        fontWeight: 600,
        marginBottom: '14px',
        padding: '7px 12px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <span className="live-pulse-dot" />
        <span><strong style={{ color: '#0f172a' }}>14 shoppers</strong> are viewing this item right now. High demand!</span>
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Row 1: Dual Primary Actions (Add to Cart + Buy Now) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* 1. Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || added}
            className="product-card-btn"
            style={{
              border: '1.5px solid #0f172a',
              borderRadius: '10px',
              padding: '11px 12px',
              fontSize: '0.86rem',
              fontWeight: 700,
              width: '100%',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              opacity: outOfStock ? 0.6 : 1,
              background: added ? '#10b981' : '#fff',
              color: added ? '#fff' : '#0f172a',
              borderColor: added ? '#10b981' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fas ${added ? 'fa-check' : 'fa-shopping-bag'}`} />
            <span>{added ? 'Added!' : 'Add to Cart'}</span>
          </button>

          {/* 2. Direct Buy Now (COD) */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="product-card-btn"
            style={{
              border: 'none',
              borderRadius: '10px',
              padding: '11px 12px',
              fontSize: '0.86rem',
              fontWeight: 800,
              width: '100%',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              opacity: outOfStock ? 0.6 : 1,
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(234,88,12,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'transform 0.15s ease',
            }}
          >
            <i className="fas fa-bolt" />
            <span>{outOfStock ? 'Out of Stock' : '⚡ Buy Now'}</span>
          </button>
        </div>

        {/* Row 2: WhatsApp 1-Click Order + Wishlist Heart */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 3. WhatsApp Direct Order Button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="product-card-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              flex: 1,
              cursor: 'pointer',
              background: '#25D366',
              color: '#fff',
              boxShadow: '0 3px 12px rgba(37,211,102,0.25)',
            }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '1.15rem' }} />
            <span>Order via WhatsApp</span>
          </button>

          {/* 4. Native Share Button (Attaches rich preview card on WhatsApp/Social) */}
          <button
            type="button"
            onClick={handleNativeShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              width: '46px',
              flexShrink: 0,
              cursor: 'pointer',
              background: copied ? '#10b981' : '#fff',
              color: copied ? '#fff' : '#0284c7',
              borderColor: copied ? '#10b981' : '#e2e8f0',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            title={copied ? 'Link Copied!' : 'Share with Photo on WhatsApp'}
            aria-label="Share product"
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'}`} />
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              width: '46px',
              flexShrink: 0,
              cursor: 'pointer',
              background: '#fff',
              color: isInWishlist ? '#ef4444' : '#64748b',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            title="Save to Wishlist"
            aria-label="Wishlist"
          >
            <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '1.1rem' }} />
          </button>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div
        className="d-md-none"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1040,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid #e2e8f0',
          padding: '8px 12px calc(8px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          display: showSticky ? 'flex' : 'none',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <img
              src={selectedVariant?.image || product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ minWidth: '65px' }}>
            <span style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '0.94rem', fontWeight: 900, color: 'var(--pd-primary, #ea580c)', lineHeight: 1 }}>
              Rs. {finalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          <button
            type="button"
            onClick={handleWhatsApp}
            style={{
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Order on WhatsApp"
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }} />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || added}
            style={{
              background: '#fff',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
            }}
          >
            <i className={`fas ${added ? 'fa-check' : 'fa-shopping-bag'}`} style={{ fontSize: '10px' }} />
            <span>{added ? 'Added!' : 'Add'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1.2,
              boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
            }}
          >
            <i className="fas fa-bolt" style={{ fontSize: '10px' }} />
            <span>{outOfStock ? 'Out of Stock' : '⚡ Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
