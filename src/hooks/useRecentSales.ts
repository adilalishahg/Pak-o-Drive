'use client';

import { useState, useEffect } from 'react';
import { RECENT_SALES_NOTIFICATIONS } from '../lib/constants';

export function useRecentSales() {
  const [currentSale, setCurrentSale] = useState<typeof RECENT_SALES_NOTIFICATIONS[number] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    
    // Initial delay before showing first notification
    const initialTimeout = setTimeout(() => {
      setCurrentSale(RECENT_SALES_NOTIFICATIONS[index]);
      setVisible(true);
    }, 4000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        index = (index + 1) % RECENT_SALES_NOTIFICATIONS.length;
        setCurrentSale(RECENT_SALES_NOTIFICATIONS[index]);
        setVisible(true);
      }, 1000);
    }, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  return { currentSale, visible, dismiss };
}
