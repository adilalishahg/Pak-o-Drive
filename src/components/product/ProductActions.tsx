'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { IProduct, IProductVariant } from '../../types';

interface ProductActionsProps {
  product: IProduct;
  selectedVariant?: IProductVariant;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product, selectedVariant }) => {
  const router = useRouter();
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  const stockLimit = selectedVariant !== undefined ? selectedVariant.stock : product.stock;
  const outOfStock = stockLimit === 0;
  const isUnlimited = stockLimit < 0;
  const finalPrice = selectedVariant ? selectedVariant.price : product.price;

  // Reset quantity to 1 if the selected variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  // Monitor scroll for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const displayName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const text = encodeURIComponent(
      `السلام علیکم! Mujhe yeh product order karna hai:\n\n*Product:* ${displayName}\n*Price:* Rs. ${finalPrice.toLocaleString()} (Cash On Delivery)\n*Link:* ${url}\n\nDelivery Address aur details share kar raha hoon:`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

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
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
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
              onClick={() => setQuantity(q => (!isUnlimited ? Math.min(stockLimit, q + 1) : q + 1))}
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

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product._id || '')}
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
              color: isInWishlist(product._id || '') ? '#ef4444' : '#64748b',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            title="Save to Wishlist"
            aria-label="Wishlist"
          >
            <i className={isInWishlist(product._id || '') ? 'fas fa-heart' : 'far fa-heart'} style={{ fontSize: '1.1rem' }} />
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
          padding: '8px 12px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          display: showSticky ? 'flex' : 'none',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.25s ease',
        }}
      >
        <div style={{ flex: '0 0 auto', minWidth: '78px' }}>
          <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total Price</span>
          <span style={{ fontSize: '0.96rem', fontWeight: 900, color: 'var(--pd-primary, #ea580c)', lineHeight: 1 }}>
            Rs. {finalPrice.toLocaleString()}
          </span>
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
