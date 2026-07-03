import React from 'react';
import { getCachedAllProducts } from '../../lib/cache';
import { ShopClient } from '../../components/shop/ShopClient';

export default async function ShopPage() {
  const initialProducts = await getCachedAllProducts();

  return (
    <ShopClient initialProducts={initialProducts} />
  );
}
