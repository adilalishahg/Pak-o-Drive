'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { ProductCard } from './ProductCard';
import { ProductCardClassic } from './ProductCardClassic';
import { IProduct } from '../../types';

interface Props { product: IProduct; priority?: boolean; }

export const ProductCardAuto: React.FC<Props> = ({ product, priority }) => {
  const { theme } = useSiteTheme();
  return theme.layoutTheme === 'classic'
    ? <ProductCardClassic product={product} priority={priority} />
    : <ProductCard product={product} priority={priority} />;
};
