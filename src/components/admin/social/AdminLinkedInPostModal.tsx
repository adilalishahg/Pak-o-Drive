'use client';

import React from 'react';
import type { useAdminLinkedInPost } from '@/hooks/useAdminLinkedInPost';
import type { TechTrack } from '@/lib/dynamicCarouselAiEngine';

interface AdminLinkedInPostModalProps {
  hook: ReturnType<typeof useAdminLinkedInPost>;
}

export function AdminLinkedInPostModal({ hook }: AdminLinkedInPostModalProps) {
  const {
    isOpen,
    setIsOpen,
    selectedTrack,
    setSelectedTrack,
    postingState,
    progressMessage,
    lastResult,
    recentLogs,
    account,
    tracks,
    loadingHistory,
    toast,
    triggerDynamicPost,
    resetModal,
  } = hook;

  if (!isOpen) return null;

  const isWorking =
    postingState === 'generating' || postingState === 'rendering' || postingState === 'publishing';

  const trackOptions: { id: TechTrack | 'auto'; title: string; icon: string }[] = [
    { id: 'auto', title: '✨ Auto-Discover Trend', icon: 'fas fa-wand-magic-sparkles' },
    { id: 'agentic-ai', title: '🤖 Agentic AI & Tools', icon: 'fas fa-robot' },
    { id: 'nextjs-react', title: '⚡ Next.js 16 & React 19', icon: 'fab fa-react' },
    { id: 'typescript', title: '🛡️ Advanced TypeScript', icon: 'fas fa-code' },
    { id: 'cloud-architecture', title: '☁️ Cloud Architecture', icon: 'fas fa-cloud' },
    { id: 'fullstack-performance', title: '🚀 Full-Stack Web Vitals', icon: 'fas fa-gauge-high' },
  ];

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1055,
      }}
      tabIndex={-1}
      role="dialog"
    >
      {/* Toast Notification Container */}
      {toast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x p-3"
          style={{ zIndex: 1099, marginTop: '20px' }}
        >
          <div
            className={`toast show text-white border-0 shadow-lg px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
              toast.type === 'success' ? 'bg-success' : 'bg-danger'
            }`}
            style={{ minWidth: '320px', maxWidth: '90vw' }}
          >
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} />
            <div className="flex-grow-1 text-sm fw-medium">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" style={{ background: '#ffffff' }}>
          {/* Header Banner */}
          <div
            className="modal-header border-0 px-4 py-3 text-white d-flex align-items-center justify-content-between"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '42px',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <i className="fab fa-linkedin text-info" style={{ fontSize: '1.4rem' }} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white" style={{ fontSize: '1.15rem' }}>
                  AI LinkedIn Post & Carousel Generator
                </h5>
                <span className="text-white-50" style={{ fontSize: '0.78rem' }}>
                  Option A: Software & AI Engineering (4:5 Slobodan Gajić Vertical Portrait PDF)
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-white-50 text-decoration-none p-1"
              onClick={() => {
                if (!isWorking) setIsOpen(false);
              }}
              disabled={isWorking}
              aria-label="Close"
              style={{ fontSize: '1.2rem' }}
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: '#f8fafc' }}>
            {/* Account Status Card */}
            <div className="card border-0 shadow-sm rounded-3 mb-3 p-3 bg-white">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="rounded-circle d-inline-block"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: account?.isActive !== false ? '#10b981' : '#f59e0b',
                    }}
                  />
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>
                    {account?.accountName || 'LinkedIn Connected Profile'}
                  </span>
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.72rem' }}>
                    {account?.accountUrn ? 'API Linked' : 'Token Ready'}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  Total Carousels: <span className="fw-bold text-dark">{account?.postCount || 0}</span>
                  {account?.lastPostedAt && (
                    <span className="ms-2">
                      • Last: {new Date(account.lastPostedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Track Selector */}
            <div className="mb-4">
              <label className="form-label text-uppercase text-secondary fw-bold mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                Select Engineering Track
              </label>
              <div className="row g-2">
                {trackOptions.map((t) => {
                  const isSelected = selectedTrack === t.id;
                  return (
                    <div className="col-12 col-sm-6 col-md-4" key={t.id}>
                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() => setSelectedTrack(t.id)}
                        className={`btn w-100 text-start p-2 rounded-3 border transition-all ${
                          isSelected
                            ? 'btn-primary shadow-sm border-primary'
                            : 'btn-white bg-white text-dark border-light-subtle hover-shadow'
                        }`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        <div className="fw-semibold text-truncate">{t.title}</div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress / Status Feedback Box */}
            {postingState !== 'idle' && (
              <div
                className={`alert border-0 rounded-3 mb-4 p-3 ${
                  postingState === 'success'
                    ? 'alert-success'
                    : postingState === 'error'
                    ? 'alert-danger'
                    : 'alert-info'
                }`}
              >
                <div className="d-flex align-items-center gap-3">
                  {isWorking ? (
                    <div className="spinner-border spinner-border-sm text-primary flex-shrink-0" role="status" />
                  ) : postingState === 'success' ? (
                    <i className="fas fa-check-circle text-success fs-5 flex-shrink-0" />
                  ) : (
                    <i className="fas fa-exclamation-circle text-danger fs-5 flex-shrink-0" />
                  )}
                  <div className="flex-grow-1" style={{ fontSize: '0.84rem' }}>
                    <div className="fw-bold mb-0">{progressMessage}</div>
                    {lastResult?.postId && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        Post URN: <code>{lastResult.postId}</code>
                      </div>
                    )}
                  </div>
                  {!isWorking && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      onClick={resetModal}
                      style={{ fontSize: '0.75rem' }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
              <button
                type="button"
                className="btn btn-primary flex-grow-1 py-2 px-4 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={triggerDynamicPost}
                disabled={isWorking}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  border: 'none',
                }}
              >
                {isWorking ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Processing Dynamic Carousel...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" />
                    <span>Generate & Publish to LinkedIn Now</span>
                  </>
                )}
              </button>
              <a
                href="/api/cron/auto-social?action=preview-carousel"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary py-2 px-3 rounded-3 d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: '0.82rem' }}
              >
                <i className="fas fa-file-pdf text-danger" />
                <span>Preview Active PDF</span>
              </a>
            </div>

            {/* Recent Post History Audit Table */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase text-secondary fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  Recent LinkedIn Carousels Log
                </span>
                {loadingHistory && <span className="spinner-border spinner-border-sm text-muted" />}
              </div>

              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="table-responsive" style={{ maxHeight: '220px' }}>
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ minWidth: '160px' }}>Topic</th>
                        <th>Track</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-3 text-muted">
                            No published post logs found yet.
                          </td>
                        </tr>
                      ) : (
                        recentLogs.map((log) => (
                          <tr key={log._id}>
                            <td className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }} title={log.topic}>
                              {log.topic}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {log.track || 'agentic-ai'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${log.source === 'admin-manual' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                {log.source === 'admin-manual' ? '👤 Manual' : '⏰ Cron'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${log.status === 'published' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="text-muted">
                              {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-0 px-4 py-2 bg-white d-flex justify-content-between">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              💡 Real-time trend discovery + deduplication prevents repeating topics within 45 days.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light border px-3 rounded-2"
              onClick={() => setIsOpen(false)}
              disabled={isWorking}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
