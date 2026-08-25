'use client';

import { useState, useEffect } from 'react';
import { RECENT_SALES_NOTIFICATIONS } from '../lib/constants';

export function useRecentSales() {
  const [currentSale, setCurrentSale] = useState<typeof RECENT_SALES_NOTIFICATIONS[number] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed popups in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('pd_sales_popup_dismissed') === '1') {
      return;
    }

    let showCount = 0;
    const maxShows = 2; // Show maximum 2 times per session so it never annoys real customers
    let index = Math.floor(Math.random() * RECENT_SALES_NOTIFICATIONS.length);

    // Initial subtle delay (8 seconds after landing on the page)
    const initialTimeout = setTimeout(() => {
      if (showCount < maxShows) {
        setCurrentSale(RECENT_SALES_NOTIFICATIONS[index]);
        setVisible(true);
        showCount++;

        // Auto hide after 5 seconds
        setTimeout(() => {
          setVisible(false);
        }, 5000);
      }
    }, 8000);

    // Second and final notification after 35 seconds
    const secondTimeout = setTimeout(() => {
      if (showCount < maxShows && sessionStorage.getItem('pd_sales_popup_dismissed') !== '1') {
        index = (index + 1) % RECENT_SALES_NOTIFICATIONS.length;
        setCurrentSale(RECENT_SALES_NOTIFICATIONS[index]);
        setVisible(true);
        showCount++;

        // Auto hide after 5 seconds
        setTimeout(() => {
          setVisible(false);
        }, 5000);
      }
    }, 35000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(secondTimeout);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pd_sales_popup_dismissed', '1');
    }
  };

  return { currentSale, visible, dismiss };
}
