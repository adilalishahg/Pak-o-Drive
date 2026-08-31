'use client';

import React from 'react';
import ProductSEOOptimizer from '../../../components/product/ProductSEOOptimizer';
import { SpecInput, VariantInput } from '../../../hooks/useProductForm';

interface ProductSeoDetailsProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  originalPrice: string;
  category: string;
  image: string;
  images: string[];
  video: string;
  specs: SpecInput[];
  variants: VariantInput[];
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  seoKeywords: string;
  setSeoKeywords: (v: string) => void;
}

export function ProductSeoDetails({
  name,
  setName,
  description,
  setDescription,
  price,
  originalPrice,
  category,
  image,
  images,
  video,
  specs,
  variants,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  seoKeywords,
  setSeoKeywords,
}: ProductSeoDetailsProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-transparent border-0 py-3 px-4">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="fas fa-search text-primary" /> Search Engine Optimization (SEO) & Meta
        </h6>
      </div>

      <div className="card-body p-4 pt-0">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">SEO Meta Title</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder={name ? `${name} | Buy Online in Pakistan - Pak-o-Drive` : 'Custom Meta Title'}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold text-muted">SEO Meta Description</label>
            <textarea
              rows={2}
              className="form-control form-control-sm"
              placeholder={description ? description.slice(0, 150) : 'Custom search engine summary...'}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Keywords / Tags (Comma-separated)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. earbuds, bluetooth 5.3, noise cancelling, cod pakistan"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
            />
          </div>
        </div>

        {/* Live SEO Optimizer Engine */}
        <div className="mt-4 pt-3 border-top">
          <ProductSEOOptimizer
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            price={price}
            originalPrice={originalPrice}
            image={image}
            images={images}
            video={video}
            category={category}
            specs={specs}
            variants={variants}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            seoDescription={seoDescription}
            setSeoDescription={setSeoDescription}
            seoKeywords={seoKeywords}
            setSeoKeywords={setSeoKeywords}
          />
        </div>
      </div>
    </div>
  );
}
