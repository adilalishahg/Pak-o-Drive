'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BotState {
  status: 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'CONNECTED';
  phoneNumber: string | null;
  qrCodeBase64: string | null;
  lastConnectedAt: string | null;
  totalMessagesProcessed: number;
  totalAutoRepliesSent: number;
  error: string | null;
}

export interface WhatsAppRuleItem {
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

export function useWhatsAppBot() {
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
  const [formDynamicAction, setFormDynamicAction] = useState<WhatsAppRuleItem['dynamicAction']>('none');
  const [formPriority, setFormPriority] = useState(10);
  const [formEnabled, setFormEnabled] = useState(true);

  // Custom Confirm Dialog States (Rule #7)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Simulator states
  const [simQuery, setSimQuery] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    matched: boolean;
    matchedRuleName: string | null;
    dynamicAction?: string;
    simulatedReply: string;
  } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

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

  // Polling bot status every 3.5s when connecting or QR ready
  useEffect(() => {
    if (botState.status === 'CONNECTING' || botState.status === 'QR_READY') {
      const timer = setInterval(() => {
        fetchBotStatus();
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [botState.status, fetchBotStatus]);

  const handleStartBot = useCallback(async () => {
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
  }, [showToast]);

  const handleLogoutBot = useCallback(async () => {
    setLogoutConfirmOpen(false);
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
        showToast('WhatsApp session logged out & cleared.');
      } else {
        showToast(json.error || 'Failed to disconnect', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [showToast]);

  const handleToggleRule = useCallback(
    async (rule: WhatsAppRuleItem) => {
      try {
        const res = await fetch('/api/whatsapp-bot/rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: rule._id, enabled: !rule.enabled }),
        });
        const json = await res.json();
        if (json.success) {
          setRules((prev) => prev.map((r) => (r._id === rule._id ? { ...r, enabled: !rule.enabled } : r)));
          showToast(`Rule "${rule.name}" ${!rule.enabled ? 'activated' : 'paused'}.`);
        }
      } catch {
        showToast('Failed to update rule status', 'error');
      }
    },
    [showToast]
  );

  const handleDeleteRule = useCallback(async () => {
    if (!deleteConfirmId) return;
    const ruleId = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/whatsapp-bot/rules?id=${ruleId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setRules((prev) => prev.filter((r) => r._id !== ruleId));
        showToast('Rule deleted successfully.');
      } else {
        showToast(json.error || 'Failed to delete rule', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  }, [deleteConfirmId, showToast]);

  const openCreateModal = useCallback(() => {
    setEditingRule(null);
    setFormName('');
    setFormTriggerType('contains');
    setFormKeywords('');
    setFormReplyMessage('');
    setFormDynamicAction('none');
    setFormPriority(10);
    setFormEnabled(true);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((rule: WhatsAppRuleItem) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormTriggerType(rule.triggerType);
    setFormKeywords(rule.keywords.join(', '));
    setFormReplyMessage(rule.replyMessage);
    setFormDynamicAction(rule.dynamicAction);
    setFormPriority(rule.priority);
    setFormEnabled(rule.enabled);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRule(null);
  }, []);

  const handleSaveRule = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formName.trim()) {
        showToast('Rule name is required.', 'error');
        return;
      }
      if (formTriggerType !== 'default' && !formKeywords.trim()) {
        showToast('At least one trigger keyword is required.', 'error');
        return;
      }
      if (!formReplyMessage.trim() && formDynamicAction === 'none') {
        showToast('Provide a reply message or select a Dynamic Action.', 'error');
        return;
      }

      const keywordsArr = formKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        triggerType: formTriggerType,
        keywords: keywordsArr,
        replyMessage: formReplyMessage.trim(),
        dynamicAction: formDynamicAction,
        priority: Number(formPriority) || 10,
        enabled: formEnabled,
      };

      try {
        let res;
        if (editingRule) {
          res = await fetch('/api/whatsapp-bot/rules', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingRule._id, ...payload }),
          });
        } else {
          res = await fetch('/api/whatsapp-bot/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        const json = await res.json();
        if (json.success) {
          showToast(`Rule ${editingRule ? 'updated' : 'created'} successfully!`);
          closeModal();
          fetchRules();
        } else {
          showToast(json.error || 'Failed to save rule', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Network error', 'error');
      }
    },
    [
      formName,
      formTriggerType,
      formKeywords,
      formReplyMessage,
      formDynamicAction,
      formPriority,
      formEnabled,
      editingRule,
      showToast,
      closeModal,
      fetchRules,
    ]
  );

  const handleSeedDefaults = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/whatsapp-bot/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedDefaults: true }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Default e-commerce menu & rules seeded successfully!');
        fetchRules();
      } else {
        showToast(json.error || 'Failed to seed rules', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [showToast, fetchRules]);

  const handleSimulate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!simQuery.trim()) return;

      setSimLoading(true);
      setSimResult(null);

      try {
        const res = await fetch('/api/whatsapp-bot/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: simQuery.trim() }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSimResult(json.data);
        } else {
          showToast(json.error || 'Test failed', 'error');
        }
      } catch {
        showToast('Failed to execute simulation test', 'error');
      } finally {
        setSimLoading(false);
      }
    },
    [simQuery, showToast]
  );

  return {
    botState,
    rules,
    loading,
    actionLoading,
    toast,
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
    deleteConfirmId,
    setDeleteConfirmId,
    logoutConfirmOpen,
    setLogoutConfirmOpen,
    simQuery,
    setSimQuery,
    simLoading,
    simResult,
    handleStartBot,
    handleLogoutBot,
    handleToggleRule,
    handleDeleteRule,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveRule,
    handleSeedDefaults,
    handleSimulate,
  };
}
