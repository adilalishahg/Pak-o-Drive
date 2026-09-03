'use client';

import React, { useState } from 'react';

export interface AiGeneratedProductData {
  title: string;
  description: string;
  specifications: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
}

export interface AiProductGeneratorModalProps {
  isOpen: boolean;
  initialTitle?: string;
  initialCategory?: string;
  onClose: () => void;
  onApply: (data: AiGeneratedProductData) => void;
}

export const AiProductGeneratorModal: React.FC<AiProductGeneratorModalProps> = ({
  isOpen,
  initialTitle = '',
  initialCategory = '',
  onClose,
  onApply,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<AiGeneratedProductData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a product title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category }),
      });

      const data = await res.json();
      if (data.success) {
        setGenerated(data.data);
      } else {
        setError(data.error || 'Failed to generate product content.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generated) return;
    onApply(generated);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1065,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-4 shadow-xl p-4 overflow-hidden d-flex flex-column"
        style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              <i className="fas fa-magic" />
            </span>
            <h6 className="mb-0 fw-bold text-dark">AI 1-Click Product Copywriter</h6>
          </div>
          <button type="button" onClick={onClose} className="btn-close" aria-label="Close" />
        </div>

        {/* Input Controls */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted mb-1">Product Title / Name:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Wireless Car Vacuum Cleaner or Suzuki Mehran Mirror"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className="btn btn-primary btn-sm px-3 fw-bold text-white d-flex align-items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" /> Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt" /> Generate with AI
                </>
              )}
            </button>
          </div>
          {error && <div className="text-danger small mt-1">{error}</div>}
        </div>

        {/* Generated Preview Box */}
        {generated && (
          <div
            className="flex-fill overflow-y-auto p-3 bg-light rounded-3 border mb-3"
            style={{ fontSize: '0.82rem' }}
          >
            <div className="mb-2">
              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mb-1.5">
                ✅ AI Generated Description:
              </span>
              <pre
                className="p-2.5 bg-white rounded-2 border text-dark mb-0"
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {generated.description}
              </pre>
            </div>

            <div className="mb-2">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mb-1.5">
                ⚙️ Specifications Map:
              </span>
              <div className="bg-white p-2 rounded-2 border">
                {Object.entries(generated.specifications).map(([k, v]) => (
                  <div key={k} className="d-flex justify-content-between border-bottom py-1">
                    <span className="fw-bold text-secondary">{k}:</span>
                    <span className="text-dark">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="badge bg-secondary bg-opacity-10 text-secondary border mb-1">
                🔍 Google SEO Preview:
              </span>
              <div className="bg-white p-2 rounded-2 border">
                <div className="text-primary fw-bold text-truncate">{generated.seoTitle}</div>
                <div className="text-success small" style={{ fontSize: '0.72rem' }}>
                  https://www.pakodrive.pk/product/...
                </div>
                <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                  {generated.seoDescription}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="d-flex gap-2 justify-content-end pt-2 border-top">
          <button type="button" onClick={onClose} className="btn btn-outline-secondary btn-sm px-3">
            Cancel
          </button>
          {generated && (
            <button
              type="button"
              onClick={handleApply}
              className="btn btn-success btn-sm px-4 fw-bold text-white d-flex align-items-center gap-1.5"
            >
              <i className="fas fa-check-circle" /> Apply to Product Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
