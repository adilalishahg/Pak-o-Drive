import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IOrder } from '@/types';

export interface OrderInvoiceCardProps {
  order: IOrder;
  shortId: string;
}

export function OrderInvoiceCard({ order, shortId }: OrderInvoiceCardProps) {
  const formattedDate = new Date(order.createdAt || '').toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div id="invoice-print-area" style={{ maxWidth: '640px', margin: '16px auto 0', padding: '0 12px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        {/* Invoice Header */}
        <div style={{ borderTop: '4px solid var(--pd-primary)', padding: '20px 20px 16px' }}>
          <div
            className="oc-invoice-header"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--pd-primary), #c2410c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="fas fa-shopping-bag" style={{ color: '#fff', fontSize: '14px' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--pd-primary)' }}>Electro</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.6 }}>
                support@pakodrive.com<br />03185205667
              </p>
            </div>

            {/* Order meta */}
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.85rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Invoice Receipt
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.6 }}>
                #{shortId}<br />
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f0f0f0' }} />

        {/* Shipping + Payment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '0' }}>
          <div style={{ padding: '16px', borderRight: '1px solid #f0f0f0' }}>
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
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    background: '#f5f5f5',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={item.image || '/img/product-placeholder.png'}
                    alt={item.name}
                    fill
                    sizes="44px"
                    style={{ objectFit: 'contain', padding: '4px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/img/product-placeholder.png';
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: '0 0 2px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: '#111',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
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
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#111' }}>
              PKR {order.totalAmount.toLocaleString()}
            </span>
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

      {/* Back to Home CTA */}
      <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <i className="fas fa-arrow-left" style={{ fontSize: '12px' }} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
