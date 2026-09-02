'use client';

import React from 'react';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { OrderLoadingState } from '@/components/order-confirmation/OrderLoadingState';
import { OrderErrorState } from '@/components/order-confirmation/OrderErrorState';
import { OrderSuccessBanner } from '@/components/order-confirmation/OrderSuccessBanner';
import { OrderInvoiceCard } from '@/components/order-confirmation/OrderInvoiceCard';

export default function OrderConfirmationPage() {
  const {
    order,
    loading,
    error,
    shortId,
    handleWhatsApp,
    handlePrint,
  } = useOrderConfirmation();

  if (loading) return <OrderLoadingState />;
  if (error || !order) return <OrderErrorState error={error} />;

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '32px' }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-area,
          #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #fff !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          header, nav, footer, .no-print,
          [class*="navbar"], [class*="footer"],
          [class*="whatsapp"], [class*="back-to-top"],
          [class*="chat"] { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
        @media (max-width: 575px) {
          .oc-invoice-header { flex-direction: column !important; gap: 12px !important; }
          .oc-invoice-header .text-end { text-align: left !important; }
        }
      `}</style>

      {/* Success Banner with WhatsApp & Print CTA */}
      <OrderSuccessBanner
        shortId={shortId}
        onWhatsApp={handleWhatsApp}
        onPrint={handlePrint}
      />

      {/* Printable Invoice Card */}
      <OrderInvoiceCard order={order} shortId={shortId} />
    </div>
  );
}
