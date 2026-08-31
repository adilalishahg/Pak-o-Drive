'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface BotState {
  status: 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'CONNECTED';
  phoneNumber: string | null;
  qrCodeBase64: string | null;
  lastConnectedAt: string | null;
  totalMessagesProcessed: number;
  totalAutoRepliesSent: number;
  error: string | null;
}

interface WhatsAppRuleItem {
  _id: string;
  name: string;
  triggerType: 'contains' | 'exact' | 'regex' | 'default';
  keywords: string[];
  replyMessage: string;
  dynamicAction: 'none' | 'order_status_lookup' | 'interactive_menu' | 'bank_details' | 'agent_handoff' | 'returns_policy';
  enabled: boolean;
  priority: number;
  createdAt?: string;
}

export default function AdminWhatsAppBotPage() {
  const [botState, setBotState] = useState<BotState>({
    status: 'DISCONNECTED',
    phoneNumber: null,
    qrCodeBase64: null,
    lastConnectedAt: null,
    totalMessagesProcessed: 0,
    totalAutoRepliesSent: 0,
    error: null,
  });

  const [rules, setRules] = useState<WhatsAppRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WhatsAppRuleItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<'contains' | 'exact' | 'regex' | 'default'>('contains');
  const [formKeywords, setFormKeywords] = useState('');
  const [formReplyMessage, setFormReplyMessage] = useState('');
  const [formDynamicAction, setFormDynamicAction] = useState<'none' | 'order_status_lookup' | 'interactive_menu' | 'bank_details' | 'agent_handoff' | 'returns_policy'>('none');
  const [formPriority, setFormPriority] = useState(10);
  const [formEnabled, setFormEnabled] = useState(true);

  // Simulator states
  const [simQuery, setSimQuery] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    matched: boolean;
    matchedRuleName: string | null;
    dynamicAction?: string;
    simulatedReply: string;
  } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchBotStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp-bot/status');
      const json = await res.json();
      if (json.success && json.data) {
        setBotState(json.data);
      }
    } catch (err) {
      console.error('Error fetching bot status:', err);
    }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp-bot/rules');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRules(json.data);
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBotStatus(), fetchRules()]);
      setLoading(false);
    };
    init();
  }, [fetchBotStatus, fetchRules]);

  // Polling bot status every 4s when connecting or QR ready
  useEffect(() => {
    if (botState.status === 'CONNECTING' || botState.status === 'QR_READY') {
      const timer = setInterval(() => {
        fetchBotStatus();
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [botState.status, fetchBotStatus]);

  const handleStartBot = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/whatsapp-bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const json = await res.json();
      if (json.success) {
        setBotState(json.data);
        showToast('WhatsApp engine started! Scan QR code to connect.');
      } else {
        showToast(json.error || 'Failed to start bot', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogoutBot = async () => {
    if (!confirm('Are you sure you want to disconnect WhatsApp and wipe the saved session?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/whatsapp-bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      const json = await res.json();
      if (json.success) {
        setBotState(json.data);
        showToast('WhatsApp bot disconnected successfully.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error disconnecting', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedRules = async () => {
    if (!confirm('Reset all rules to default Pakistani E-Commerce rules? Custom changes will be overwritten.')) return;
    try {
      const res = await fetch('/api/whatsapp-bot/rules/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setRules(json.data);
        showToast('Reset to 5 default e-commerce rules successfully!');
      }
    } catch (err: any) {
      showToast(err.message || 'Error seeding rules', 'error');
    }
  };

  const handleToggleRule = async (rule: WhatsAppRuleItem) => {
    try {
      const res = await fetch(`/api/whatsapp-bot/rules/${rule._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      const json = await res.json();
      if (json.success) {
        setRules((prev) => prev.map((r) => (r._id === rule._id ? json.data : r)));
        showToast(`Rule "${rule.name}" ${!rule.enabled ? 'Enabled' : 'Disabled'}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating rule', 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const res = await fetch(`/api/whatsapp-bot/rules/${ruleId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setRules((prev) => prev.filter((r) => r._id !== ruleId));
        showToast('Rule deleted successfully.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting rule', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingRule(null);
    setFormName('');
    setFormTriggerType('contains');
    setFormKeywords('');
    setFormReplyMessage('');
    setFormDynamicAction('none');
    setFormPriority(10);
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: WhatsAppRuleItem) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormTriggerType(rule.triggerType);
    setFormKeywords(rule.keywords.join(', '));
    setFormReplyMessage(rule.replyMessage);
    setFormDynamicAction(rule.dynamicAction);
    setFormPriority(rule.priority);
    setFormEnabled(rule.enabled);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReplyMessage.trim()) {
      showToast('Name and Reply message are required', 'error');
      return;
    }

    const payload = {
      name: formName,
      triggerType: formTriggerType,
      keywords: formKeywords,
      replyMessage: formReplyMessage,
      dynamicAction: formDynamicAction,
      priority: formPriority,
      enabled: formEnabled,
    };

    try {
      if (editingRule) {
        const res = await fetch(`/api/whatsapp-bot/rules/${editingRule._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setRules((prev) => prev.map((r) => (r._id === editingRule._id ? json.data : r)));
          showToast('Rule updated successfully!');
          setIsModalOpen(false);
        } else {
          showToast(json.error || 'Failed to update rule', 'error');
        }
      } else {
        const res = await fetch('/api/whatsapp-bot/rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setRules((prev) => [...prev, json.data].sort((a, b) => a.priority - b.priority));
          showToast('New rule created successfully!');
          setIsModalOpen(false);
        } else {
          showToast(json.error || 'Failed to create rule', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving rule', 'error');
    }
  };

  const handleTestSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuery.trim()) return;

    setSimLoading(true);
    try {
      const res = await fetch('/api/whatsapp-bot/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: simQuery }),
      });
      const json = await res.json();
      if (json.success) {
        setSimResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const isConnected = botState.status === 'CONNECTED';
  const isQrReady = botState.status === 'QR_READY';
  const isConnecting = botState.status === 'CONNECTING';

  return (
    <div className="container-fluid px-0 py-2">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-4 p-3 rounded-4 shadow-lg text-white d-flex align-items-center gap-3 z-3`}
          style={{
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            maxWidth: '420px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} fs-5`} />
          <span className="small fw-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="fab fa-whatsapp text-success" />
            WhatsApp Auto-Responder Bot
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill fs-7">
              100% Free & Unlimited
            </span>
          </h4>
          <p className="text-muted small mb-0">
            Automatically replies to customer queries on WhatsApp based on dynamic keywords, order lookups & custom rules.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={handleSeedRules}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            title="Reset to default Pakistani e-commerce rules"
          >
            <i className="fas fa-undo-alt me-1.5" /> Reset Default Rules
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-primary btn-sm rounded-pill px-3.5 shadow-sm d-flex align-items-center gap-1.5"
          >
            <i className="fas fa-plus" /> Create New Rule
          </button>
        </div>
      </div>

      {/* Top Grid: Connection & Stats */}
      <div className="row g-4 mb-4">
        {/* Left Card: Connection & QR Code */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h6 className="fw-bold text-secondary mb-0 d-flex align-items-center gap-2">
                <i className="fas fa-signal text-primary" />
                Connection Status & QR Scanner
              </h6>

              <div className="d-flex align-items-center gap-2">
                {isConnected ? (
                  <span className="badge bg-success rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5">
                    <span className="spinner-grow spinner-grow-sm" style={{ width: '8px', height: '8px' }} />
                    Connected ({botState.phoneNumber || 'WhatsApp Active'})
                  </span>
                ) : isQrReady ? (
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-1.5">
                    <i className="fas fa-qrcode me-1" /> Scan QR Code
                  </span>
                ) : isConnecting ? (
                  <span className="badge bg-info text-white rounded-pill px-3 py-1.5">
                    <span className="spinner-border spinner-border-sm me-1" /> Initializing...
                  </span>
                ) : (
                  <span className="badge bg-secondary rounded-pill px-3 py-1.5">
                    🔴 Disconnected
                  </span>
                )}
              </div>
            </div>

            {/* Connection Body */}
            {isConnected ? (
              <div className="text-center py-4 bg-light rounded-4 border border-success border-opacity-25">
                <div
                  className="rounded-circle bg-success bg-opacity-10 text-success mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px' }}
                >
                  <i className="fab fa-whatsapp fs-1" />
                </div>
                <h5 className="fw-bold text-dark mb-1">WhatsApp Bot is Live!</h5>
                <p className="text-muted small mb-3">
                  Connected Number: <strong className="text-dark">{botState.phoneNumber || 'Active'}</strong>
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogoutBot}
                    disabled={actionLoading}
                    className="btn btn-outline-danger btn-sm rounded-pill px-4"
                  >
                    <i className="fas fa-sign-out-alt me-1.5" /> Disconnect & Re-scan
                  </button>
                </div>
              </div>
            ) : isQrReady && botState.qrCodeBase64 ? (
              <div className="row align-items-center g-3 py-2">
                <div className="col-md-5 text-center">
                  <div className="p-2 border rounded-3 bg-white d-inline-block shadow-sm">
                    <img
                      src={botState.qrCodeBase64}
                      alt="WhatsApp QR Code"
                      style={{ width: '180px', height: '180px' }}
                    />
                  </div>
                  <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                    <i className="fas fa-sync-alt fa-spin me-1 text-primary" /> Auto-refreshes every 20s
                  </div>
                </div>

                <div className="col-md-7">
                  <h6 className="fw-bold text-dark mb-2">How to link your WhatsApp:</h6>
                  <ol className="text-muted small ps-3 mb-3 d-flex flex-column gap-1.5" style={{ fontSize: '0.84rem' }}>
                    <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
                    <li>Tap <strong>Menu (⋮)</strong> or <strong>Settings (⚙️)</strong>.</li>
                    <li>Tap <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong>.</li>
                    <li>Point your phone camera at this QR Code to scan.</li>
                  </ol>
                  <button
                    type="button"
                    onClick={handleStartBot}
                    disabled={actionLoading}
                    className="btn btn-primary btn-sm rounded-pill px-3"
                  >
                    <i className="fas fa-redo me-1" /> Refresh QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded-4 border">
                <i className="fas fa-robot text-muted fs-1 mb-2" />
                <h6 className="fw-bold text-secondary mb-1">WhatsApp Engine is Idle</h6>
                <p className="text-muted small mb-3">
                  Click the button below to start the WhatsApp connection and generate your scan QR Code.
                </p>
                <button
                  type="button"
                  onClick={handleStartBot}
                  disabled={actionLoading}
                  className="btn btn-success btn-sm rounded-pill px-4 shadow-sm"
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1.5" />
                      Starting Engine...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-whatsapp me-1.5" />
                      Start WhatsApp Bot & Scan QR
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Real-time Rule Simulator */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
            <h6 className="fw-bold text-secondary mb-2 pb-2 border-bottom d-flex align-items-center gap-2">
              <i className="fas fa-vial text-warning" />
              Live Test Simulator
            </h6>
            <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
              Type a customer message below to test how the bot will reply without sending actual WhatsApp messages.
            </p>

            <form onSubmit={handleTestSimulator} className="mb-3">
              <div className="input-group input-group-sm mb-2">
                <input
                  type="text"
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  className="form-control rounded-start-3"
                  placeholder="e.g. Assalam o Alaikum, mera order status batao"
                />
                <button
                  type="submit"
                  disabled={simLoading || !simQuery.trim()}
                  className="btn btn-primary rounded-end-3 px-3"
                >
                  {simLoading ? <span className="spinner-border spinner-border-sm" /> : <i className="fas fa-paper-plane" />}
                </button>
              </div>
            </form>

            {simResult && (
              <div className="bg-light p-3 rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.72rem' }}>
                    Matched: {simResult.matchedRuleName || 'None'}
                  </span>
                  {simResult.dynamicAction && simResult.dynamicAction !== 'none' && (
                    <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25" style={{ fontSize: '0.7rem' }}>
                      ⚡ Action: {simResult.dynamicAction}
                    </span>
                  )}
                </div>
                <div className="bg-white p-2.5 rounded-3 border small text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {simResult.simulatedReply}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules List Card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
          <div>
            <h6 className="fw-bold text-secondary mb-0 d-flex align-items-center gap-2">
              <i className="fas fa-list-check text-primary" />
              Configured Auto-Reply Rules ({rules.length})
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
              Messages are matched from highest priority (top) to lowest.
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="btn btn-outline-primary btn-sm rounded-pill px-3"
          >
            <i className="fas fa-plus me-1" /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-inbox fs-1 mb-2 text-muted" />
            <h6>No rules found</h6>
            <button onClick={handleSeedRules} className="btn btn-primary btn-sm rounded-pill mt-2">
              Load 5 Default E-Commerce Rules
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {rules.map((rule, idx) => (
              <div
                key={rule._id}
                className={`border rounded-4 p-3.5 transition-all ${
                  rule.enabled ? 'bg-white shadow-xs' : 'bg-light opacity-75'
                }`}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>
                      #{idx + 1}
                    </span>
                    <h6 className="fw-bold text-dark mb-0">{rule.name}</h6>
                    <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                      Type: {rule.triggerType}
                    </span>
                    {rule.dynamicAction !== 'none' && (
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                        ⚡ {rule.dynamicAction}
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule)}
                        title="Enable/Disable Rule"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      className="btn btn-light btn-sm border py-0.5 px-2 text-primary"
                      title="Edit Rule"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule._id)}
                      className="btn btn-light btn-sm border py-0.5 px-2 text-danger"
                      title="Delete Rule"
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </div>
                </div>

                {/* Keywords */}
                <div className="mb-2 d-flex flex-wrap gap-1 align-items-center">
                  <span className="text-muted small fw-semibold me-1" style={{ fontSize: '0.72rem' }}>
                    Triggers:
                  </span>
                  {rule.keywords.map((kw, i) => (
                    <span key={i} className="badge bg-light text-dark border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Reply preview */}
                <div
                  className="bg-light p-2.5 rounded-3 border text-secondary small"
                  style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', maxHeight: '100px', overflowY: 'auto' }}
                >
                  {rule.replyMessage}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {editingRule ? 'Edit Auto-Reply Rule' : 'Create New Auto-Reply Rule'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <form onSubmit={handleSaveRule}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-muted">Rule Title *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="e.g. Pricing Inquiry Response"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-muted">Match Type</label>
                      <select
                        value={formTriggerType}
                        onChange={(e: any) => setFormTriggerType(e.target.value)}
                        className="form-select rounded-3"
                      >
                        <option value="contains">Contains Keyword</option>
                        <option value="exact">Exact Match</option>
                        <option value="regex">Regular Expression (Regex)</option>
                        <option value="default">Default Fallback</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">
                        Trigger Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={formKeywords}
                        onChange={(e) => setFormKeywords(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="price, keemat, rate, cost, kitne ka hai"
                      />
                      <div className="form-text small">
                        If incoming customer message contains any of these words, this rule will trigger.
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Dynamic Action Hook</label>
                      <select
                        value={formDynamicAction}
                        onChange={(e: any) => setFormDynamicAction(e.target.value)}
                        className="form-select rounded-3"
                      >
                        <option value="none">None (Static Text Message)</option>
                        <option value="order_status_lookup">📦 Dynamic Order Status Lookup (MongoDB)</option>
                        <option value="interactive_menu">📋 Interactive 1-4 Menu List</option>
                        <option value="bank_details">💳 Send Bank & JazzCash Details</option>
                        <option value="returns_policy">🛡️ 7-Day Return Policy</option>
                        <option value="agent_handoff">👨‍💼 Live Agent Handoff (Pause Bot 24h)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">Priority (Lower = Evaluated First)</label>
                      <input
                        type="number"
                        value={formPriority}
                        onChange={(e) => setFormPriority(Number(e.target.value))}
                        className="form-control rounded-3"
                        min={1}
                        max={100}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Auto-Reply Message Template *</label>
                      <textarea
                        required
                        rows={6}
                        value={formReplyMessage}
                        onChange={(e) => setFormReplyMessage(e.target.value)}
                        className="form-control rounded-3"
                        placeholder="Write your WhatsApp reply in Roman Urdu or English..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2.5 px-4 bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    {editingRule ? 'Save Changes' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
