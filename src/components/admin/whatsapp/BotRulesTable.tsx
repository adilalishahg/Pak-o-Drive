'use client';

import React from 'react';
import { WhatsAppRuleItem } from '../../../hooks/useWhatsAppBot';
import { BotRulesTableProps } from '@/types/whatsapp';

export function BotRulesTable({

  rules,
  actionLoading,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleRule,
  onOpenDeleteConfirm,
  onSeedDefaults,
}: BotRulesTableProps) {
  const sortedRules = rules
    .slice()
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      {/* Card Header */}
      <div className="card-header bg-white py-3 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="fas fa-robot text-primary" /> Auto-Reply Menu &amp; Rules ({rules.length})
          </h6>
          <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
            Define keywords, dynamic actions (Order Lookup, Bank Details, Handoff), and rich responses.
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {rules.length === 0 && (
            <button
              type="button"
              onClick={onSeedDefaults}
              disabled={actionLoading}
              className="btn btn-outline-success btn-sm rounded-pill px-3"
            >
              <i className="fas fa-magic me-1" /> Seed Defaults
            </button>
          )}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
          >
            <i className="fas fa-plus me-1" /> Add Rule
          </button>
        </div>
      </div>

      <div className="card-body p-0">
        {rules.length === 0 ? (
          <div className="text-center py-5 px-3">
            <i className="fas fa-list-alt text-muted mb-2" style={{ fontSize: '2.5rem' }} />
            <h6 className="fw-bold text-secondary mb-1">No Auto-Reply Rules Configured</h6>
            <p className="text-muted small mb-3">
              Click &quot;Seed Defaults&quot; to auto-load standard e-commerce options (Hi, Track Order, Bank Details, Live Support).
            </p>
            <button
              type="button"
              onClick={onSeedDefaults}
              disabled={actionLoading}
              className="btn btn-success btn-sm rounded-pill px-4"
            >
              <i className="fas fa-magic me-1" /> Seed Default E-Commerce Rules
            </button>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (Screen < 992px) */}
            <div className="d-lg-none d-flex flex-column gap-3 p-3 bg-light">
              {sortedRules.map((rule, idx) => (
                <div
                  key={rule._id}
                  className="bg-white rounded-3 p-3 border shadow-xs d-flex flex-column gap-2.5"
                  style={{ borderLeft: rule.enabled ? '4px solid #ea580c' : '4px solid #94a3b8' }}
                >
                  {/* Top Row: Priority Badge + Rule Title + Toggle */}
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2 min-w-0 flex-grow-1">
                      <span
                        className="badge bg-dark rounded-circle flex-shrink-0 d-inline-flex align-items-center justify-content-center"
                        style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
                      >
                        #{idx + 1}
                      </span>
                      <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>
                        {rule.name}
                      </h6>
                    </div>

                    <div className="form-check form-switch d-inline-block mb-0 flex-shrink-0">
                      <input
                        className="form-check-input my-0"
                        type="checkbox"
                        role="switch"
                        checked={rule.enabled}
                        onChange={() => onToggleRule(rule)}
                        style={{ cursor: 'pointer' }}
                        title={rule.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </div>
                  </div>

                  {/* Sub-row: Match Type & Dynamic Action Badges */}
                  <div className="d-flex flex-wrap gap-1.5 align-items-center">
                    <span className="badge bg-secondary rounded-pill text-capitalize px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                      Type: {rule.triggerType}
                    </span>

                    {rule.dynamicAction !== 'none' && (
                      <span
                        className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-0.5 text-wrap"
                        style={{ fontSize: '0.68rem', maxWidth: '100%' }}
                      >
                        ⚡ {rule.dynamicAction.replace(/_/g, ' ')}
                      </span>
                    )}

                    <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                      Priority: {rule.priority || 0}
                    </span>
                  </div>

                  {/* Keywords Pills */}
                  {rule.triggerType !== 'default' && rule.keywords.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 align-items-center pt-1 border-top">
                      <span className="text-muted small me-1" style={{ fontSize: '0.72rem' }}>
                        Triggers:
                      </span>
                      {rule.keywords.map((k, i) => (
                        <span
                          key={i}
                          className="badge bg-light text-dark border font-monospace px-1.5 py-0.5"
                          style={{ fontSize: '0.68rem' }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reply Message Preview Bubble */}
                  <div
                    className="p-2.5 rounded-2 bg-light border text-dark font-monospace small mt-1"
                    style={{
                      fontSize: '0.75rem',
                      lineHeight: '1.4',
                      maxHeight: '90px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rule.replyMessage || (rule.dynamicAction !== 'none' ? `[Dynamic Logic: ${rule.dynamicAction}]` : '—')}
                  </div>

                  {/* Actions Footer */}
                  <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(rule)}
                      className="btn btn-outline-secondary btn-sm px-3 rounded-pill d-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <i className="fas fa-edit" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDeleteConfirm(rule._id)}
                      className="btn btn-outline-danger btn-sm px-3 rounded-pill d-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <i className="fas fa-trash-alt" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (Screen >= 992px) */}
            <div className="table-responsive d-none d-lg-block">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Rule Name &amp; Action</th>
                    <th>Trigger Match</th>
                    <th>Keywords</th>
                    <th>Reply Preview</th>
                    <th className="text-center">Priority</th>
                    <th className="text-center">Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRules.map((rule) => (
                    <tr key={rule._id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{rule.name}</div>
                        {rule.dynamicAction !== 'none' && (
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                            style={{ fontSize: '0.68rem' }}
                          >
                            ⚡ {rule.dynamicAction.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-secondary rounded-pill text-capitalize" style={{ fontSize: '0.7rem' }}>
                          {rule.triggerType}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                          {rule.triggerType === 'default' ? (
                            <span className="text-muted small font-italic">Fallback on any message</span>
                          ) : (
                            rule.keywords.map((k, i) => (
                              <span key={i} className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.7rem' }}>
                                {k}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate text-muted font-monospace" style={{ maxWidth: '240px', fontSize: '0.78rem' }}>
                          {rule.replyMessage || (rule.dynamicAction !== 'none' ? `[Dynamic: ${rule.dynamicAction}]` : '—')}
                        </div>
                      </td>
                      <td className="text-center font-monospace fw-semibold">{rule.priority || 0}</td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block mb-0">
                          <input
                            className="form-check-input my-0"
                            type="checkbox"
                            role="switch"
                            checked={rule.enabled}
                            onChange={() => onToggleRule(rule)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(rule)}
                            className="btn btn-outline-secondary btn-sm py-1 px-2"
                            title="Edit Rule"
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDeleteConfirm(rule._id)}
                            className="btn btn-outline-danger btn-sm py-1 px-2"
                            title="Delete Rule"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
