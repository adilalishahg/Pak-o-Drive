'use client';

import React from 'react';
import { SiteTheme } from '../../common/DynamicThemeProvider';
import { optimizeImageBeforeUpload } from '../../../utils/imageOptimizer';

interface HeroSlidesManagerProps {
  form: SiteTheme;
  availableProducts: any[];
  onAddSlide: () => void;
  onUpdateSlide: (idx: number, field: string, val: any) => void;
  onDeleteSlide: (idx: number) => void;
  onMoveSlide: (idx: number, direction: 'up' | 'down') => void;
  onSelectProduct: (idx: number, prodId: string) => void;
  onUpdateSliderSetting: (key: string, val: any) => void;
}

export function HeroSlidesManager({
  form,
  availableProducts,
  onAddSlide,
  onUpdateSlide,
  onDeleteSlide,
  onMoveSlide,
  onSelectProduct,
  onUpdateSliderSetting,
}: HeroSlidesManagerProps) {
  const heroSlidesList = form.homepageSections?.heroSlides || [];
  const sliderCfg = form.homepageSections?.heroSliderSettings || {
    autoSlideEnabled: true,
    autoSlideIntervalSec: 5,
    showArrows: true,
    showDots: true,
  };

  const autoPlay = sliderCfg.autoSlideEnabled !== false;
  const intervalSec = sliderCfg.autoSlideIntervalSec ?? 5;
  const showArrows = sliderCfg.showArrows !== false;
  const showDots = sliderCfg.showDots !== false;

  return (
    <div className="card border-primary border-opacity-25 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* Card Header */}
      <div className="card-header bg-primary bg-opacity-10 py-3 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
            <i className="fas fa-layer-group" />
            Hero Carousel Slides ({heroSlidesList.length} Slides)
          </h6>
          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
            Add multiple slides to cycle on the homepage Hero section. Link directly to any product to auto-sync title, badge & product image!
          </div>
        </div>
        <button
          type="button"
          onClick={onAddSlide}
          className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-sm ms-auto"
        >
          <i className="fas fa-plus" /> Add New Slide
        </button>
      </div>

      <div className="card-body p-3 p-md-4 bg-white">
        {/* ⚙️ Hero Slider Controls & Behavior Settings */}
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
            <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
              <i className="fas fa-sliders-h text-primary" /> Slider Timing & Navigation Controls
            </span>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.72rem' }}>
              Live Auto-Sync
            </span>
          </div>

          <div className="row g-3 pt-1">
            {/* Auto-Slide Interval */}
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label mb-0 text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>
                  Auto-Slide Interval (Rotation Time)
                </label>
                <span className="badge bg-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.75rem' }}>
                  {intervalSec} Seconds
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min={2}
                max={15}
                step={1}
                value={intervalSec}
                onChange={(e) => onUpdateSliderSetting('autoSlideIntervalSec', Number(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.68rem' }}>
                <span>2s (Fast)</span>
                <span>5s (Recommended)</span>
                <span>15s (Slow)</span>
              </div>
            </div>

            {/* Switches Container */}
            <div className="col-12 col-md-6">
              <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                {/* Auto-Slide Switch */}
                <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border">
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.78rem' }}>
                    <i className="fas fa-play-circle text-success me-1.5" /> Auto-Slide Enabled
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      checked={autoPlay}
                      onChange={(e) => onUpdateSliderSetting('autoSlideEnabled', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Navigation Handles (Left/Right Arrows) Switch */}
                <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border">
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.78rem' }}>
                    <i className="fas fa-arrows-alt-h text-primary me-1.5" /> Left / Right Handles (Arrows)
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      checked={showArrows}
                      onChange={(e) => onUpdateSliderSetting('showArrows', e.target.checked)}
                    />
                  </div>
                </div>

                {/* Slide Dots Switch */}
                <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-2 border">
                  <span className="small text-dark fw-medium" style={{ fontSize: '0.78rem' }}>
                    <i className="fas fa-ellipsis-h text-muted me-1.5" /> Slide Indicator Dots
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input my-0"
                      type="checkbox"
                      role="switch"
                      checked={showDots}
                      onChange={(e) => onUpdateSliderSetting('showDots', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {heroSlidesList.length === 0 ? (
          <div className="text-center py-4 px-3 border border-dashed rounded-3 bg-light">
            <i className="fas fa-images text-muted mb-2" style={{ fontSize: '2rem' }} />
            <h6 className="fw-bold text-secondary mb-1">No Custom Hero Slides Yet</h6>
            <p className="text-muted small mb-3">
              Currently using the fallback banners. Click below to add multiple dynamic product slides!
            </p>
            <button
              type="button"
              onClick={onAddSlide}
              className="btn btn-outline-primary btn-sm rounded-pill px-4"
            >
              <i className="fas fa-plus me-1" /> Create First Hero Slide
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {heroSlidesList.map((slide: any, idx: number) => {
              const linkedProd = slide.productId
                ? availableProducts.find((p) => String(p._id) === String(slide.productId))
                : null;
              const isProductImg = slide.imageType !== 'custom';
              const displayImg = isProductImg
                ? linkedProd?.image || slide.imageUrl || '/img/product-1.png'
                : slide.imageUrl || '/img/product-1.png';

              return (
                <div
                  key={idx}
                  className={`border rounded-3 overflow-hidden shadow-xs w-100 ${
                    slide.enabled !== false ? 'border-secondary-subtle' : 'border-danger-subtle opacity-75'
                  }`}
                >
                  {/* Slide Header Bar */}
                  <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                      <span className="badge bg-secondary rounded-pill px-2 py-1 flex-shrink-0" style={{ fontSize: '0.72rem' }}>
                        Slide #{idx + 1}
                      </span>
                      <span className="fw-bold text-dark small text-truncate">
                        {slide.title || (linkedProd?.name ? linkedProd.name : 'Untitled Slide')}
                      </span>
                      {linkedProd && (
                        <span
                          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 text-truncate d-none d-sm-inline-block"
                          style={{ fontSize: '0.7rem', maxWidth: '130px' }}
                        >
                          <i className="fas fa-box me-1" /> {linkedProd.name}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveSlide(idx, 'up')}
                        className="btn btn-light btn-sm border py-1 px-2 text-muted"
                        title="Move Up"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="fas fa-arrow-up" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === heroSlidesList.length - 1}
                        onClick={() => onMoveSlide(idx, 'down')}
                        className="btn btn-light btn-sm border py-1 px-2 text-muted"
                        title="Move Down"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="fas fa-arrow-down" />
                      </button>

                      <div className="form-check form-switch mb-0 ms-1 d-flex align-items-center">
                        <input
                          className="form-check-input my-0"
                          type="checkbox"
                          role="switch"
                          checked={slide.enabled !== false}
                          onChange={(e) => onUpdateSlide(idx, 'enabled', e.target.checked)}
                          title="Enable/Disable Slide"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteSlide(idx)}
                        className="btn btn-outline-danger btn-sm py-1 px-2 ms-1"
                        title="Delete Slide"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </div>
                  </div>

                  {/* Slide Form Body */}
                  <div className="p-3 bg-white">
                    <div className="row g-3">
                      {/* Product Link Dropdown */}
                      <div className="col-12">
                        <label className="form-label mb-1 text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                          <i className="fas fa-link me-1" /> Select Product to Feature (Auto-fills Title, Badge & Image)
                        </label>
                        <select
                          className="form-select form-select-sm rounded-3 w-100"
                          value={slide.productId || ''}
                          onChange={(e) => onSelectProduct(idx, e.target.value)}
                          style={{ fontSize: '0.84rem' }}
                        >
                          <option value="">-- Custom Banner (No Product Linked) --</option>
                          {availableProducts.map((p: any) => (
                            <option key={p._id} value={p._id}>
                              📦 {p.name} — PKR {p.price?.toLocaleString()} {p.heroText ? `[Badge: "${p.heroText}"]` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                          Selecting a product will automatically link to its detail page and load its headline, hero badge & image.
                        </div>
                      </div>

                      {/* Image Selection Mode */}
                      <div className="col-12 col-md-6">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.78rem' }}>
                          Slide Image Option
                        </label>
                        <div className="d-flex flex-wrap gap-2 mb-2 w-100">
                          <button
                            type="button"
                            onClick={() => onUpdateSlide(idx, 'imageType', 'product')}
                            className={`btn btn-sm rounded-3 flex-fill ${
                              isProductImg ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '0.78rem', minWidth: '120px' }}
                          >
                            <i className="fas fa-box me-1" /> Product Image
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateSlide(idx, 'imageType', 'custom')}
                            className={`btn btn-sm rounded-3 flex-fill ${
                              !isProductImg ? 'btn-primary' : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '0.78rem', minWidth: '120px' }}
                          >
                            <i className="fas fa-upload me-1" /> Custom Banner
                          </button>
                        </div>

                        {!isProductImg ? (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control form-control-sm w-100"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const opt = await optimizeImageBeforeUpload(file);
                                  const fd = new FormData();
                                  fd.append('file', opt);
                                  const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                  const j = await res.json();
                                  if (j.success) {
                                    onUpdateSlide(idx, 'imageUrl', j.url);
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                        ) : (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {linkedProd ? 'Using product primary image.' : 'Select a product above or switch to Custom Banner.'}
                          </div>
                        )}
                      </div>

                      {/* Image Preview Box */}
                      <div className="col-12 col-md-6 d-flex align-items-center">
                        <div className="d-flex align-items-center gap-3 w-100 bg-light p-2 rounded-3 border overflow-hidden">
                          <div
                            className="border rounded bg-white p-1 position-relative flex-shrink-0"
                            style={{ width: '56px', height: '56px' }}
                          >
                            <img
                              src={displayImg}
                              alt="Slide preview"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div className="small text-truncate min-w-0 flex-grow-1" style={{ fontSize: '0.75rem' }}>
                            <div className="fw-semibold text-dark text-truncate">
                              {isProductImg ? linkedProd?.name || 'Default Asset' : 'Custom Banner Asset'}
                            </div>
                            <div className="text-muted text-truncate">{displayImg}</div>
                          </div>
                        </div>
                      </div>

                      {/* Badge / Tagline */}
                      <div className="col-12 col-md-6">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Hero Badge / Deal Tagline
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={slide.badge || ''}
                          onChange={(e) => onUpdateSlide(idx, 'badge', e.target.value)}
                          placeholder="e.g. 🔥 HOT DEAL 2026 / FLASH SALE"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Headline Title */}
                      <div className="col-12 col-md-6">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Headline Title
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={slide.title || ''}
                          onChange={(e) => onUpdateSlide(idx, 'title', e.target.value)}
                          placeholder="e.g. Wireless Noise-Cancelling Earbuds"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Subtitle / Description */}
                      <div className="col-12">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Subtitle / Promotional Description
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={slide.subtitle || ''}
                          onChange={(e) => onUpdateSlide(idx, 'subtitle', e.target.value)}
                          placeholder="Short description highlighting specs or special discount..."
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Button Label & Link */}
                      <div className="col-12 col-md-6">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Button Label
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={slide.buttonText || 'Shop Now'}
                          onChange={(e) => onUpdateSlide(idx, 'buttonText', e.target.value)}
                          placeholder="Shop Now"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label mb-1 text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          Button Link URL
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={slide.buttonLink || '/shop'}
                          onChange={(e) => onUpdateSlide(idx, 'buttonLink', e.target.value)}
                          placeholder="/shop or /product/ID"
                          style={{ fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
