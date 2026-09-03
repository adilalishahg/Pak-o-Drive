'use client';

import React from 'react';
import { OrderData } from '@/hooks/useAdminOrders';

export interface ThermalShippingLabelModalProps {
  order: OrderData | null;
  courier: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalShippingLabelModal: React.FC<ThermalShippingLabelModalProps> = ({
  order,
  courier,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const shortId = order._id.slice(-8).toUpperCase();
  const trackingNumber = order.trackingNumber || `CN-${courier.slice(0, 3)}-${order._id.slice(-6).toUpperCase()}`;
  const totalAmount = order.totalAmount || 0;
  const customer = order.customerDetails || { name: 'Customer', phone: '', address: '', city: 'Pakistan' };
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 1065,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Thermal Label Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #thermal-label-area, #thermal-label-area * { visibility: visible !important; }
          #thermal-label-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100mm !important;
            height: 150mm !important;
            margin: 0 !important;
            padding: 8mm !important;
            background: #fff !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            color: #000 !important;
          }
          header, nav, footer, .no-print, [class*="navbar"], [class*="modal"] {
            display: none !important;
          }
          @page { size: 100mm 150mm; margin: 0; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3 shadow-lg p-4"
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom no-print">
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <i className="fas fa-barcode text-primary" /> Thermal Airway Bill Shipping Label
          </h6>
          <button type="button" onClick={onClose} className="btn-close" aria-label="Close" />
        </div>

        {/* ── 4x6 Thermal Label Container ── */}
        <div
          id="thermal-label-area"
          style={{
            border: '2px solid #000',
            padding: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#fff',
            color: '#000',
            fontSize: '11px',
          }}
        >
          {/* Top Header: Brand + Courier */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '-0.5px' }}>PAK-O-DRIVE</div>
              <div style={{ fontSize: '8px', textTransform: 'uppercase' }}>Express Logistics &amp; E-Commerce</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '2px' }}>
                {courier}
              </div>
              <div style={{ fontSize: '8px', marginTop: '2px' }}>CASH ON DELIVERY</div>
            </div>
          </div>

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', padding: '6px 0', borderBottom: '1px dashed #000' }}>
            <div style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
              ||| | |||| | ||||| |||| | |||
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>
              {trackingNumber}
            </div>
          </div>

          {/* Destination City Banner (Crucial for Courier Sorting!) */}
          <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '4px 0', margin: '6px 0', fontSize: '14px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
            DESTINATION: {customer.city}
          </div>

          {/* Consignee (Receiver Details) */}
          <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '6px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', color: '#444' }}>SHIP TO (CONSIGNEE):</div>
            <div style={{ fontSize: '12px', fontWeight: 800 }}>{customer.name}</div>
            <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '1px' }}>📞 {customer.phone}</div>
            <div style={{ fontSize: '10px', lineHeight: 1.3, marginTop: '2px' }}>{customer.address}, {customer.city}</div>
          </div>

          {/* COD Collectible Box */}
          <div style={{ border: '2px solid #000', padding: '6px 8px', margin: '6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800 }}>COD AMOUNT TO COLLECT:</div>
              <div style={{ fontSize: '7px' }}>* Courier rider: Do not deliver without collection</div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900 }}>
              PKR {totalAmount.toLocaleString()}
            </div>
          </div>

          {/* Order Details & Items */}
          <div style={{ borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: 700, color: '#444', marginBottom: '3px' }}>
              <span>ORDER #{shortId}</span>
              <span>DATE: {dateStr}</span>
            </div>
            <div style={{ fontSize: '9px', lineHeight: 1.3 }}>
              {order.items && order.items.map((it: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                    {it.quantity}x {it.name}
                  </span>
                  <span style={{ fontWeight: 700 }}>PKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipper (Return Details) */}
          <div style={{ fontSize: '8px', lineHeight: 1.3 }}>
            <span style={{ fontWeight: 700 }}>RETURN IF UNDELIVERED TO:</span><br />
            Pak-o-Drive Fulfillment Hub, Rawalpindi / Islamabad, Pakistan &bull; Phone: +92 318 5205667
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary flex-fill fw-bold py-2 rounded-2 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="fas fa-print" /> Print Thermal Label (4x6)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-secondary px-3 py-2 rounded-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
