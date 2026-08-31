'use client';

import React from 'react';
import Image from 'next/image';
import { VariantInput } from '../../../hooks/useProductForm';

interface ProductVariantsBuilderProps {
  variants: VariantInput[];
  variantUploading: Record<number, boolean>;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onVariantChange: (index: number, field: keyof VariantInput, value: string) => void;
  onVariantFileChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function ProductVariantsBuilder({
  variants,
  variantUploading,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onVariantFileChange,
}: ProductVariantsBuilderProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-transparent border-0 py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="fas fa-cubes text-primary" /> Product Variants ({variants.length})
          </h6>
          <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
            Add color, size, capacity or packaging variants with custom pricing and stock.
          </span>
        </div>
        <button
          type="button"
          onClick={onAddVariant}
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          <i className="fas fa-plus me-1" /> Add Variant
        </button>
      </div>

      <div className="card-body p-4 pt-0">
        {variants.length === 0 ? (
          <div className="text-center py-4 px-3 border border-dashed rounded-3 bg-light text-muted small">
            No variants created. This product will be sold as a single standard item.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {variants.map((v, idx) => (
              <div key={idx} className="p-3 border rounded-3 bg-light position-relative">
                <button
                  type="button"
                  onClick={() => onRemoveVariant(idx)}
                  className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 py-0 px-2 rounded-circle"
                  style={{ width: '26px', height: '26px', lineHeight: '24px' }}
                  title="Remove Variant"
                >
                  ×
                </button>

                <div className="row g-2 pe-4">
                  {/* Variant Name */}
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                      Variant Name / Option
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Midnight Black / 128GB"
                      value={v.name}
                      onChange={(e) => onVariantChange(idx, 'name', e.target.value)}
                    />
                  </div>

                  {/* Variant Price */}
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                      Price (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="4500"
                      value={v.price}
                      onChange={(e) => onVariantChange(idx, 'price', e.target.value)}
                    />
                  </div>

                  {/* Variant Original Price */}
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                      Original (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="6000"
                      value={v.originalPrice}
                      onChange={(e) => onVariantChange(idx, 'originalPrice', e.target.value)}
                    />
                  </div>

                  {/* Variant Stock */}
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="10"
                      value={v.stock}
                      onChange={(e) => onVariantChange(idx, 'stock', e.target.value)}
                    />
                  </div>

                  {/* Variant Image */}
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm"
                      onChange={(e) => onVariantFileChange(idx, e)}
                      disabled={variantUploading[idx]}
                    />
                  </div>
                </div>

                {v.image && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <div
                      className="rounded border bg-white position-relative flex-shrink-0"
                      style={{ width: '36px', height: '36px' }}
                    >
                      <Image src={v.image} alt={v.name} fill sizes="36px" style={{ objectFit: 'contain' }} />
                    </div>
                    <span className="small text-muted text-truncate font-monospace" style={{ fontSize: '0.72rem' }}>
                      {v.image}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
