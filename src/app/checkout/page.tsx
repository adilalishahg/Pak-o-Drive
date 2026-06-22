'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { logInteraction } from '../../components/common/AnalyticsTracker';

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '8px',
  padding: '11px 14px', fontSize: '0.9rem', outline: 'none',
  fontFamily: 'var(--pd-font)', color: '#111', background: '#fff',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 700,
  color: '#374151', marginBottom: '5px',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <i className="fas fa-shopping-cart" style={{ fontSize: '2.5rem', color: '#d1d5db', marginBottom: '14px' }} />
        <h3 style={{ fontWeight: 700, color: '#111', marginBottom: '8px' }}>Cart is Empty</h3>
        <Link href="/shop" className="btn-gradient" style={{ textDecoration: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '0.9rem', marginTop: '12px' }}>
          Go to Shop
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = `${firstName} ${lastName}`.trim();
    if (!name || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      const utmSource = sessionStorage.getItem('utm_source') || '';
      const utmMedium = sessionStorage.getItem('utm_medium') || '';
      const utmCampaign = sessionStorage.getItem('utm_campaign') || '';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails: { name, email: email.trim() || undefined, phone: phone.trim(), address: address.trim(), city: city.trim(), notes: orderNotes.trim() || undefined },
          items: cart.map(i => ({ productId: i.product._id, quantity: i.quantity })),
          utmSource: utmSource || undefined, utmMedium: utmMedium || undefined, utmCampaign: utmCampaign || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong.');
      logInteraction('checkout_success', window.location.pathname, { orderId: data.orderId, amount: cartTotal, itemsCount: cart.length });
      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
        <div className="container-fluid px-3">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.78rem' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-decoration-none text-muted">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cart" className="text-decoration-none text-muted">Cart</Link></li>
            <li className="breadcrumb-item active fw-semibold" style={{ color: '#111' }}>Checkout</li>
          </ol>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '12px auto 0', padding: '0 12px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111', marginBottom: '14px', padding: '0 2px' }}>Checkout</h2>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '0.85rem', color: '#dc2626', display: 'flex', gap: '8px' }}>
            <i className="fas fa-exclamation-circle" style={{ marginTop: '2px', flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* LEFT — Shipping form */}
            <div className="col-12 col-lg-7">
              <div style={{ background: '#fff', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                  <i className="fas fa-map-marker-alt me-2" style={{ color: 'var(--pd-primary)', fontSize: '14px' }} />
                  Shipping Information
                </h4>

                <div className="row g-3">
                  <div className="col-6">
                    <label style={labelStyle}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-6">
                    <label style={labelStyle}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={address} onChange={e => setAddress(e.target.value)} placeholder="House No, Street Name" style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>City <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Phone <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+923001234567" style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Email <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'} />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Order Notes <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                    <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={3} placeholder="Any special instructions..." style={{ ...inputStyle, resize: 'vertical' as const }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--pd-primary)'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Order summary */}
            <div className="col-12 col-lg-5">
              <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', position: 'sticky', top: '80px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                  <i className="fas fa-receipt me-2" style={{ color: 'var(--pd-primary)', fontSize: '14px' }} />
                  Order Summary
                </h4>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {cart.map(item => (
                    <div key={item.product._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', alignItems: 'center' }}>
                      <span style={{ color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                        {item.product.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: '#111', flexShrink: 0 }}>PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '12px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6b7280' }}>Delivery</span>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <span style={{ fontWeight: 800, color: '#111' }}>Total</span>
                    <span style={{ fontWeight: 900, color: 'var(--pd-primary)' }}>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* COD badge */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-money-bill-wave" style={{ flexShrink: 0 }} />
                  <span><strong>Cash on Delivery (COD)</strong> — Pay when you receive</span>
                </div>

                <button type="submit" disabled={loading} className="btn-gradient"
                  style={{ border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 800, fontSize: '0.95rem', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Placing Order…</>
                  ) : (
                    <><i className="fas fa-check-circle me-2" />Place Order</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
