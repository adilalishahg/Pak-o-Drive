'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useSiteTheme } from './DynamicThemeProvider';

export const FloatingCartButton: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useCart();
  const { theme } = useSiteTheme();
  
  const isCartOrCheckout = pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/order-confirmation');
  
  if (cartCount === 0 || isCartOrCheckout) {
    return null;
  }

  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  // Determine colors based on active theme
  const btnBackground = isModernGreen
    ? 'linear-gradient(135deg, #d4af37, #b89324)'
    : (isCleanWhite ? `linear-gradient(135deg, ${theme.primaryColor}, color-mix(in srgb, ${theme.primaryColor} 80%, #000))` : 'linear-gradient(135deg, var(--pd-primary), #c2410c)');

  const accentColor = isModernGreen ? '#0d231d' : '#ffffff';

  return (
    <>
      <Link
        href="/cart"
        className="floating-cart-btn-pill shadow-lg d-flex align-items-center justify-content-between text-decoration-none"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '28px',
          zIndex: 9998,
          background: btnBackground,
          color: accentColor,
          padding: '12px 20px',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          minWidth: '220px',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.2)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="fas fa-shopping-cart" style={{ fontSize: '14px', color: '#fff' }} />
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4d4f',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                borderRadius: '10px',
                padding: '2px 6px',
                lineHeight: 1,
              }}
            >
              {cartCount}
            </span>
          </div>
          <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>Checkout</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>PKR {cartTotal.toLocaleString()}</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-1.5 ms-3">
          <span style={{ fontSize: '0.78rem' }}>Go to Cart</span>
          <i className="fas fa-arrow-right floating-cart-btn-arrow" />
        </div>
      </Link>

      <style>{`
        .floating-cart-btn-pill:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22) !important;
          opacity: 0.95;
        }
        .floating-cart-btn-pill:hover .floating-cart-btn-arrow {
          transform: translateX(4px);
        }
        .floating-cart-btn-arrow {
          transition: transform 0.2s ease;
        }
        @media (max-width: 576px) {
          .floating-cart-btn-pill {
            bottom: 16px !important;
            left: 16px !important;
            minWidth: 190px !important;
            padding: 10px 16px !important;
          }
        }
      `}</style>
    </>
  );
};
