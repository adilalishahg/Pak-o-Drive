'use client';

import { useEffect } from 'react';
import { logInteraction } from './AnalyticsTracker';

interface ProductViewLoggerProps {
  id: string;
  name: string;
  category: string;
  price: number;
}

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
