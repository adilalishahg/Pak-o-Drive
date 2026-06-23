'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f9fafb' }}>
        <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '16px' }} />
        <h2 style={{ fontWeight: 800, color: '#111', marginBottom: '8px', fontSize: '1.3rem' }}>Your Cart is Empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          Add some products to your cart and come back here.
        </p>
        <Link href="/shop" className="btn-gradient" style={{ textDecoration: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 700, fontSize: '0.9rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '32px' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
        <div className="container-fluid px-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.78rem' }}>
              <li className="breadcrumb-item"><Link href="/" className="text-decoration-none text-muted">Home</Link></li>
              <li className="breadcrumb-item active fw-semibold" style={{ color: '#111' }}>Cart</li>
            </ol>
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '12px auto 0', padding: '0 12px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111', marginBottom: '12px', padding: '0 2px' }}>
          Cart <span style={{ color: '#6b7280', fontWeight: 400 }}>({cart.length} items)</span>
        </h2>

        {/* Cart items */}
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
          {cart.map((item, idx) => {
            const prod = item.product;
            const id = prod._id ? prod._id.toString() : '';
            const variantId = item.variant?._id;
            const itemPrice = item.variant ? item.variant.price : prod.price;
            const itemImage = item.variant?.image || prod.image || '/img/product-placeholder.png';
            const stockLimit = item.variant !== undefined ? item.variant.stock : prod.stock;

            return (
              <div key={`${id}_${variantId || ''}`} style={{
                display: 'flex', gap: '12px', padding: '14px',
                borderBottom: idx < cart.length - 1 ? '1px solid #f0f0f0' : 'none',
                alignItems: 'flex-start',
              }}>
                {/* Image */}
                <Link href={`/product/${id}`} style={{ flexShrink: 0, display: 'block' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                    <Image src={itemImage} alt={prod.name} fill
                      sizes="80px" style={{ objectFit: 'contain', padding: '4px' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/img/product-placeholder.png'; }}
                      unoptimized />
                  </div>
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/product/${id}`} style={{ textDecoration: 'none' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.85rem', color: '#111',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prod.name}
                      {item.variant && (
                        <span className="text-secondary ms-1 fw-semibold" style={{ fontSize: '0.78rem' }}>
                          ({item.variant.name})
                        </span>
                      )}
                    </p>
                  </Link>
                  <p style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--pd-primary)' }}>
                    PKR {(itemPrice * item.quantity).toLocaleString()}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: '#9ca3af' }}>
                    PKR {itemPrice.toLocaleString()} each
                  </p>

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    <button onClick={() => updateQuantity(id, item.quantity - 1, variantId)} disabled={item.quantity <= 1}
                      style={{
                        width: '32px', height: '32px', border: '1px solid #e5e7eb',
                        borderRadius: '6px 0 0 6px', background: '#f9fafb',
                        cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>−</button>
                    <span style={{
                      width: '40px', height: '32px', border: '1px solid #e5e7eb', borderLeft: 'none', borderRight: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.88rem', fontWeight: 700, color: '#111',
                    }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(id, item.quantity + 1, variantId)} disabled={item.quantity >= stockLimit}
                      style={{
                        width: '32px', height: '32px', border: '1px solid #e5e7eb',
                        borderRadius: '0 6px 6px 0', background: '#f9fafb',
                        cursor: item.quantity >= stockLimit ? 'not-allowed' : 'pointer',
                        fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>+</button>
                  </div>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(id, variantId)}
                  style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', marginTop: '2px' }}>
                  <i className="fas fa-trash-alt" style={{ fontSize: '15px' }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 0' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#111', margin: '0 0 14px' }}>Order Summary</h4>
          </div>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6b7280' }}>
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span style={{ fontWeight: 600, color: '#111' }}>PKR {cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6b7280' }}>
              <span>Delivery</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>FREE</span>
            </div>
            <div style={{ height: '1px', background: '#f0f0f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span style={{ fontWeight: 800, color: '#111' }}>Total</span>
              <span style={{ fontWeight: 900, color: 'var(--pd-primary)', fontSize: '1.1rem' }}>PKR {cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* COD note */}
          <div style={{ margin: '0 16px 12px', background: '#fef3c7', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#92400e', display: 'flex', gap: '8px' }}>
            <i className="fas fa-info-circle" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>We support <strong>Cash on Delivery (COD)</strong>. Verify your package before paying.</span>
          </div>

          <div style={{ padding: '0 16px 16px' }}>
            <Link href="/checkout" className="btn-gradient" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              textDecoration: 'none', borderRadius: '8px', padding: '14px',
              fontWeight: 800, fontSize: '0.95rem', width: '100%',
            }}>
              <i className="fas fa-lock" style={{ fontSize: '13px' }} />
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
