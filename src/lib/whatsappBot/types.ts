export interface BotState {
  status: 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'CONNECTED';
  phoneNumber: string | null;
  qrCodeBase64: string | null;
  lastConnectedAt: Date | null;
  totalMessagesProcessed: number;
  totalAutoRepliesSent: number;
  pausedContacts: Record<string, number>; // phone -> unpause timestamp (for human agent handoff)
  error: string | null;
}
