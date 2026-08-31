'use client';

import React from 'react';
import Link from 'next/link';
import { useWhatsAppBot } from '../../../hooks/useWhatsAppBot';
import { BotStatusCard } from '../../../components/admin/whatsapp/BotStatusCard';
import { BotRulesTable } from '../../../components/admin/whatsapp/BotRulesTable';
import { BotRuleModal } from '../../../components/admin/whatsapp/BotRuleModal';
import { BotQuerySimulator } from '../../../components/admin/whatsapp/BotQuerySimulator';
import { BotConfirmDialogs } from '../../../components/admin/whatsapp/BotConfirmDialogs';

export default function AdminWhatsAppBotPage() {
  const {
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
  } = useWhatsAppBot();

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading WhatsApp Bot...</span>
        </div>
        <p className="text-muted fw-semibold">Loading WhatsApp Bot Studio...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            <i className="fab fa-whatsapp text-success me-2" />
            WhatsApp Automation &amp; Bot Studio
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Configure auto-replies, interactive menu navigation, real-time order tracking, and live agent handoffs.
          </p>
        </div>
        <Link href="/admin" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="fas fa-arrow-left me-1" /> Dashboard
        </Link>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`alert border-0 rounded-3 mb-4 d-flex align-items-center gap-2 ${
            toast.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* 1. Connection Status Card */}
      <BotStatusCard
        botState={botState}
        actionLoading={actionLoading}
        onStartBot={handleStartBot}
        onOpenLogoutConfirm={() => setLogoutConfirmOpen(true)}
      />

      {/* 2. Interactive Menu & Auto-Reply Rules Table */}
      <BotRulesTable
        rules={rules}
        actionLoading={actionLoading}
        onOpenCreateModal={openCreateModal}
        onOpenEditModal={openEditModal}
        onToggleRule={handleToggleRule}
        onOpenDeleteConfirm={(id) => setDeleteConfirmId(id)}
        onSeedDefaults={handleSeedDefaults}
      />

      {/* 3. Live Customer Test Simulator */}
      <BotQuerySimulator
        simQuery={simQuery}
        setSimQuery={setSimQuery}
        simLoading={simLoading}
        simResult={simResult}
        onSimulate={handleSimulate}
      />

      {/* Rule Add/Edit Modal */}
      <BotRuleModal
        isModalOpen={isModalOpen}
        editingRule={editingRule}
        formName={formName}
        setFormName={setFormName}
        formTriggerType={formTriggerType}
        setFormTriggerType={setFormTriggerType}
        formKeywords={formKeywords}
        setFormKeywords={setFormKeywords}
        formReplyMessage={formReplyMessage}
        setFormReplyMessage={setFormReplyMessage}
        formDynamicAction={formDynamicAction}
        setFormDynamicAction={setFormDynamicAction}
        formPriority={formPriority}
        setFormPriority={setFormPriority}
        formEnabled={formEnabled}
        setFormEnabled={setFormEnabled}
        onCloseModal={closeModal}
        onSaveRule={handleSaveRule}
      />

      {/* Custom Confirmation Modals (Rule #7) */}
      <BotConfirmDialogs
        deleteConfirmId={deleteConfirmId}
        onCancelDelete={() => setDeleteConfirmId(null)}
        onConfirmDelete={handleDeleteRule}
        logoutConfirmOpen={logoutConfirmOpen}
        onCancelLogout={() => setLogoutConfirmOpen(false)}
        onConfirmLogout={handleLogoutBot}
      />
    </div>
  );
}
