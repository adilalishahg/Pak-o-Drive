'use client';

import React from 'react';

interface ProductGeneralInfoProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: any[];
  price: string;
  setPrice: (v: string) => void;
  originalPrice: string;
  setOriginalPrice: (v: string) => void;
  stock: string;
  setStock: (v: string) => void;
  heroText: string;
  setHeroText: (v: string) => void;
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
  isNewArrival: boolean;
  setIsNewArrival: (v: boolean) => void;
  isTopSelling: boolean;
  setIsTopSelling: (v: boolean) => void;
  validationErrors: Record<string, string>;
}

export function ProductGeneralInfo({
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  categories,
  price,
  setPrice,
  originalPrice,
  setOriginalPrice,
  stock,
  setStock,
  heroText,
  setHeroText,
  isFeatured,
  setIsFeatured,
  isNewArrival,
  setIsNewArrival,
  isTopSelling,
  setIsTopSelling,
  validationErrors,
}: ProductGeneralInfoProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-transparent border-0 py-3 px-4">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="fas fa-box text-primary" /> Basic Information
        </h6>
      </div>
      <div className="card-body p-4 pt-0">
        <div className="row g-3">
          {/* Product Name */}
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">
              Product Title / Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Wireless Noise-Cancelling Earbuds Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
          </div>

          {/* Description */}
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">
              Product Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
              placeholder="Describe key features, box contents, specs and benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {validationErrors.description && <div className="invalid-feedback">{validationErrors.description}</div>}
          </div>

          {/* Category */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">
              Category <span className="text-danger">*</span>
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c: any) => (
                <option key={c.slug} value={c.slug}>
                  {c.parentCategory ? `└─ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">
              Stock Quantity <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              id="stock"
              min="0"
              className={`form-control ${validationErrors.stock ? 'is-invalid' : ''}`}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            {validationErrors.stock && <div className="invalid-feedback">{validationErrors.stock}</div>}
          </div>

          {/* Price */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">
              Price (PKR) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted font-monospace">PKR</span>
              <input
                type="number"
                id="price"
                min="0"
                step="any"
                className={`form-control ${validationErrors.price ? 'is-invalid' : ''}`}
                placeholder="4500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {validationErrors.price && <div className="invalid-feedback">{validationErrors.price}</div>}
            </div>
          </div>

          {/* Original Price / Discount */}
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-muted">Original / Strikethrough Price (PKR)</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted font-monospace">PKR</span>
              <input
                type="number"
                id="originalPrice"
                min="0"
                step="any"
                className="form-control"
                placeholder="6000 (Optional for discount tag)"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Hero Deal Tagline / Badge */}
          <div className="col-12">
            <label className="form-label small fw-bold text-muted">Hero Deal Tagline / Promotional Badge</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 🔥 HOT DEAL 2026 / FLASH SALE / BESTSELLER"
              value={heroText}
              onChange={(e) => setHeroText(e.target.value)}
            />
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              Shows on Hero Carousel slides and product deal badge banners.
            </div>
          </div>

          {/* Visibility Badges */}
          <div className="col-12 pt-2 border-top">
            <label className="form-label small fw-bold text-muted mb-2 d-block">Storefront Section Badges</label>
            <div className="d-flex flex-wrap gap-4">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="isFeatured">
                  ⭐ Featured Product
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isNewArrival"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="isNewArrival">
                  🆕 New Arrival
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isTopSelling"
                  checked={isTopSelling}
                  onChange={(e) => setIsTopSelling(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold text-dark" htmlFor="isTopSelling">
                  🔥 Top Selling / Trending
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
