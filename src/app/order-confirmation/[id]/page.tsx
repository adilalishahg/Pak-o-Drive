'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { IOrder } from '../../../types';

export default function OrderConfirmationPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });
        } else {
          setError(data.error || 'Failed to load order.');
        }
      } catch {
        setError('Connection failed. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleWhatsApp = () => {
    if (!order) return;
    const items = order.items.map(i => `- ${i.quantity}x ${i.name} (PKR ${i.price.toLocaleString()})`).join('\n');
    const msg = `*Order Confirmation*\nOrder ID: #${order._id?.slice(-8).toUpperCase()}\nName: ${order.customerDetails.name}\nPhone: ${order.customerDetails.phone}\nAddress: ${order.customerDetails.address}, ${order.customerDetails.city}\n\nItems:\n${items}\n\nTotal: PKR ${order.totalAmount.toLocaleString()}\nPayment: COD`;
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
      <div className="spinner-border" style={{ color: 'var(--pd-primary)', width: '2.5rem', height: '2.5rem' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading your order…</p>
    </div>
  );

  if (error || !order) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '16px', display: 'block' }} />
        <h3 style={{ fontWeight: 700, color: '#111', marginBottom: '8px' }}>Order Not Found</h3>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
        <Link href="/" className="btn-gradient" style={{ textDecoration: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '0.9rem' }}>
          Return to Home
        </Link>
      </div>
    </div>
  );

  const shortId = order._id ? order._id.slice(-8).toUpperCase() : '';

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '32px' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
        @media (max-width: 575px) {
          .oc-invoice-header { flex-direction: column !important; gap: 12px !important; }
          .oc-invoice-header .text-end { text-align: left !important; }
          .oc-totals-table { width: 100% !important; }
        }
      `}</style>

      {/* ── Success banner ── */}
      <div className="no-print" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '28px 20px 24px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <i className="fas fa-check" style={{ fontSize: '1.6rem', color: '#fff' }} />
        </div>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 6px' }}>
          Order Placed!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '0 0 20px' }}>
          Order #{shortId} · Thank you for shopping with us
        </p>
        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', margin: '0 auto' }}>
          <button onClick={handleWhatsApp} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#25D366', border: 'none', borderRadius: '8px',
            padding: '13px 20px', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <i className="fab fa-whatsapp" style={{ fontSize: '1.1rem' }} />
            Confirm Order on WhatsApp
          </button>
          <button onClick={() => window.print()} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px', padding: '12px 20px',
            color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            <i className="fas fa-print" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div style={{ maxWidth: '640px', margin: '16px auto 0', padding: '0 12px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

          {/* Invoice header */}
          <div style={{ borderTop: '4px solid var(--pd-primary)', padding: '20px 20px 16px' }}>
            <div className="oc-invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fas fa-shopping-bag" style={{ color: '#fff', fontSize: '14px' }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--pd-primary)' }}>Electro</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.6 }}>
                  support@pakodrive.com<br />+0123 456 7890
                </p>
              </div>
              {/* Order meta */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.85rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Invoice Receipt
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.6 }}>
                  #{shortId}<br />
                  {new Date(order.createdAt || '').toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f0f0f0' }} />

          {/* Shipping + Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '0' }}>
            <div style={{ padding: '16px 16px 16px', borderRight: '1px solid #f0f0f0' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Shipping
              </p>
              <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '0.82rem', color: '#111' }}>
                {order.customerDetails.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.55 }}>
                {order.customerDetails.address}<br />
                {order.customerDetails.city}, Pakistan
              </p>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Payment
              </p>
              <p style={{ margin: '0 0 3px', fontSize: '0.78rem', color: '#111' }}>
                Method: <strong style={{ color: '#16a34a' }}>COD</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.55 }}>
                {order.customerDetails.phone}
                {order.customerDetails.email && <><br />{order.customerDetails.email}</>}
              </p>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f0f0f0' }} />

          {/* Items */}
          <div style={{ padding: '16px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Items Ordered
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    borderRadius: '6px', background: '#f5f5f5',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <Image
                      src={item.image || '/img/product-placeholder.png'}
                      alt={item.name}
                      fill
                      sizes="44px"
                      style={{ objectFit: 'contain', padding: '4px' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/img/product-placeholder.png'; }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.8rem', color: '#111',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>
                      PKR {item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111', flexShrink: 0 }}>
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: '#f0f0f0' }} />

          {/* Totals */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#111' }}>PKR {order.totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Delivery</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#16a34a' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>Grand Total</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--pd-primary)' }}>
                PKR {order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            textDecoration: 'none', color: '#6b7280', fontSize: '0.85rem', fontWeight: 600,
          }}>
            <i className="fas fa-arrow-left" style={{ fontSize: '12px' }} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
