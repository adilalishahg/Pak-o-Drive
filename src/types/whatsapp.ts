/**
 * WhatsApp Automation & Bot Studio Component Types for Pak-o-Drive Platform
 */

import { WhatsAppRuleItem } from '../hooks/useWhatsAppBot';

export interface BotState {
  status: 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'CONNECTED';
  phoneNumber: string | null;
  qrCodeBase64: string | null;
  lastConnectedAt: Date | string | null;
  totalMessagesProcessed: number;
  totalAutoRepliesSent: number;
  pausedContacts?: Record<string, number>;
  error: string | null;
  platform?: string;
}



export interface BotStatusCardProps {
  botState: BotState;
  actionLoading: boolean;
  onStartBot: () => Promise<void>;
  onOpenLogoutConfirm: () => void;
}

export interface BotRulesTableProps {
  rules: WhatsAppRuleItem[];
  actionLoading: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (rule: WhatsAppRuleItem) => void;
  onToggleRule: (rule: WhatsAppRuleItem) => Promise<void>;
  onOpenDeleteConfirm: (ruleId: string) => void;
  onSeedDefaults: () => Promise<void>;
}

export interface BotRuleModalProps {
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

export interface BotConfirmDialogsProps {
  deleteConfirmId: string | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  logoutConfirmOpen: boolean;
  onCancelLogout: () => void;
  onConfirmLogout: () => Promise<void>;
}

export interface BotQuerySimulatorProps {
  simQuery: string;
  setSimQuery: (v: string) => void;
  simLoading: boolean;
  simResult: {
    matched: boolean;
    matchedRuleName: string | null;
    dynamicAction?: string;
    simulatedReply: string;
  } | null;
  onSimulate: (e: React.FormEvent) => Promise<void>;
}
