'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSiteTheme } from '@/components/common/DynamicThemeProvider';
import { FLOATING_CART_EXCLUDED_PREFIXES } from '@/lib/constants';

export function useFloatingCart() {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useCart();
  const { theme } = useSiteTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isExcluded =
    !pathname ||
    FLOATING_CART_EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const isVisible = mounted && cartCount > 0 && !isExcluded;

  const isModernGreen = theme.layoutTheme === 'modern-green';
  const isCleanWhite = theme.layoutTheme === 'theme1';

  const btnBackground = isModernGreen
    ? 'linear-gradient(135deg, #d4af37, #b89324)'
    : isCleanWhite
    ? `linear-gradient(135deg, ${theme.primaryColor}, color-mix(in srgb, ${theme.primaryColor} 80%, #000))`
    : 'linear-gradient(135deg, var(--pd-primary), #c2410c)';

  const accentColor = isModernGreen ? '#0d231d' : '#ffffff';

  return {
    isVisible,
    cartCount,
    cartTotal,
    formattedTotal: `PKR ${cartTotal.toLocaleString()}`,
    btnBackground,
    accentColor,
  };
}
