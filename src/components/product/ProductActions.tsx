'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';

interface ProductActionsProps {
  product: IProduct;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567';

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `Hi, I want to order "${product.name}" — PKR ${product.price.toLocaleString()}\n${url}`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  const outOfStock = product.stock <= 0;

  return (
    <div>
      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Qty:</span>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden',
        }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
            style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb',
              cursor: quantity <= 1 ? 'not-allowed' : 'pointer', fontSize: '1rem',
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            −
          </button>
          <span style={{ width: '40px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
            {quantity}
          </span>
          <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}
            style={{ width: '36px', height: '36px', border: 'none', background: '#f9fafb',
              cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', fontSize: '1rem',
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            +
          </button>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
            Only {product.stock} left!
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
      </div>
    </div>
  );
};
