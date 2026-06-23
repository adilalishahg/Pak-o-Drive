'use client';

import React from 'react';
import { useSiteTheme } from '../common/DynamicThemeProvider';
import { ProductCard } from './ProductCard';
import { ProductCardClassic } from './ProductCardClassic';
import { IProduct } from '../../types';

interface Props { product: IProduct }

export const ProductCardAuto: React.FC<Props> = ({ product }) => {
  const { theme } = useSiteTheme();
  return theme.layoutTheme === 'classic'
    ? <ProductCardClassic product={product} />
    : <ProductCard product={product} />;
};
