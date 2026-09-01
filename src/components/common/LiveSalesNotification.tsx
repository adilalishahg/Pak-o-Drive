'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { OptimizedImage } from './OptimizedImage';
import { NotificationItem } from '@/types/common';
import { PAKISTANI_CUSTOMERS } from '@/lib/constants';

const TIME_AGO_LIST = [
  'Just now',
  '2 minutes ago',
  '4 minutes ago',
  '6 minutes ago',
  '9 minutes ago',
];

export default function LiveSalesNotification() {
  const pathname = usePathname();
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [productsList, setProductsList] = useState<any[]>([]);

  // Don't show on admin or checkout pages to avoid distraction
  const shouldHide = pathname.startsWith('/admin') || pathname === '/checkout' || isDismissed;

  useEffect(() => {
    // Fetch products once to use realistic store catalog
    async function loadProducts() {
      try {
        const res = await fetch('/api/products?limit=20');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProductsList(json.data);
        }
      } catch (err) {
        console.error('Error loading products for social proof:', err);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (shouldHide || productsList.length === 0) return;

    // Trigger initial notification after 6 seconds
    const initialTimer = setTimeout(() => {
      showRandomNotification();
    }, 6000);

    // Periodic loop every 26 seconds
    const interval = setInterval(() => {
      showRandomNotification();
    }, 26000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [productsList, shouldHide]);

  const showRandomNotification = () => {
    if (shouldHide || productsList.length === 0) return;

    const randomCustomer = PAKISTANI_CUSTOMERS[Math.floor(Math.random() * PAKISTANI_CUSTOMERS.length)];
    const randomProduct = productsList[Math.floor(Math.random() * productsList.length)];
    const randomTime = TIME_AGO_LIST[Math.floor(Math.random() * TIME_AGO_LIST.length)];

    setCurrentNotification({
      customerName: randomCustomer.name,
      city: randomCustomer.city,
      productName: randomProduct.name,
      productImage: randomProduct.image || '/img/product-1.png',
      productLink: `/product/${randomProduct._id}`,
      timeAgo: randomTime,
    });

    setIsVisible(true);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  if (shouldHide || !currentNotification) return null;

  return (
    <div
      className={`position-fixed z-3 ${isVisible ? 'toast-slide-enter' : 'toast-slide-exit'}`}
      style={{
        bottom: '24px',
        left: '20px',
        maxWidth: '320px',
        pointerEvents: isVisible ? 'auto' : 'none',
        display: isVisible ? 'block' : 'none',
      }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 p-2.5 bg-white"
        style={{
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14), 0 2px 6px rgba(15, 23, 42, 0.06)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="d-flex align-items-center gap-2.5">
          {/* Product Thumbnail */}
          <Link
            href={currentNotification.productLink}
            className="flex-shrink-0 position-relative rounded-3 overflow-hidden bg-light border d-block"
            style={{ width: '48px', height: '48px' }}
          >
            <OptimizedImage
              src={currentNotification.productImage}
              alt={currentNotification.productName}
              fill
              sizes="48px"
              style={{ objectFit: 'contain', padding: '2px' }}
              fallbackSrc="/img/product-1.png"
            />
          </Link>

          {/* Text Information */}
          <div className="flex-grow-1 min-w-0" style={{ lineHeight: 1.25 }}>
            <div className="d-flex align-items-center gap-1.5 mb-0.5">
              <span className="live-pulse-dot" style={{ width: '7px', height: '7px' }} />
              <span className="fw-bold text-dark text-truncate" style={{ fontSize: '0.74rem' }}>
                {currentNotification.customerName} in {currentNotification.city}
              </span>
            </div>

            <Link
              href={currentNotification.productLink}
              className="text-decoration-none text-secondary fw-semibold text-truncate d-block"
              style={{ fontSize: '0.76rem', color: '#0f172a' }}
            >
              Purchased {currentNotification.productName}
            </Link>

            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                <i className="fas fa-check-circle text-success me-1" style={{ fontSize: '9px' }} />
                Verified Order • {currentNotification.timeAgo}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setIsDismissed(true);
            }}
            className="btn-close ms-auto align-self-start p-1"
            style={{ fontSize: '0.6rem', opacity: 0.6 }}
            aria-label="Dismiss notification"
          />
        </div>
      </div>
    </div>
  );
}

export { LiveSalesNotification };

