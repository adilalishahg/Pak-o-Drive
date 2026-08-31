'use client';

import React from 'react';
import Image from 'next/image';

interface ProductImagesManagerProps {
  image: string;
  setImage: (url: string) => void;
  images: string[];
  uploading: boolean;
  galleryUploading: boolean;
  galleryUrlInput: string;
  setGalleryUrlInput: (v: string) => void;
  mainImageError: boolean;
  setMainImageError: (v: boolean) => void;
  galleryImageErrors: Record<number, boolean>;
  setGalleryImageErrors: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  video: string;
  setVideo: (v: string) => void;
  validationErrors: Record<string, string>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onGalleryFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onAddGalleryUrl: () => void;
  onRemoveGalleryImage: (idx: number) => void;
  onSetMainImage: (url: string) => void;
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function ProductImagesManager({
  image,
  setImage,
  images,
  uploading,
  galleryUploading,
  galleryUrlInput,
  setGalleryUrlInput,
  mainImageError,
  setMainImageError,
  galleryImageErrors,
  setGalleryImageErrors,
  video,
  setVideo,
  validationErrors,
  onFileChange,
  onGalleryFileChange,
  onAddGalleryUrl,
  onRemoveGalleryImage,
  onSetMainImage,
  onVideoChange,
}: ProductImagesManagerProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-transparent border-0 py-3 px-4">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="fas fa-images text-primary" /> Product Media & Gallery
        </h6>
      </div>
      <div className="card-body p-4 pt-0">
        {/* Main Image */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted d-block">
            Primary / Cover Image <span className="text-danger">*</span>
          </label>
          <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
            {/* Image Preview */}
            <div
              className="rounded-3 border d-flex align-items-center justify-content-center bg-light overflow-hidden position-relative flex-shrink-0"
              style={{ width: '120px', height: '120px' }}
            >
              {image ? (
                mainImageError ? (
                  <span className="text-muted small">Broken Image</span>
                ) : (
                  <Image
                    src={image}
                    alt="Main Product"
                    fill
                    sizes="120px"
                    style={{ objectFit: 'contain' }}
                    onError={() => setMainImageError(true)}
                  />
                )
              ) : (
                <i className="fas fa-image text-muted" style={{ fontSize: '2rem' }} />
              )}
            </div>

            <div className="flex-grow-1 w-100">
              {/* File Upload */}
              <div className="mb-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className={`form-control ${validationErrors.image ? 'is-invalid' : ''}`}
                  onChange={onFileChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="small text-primary mt-1">
                    <span className="spinner-border spinner-border-sm me-1" /> Optimizing & Uploading to Cloudinary...
                  </div>
                )}
                {validationErrors.image && <div className="invalid-feedback">{validationErrors.image}</div>}
              </div>

              {/* URL Fallback */}
              <div className="input-group">
                <span className="input-group-text bg-light text-muted small">URL</span>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        <div className="mb-4 pt-3 border-top">
          <label className="form-label small fw-bold text-muted d-block mb-1">
            Additional Gallery Images (Multi-Angle Shots)
          </label>
          <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
            Upload multiple gallery images. Click &quot;Set Cover&quot; on any image to promote it to primary.
          </p>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="position-relative border rounded-3 p-1 bg-light group overflow-hidden"
                style={{ width: '90px', height: '90px' }}
              >
                {galleryImageErrors[idx] ? (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small text-center">
                    Broken
                  </div>
                ) : (
                  <Image
                    src={imgUrl}
                    alt={`Gallery ${idx + 1}`}
                    fill
                    sizes="90px"
                    style={{ objectFit: 'contain' }}
                    onError={() => setGalleryImageErrors((prev) => ({ ...prev, [idx]: true }))}
                  />
                )}
                <div className="position-absolute top-0 end-0 d-flex gap-1 p-1 bg-dark bg-opacity-75 rounded-bottom-start">
                  <button
                    type="button"
                    onClick={() => onSetMainImage(imgUrl)}
                    className="btn btn-xs btn-primary p-0 px-1 text-white"
                    title="Make Main Image"
                    style={{ fontSize: '0.65rem' }}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(idx)}
                    className="btn btn-xs btn-danger p-0 px-1 text-white"
                    title="Remove"
                    style={{ fontSize: '0.65rem' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-2">
            <div className="col-12 col-md-7">
              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control form-control-sm"
                onChange={onGalleryFileChange}
                disabled={galleryUploading}
              />
              {galleryUploading && (
                <div className="small text-primary mt-1">
                  <span className="spinner-border spinner-border-sm me-1" /> Uploading gallery images...
                </div>
              )}
            </div>
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="Paste image URL..."
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={onAddGalleryUrl}
                  className="btn btn-outline-secondary"
                  disabled={!galleryUrlInput.trim()}
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Video */}
        <div className="pt-3 border-top">
          <label className="form-label small fw-bold text-muted d-block mb-1">
            Product Demo Video (Optional)
          </label>
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <input
                type="file"
                accept="video/*"
                className="form-control form-control-sm"
                onChange={onVideoChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                placeholder="Video URL or Cloudinary URL..."
                value={video}
                onChange={(e) => setVideo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
