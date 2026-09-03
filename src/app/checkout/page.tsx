'use client';

import React from 'react';
import Link from 'next/link';
import { useCheckout } from '../../hooks/useCheckout';
import { SearchableCitySelect } from '@/components/common/SearchableCitySelect';
import { AddressLocationPicker } from '@/components/checkout/AddressLocationPicker';

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    formData,
    updateField,
    loading,
    error,
    handlePlaceOrder,
    handleOrderViaWhatsApp,
  } = useCheckout();

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f8fafc' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%', background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
        }}>
          <i className="fas fa-shopping-cart" style={{ fontSize: '1.8rem', color: '#94a3b8' }} />
        </div>
        <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '1.4rem' }}>Your Shopping Cart is Empty</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center', maxWidth: '400px' }}>
          Explore our trending electronics, gadgets, and car accessories to place your order.
        </p>
        <Link href="/shop" className="btn-gradient" style={{ textDecoration: 'none', borderRadius: '10px', padding: '12px 28px', fontWeight: 800, fontSize: '0.92rem' }}>
          <i className="fas fa-store me-2" /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>

      {/* Top Breadcrumb & Trust Banner */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}>
        <div className="container-fluid px-3" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
              <li className="breadcrumb-item"><Link href="/" className="text-decoration-none text-muted">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/cart" className="text-decoration-none text-muted">Cart</Link></li>
              <li className="breadcrumb-item active fw-bold" style={{ color: '#0f172a' }}>1-Click Checkout</li>
            </ol>
            <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
              <i className="fas fa-shield-alt" />
              <span>100% Safe & Secure Cash On Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '20px auto 0', padding: '0 14px' }}>
        
        {/* Page Title */}
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Fast Cash On Delivery Checkout
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Fill in your delivery details below. No account or upfront card payment required.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '18px', fontSize: '0.88rem', color: '#dc2626',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '16px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="row g-3">

            {/* LEFT COLUMN — Delivery Form */}
            <div className="col-12 col-lg-7">
              <div style={{
                background: '#fff', borderRadius: '14px', padding: '22px',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-truck-moving" style={{ color: 'var(--pd-primary, #ea580c)' }} />
                    Shipping & Delivery Details
                  </h2>
                  <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                    Step 1 of 1
                  </span>
                </div>

                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-12">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Full Name (مکمل نام) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      value={formData.fullName}
                      onChange={e => updateField('fullName', e.target.value)}
                      style={{
                        width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '8px',
                        padding: '11px 14px', fontSize: '0.92rem', outline: 'none',
                        color: '#0f172a', background: '#fff',
                      }}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="col-12">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mobile / WhatsApp Number (موبائل یا واٹس ایپ نمبر) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        placeholder="03001234567 or 03XX-XXXXXXX"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        style={{
                          width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '8px',
                          padding: '11px 14px 11px 42px', fontSize: '0.92rem', outline: 'none',
                          color: '#0f172a', background: '#fff',
                        }}
                      />
                      <i className="fab fa-whatsapp" style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: '#25D366', fontSize: '18px',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Courier rider will call/WhatsApp on this number for delivery.
                    </span>
                  </div>

                  {/* City Selector with Type-to-Search Filter */}
                  <div className="col-12 col-sm-6">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      City (شہر) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <SearchableCitySelect
                      value={formData.city}
                      onChange={val => updateField('city', val)}
                      required
                      placeholder="Type or select city (e.g. Lahore, Karachi...)"
                    />
                  </div>

                  {/* Optional Email */}
                  <div className="col-12 col-sm-6">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Email Address <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="For tracking updates"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                      style={{
                        width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '8px',
                        padding: '11px 14px', fontSize: '0.92rem', outline: 'none',
                        color: '#0f172a', background: '#fff',
                      }}
                    />
                  </div>

                  {/* Street Delivery Address with Free GPS Picker & Predictive Dropdown */}
                  <AddressLocationPicker
                    address={formData.address}
                    onChangeAddress={val => updateField('address', val)}
                    selectedCity={formData.city}
                    onSelectCity={city => updateField('city', city)}
                    required
                  />

                  {/* Order Notes */}
                  <div className="col-12">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before coming or leave with neighbor"
                      value={formData.orderNotes}
                      onChange={e => updateField('orderNotes', e.target.value)}
                      style={{
                        width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '9px 12px', fontSize: '0.84rem', outline: 'none',
                        color: '#334155', background: '#f8fafc',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Order Summary & Action */}
            <div className="col-12 col-lg-5">
              <div style={{
                background: '#fff', borderRadius: '14px', padding: '20px',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                position: 'sticky', top: '80px',
              }}>
                <h3 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  Order Summary ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
                </h3>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
                  {cart.map(item => {
                    const price = item.variant ? item.variant.price : item.product.price;
                    const variantId = item.variant?._id || '';
                    return (
                      <div key={`${item.product._id}_${variantId}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span style={{
                            background: '#f1f5f9', color: '#475569', fontSize: '0.72rem',
                            fontWeight: 700, padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                          }}>
                            {item.quantity}x
                          </span>
                          <span style={{ color: '#1e293b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.product.name}
                            {item.variant && (
                              <span style={{ color: '#64748b', fontSize: '0.76rem', marginLeft: '4px' }}>
                                ({item.variant.name})
                              </span>
                            )}
                          </span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                          Rs. {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ height: '1px', background: '#f1f5f9', marginBottom: '14px' }} />

                {/* Pricing Calculation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b' }}>
                    <span>Shipping Charges (Nationwide)</span>
                    <span style={{ fontWeight: 800, color: '#16a34a' }}>FREE SHIPPING</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
                    <span style={{ fontWeight: 900, color: 'var(--pd-primary, #ea580c)' }}>
                      Rs. {cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* COD Guarantee Box */}
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
                  padding: '10px 12px', marginBottom: '16px', fontSize: '0.78rem', color: '#166534',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <i className="fas fa-hand-holding-usd" style={{ fontSize: '18px', flexShrink: 0, color: '#16a34a' }} />
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Pay with cash only when your parcel reaches your doorstep.</div>
                  </div>
                </div>

                {/* Primary Button: Complete COD Order */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    width: '100%',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.85 : 1,
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(234,88,12,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      <span>Placing Your Order…</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle" />
                      <span>Complete Order (Cash On Delivery)</span>
                    </>
                  )}
                </button>

                {/* Secondary Button: Order via WhatsApp */}
                <button
                  type="button"
                  onClick={handleOrderViaWhatsApp}
                  style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    width: '100%',
                    cursor: 'pointer',
                    background: '#25D366',
                    color: '#fff',
                    boxShadow: '0 3px 12px rgba(37,211,102,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }} />
                  <span>Order via WhatsApp (1-Click)</span>
                </button>

                {/* Trust assurance footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-around', marginTop: '16px',
                  paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '0.7rem', color: '#64748b',
                }}>
                  <span><i className="fas fa-undo-alt me-1 text-primary" /> 7-Day Returns</span>
                  <span><i className="fas fa-shield-alt me-1 text-success" /> 100% Original</span>
                  <span><i className="fas fa-truck me-1 text-warning" /> 24-48h Delivery</span>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
