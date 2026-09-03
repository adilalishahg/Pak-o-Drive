'use client';

import { useMemo } from 'react';
import { useCart } from '@/context/CartContext';

export function useFreeShippingMeter() {
  const { cart, isHydrated } = useCart();

  const { totalItems, isUnlocked, itemsRemaining, progressPct, message } = useMemo(() => {
    if (!isHydrated) {
      return {
        totalItems: 0,
        isUnlocked: false,
        itemsRemaining: 2,
        progressPct: 0,
        message: 'Free delivery on 2 or more products across Pakistan',
      };
    }

    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const unlocked = count >= 2;
    const remaining = Math.max(0, 2 - count);
    const pct = unlocked ? 100 : Math.min(100, Math.round((count / 2) * 100));

    let msg = '';
    if (unlocked) {
      msg = '🎉 Mubarak! You have unlocked 100% FREE Delivery across Pakistan!';
    } else if (remaining === 1) {
      msg = '🚚 Add 1 more product to unlock FREE Doorstep Delivery!';
    } else {
      msg = '🚚 Add 2 products to unlock 100% FREE Delivery across Pakistan!';
    }

    return {
      totalItems: count,
      isUnlocked: unlocked,
      itemsRemaining: remaining,
      progressPct: pct,
      message: msg,
    };
  }, [cart, isHydrated]);

  return {
    isHydrated,
    totalItems,
    isUnlocked,
    itemsRemaining,
    progressPct,
    message,
  };
}
