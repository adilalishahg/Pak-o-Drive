'use client';

import React from 'react';
import Image from 'next/image';
import { ProductMini } from '@/hooks/useAdminBlogs';

interface BlogEditorProductsTabProps {
  availableProducts: ProductMini[];
  selectedProductIds: string[];
  onSelectProduct: (productId: string) => void;
}

export const BlogEditorProductsTab: React.FC<BlogEditorProductsTabProps> = ({
  availableProducts,
  selectedProductIds,
  onSelectProduct,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">
          Link Matching Store Products
        </h4>
        <p className="text-xs text-slate-500">
          Selected items will be presented with high-converting "Cash on Delivery" cards inside this article.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-2">
        {availableProducts.map((prod) => {
          const isSelected = selectedProductIds.includes(prod._id);
          const prodImage =
            prod.image ||
            (prod.images && prod.images[0]) ||
            '/img/placeholder-product.png';

          return (
            <div
              key={prod._id}
              onClick={() => onSelectProduct(prod._id)}
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                <Image
                  src={prodImage}
                  alt={prod.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 truncate">
                  {prod.name}
                </h5>
                <span className="text-xs font-extrabold text-orange-600 block mt-0.5">
                  Rs. {Number(prod.price || 0).toLocaleString()}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
