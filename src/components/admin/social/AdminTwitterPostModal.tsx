'use client';

import React, { useState } from 'react';
import type { useAdminTwitterPost } from '@/hooks/useAdminTwitterPost';

interface AdminTwitterPostModalProps {
  hook: ReturnType<typeof useAdminTwitterPost>;
}

export function AdminTwitterPostModal({ hook }: AdminTwitterPostModalProps) {
  const {
    isOpen,
    setIsOpen,
    selectedTopic,
    setSelectedTopic,
    postingState,
    progressMessage,
    previewTweets,
    lastResult,
    recentLogs,
    account,
    hasEnvKeys,
    loadingHistory,
    forceSimulation,
    setForceSimulation,
    toast,
    handleGeneratePreview,
    triggerTwitterPost,
    resetModal,
  } = hook;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const isWorking = postingState === 'previewing' || postingState === 'publishing';

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (typeof index === 'number') {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const copyFullThread = () => {
    const fullText = previewTweets.join('\n\n---\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(999);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

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
      {/* Toast Notification */}
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
        <div className="modal-content shadow-2xl border-0 rounded-4 overflow-hidden bg-white text-dark">
          {/* Header */}
          <div className="modal-header bg-slate-950 text-white border-0 px-4 py-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-dark text-white border border-secondary"
                style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 'bold' }}
              >
                𝕏
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  Twitter / 𝕏 Tech & Client Engine
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary text-xs px-2 py-0.5">
                    AI Auto-Post
                  </span>
                </h5>
                <p className="text-muted small mb-0 text-xs">
                  Generate viral tech threads, attract international clients & build X creator impressions
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => {
                resetModal();
                setIsOpen(false);
              }}
              disabled={isWorking}
              aria-label="Close"
            />
          </div>

          {/* Modal Body */}
          <div className="modal-body px-4 py-3">
            {/* Status & Credential Alert */}
            <div className="d-flex align-items-center justify-content-between p-2 mb-3 rounded-3 bg-light border">
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`badge ${
                    hasEnvKeys || account?.isActive ? 'bg-success' : 'bg-warning text-dark'
                  } d-flex align-items-center gap-1`}
                >
                  <i className={`fas ${hasEnvKeys || account?.isActive ? 'fa-link' : 'fa-info-circle'}`} />
                  {hasEnvKeys || account?.isActive ? 'API Connected' : 'Simulation & Copy Mode'}
                </span>
                <span className="text-muted text-xs">
                  {account?.accountUrn
                    ? `Active Account: @${account.accountUrn}`
                    : 'Ready to auto-generate threads or publish via API keys'}
                </span>
              </div>

              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="twitterSimMode"
                  checked={forceSimulation}
                  onChange={(e) => setForceSimulation(e.target.checked)}
                />
                <label className="form-check-label text-xs fw-semibold text-muted" htmlFor="twitterSimMode">
                  Dry-Run / Preview Only
                </label>
              </div>
            </div>

            {/* Topic Input */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-xs text-uppercase tracking-wider text-muted">
                Custom Topic (Leave blank for AI auto-selection)
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control text-sm"
                  placeholder="e.g. Why Next.js 16 App Router caching confuses developers..."
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={isWorking}
                />
                <button
                  type="button"
                  className="btn btn-outline-dark text-sm px-3"
                  onClick={handleGeneratePreview}
                  disabled={isWorking}
                >
                  <i className="fas fa-wand-magic-sparkles me-1 text-primary" />
                  {postingState === 'previewing' ? 'Generating...' : 'Generate Thread'}
                </button>
              </div>
            </div>

            {/* Loading / Progress State */}
            {isWorking && (
              <div className="p-4 my-3 text-center rounded-3 bg-light border border-primary border-opacity-25">
                <div className="spinner-border text-primary mb-2" role="status" style={{ width: '2rem', height: '2rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="fw-semibold text-sm text-dark">{progressMessage}</div>
                <div className="text-muted text-xs mt-1">Applying anti-duplication, character bounds & client acquisition CTAs</div>
              </div>
            )}

            {/* Generated Thread Preview */}
            {previewTweets.length > 0 && !isWorking && (
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-xs text-uppercase tracking-wider text-dark d-flex align-items-center gap-1">
                    <i className="fab fa-twitter text-primary" /> Generated Thread ({previewTweets.length} Tweets)
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-secondary py-0.5 px-2 text-xs"
                    onClick={copyFullThread}
                  >
                    <i className={`fas ${copiedIndex === 999 ? 'fa-check text-success' : 'fa-copy'} me-1`} />
                    {copiedIndex === 999 ? 'Copied Full Thread!' : 'Copy Entire Thread'}
                  </button>
                </div>

                <div className="d-flex flex-column gap-2">
                  {previewTweets.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-3 border bg-slate-50 position-relative transition-all hover:border-dark"
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="badge bg-dark text-white text-xs px-2 py-0.5">
                          {idx + 1} of {previewTweets.length}
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${
                              tweet.length > 270 ? 'bg-danger' : 'bg-secondary bg-opacity-25 text-dark'
                            } text-xs`}
                          >
                            {tweet.length}/280
                          </span>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-secondary py-0.5 px-2 text-xs d-flex align-items-center gap-1"
                            onClick={() => copyToClipboard(tweet, idx)}
                          >
                            <i className={`fas ${copiedIndex === idx ? 'fa-check text-success' : 'fa-copy'}`} />
                            {copiedIndex === idx ? 'Copied' : 'Copy'}
                          </button>
                          <a
                            href={`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-dark py-0.5 px-2 text-xs d-flex align-items-center gap-1 text-white"
                          >
                            <i className="fab fa-twitter text-info" /> Post on 𝕏
                          </a>
                        </div>
                      </div>

                      <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{tweet}</div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info py-2 px-3 mt-2 text-xs mb-0 d-flex align-items-center gap-2">
                  <i className="fas fa-lightbulb text-warning" />
                  <span>
                    <strong>Thread Kaise Banti Hai:</strong> Tweet 1 post karne ke baad, Twitter par usi tweet ke neechay <strong>&quot;Post your reply&quot;</strong> mein Tweet 2, 3, 4 copy karke reply karte jayein — yeh Twitter par mukammal viral thread ban jati hai!
                  </span>
                </div>
              </div>
            )}

            {/* Recent Publications History */}
            <div className="mt-3">
              <h6 className="fw-bold text-xs text-uppercase tracking-wider text-muted mb-2 d-flex align-items-center justify-content-between">
                <span>Recent 𝕏 Posts & Logs</span>
                {loadingHistory && <span className="spinner-border spinner-border-sm text-muted" />}
              </h6>

              {recentLogs.length === 0 ? (
                <div className="text-center p-3 text-muted text-xs bg-light rounded-3">
                  No previous tweets recorded yet. Generate your first viral thread above!
                </div>
              ) : (
                <div className="table-responsive rounded-3 border" style={{ maxHeight: '180px' }}>
                  <table className="table table-sm table-hover mb-0 text-xs">
                    <thead className="table-light">
                      <tr>
                        <th>Status</th>
                        <th>Topic</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogs.slice(0, 5).map((log) => (
                        <tr key={log._id}>
                          <td>
                            <span
                              className={`badge ${
                                log.status === 'published'
                                  ? 'bg-success'
                                  : log.status === 'simulated'
                                  ? 'bg-info text-dark'
                                  : 'bg-danger'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="text-truncate fw-medium" style={{ maxWidth: '220px' }}>
                            {log.topic}
                          </td>
                          <td>{log.isThread ? 'Thread' : 'Single'}</td>
                          <td className="text-muted">{new Date(log.createdAt).toLocaleDateString()}</td>
                          <td>
                            {log.tweetUrl ? (
                              <a
                                href={log.tweetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-outline-primary py-0 px-1 text-xs"
                              >
                                View 𝕏
                              </a>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light px-4 py-3 border-top d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary text-sm"
              onClick={() => {
                resetModal();
                setIsOpen(false);
              }}
              disabled={isWorking}
            >
              Close
            </button>

            <div className="d-flex align-items-center gap-2">
              {previewTweets.length > 0 && (
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(previewTweets[0] || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark text-sm d-flex align-items-center gap-1"
                >
                  <i className="fab fa-twitter text-primary" /> Post Manually on 𝕏
                </a>
              )}

              <button
                type="button"
                className="btn btn-dark text-white text-sm px-4 d-flex align-items-center gap-2 shadow-sm"
                onClick={triggerTwitterPost}
                disabled={isWorking}
              >
                <i className="fas fa-paper-plane" />
                {isWorking ? 'Publishing...' : 'Dispatch to 𝕏 (Twitter)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
