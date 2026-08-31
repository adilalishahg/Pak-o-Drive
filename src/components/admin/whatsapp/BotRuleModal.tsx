'use client';

import React from 'react';
import { WhatsAppRuleItem } from '../../../hooks/useWhatsAppBot';

interface BotRuleModalProps {
  isModalOpen: boolean;
  editingRule: WhatsAppRuleItem | null;
  formName: string;
  setFormName: (v: string) => void;
  formTriggerType: 'contains' | 'exact' | 'regex' | 'default';
  setFormTriggerType: (v: 'contains' | 'exact' | 'regex' | 'default') => void;
  formKeywords: string;
  setFormKeywords: (v: string) => void;
  formReplyMessage: string;
  setFormReplyMessage: (v: string) => void;
  formDynamicAction: WhatsAppRuleItem['dynamicAction'];
  setFormDynamicAction: (v: WhatsAppRuleItem['dynamicAction']) => void;
  formPriority: number;
  setFormPriority: (v: number) => void;
  formEnabled: boolean;
  setFormEnabled: (v: boolean) => void;
  onCloseModal: () => void;
  onSaveRule: (e: React.FormEvent) => Promise<void>;
}

export function BotRuleModal({
  isModalOpen,
  editingRule,
  formName,
  setFormName,
  formTriggerType,
  setFormTriggerType,
  formKeywords,
  setFormKeywords,
  formReplyMessage,
  setFormReplyMessage,
  formDynamicAction,
  setFormDynamicAction,
  formPriority,
  setFormPriority,
  formEnabled,
  setFormEnabled,
  onCloseModal,
  onSaveRule,
}: BotRuleModalProps) {
  if (!isModalOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark">
              <i className="fas fa-robot text-primary me-2" />
              {editingRule ? 'Edit Auto-Reply Rule' : 'Create New Auto-Reply Rule'}
            </h5>
            <button type="button" className="btn-close" onClick={onCloseModal} />
          </div>

          <form onSubmit={onSaveRule}>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* Rule Name */}
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-bold text-muted">
                    Rule Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Greeting / Main Menu"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Priority */}
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-bold text-muted">Priority (Higher runs first)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                  />
                </div>

                {/* Trigger Type */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-muted">Trigger Match Type</label>
                  <select
                    className="form-select"
                    value={formTriggerType}
                    onChange={(e) => setFormTriggerType(e.target.value as any)}
                  >
                    <option value="contains">Contains Word (Any of keywords)</option>
                    <option value="exact">Exact Match Only (e.g. 1, 2, 3)</option>
                    <option value="regex">Regular Expression</option>
                    <option value="default">Default / Fallback (When no other matches)</option>
                  </select>
                </div>

                {/* Dynamic Action */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-muted">⚡ Dynamic Action</label>
                  <select
                    className="form-select"
                    value={formDynamicAction}
                    onChange={(e) => setFormDynamicAction(e.target.value as any)}
                  >
                    <option value="none">None (Static Text Reply Only)</option>
                    <option value="interactive_menu">Interactive 4-Option Main Menu</option>
                    <option value="order_status_lookup">Live Order Tracking by Phone / ID</option>
                    <option value="bank_details">Direct Bank / JazzCash / Easypaisa Accounts</option>
                    <option value="agent_handoff">Live Human Agent Support Handoff</option>
                    <option value="returns_policy">7-Day Checking Warranty &amp; Return Info</option>
                  </select>
                </div>

                {/* Keywords */}
                {formTriggerType !== 'default' && (
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">
                      Trigger Keywords (Comma separated) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. hi, hello, salam, menu, start, 0"
                      value={formKeywords}
                      onChange={(e) => setFormKeywords(e.target.value)}
                    />
                    <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                      Separate multiple keywords with commas. Word-boundary isolation prevents false-positive matching.
                    </div>
                  </div>
                )}

                {/* Reply Message */}
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">
                    Reply Text Message Template
                  </label>
                  <textarea
                    rows={4}
                    className="form-control font-monospace"
                    placeholder="Enter formatted WhatsApp reply text with emojis..."
                    value={formReplyMessage}
                    onChange={(e) => setFormReplyMessage(e.target.value)}
                  />
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Supports WhatsApp markdown formatting: *bold*, _italic_, ~strike~.
                  </div>
                </div>

                {/* Enabled Toggle */}
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="ruleEnabled"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                    />
                    <label className="form-check-label small fw-semibold text-dark" htmlFor="ruleEnabled">
                      Rule Active &amp; Enabled
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light btn-sm rounded-pill px-3" onClick={onCloseModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4">
                <i className="fas fa-save me-1" /> {editingRule ? 'Update Rule' : 'Save Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
