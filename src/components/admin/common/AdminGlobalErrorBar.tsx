'use client';

import React, { useState } from 'react';
import { useAdminErrors } from '../../../hooks/useAdminErrors';
import { AdminLogEntry } from '../../../types/adminError';

export function AdminGlobalErrorBar() {
  const {
    alerts,
    activeAlert,
    unreadErrorsCount,
    unreadWarningsCount,
    currentIndex,
    expandedId,
    minimized,
    drawerOpen,
    copiedId,
    setDrawerOpen,
    setMinimized,
    dismissAlert,
    dismissCurrent,
    clearAll,
    toggleDetails,
    nextAlert,
    prevAlert,
    copyError,
    simulateTestError,
  } = useAdminErrors();

  const [filterType, setFilterType] = useState<'all' | 'error' | 'warn'>('all');

  const filteredLogs = alerts.filter((item) => {
    if (filterType === 'error') return item.type === 'error';
    if (filterType === 'warn') return item.type === 'warn';
    return true;
  });

  const unreadTotal = unreadErrorsCount + unreadWarningsCount;

  return (
    <>
      {/* ── 1. Top Global Banner (Visible when there is an active alert and not minimized) ── */}
      {activeAlert && !minimized && (
        <div
          className="admin-error-banner shadow-sm mb-3 rounded-3 overflow-hidden transition-all"
          style={{
            border: activeAlert.type === 'error' ? '1px solid #fca5a5' : '1px solid #fde68a',
            borderLeft: activeAlert.type === 'error' ? '5px solid #dc2626' : '5px solid #d97706',
            background: activeAlert.type === 'error' ? '#fff5f5' : '#fffbeb',
            animation: 'fadeInDown 0.25s ease-out',
          }}
        >
          <div className="p-3">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap flex-md-nowrap">
              {/* Left: Icon & Alert Info */}
              <div className="d-flex align-items-start gap-2.5 min-w-0 flex-grow-1">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: activeAlert.type === 'error' ? 'rgba(220, 38, 38, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                    color: activeAlert.type === 'error' ? '#dc2626' : '#d97706',
                  }}
                >
                  <i className={`fas ${activeAlert.type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'} fs-6`} />
                </div>

                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span
                      className="badge rounded-pill text-uppercase px-2 py-0.5"
                      style={{
                        fontSize: '0.68rem',
                        letterSpacing: '0.5px',
                        background: activeAlert.type === 'error' ? '#dc2626' : '#d97706',
                        color: '#ffffff',
                      }}
                    >
                      {activeAlert.type === 'error' ? 'Console Error' : 'Console Warning'}
                    </span>

                    {activeAlert.count > 1 && (
                      <span className="badge bg-secondary text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                        Repeated {activeAlert.count}x
                      </span>
                    )}

                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      {new Date(activeAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>

                    {unreadTotal > 1 && (
                      <span className="badge bg-light text-dark border rounded-pill px-2 py-0.5 ms-auto ms-sm-0" style={{ fontSize: '0.72rem' }}>
                        Issue {currentIndex + 1} of {unreadTotal}
                      </span>
                    )}
                  </div>

                  {/* Main Message */}
                  <div
                    className="fw-semibold text-dark font-monospace text-break leading-normal py-0.5"
                    style={{ fontSize: '0.86rem' }}
                  >
                    {activeAlert.message}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="d-flex align-items-center gap-1.5 flex-shrink-0 ms-auto ms-md-0">
                {/* Navigation if multiple */}
                {unreadTotal > 1 && (
                  <div className="btn-group btn-group-sm me-1" role="group">
                    <button
                      type="button"
                      onClick={prevAlert}
                      className="btn btn-outline-secondary btn-sm py-0.5 px-2"
                      title="Previous Alert"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextAlert}
                      className="btn btn-outline-secondary btn-sm py-0.5 px-2"
                      title="Next Alert"
                    >
                      ›
                    </button>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => copyError(activeAlert.id)}
                  className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.78rem' }}
                  title="Copy error details to clipboard"
                >
                  <i className={`fas ${copiedId === activeAlert.id ? 'fa-check text-success' : 'fa-copy text-muted'}`} />
                  <span className="d-none d-sm-inline">
                    {copiedId === activeAlert.id ? 'Copied!' : 'Copy'}
                  </span>
                </button>

                {/* View Details Button */}
                {activeAlert.stack && (
                  <button
                    type="button"
                    onClick={() => toggleDetails(activeAlert.id)}
                    className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.78rem' }}
                    title="Toggle stack trace"
                  >
                    <i className="fas fa-code text-muted" />
                    <span className="d-none d-sm-inline">
                      {expandedId === activeAlert.id ? 'Hide Details' : 'Details'}
                    </span>
                  </button>
                )}

                {/* Open Full Log Inspector */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="btn btn-sm btn-light border py-1 px-2.5 d-flex align-items-center gap-1.5"
                  style={{ fontSize: '0.78rem' }}
                  title="Open Error History Inspector"
                >
                  <i className="fas fa-list-ul text-muted" />
                  <span className="d-none d-md-inline">All Logs ({alerts.length})</span>
                </button>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  className="btn btn-sm btn-light border py-1 px-2"
                  style={{ fontSize: '0.78rem' }}
                  title="Minimize banner"
                  aria-label="Minimize"
                >
                  <i className="fas fa-minus text-muted" />
                </button>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={dismissCurrent}
                  className="btn btn-sm btn-light border text-danger py-1 px-2"
                  style={{ fontSize: '0.85rem' }}
                  title="Dismiss alert"
                  aria-label="Dismiss"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            {/* Collapsible Stack Trace Details */}
            {expandedId === activeAlert.id && activeAlert.stack && (
              <div className="mt-2.5 pt-2.5 border-top border-secondary border-opacity-10">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-bold" style={{ fontSize: '0.72rem' }}>
                    TECHNICAL STACK TRACE
                  </span>
                  <button
                    type="button"
                    onClick={() => copyError(activeAlert.id)}
                    className="btn btn-xs btn-link p-0 text-decoration-none small text-muted"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {copiedId === activeAlert.id ? '✓ Copied' : 'Copy trace'}
                  </button>
                </div>
                <pre
                  className="bg-dark text-light p-2.5 rounded-2 font-monospace mb-0 small overflow-auto text-break"
                  style={{
                    fontSize: '0.75rem',
                    maxHeight: '180px',
                    lineHeight: '1.4',
                  }}
                >
                  {activeAlert.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Floating Status Pill (Visible when minimized OR when logs exist) ── */}
      {(minimized || !activeAlert) && alerts.length > 0 && (
        <div
          className="position-fixed bottom-0 end-0 m-3 z-3 shadow-lg rounded-pill overflow-hidden transition-all"
          style={{ zIndex: 1050, animation: 'fadeInUp 0.3s ease-out' }}
        >
          <div
            className="d-flex align-items-center p-1.5 px-3 bg-dark text-white rounded-pill border border-secondary border-opacity-50 cursor-pointer shadow"
            onClick={() => {
              setMinimized(false);
              setDrawerOpen(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            {unreadErrorsCount > 0 && (
              <span className="badge bg-danger text-white rounded-pill px-2 py-1 me-1.5 d-flex align-items-center gap-1">
                <i className="fas fa-exclamation-circle" /> {unreadErrorsCount} {unreadErrorsCount === 1 ? 'Error' : 'Errors'}
              </span>
            )}

            {unreadWarningsCount > 0 && (
              <span className="badge bg-warning text-dark rounded-pill px-2 py-1 me-1.5 d-flex align-items-center gap-1">
                <i className="fas fa-exclamation-triangle" /> {unreadWarningsCount} {unreadWarningsCount === 1 ? 'Warning' : 'Warnings'}
              </span>
            )}

            {unreadTotal === 0 && (
              <span className="badge bg-secondary text-white rounded-pill px-2 py-1 me-1.5 d-flex align-items-center gap-1">
                <i className="fas fa-check-circle text-success" /> {alerts.length} Logged
              </span>
            )}

            <span className="small fw-semibold me-1 d-none d-sm-inline" style={{ fontSize: '0.78rem' }}>
              Console Inspector
            </span>
            <i className="fas fa-chevron-up text-muted small ms-1" />
          </div>
        </div>
      )}

      {/* ── 3. Full Slide-Over Drawer: Complete Console Logs & Diagnostics ── */}
      {drawerOpen && (
        <div
          className="position-fixed top-0 end-0 bottom-0 bg-white shadow-lg border-start d-flex flex-column z-3"
          style={{
            width: '100%',
            maxWidth: '540px',
            zIndex: 1060,
            animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Drawer Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                <i className="fas fa-terminal" style={{ fontSize: '0.85rem' }} />
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark leading-normal">Admin Console Inspector</h6>
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Live runtime errors, API failures &amp; warnings
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              aria-label="Close drawer"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Drawer Subheader: Filter Chips & Controls */}
          <div className="p-2 px-3 border-bottom bg-white d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`btn btn-xs py-1 px-2.5 ${filterType === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                All ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('error')}
                className={`btn btn-xs py-1 px-2.5 ${filterType === 'error' ? 'btn-danger' : 'btn-outline-danger'}`}
                style={{ fontSize: '0.75rem' }}
              >
                Errors ({alerts.filter((a) => a.type === 'error').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('warn')}
                className={`btn btn-xs py-1 px-2.5 ${filterType === 'warn' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                style={{ fontSize: '0.75rem' }}
              >
                Warnings ({alerts.filter((a) => a.type === 'warn').length})
              </button>
            </div>

            <div className="d-flex align-items-center gap-1.5">
              <button
                type="button"
                onClick={clearAll}
                disabled={alerts.length === 0}
                className="btn btn-outline-danger btn-xs py-1 px-2 d-flex align-items-center gap-1"
                style={{ fontSize: '0.75rem' }}
                title="Clear all logged errors"
              >
                <i className="fas fa-trash-alt" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Drawer Body: Log Items */}
          <div className="flex-grow-1 overflow-y-auto p-3 bg-light">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-check-circle text-success mb-2" style={{ fontSize: '2.5rem' }} />
                <h6 className="fw-bold text-dark mb-1">No Console Issues Logged</h6>
                <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
                  All admin systems, network APIs, and React hooks are running smoothly.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={() => simulateTestError('error')}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    style={{ fontSize: '0.78rem' }}
                  >
                    ⚡ Test Simulated Error
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateTestError('warn')}
                    className="btn btn-outline-warning text-dark btn-sm rounded-pill px-3"
                    style={{ fontSize: '0.78rem' }}
                  >
                    ⚡ Test Warning
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {filteredLogs.map((log: AdminLogEntry) => {
                  const isErr = log.type === 'error';
                  const isExp = expandedId === log.id;

                  return (
                    <div
                      key={log.id}
                      className="card border-0 shadow-sm rounded-3 overflow-hidden"
                      style={{
                        borderLeft: isErr ? '4px solid #dc2626' : '4px solid #d97706',
                        opacity: log.dismissed ? 0.65 : 1,
                      }}
                    >
                      <div className="p-3">
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-1.5">
                          <div className="d-flex align-items-center gap-1.5">
                            <span
                              className="badge rounded-pill text-uppercase px-2 py-0.5"
                              style={{
                                fontSize: '0.65rem',
                                background: isErr ? '#dc2626' : '#d97706',
                                color: '#ffffff',
                              }}
                            >
                              {isErr ? 'Error' : 'Warning'}
                            </span>
                            {log.count > 1 && (
                              <span className="badge bg-secondary text-white rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                {log.count}x
                              </span>
                            )}
                            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyError(log.id)}
                              className="btn btn-xs btn-light border py-0.5 px-2"
                              style={{ fontSize: '0.7rem' }}
                              title="Copy"
                            >
                              <i className={`fas ${copiedId === log.id ? 'fa-check text-success' : 'fa-copy'}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => dismissAlert(log.id)}
                              className="btn btn-xs btn-light border text-danger py-0.5 px-2"
                              style={{ fontSize: '0.7rem' }}
                              title="Dismiss"
                            >
                              <i className="fas fa-times" />
                            </button>
                          </div>
                        </div>

                        <p className="font-monospace mb-1.5 text-dark fw-semibold text-break small leading-normal py-0.5" style={{ fontSize: '0.8rem' }}>
                          {log.message}
                        </p>

                        {log.stack && (
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleDetails(log.id)}
                              className="btn btn-link p-0 text-decoration-none small text-muted d-flex align-items-center gap-1"
                              style={{ fontSize: '0.72rem' }}
                            >
                              <i className={`fas ${isExp ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                              <span>{isExp ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
                            </button>

                            {isExp && (
                              <pre
                                className="bg-dark text-light p-2 rounded-2 font-monospace mt-1.5 mb-0 small overflow-auto text-break"
                                style={{ fontSize: '0.7rem', maxHeight: '140px' }}
                              >
                                {log.stack}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-top bg-white d-flex align-items-center justify-content-between">
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => simulateTestError('error')}
                className="btn btn-outline-danger btn-xs py-1 px-2.5 rounded-pill"
                style={{ fontSize: '0.72rem' }}
              >
                + Test Error
              </button>
              <button
                type="button"
                onClick={() => simulateTestError('warn')}
                className="btn btn-outline-warning text-dark btn-xs py-1 px-2.5 rounded-pill"
                style={{ fontSize: '0.72rem' }}
              >
                + Test Warning
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="btn btn-sm btn-secondary rounded-pill px-3"
              style={{ fontSize: '0.78rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for drawer */}
      {drawerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-2"
          onClick={() => setDrawerOpen(false)}
          style={{ zIndex: 1055 }}
        />
      )}
    </>
  );
}
