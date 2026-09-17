'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VisionProductProposalCard } from '@/components/admin/ai-copilot/VisionProductProposalCard';

interface AiCopilotMessageListProps {
  messages: any[];
  loading: boolean;
  copiedId: string | null;
  handleCopy: (content: string, id: string) => void;
  pendingAction: any;
  confirmPendingAction: (action: any) => void;
  cancelPendingAction: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AiCopilotMessageList({
  messages,
  loading,
  copiedId,
  handleCopy,
  pendingAction,
  confirmPendingAction,
  cancelPendingAction,
  messagesEndRef,
}: AiCopilotMessageListProps) {
  return (
    <div
      className="flex-grow-1 p-3 p-md-4 overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="d-flex flex-column gap-3">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`d-flex gap-2.5 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
            >
              {/* Avatar */}
              {!isUser && (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                  style={{
                    width: '34px',
                    height: '34px',
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                    fontSize: '14px',
                  }}
                >
                  <i className="fas fa-brain" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-4 p-3 shadow-sm ${
                  isUser
                    ? 'bg-primary text-white'
                    : 'bg-light border text-dark'
                }`}
                style={{
                  maxWidth: isUser ? '82%' : '90%',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-1 gap-3">
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: '11px',
                      color: isUser ? 'rgba(255,255,255,0.85)' : '#64748b',
                    }}
                  >
                    {isUser ? 'Aap (Admin)' : 'Pak-o-Drive AI Brain'}
                  </span>
                  <div className="d-flex align-items-center gap-1.5">
                    <span
                      style={{
                        fontSize: '10px',
                        color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      }}
                    >
                      {m.timestamp}
                    </span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="btn btn-sm btn-link p-0 text-secondary text-decoration-none"
                        title="Copy response"
                      >
                        <i className={copiedId === m.id ? 'fas fa-check text-success' : 'far fa-copy'} style={{ fontSize: '11px' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Uploaded / Attached Image Thumbnail */}
                {m.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={m.imageUrl}
                      alt="Uploaded car accessory"
                      className="rounded-3 border shadow-sm"
                      style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Markdown Content */}
                <div
                  className={`copilot-markdown ${isUser ? 'text-white' : ''}`}
                  style={{ wordBreak: 'break-word' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>

                {/* Action Executed Badge */}
                {m.actionExecuted && (
                  <div className="mt-2.5 p-2 bg-success-subtle border border-success-subtle rounded-3 d-flex align-items-center gap-2 text-success small">
                    <i className="fas fa-check-circle fs-6" />
                    <div>
                      <strong className="d-block" style={{ fontSize: '11.5px' }}>Database Synchronized</strong>
                      <span style={{ fontSize: '11px' }}>{m.actionExecuted.description}</span>
                    </div>
                  </div>
                )}

                {/* Action Proposal & Confirmation Cards */}
                {m.actionRequired && pendingAction?.id === m.actionRequired.id && (
                  m.actionRequired.type === 'publish_vision_product' ? (
                    <VisionProductProposalCard
                      action={m.actionRequired}
                      isThinking={loading}
                      onConfirm={confirmPendingAction}
                      onCancel={cancelPendingAction}
                    />
                  ) : m.actionRequired.type === 'trigger_cron' ? (
                    <div className="mt-3 p-3 bg-white border border-info-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-info-emphasis fw-bold">
                          <i className="fas fa-robot fs-5 text-info" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-info text-white px-2 py-1" style={{ fontSize: '11px' }}>
                          Autonomous Dispatch
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-info text-white d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-sm"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-play" />
                          <span>🚀 Yes, Run Cron Now</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : m.actionRequired.type === 'create_bundle' ? (
                    <div className="mt-3 p-3 bg-white border border-primary-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                          <i className="fas fa-box-open fs-5" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '11px' }}>
                          High-Margin Combo
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-check" />
                          <span>✅ Create & Publish Bundle</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : m.actionRequired.type === 'auto_beat_price' ? (
                    <div className="mt-3 p-3 bg-white border border-warning-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-warning-emphasis fw-bold">
                          <i className="fas fa-chart-line fs-5 text-warning" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: '11px' }}>
                          Auto-Beat Pricing
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-warning d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold text-dark"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-check" />
                          <span>✅ Approve & Update Live Price</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : m.actionRequired.type === 'create_flash_sale' ? (
                    <div className="mt-3 p-3 bg-white border border-danger-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-danger fw-bold">
                          <i className="fas fa-bolt fs-5" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-danger text-white px-2 py-1" style={{ fontSize: '11px' }}>
                          Flash Sale Event
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-danger d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-bolt" />
                          <span>✅ Activate Flash Sale Live</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : m.actionRequired.type === 'generate_customer_reviews' ? (
                    <div className="mt-3 p-3 bg-white border border-info-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-info-emphasis fw-bold">
                          <i className="fas fa-star text-warning fs-5" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-info text-dark px-2 py-1" style={{ fontSize: '11px' }}>
                          Social Proof
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-info d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold text-dark"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-check" />
                          <span>✅ Publish Verified Reviews</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : m.actionRequired.type === 'update_order_status' ? (
                    <div className="mt-3 p-3 bg-white border border-success-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-success fw-bold">
                          <i className="fas fa-clipboard-check fs-5" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: '11px' }}>
                          {m.actionRequired.count > 1 ? `${m.actionRequired.count} Orders` : 'Order Verification'}
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12.5px', lineHeight: '1.45' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-success d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-check" />
                          <span>✅ Yes, Update Status</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-danger-subtle border border-danger-subtle rounded-3 text-dark shadow-sm">
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2 text-danger fw-bold">
                          <i className="fas fa-shield-alt fs-5" />
                          <span style={{ fontSize: '13px' }}>{m.actionRequired.title}</span>
                        </div>
                        <span className="badge bg-danger text-white px-2 py-1" style={{ fontSize: '11px' }}>
                          {m.actionRequired.count} Items
                        </span>
                      </div>
                      <p className="small mb-3 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        {m.actionRequired.description}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => confirmPendingAction(m.actionRequired)}
                          className="btn btn-sm btn-danger d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <i className="fas fa-check" />
                          <span>Confirm & Execute</span>
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={cancelPendingAction}
                          className="btn btn-sm btn-outline-secondary px-3 py-1.5"
                          style={{ borderRadius: '8px', fontSize: '12px' }}
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                  style={{
                    width: '34px',
                    height: '34px',
                    background: '#2563eb',
                    fontSize: '14px',
                  }}
                >
                  <i className="fas fa-user-shield" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="d-flex gap-2.5 justify-content-start">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
              style={{
                width: '34px',
                height: '34px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                fontSize: '14px',
              }}
            >
              <i className="fas fa-brain fa-pulse" />
            </div>
            <div className="bg-light border rounded-4 p-3 shadow-sm" style={{ maxWidth: '80%' }}>
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                <i className="fas fa-spinner fa-spin text-emerald" style={{ color: '#059669' }} />
                <span>Pak-o-Drive database aur market intelligence analyze ho rahi hai...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
