'use client';

import React from 'react';
import { BotQuerySimulatorProps } from '@/types/whatsapp';

export function BotQuerySimulator({

  simQuery,
  setSimQuery,
  simLoading,
  simResult,
  onSimulate,
}: BotQuerySimulatorProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-header bg-white py-3 px-4">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          <i className="fas fa-flask text-primary" /> Live WhatsApp Bot Test Simulator
        </h6>
        <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
          Test customer messages in real-time to verify rule precedence, dynamic actions, and reply formatting.
        </span>
      </div>

      <div className="card-body p-4 pt-0">
        <form onSubmit={onSimulate} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type customer message (e.g. 'salam', 'track order', '1')..."
              value={simQuery}
              onChange={(e) => setSimQuery(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            />
            <button
              type="submit"
              disabled={simLoading || !simQuery.trim()}
              className="btn btn-primary px-3 px-md-4"
              style={{ fontSize: '0.85rem' }}
            >
              {simLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  <span className="d-none d-sm-inline">Simulating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-1" />
                  <span className="d-none d-sm-inline">Test Rule</span>
                </>
              )}
            </button>
          </div>
        </form>

        {simResult && (
          <div className="p-3 rounded-3 border bg-light">
            <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <span className="text-muted small me-2">Match Status:</span>
                {simResult.matched ? (
                  <span className="badge bg-success rounded-pill px-2">Matched Rule</span>
                ) : (
                  <span className="badge bg-secondary rounded-pill px-2">No Match / Ignored</span>
                )}
              </div>

              {simResult.matchedRuleName && (
                <div>
                  <span className="text-muted small me-1">Triggered:</span>
                  <span className="fw-bold text-dark font-monospace small">{simResult.matchedRuleName}</span>
                </div>
              )}

              {simResult.dynamicAction && (
                <div>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 small">
                    ⚡ {simResult.dynamicAction}
                  </span>
                </div>
              )}
            </div>

            <div className="small fw-semibold text-muted mb-1">Simulated Customer Phone Reply:</div>
            <pre
              className="p-3 bg-white border rounded-3 mb-0 font-monospace text-dark"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.82rem', maxHeight: '200px', overflowY: 'auto' }}
            >
              {simResult.simulatedReply || '(Bot remains silent — no reply sent)'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
