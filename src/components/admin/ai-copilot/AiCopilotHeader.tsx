'use client';

import React from 'react';
import Link from 'next/link';

interface AiCopilotHeaderProps {
  snapshot: any;
  seoAudit: any;
  snapshotLoading: boolean;
  fetchSnapshot: () => void;
  clearChat: () => void;
  showSeoBar: boolean;
  setShowSeoBar: React.Dispatch<React.SetStateAction<boolean>>;
  showCompetitorBar: boolean;
  setShowCompetitorBar: React.Dispatch<React.SetStateAction<boolean>>;
  targetSeoUrl: string;
  setTargetSeoUrl: (url: string) => void;
  competitorUrl: string;
  setCompetitorUrl: (url: string) => void;
  sendMessage: (msg: string, seoUrl?: string, compUrl?: string) => void;
  analyzeCompetitor: (url: string) => void;
  loading: boolean;
}

export function AiCopilotHeader({
  snapshot,
  seoAudit,
  snapshotLoading,
  fetchSnapshot,
  clearChat,
  showSeoBar,
  setShowSeoBar,
  showCompetitorBar,
  setShowCompetitorBar,
  targetSeoUrl,
  setTargetSeoUrl,
  competitorUrl,
  setCompetitorUrl,
  sendMessage,
  analyzeCompetitor,
  loading,
}: AiCopilotHeaderProps) {
  return (
    <>
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pb-3 mb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                color: '#fff',
                fontSize: '20px',
              }}
            >
              <i className="fas fa-brain" />
            </div>
            <div>
              <h1 className="h4 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                Pak-o-Drive AI Copilot & Market Brain
                <span className="badge rounded-pill bg-emerald text-white fw-medium px-2 py-1" style={{ fontSize: '11px', background: '#059669' }}>
                  Live Engine
                </span>
              </h1>
              <p className="text-muted small mb-0">
                Real-time MongoDB Store Metrics • Rawalpindi & Islamabad Auto Trends • Live SEO Ranking Audit
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSeoBar((v) => !v)}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${showSeoBar ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-search" />
            <span>{showSeoBar ? 'Close SEO URL' : 'Audit Specific URL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCompetitorBar((v) => !v)}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${showCompetitorBar ? 'btn-danger' : 'btn-outline-danger'}`}
            style={{ borderRadius: '10px' }}
            title="Inspect any competitor store or product link"
          >
            <i className="fas fa-user-secret" />
            <span>{showCompetitorBar ? 'Close Competitor Spy' : '🕵️ Competitor Spy'}</span>
          </button>

          <button
            type="button"
            onClick={fetchSnapshot}
            disabled={snapshotLoading}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
            style={{ borderRadius: '10px' }}
            title="Refresh database live metrics"
          >
            <i className={`fas fa-sync-alt ${snapshotLoading ? 'fa-spin' : ''}`} />
            <span>Sync Data</span>
          </button>

          <button
            type="button"
            onClick={clearChat}
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5"
            style={{ borderRadius: '10px' }}
            title="Clear Chat History"
          >
            <i className="fas fa-trash-alt" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Live Store Metrics Strip */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Total Products</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">{snapshot ? snapshot.totalProducts : '...'}</span>
              <span className="badge bg-light text-secondary border">Catalog</span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Low Stock Alert</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className={`h6 mb-0 fw-bold ${snapshot && snapshot.lowStockItems.length > 0 ? 'text-danger' : 'text-success'}`}>
                {snapshot ? `${snapshot.lowStockItems.length} items` : '...'}
              </span>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                {snapshot?.outOfStockCount ? `${snapshot.outOfStockCount} Out` : 'Stock'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Total Orders</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">{snapshot ? snapshot.totalOrders : '...'}</span>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                {snapshot ? `${snapshot.pendingOrdersCount} Pending` : 'Orders'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>Store Revenue</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className="h6 mb-0 fw-bold text-dark">
                {snapshot ? `PKR ${snapshot.totalRevenuePKR.toLocaleString()}` : '...'}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">Sales</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-12 col-lg">
          <div className="bg-white rounded-3 border p-2.5 shadow-sm">
            <span className="text-muted d-block small" style={{ fontSize: '11px' }}>SEO Health Check</span>
            <div className="d-flex align-items-center justify-content-between mt-1">
              <span className={`h6 mb-0 fw-bold ${seoAudit && seoAudit.totalMissingSeo > 0 ? 'text-warning' : 'text-success'}`}>
                {seoAudit ? `${seoAudit.totalMissingSeo} Missing SEO` : '...'}
              </span>
              <Link href="/admin/blogs" className="badge bg-primary-subtle text-primary border border-primary-subtle text-decoration-none">
                SEO Tools →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Optional SEO URL Target Bar */}
      {showSeoBar && (
        <div className="bg-primary-subtle border border-primary-subtle rounded-3 p-2.5 mb-3 d-flex flex-column flex-sm-row align-items-center gap-2">
          <i className="fas fa-link text-primary fs-5 ms-1" />
          <div className="flex-grow-1 w-100">
            <input
              type="text"
              className="form-control form-control-sm bg-white border"
              placeholder="e.g. /shop, /product/car-ambient-lighting, or https://pakodrive.com"
              value={targetSeoUrl}
              onChange={(e) => setTargetSeoUrl(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary text-nowrap"
            onClick={() => {
              if (targetSeoUrl.trim()) {
                sendMessage(`Audit the live SEO, title, meta description, and ranking readiness of this page: ${targetSeoUrl.trim()}`, targetSeoUrl.trim());
              }
            }}
          >
            Audit URL Now
          </button>
        </div>
      )}

      {/* Competitor Spy & Reverse Engineering Bar */}
      {showCompetitorBar && (
        <div className="bg-danger-subtle border border-danger-subtle rounded-3 p-3 mb-3 shadow-sm">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 text-danger fw-bold small">
              <i className="fas fa-user-secret fs-5" />
              <span>Competitor Spy & Strategy Breakdown:</span>
            </div>
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              <span className="text-muted small" style={{ fontSize: '11px' }}>Quick Examples:</span>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://sehgalmotors.pk/product/car-interior-ambient-lighting-kit')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                Sehgal Motors
              </button>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://autostore.pk/product/solar-rotating-car-perfume')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                Autostore.pk
              </button>
              <button
                type="button"
                onClick={() => setCompetitorUrl('https://www.pakwheels.com/accessories-spare-parts/')}
                className="badge bg-white text-secondary border text-decoration-none py-1 px-2 cursor-pointer"
                style={{ fontSize: '10px' }}
              >
                PakWheels
              </button>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
            <div className="flex-grow-1 w-100">
              <input
                type="text"
                className="form-control form-control-sm bg-white border"
                placeholder="Paste competitor link (e.g. https://sehgalmotors.pk/product/... or Daraz or PakWheels)..."
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={!competitorUrl.trim() || loading}
              className="btn btn-sm btn-danger text-nowrap d-flex align-items-center gap-1.5 px-3"
              onClick={() => {
                if (competitorUrl.trim()) {
                  analyzeCompetitor(competitorUrl.trim());
                }
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-search-location" />
                  <span>Spy & Reverse Engineer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
