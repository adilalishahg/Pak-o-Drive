'use client';

import { useEffect } from 'react';
import { logInteraction } from './AnalyticsTracker';
import { ProductViewLoggerProps } from '@/types/common';

export function ProductViewLogger({ id, name, category, price }: ProductViewLoggerProps) {

  useEffect(() => {
    logInteraction('view_product', window.location.pathname, {
      product_id: id,
      product_name: name,
      category,
      price,
    });
  }, [id, name, category, price]);

  return null;
}
