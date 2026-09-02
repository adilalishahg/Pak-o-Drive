'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { IOrder } from '@/types';

export function useOrderConfirmation() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();

        if (data.success && isMounted) {
          setOrder(data.data);
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.5 } });

          // Browser-side Purchase pixel events with deduplicated event_id
          if (typeof window !== 'undefined') {
            const eventId = `order_${data.data._id}`;
            const value = data.data.totalAmount || 0;

            // Meta Pixel — Purchase
            if (typeof (window as any).fbq === 'function') {
              try {
                (window as any).fbq(
                  'track',
                  'Purchase',
                  {
                    value,
                    currency: 'PKR',
                    content_type: 'product',
                    order_id: data.data._id,
                  },
                  { eventID: eventId }
                );
              } catch (pixelErr) {
                console.error('[Meta Pixel] Purchase fire failed:', pixelErr);
              }
            }

            // TikTok Pixel — CompletePayment
            if (
              typeof (window as any).ttq !== 'undefined' &&
              typeof (window as any).ttq.track === 'function'
            ) {
              try {
                (window as any).ttq.track('CompletePayment', {
                  value,
                  currency: 'PKR',
                  order_id: data.data._id,
                  event_id: eventId,
                });
              } catch (ttErr) {
                console.error('[TikTok Pixel] CompletePayment fire failed:', ttErr);
              }
            }
          }
        } else if (isMounted) {
          setError(data.error || 'Failed to load order.');
        }
      } catch {
        if (isMounted) setError('Connection failed. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWhatsApp = useCallback(() => {
    if (!order) return;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pakodrive.com';
    const items = order.items
      .map((i) => {
        const productLink = `${siteUrl}/product/${i.productId}`;
        return `- ${i.quantity}x ${i.name} (PKR ${i.price.toLocaleString()})\n  Link: ${productLink}`;
      })
      .join('\n');

    const emailLine = order.customerDetails.email ? `\nEmail: ${order.customerDetails.email}` : '';
    const msg = `*Order Confirmation*\nOrder ID: #${order._id?.slice(-8).toUpperCase()}\nName: ${order.customerDetails.name}\nPhone: ${order.customerDetails.phone}${emailLine}\nAddress: ${order.customerDetails.address}, ${order.customerDetails.city}\n\nItems:\n${items}\n\nTotal: PKR ${order.totalAmount.toLocaleString()}\nPayment: COD`;

    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [order, whatsappNumber]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const shortId = order?._id ? order._id.slice(-8).toUpperCase() : '';

  return {
    order,
    loading,
    error,
    shortId,
    handleWhatsApp,
    handlePrint,
  };
}
