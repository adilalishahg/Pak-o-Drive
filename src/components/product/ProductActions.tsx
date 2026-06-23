'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { IProduct, IProductVariant } from '../../types';

interface ProductActionsProps {
  product: IProduct;
  selectedVariant?: IProductVariant;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product, selectedVariant }) => {
  const { addToCart, cartCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567';

  const stockLimit = selectedVariant !== undefined ? selectedVariant.stock : product.stock;
  const outOfStock = stockLimit <= 0;

  // Reset quantity to 1 if the selected variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const finalPrice = selectedVariant ? selectedVariant.price : product.price;
    const displayName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const text = encodeURIComponent(
      `Hi, I want to order "${displayName}" — PKR ${finalPrice.toLocaleString()}\n${url}`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  return (
    <div>
      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Qty:</span>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden',
        }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || outOfStock}
            style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb',
              cursor: (quantity <= 1 || outOfStock) ? 'not-allowed' : 'pointer', fontSize: '1rem',
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            −
          </button>
          <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
            {outOfStock ? 0 : quantity}
          </span>
          <button onClick={() => setQuantity(q => Math.min(stockLimit, q + 1))} disabled={quantity >= stockLimit || outOfStock}
            style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb',
              cursor: (quantity >= stockLimit || outOfStock) ? 'not-allowed' : 'pointer', fontSize: '1rem',
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            +
          </button>
        </div>
        {stockLimit <= 5 && stockLimit > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
            Only {stockLimit} left!
          </span>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={handleAdd} disabled={outOfStock || added}
          className="btn-gradient"
          style={{
            border: 'none', borderRadius: '8px', padding: '14px 20px',
            fontSize: '0.95rem', fontWeight: 700, width: '100%', cursor: outOfStock ? 'not-allowed' : 'pointer',
            opacity: outOfStock ? 0.6 : 1,
          }}>
          <i className={`fas ${added ? 'fa-check' : 'fa-shopping-cart'}`} style={{ marginRight: '8px' }} />
          {added ? 'Added to Cart!' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <button onClick={handleWhatsApp}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            border: 'none', borderRadius: '8px', padding: '13px 20px',
            fontSize: '0.88rem', fontWeight: 700, width: '100%', cursor: 'pointer',
            background: '#25D366', color: '#fff',
            boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
          }}>
          <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }} />
          Order via WhatsApp
        </button>

        {cartCount > 0 && (
          <Link href="/cart" className="btn btn-outline-dark"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: '2px solid #111', borderRadius: '8px', padding: '12px 20px',
              fontSize: '0.88rem', fontWeight: 800, width: '100%', textDecoration: 'none',
              background: '#fff', color: '#111', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#111';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.color = '#111';
            }}
          >
            <i className="fas fa-lock" style={{ fontSize: '12px' }} />
            Proceed to Checkout
          </Link>
        )}
      </div>
    </div>
  );
};
