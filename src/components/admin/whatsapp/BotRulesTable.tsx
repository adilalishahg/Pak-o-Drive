'use client';

import React from 'react';
import { WhatsAppRuleItem } from '../../../hooks/useWhatsAppBot';

interface BotRulesTableProps {
  rules: WhatsAppRuleItem[];
  actionLoading: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (rule: WhatsAppRuleItem) => void;
  onToggleRule: (rule: WhatsAppRuleItem) => Promise<void>;
  onOpenDeleteConfirm: (ruleId: string) => void;
  onSeedDefaults: () => Promise<void>;
}

export function BotRulesTable({
  rules,
  actionLoading,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleRule,
  onOpenDeleteConfirm,
  onSeedDefaults,
}: BotRulesTableProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="fas fa-robot text-primary" /> Auto-Reply Menu &amp; Interactivity Rules ({rules.length})
          </h6>
          <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
            Define keywords, dynamic actions (Order Lookup, Bank Details, Human Handoff), and rich responses.
          </span>
        </div>

        <div className="d-flex gap-2">
          {rules.length === 0 && (
            <button
              type="button"
              onClick={onSeedDefaults}
              disabled={actionLoading}
              className="btn btn-outline-success btn-sm rounded-pill px-3"
            >
              <i className="fas fa-magic me-1" /> Seed Default Menu Rules
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
              Click &quot;Seed Default Menu Rules&quot; to auto-load standard e-commerce options (Hi, Track Order, Bank Details, Live Support).
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
          <div className="table-responsive">
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
                {rules
                  .slice()
                  .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                  .map((rule) => (
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
        )}
      </div>
    </div>
  );
}
