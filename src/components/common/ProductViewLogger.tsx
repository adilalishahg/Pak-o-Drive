'use client';

import { useEffect, useRef } from 'react';
import { logInteraction } from './AnalyticsTracker';
import { ProductViewLoggerProps } from '@/types/common';

export function ProductViewLogger({ id, name, category, price }: ProductViewLoggerProps) {
  const loggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || loggedRef.current === id) return;
    loggedRef.current = id;

    logInteraction('view_product', window.location.pathname, {
      product_id: id,
      product_name: name,
      category,
      price,
    });
  }, [id, name, category, price]);

  return null;
}
