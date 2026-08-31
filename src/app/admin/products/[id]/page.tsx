'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProductForm } from '../../../../components/admin/products/ProductForm';

export default function AdminEditProductPage() {
  const params = useParams() as { id: string };
  const productId = params?.id;

  return <ProductForm productId={productId} pageTitle="Edit Product" />;
}
