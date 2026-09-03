'use client';

import React from 'react';
import { useProductReviews, ReviewItem } from '@/hooks/useProductReviews';

export interface ProductReviewsSectionProps {
  productId: string;
  initialRating?: number;
  initialReviewCount?: number;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  initialRating = 5,
  initialReviewCount = 0,
}) => {
  const {
    reviews,
    allReviewsCount,
    stats,
    loading,
    filterPhotosOnly,
    setFilterPhotosOnly,
    isWriteModalOpen,
    setIsWriteModalOpen,
    lightboxImage,
    setLightboxImage,
    userName,
    setUserName,
    userCity,
    setUserCity,
    rating,
    setRating,
    title,
    setTitle,
    comment,
    setComment,
    imageUrlInput,
    setImageUrlInput,
    images,
    handleAddImage,
    handleRemoveImage,
    submitting,
    submitSuccess,
    errorMessage,
    handleSubmitReview,
  } = useProductReviews({ productId, initialRating, initialReviewCount });

  const renderStars = (count: number, size = '13px') => {
    return (
      <div className="d-inline-flex align-items-center gap-0.5 text-warning" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className={`fas fa-star ${i <= count ? 'text-warning' : 'text-slate-200'}`}
            style={{ color: i <= count ? '#f59e0b' : '#e2e8f0' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="pd-card p-3 p-lg-4 mt-3"
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Section Header ── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 mb-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            <i className="fas fa-star" />
          </span>
          <div>
            <h3 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
              Verified Customer Ratings & Reviews
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Real feedback from Pakistani COD buyers
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="btn btn-sm btn-outline-primary fw-bold px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
          style={{ fontSize: '0.78rem' }}
        >
          <i className="fas fa-pen" style={{ fontSize: '11px' }} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* ── Ratings Summary Bar & Distribution ── */}
      <div className="row g-3 align-items-center mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
        {/* Left: Big Score */}
        <div className="col-12 col-md-4 text-center border-end-md">
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="my-1.5">{renderStars(Math.round(stats.averageRating), '16px')}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Based on {stats.totalReviews || allReviewsCount || 1} verified ratings
          </span>
        </div>

        {/* Middle: Star Bars */}
        <div className="col-12 col-md-5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingBreakdown[star] || 0;
            const total = stats.totalReviews || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={star} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.74rem' }}>
                <span style={{ width: '32px', color: '#475569', fontWeight: 600 }}>{star} ★</span>
                <div className="progress flex-grow-1" style={{ height: '6px', background: '#e2e8f0' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${pct}%`,
                      background: star >= 4 ? '#f59e0b' : star === 3 ? '#fbbf24' : '#94a3b8',
                    }}
                  />
                </div>
                <span style={{ width: '28px', textAlign: 'right', color: '#94a3b8' }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Guarantee Badge */}
        <div className="col-12 col-md-3 text-center text-md-start ps-md-3">
          <div className="d-inline-flex d-md-flex align-items-center gap-2 text-success mb-1">
            <i className="fas fa-shield-check" style={{ fontSize: '16px' }} />
            <span className="fw-bold" style={{ fontSize: '0.78rem' }}>100% Authentic</span>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
            All reviews are from verified purchasers across Pakistan with doorstep Cash on Delivery delivery.
          </p>
        </div>
      </div>

      {/* ── Filter Buttons ── */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setFilterPhotosOnly(false)}
          className={`btn btn-sm rounded-pill px-3 py-1 ${
            !filterPhotosOnly ? 'btn-dark' : 'btn-light border'
          }`}
          style={{ fontSize: '0.74rem', fontWeight: 600 }}
        >
          All Reviews ({allReviewsCount})
        </button>

        {stats.withPhotosCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterPhotosOnly(true)}
            className={`btn btn-sm rounded-pill px-3 py-1 ${
              filterPhotosOnly ? 'btn-dark' : 'btn-light border'
            }`}
            style={{ fontSize: '0.74rem', fontWeight: 600 }}
          >
            <i className="fas fa-camera me-1" /> With Photos ({stats.withPhotosCount})
          </button>
        )}
      </div>

      {/* ── Reviews List ── */}
      {loading ? (
        <div className="py-4 text-center text-muted" style={{ fontSize: '0.84rem' }}>
          <i className="fas fa-spinner fa-spin me-2" /> Loading customer reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-4 text-center text-muted" style={{ fontSize: '0.84rem' }}>
          <p className="mb-2">Abhi tak koi review nahi likha gaya.</p>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="btn btn-sm btn-primary rounded-pill px-3"
            style={{ fontSize: '0.76rem' }}
          >
            Pehle reviewer banein aur apna tajruba share karein!
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-3 rounded-3 border"
              style={{ background: '#ffffff', borderColor: '#f1f5f9' }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1.5">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.08)',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>
                      {rev.userName}
                    </span>
                    {rev.isVerifiedBuyer && (
                      <span
                        className="badge bg-success-subtle text-success border border-success-subtle ms-1.5"
                        style={{ fontSize: '0.62rem', padding: '2px 6px' }}
                      >
                        <i className="fas fa-check me-0.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    📍 {rev.userCity || 'Pakistan'}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-2">
                {renderStars(rev.rating, '11px')}
                {rev.title && (
                  <span className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>
                    {rev.title}
                  </span>
                )}
              </div>

              <p className="mb-2 text-secondary" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                {rev.comment}
              </p>

              {/* Photo attachments */}
              {rev.images && rev.images.length > 0 && (
                <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                  {rev.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxImage(img)}
                      className="border-0 p-0 rounded-2 overflow-hidden position-relative"
                      style={{
                        width: '56px',
                        height: '56px',
                        cursor: 'pointer',
                        border: '1.5px solid #e2e8f0',
                      }}
                    >
                      <img
                        src={img}
                        alt="Customer vehicle installation"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox Image Modal ── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="position-relative bg-dark rounded-3 overflow-hidden"
            style={{ maxWidth: '90vw', maxHeight: '85vh' }}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="btn btn-sm btn-light position-absolute top-0 end-0 m-2 rounded-circle"
              style={{ width: '32px', height: '32px', zIndex: 10 }}
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Customer photo enlarged"
              style={{ width: 'auto', height: 'auto', maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* ── Write Review Modal ── */}
      {isWriteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1055,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3 shadow-lg p-4"
            style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
              <h5 className="mb-0 fw-bold">Write a Customer Review</h5>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="btn-close"
                aria-label="Close"
              />
            </div>

            {submitSuccess ? (
              <div className="alert alert-success text-center py-3">
                <i className="fas fa-check-circle fs-3 text-success d-block mb-2" />
                <strong>Shukriya!</strong> Aapka review kamyabi se submit ho gaya hai.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {errorMessage && (
                  <div className="alert alert-danger py-2 px-3 small mb-3">{errorMessage}</div>
                )}

                {/* Rating selection */}
                <div className="mb-3 text-center">
                  <label className="form-label d-block small fw-bold text-muted mb-1">
                    Tap to Rate Product:
                  </label>
                  <div className="d-inline-flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="btn border-0 p-1 bg-transparent"
                        style={{ fontSize: '24px', cursor: 'pointer' }}
                      >
                        <i
                          className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-slate-300'}`}
                          style={{ color: star <= rating ? '#f59e0b' : '#cbd5e1' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Ali"
                      className="form-control form-control-sm"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rawalpindi / Lahore"
                      className="form-control form-control-sm"
                      value={userCity}
                      onChange={(e) => setUserCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary mb-1">Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent fit in my car, looks premium!"
                    className="form-control form-control-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Quality kaisi thi? Fitting kaisi aayi? Apni gaari ke sath apna tajruba share karein..."
                    className="form-control form-control-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                {/* Optional Photo URL */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Photo of Product Installed in Car (Optional)
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="url"
                      placeholder="Paste image link..."
                      className="form-control"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="btn btn-outline-secondary"
                    >
                      + Add
                    </button>
                  </div>
                  {images.length > 0 && (
                    <div className="d-flex gap-2 mt-2">
                      {images.map((img, i) => (
                        <div key={i} className="position-relative" style={{ width: '40px', height: '40px' }}>
                          <img
                            src={img}
                            alt="preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="btn btn-danger btn-sm p-0 rounded-circle position-absolute top-0 end-0"
                            style={{ width: '14px', height: '14px', fontSize: '9px', lineHeight: 1 }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-100 fw-bold py-2 rounded-2"
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2" /> Submitting...
                    </>
                  ) : (
                    'Submit Verified Review'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
