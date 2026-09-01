import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppBotStatus {
  status: 'DISCONNECTED' | 'QR_READY' | 'CONNECTING' | 'CONNECTED';
  phoneNumber: string | null;
  platform: string;
  qrCodeBase64?: string | null;
  lastPingAt: Date;
  lastConnectedAt: Date | null;
  totalMessagesProcessed: number;
  totalAutoRepliesSent: number;
}

export interface IWhatsAppBotStatusDoc extends IWhatsAppBotStatus, Document {}

const WhatsAppBotStatusSchema = new Schema<IWhatsAppBotStatusDoc>(
  {
    status: { type: String, default: 'DISCONNECTED' },
    phoneNumber: { type: String, default: null },
    platform: { type: String, default: 'Alwaysdata 24/7 Cloud Daemon' },
    qrCodeBase64: { type: String, default: null },
    lastPingAt: { type: Date, default: Date.now },
    lastConnectedAt: { type: Date, default: null },
    totalMessagesProcessed: { type: Number, default: 0 },
    totalAutoRepliesSent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.WhatsAppBotStatus) {
  delete mongoose.models.WhatsAppBotStatus;
}

export default mongoose.models.WhatsAppBotStatus ||
  mongoose.model<IWhatsAppBotStatusDoc>('WhatsAppBotStatus', WhatsAppBotStatusSchema);
