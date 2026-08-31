'use client';

import React from 'react';
import { BotState } from '../../../hooks/useWhatsAppBot';

interface BotStatusCardProps {
  botState: BotState;
  actionLoading: boolean;
  onStartBot: () => Promise<void>;
  onOpenLogoutConfirm: () => void;
}

export function BotStatusCard({
  botState,
  actionLoading,
  onStartBot,
  onOpenLogoutConfirm,
}: BotStatusCardProps) {
  const isConnected = botState.status === 'CONNECTED';
  const isConnecting = botState.status === 'CONNECTING';
  const isQrReady = botState.status === 'QR_READY';

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      <div className="card-header bg-dark text-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px', background: '#25D366', color: '#fff' }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-white">WhatsApp Bot Connection Engine</h6>
            <span className="small text-white-50" style={{ fontSize: '0.75rem' }}>
              Baileys Multi-Device Native Automation Protocol
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="d-flex align-items-center gap-2">
          {isConnected ? (
            <span className="badge rounded-pill bg-success px-3 py-2 d-flex align-items-center gap-1.5 shadow-sm">
              <span className="rounded-circle bg-white" style={{ width: '8px', height: '8px' }} />
              ONLINE — {botState.phoneNumber || 'Active'}
            </span>
          ) : isConnecting ? (
            <span className="badge rounded-pill bg-warning text-dark px-3 py-2 d-flex align-items-center gap-1.5">
              <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
              Connecting...
            </span>
          ) : isQrReady ? (
            <span className="badge rounded-pill bg-info text-white px-3 py-2">
              <i className="fas fa-qrcode me-1" /> QR Code Ready
            </span>
          ) : (
            <span className="badge rounded-pill bg-secondary px-3 py-2">
              <i className="fas fa-power-off me-1" /> Disconnected
            </span>
          )}
        </div>
      </div>

      <div className="card-body p-4 bg-white">
        <div className="row g-4 align-items-center">
          {/* Left Column: QR / Status Graphic */}
          <div className="col-12 col-md-5 text-center border-end-md">
            {isConnected ? (
              <div className="py-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
                  style={{ width: '80px', height: '80px', background: 'rgba(37,211,102,0.15)', color: '#25D366' }}
                >
                  <i className="fas fa-check-circle" style={{ fontSize: '2.8rem' }} />
                </div>
                <h6 className="fw-bold text-dark mb-1">WhatsApp Live & Connected!</h6>
                <p className="text-muted small mb-3">
                  Bot is actively listening to customer queries and responding automatically.
                </p>
                <button
                  type="button"
                  onClick={onOpenLogoutConfirm}
                  disabled={actionLoading}
                  className="btn btn-outline-danger btn-sm rounded-pill px-4"
                >
                  <i className="fas fa-sign-out-alt me-1" /> Disconnect / Logout
                </button>
              </div>
            ) : botState.qrCodeBase64 ? (
              <div className="py-2">
                <div className="p-2 border rounded-3 d-inline-block bg-white shadow-sm mb-2">
                  <img
                    src={botState.qrCodeBase64}
                    alt="WhatsApp QR Code"
                    style={{ width: '210px', height: '210px', objectFit: 'contain' }}
                  />
                </div>
                <div className="fw-bold small text-dark mb-1">Scan with WhatsApp on your Phone</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  WhatsApp &gt; Linked Devices &gt; Link a Device
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 bg-light text-muted border"
                  style={{ width: '80px', height: '80px' }}
                >
                  <i className="fas fa-qrcode" style={{ fontSize: '2.5rem' }} />
                </div>
                <h6 className="fw-bold text-dark mb-1">Engine Not Started</h6>
                <p className="text-muted small mb-3">
                  Click below to generate a real-time QR code and pair your WhatsApp account.
                </p>
                <button
                  type="button"
                  onClick={onStartBot}
                  disabled={actionLoading}
                  className="btn btn-success btn-sm rounded-pill px-4 text-white shadow-sm"
                  style={{ background: '#25D366', borderColor: '#25D366' }}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" /> Initializing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-1" /> Start Bot &amp; Scan QR
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Key Stats & Architecture Notes */}
          <div className="col-12 col-md-7 ps-md-4">
            <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
              Engine Performance &amp; Activity
            </h6>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>
                    Messages Received
                  </span>
                  <h4 className="fw-bold text-dark mb-0">{botState.totalMessagesProcessed || 0}</h4>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '0.75rem' }}>
                    Auto-Replies Dispatched
                  </span>
                  <h4 className="fw-bold text-success mb-0">{botState.totalAutoRepliesSent || 0}</h4>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-3 border bg-light bg-opacity-50">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="fas fa-shield-alt text-primary small" />
                <span className="fw-bold text-dark small">Alwaysdata 24/7 Background Daemon</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.74rem', lineHeight: 1.4 }}>
                When running 24/7 in production via Alwaysdata daemon, customer queries are intercepted and replied to in under 400ms without keeping browser tabs open.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
