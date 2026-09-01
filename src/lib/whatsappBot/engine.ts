/**
 * WhatsApp Auto-Responder Bot Engine
 * Powered by @whiskeysockets/baileys (Zero-Chromium WebSocket Engine)
 */

import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import dbConnect from '../mongodb';
import WhatsAppRule, { DEFAULT_WHATSAPP_RULES } from '../../models/WhatsAppRule';
import Order from '../../models/Order';

import os from 'os';

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

class WhatsAppBotManager {
  private static instance: WhatsAppBotManager;
  private sock: any = null;
  private isInitializing: boolean = false;
  private authDir: string;

  public state: BotState = {
    status: 'DISCONNECTED',
    phoneNumber: null,
    qrCodeBase64: null,
    lastConnectedAt: null,
    totalMessagesProcessed: 0,
    totalAutoRepliesSent: 0,
    pausedContacts: {},
    error: null,
  };

  private constructor() {
    this.authDir = path.join(os.tmpdir(), 'pakodrive_whatsapp_auth');
  }

  public static getInstance(): WhatsAppBotManager {
    if (!WhatsAppBotManager.instance) {
      WhatsAppBotManager.instance = new WhatsAppBotManager();
    }
    return WhatsAppBotManager.instance;
  }

  /**
   * Start or restart the Baileys WhatsApp client (waits for QR code generation)
   */
  public async startBot(): Promise<BotState> {
    if (this.state.status === 'CONNECTED' && this.sock) return this.state;

    this.isInitializing = true;
    this.state.status = 'CONNECTING';
    this.state.error = null;

    try {
      // Ensure auth directory exists in writable /tmp
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      // Dynamic import to support Next.js environment seamlessly
      const baileys = await import('@whiskeysockets/baileys');
      const {
        default: makeWASocket,
        useMultiFileAuthState,
        DisconnectReason,
        fetchLatestBaileysVersion,
      } = baileys;

      const pino = (await import('pino')).default;

      const { state: authState, saveCreds } = await useMultiFileAuthState(this.authDir);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as any }));

      const socket = makeWASocket({
        version,
        auth: authState,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Pak-o-Drive Bot', 'Desktop', '1.0.0'],
        syncFullHistory: false,
      });

      this.sock = socket;

      // Save credentials on updates
      socket.ev.on('creds.update', saveCreds);

      return new Promise<BotState>((resolve) => {
        let isResolved = false;

        const complete = (newState: BotState) => {
          if (!isResolved) {
            isResolved = true;
            this.isInitializing = false;
            resolve(newState);
          }
        };

        // Fallback timeout after 5.5s so HTTP response never hangs
        const timeout = setTimeout(() => {
          complete(this.state);
        }, 5500);

        // Connection update handler (QR, connected, disconnected)
        socket.ev.on('connection.update', async (update: any) => {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            try {
              const qrImage = await QRCode.toDataURL(qr, {
                margin: 2,
                scale: 8,
                color: { dark: '#0f172a', light: '#ffffff' },
              });
              this.state.qrCodeBase64 = qrImage;
              this.state.status = 'QR_READY';
              clearTimeout(timeout);
              complete(this.state);
            } catch (err: any) {
              console.error('Failed to generate QR Code:', err);
            }
          }

          if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            this.state.status = 'DISCONNECTED';
            this.state.qrCodeBase64 = null;
            this.sock = null;

            if (shouldReconnect) {
              console.log('[WhatsAppBot] Connection closed, attempting reconnect in 5s...');
            } else {
              console.log('[WhatsAppBot] Logged out. Session cleared.');
              this.state.phoneNumber = null;
            }
            clearTimeout(timeout);
            complete(this.state);
          } else if (connection === 'open') {
            this.state.status = 'CONNECTED';
            this.state.qrCodeBase64 = null;
            this.state.lastConnectedAt = new Date();

            const userJid = socket.user?.id || '';
            this.state.phoneNumber = userJid.split(':')[0] || userJid.split('@')[0] || 'Unknown';
            console.log(`[WhatsAppBot] Connected successfully as ${this.state.phoneNumber}`);
            clearTimeout(timeout);
            complete(this.state);
          }
        });

        // Handle incoming messages
        socket.ev.on('messages.upsert', async (m: any) => {
          if (m.type !== 'notify') return;

          for (const msg of m.messages) {
            if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') continue;
            await this.handleIncomingMessage(msg);
          }
        });
      });
    } catch (err: any) {
      console.error('[WhatsAppBot] Initialization error:', err);
      this.isInitializing = false;
      this.state.status = 'DISCONNECTED';
      this.state.error = err.message || 'Failed to initialize WhatsApp bot.';
      return this.state;
    }
  }

  /**
   * Process incoming customer message and auto-reply based on dynamic rules
   */
  private async handleIncomingMessage(msg: any) {
    try {
      const senderJid = msg.key.remoteJid;
      if (!senderJid) return;

      const senderPhone = senderJid.split('@')[0];
      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        '';

      if (!messageText.trim()) return;

      this.state.totalMessagesProcessed += 1;

      // Check if this contact is currently paused (Human Agent Handoff)
      const pausedUntil = this.state.pausedContacts[senderPhone];
      if (pausedUntil && Date.now() < pausedUntil) {
        // Human agent has taken over this chat; suppress bot reply
        return;
      }

      await dbConnect();

      // Find matching rule from MongoDB
      const rules = await WhatsAppRule.find({ enabled: true }).sort({ priority: 1 });
      const matchedRule = this.matchRule(messageText, rules);

      if (!matchedRule) return;

      // Generate dynamic reply content
      const replyContent = await this.resolveReplyMessage(matchedRule, messageText, senderPhone);

      if (!replyContent) return;

      // Simulate human presence ("typing..." delay 1.5 - 2.5s)
      try {
        await this.sock?.sendPresenceUpdate('composing', senderJid);
      } catch {}

      await new Promise((resolve) => setTimeout(resolve, 1800));

      try {
        await this.sock?.sendPresenceUpdate('paused', senderJid);
      } catch {}

      // Send the reply message
      await this.sock?.sendMessage(senderJid, { text: replyContent });
      this.state.totalAutoRepliesSent += 1;

      // If action is agent_handoff, pause bot for this contact for 24 hours
      if (matchedRule.dynamicAction === 'agent_handoff') {
        this.state.pausedContacts[senderPhone] = Date.now() + 24 * 60 * 60 * 1000;
      }
    } catch (err) {
      console.error('[WhatsAppBot] Error replying to message:', err);
    }
  }

  /**
   * Rule matcher (supports exact, contains, and regex)
   */
  public matchRule(text: string, rules: any[]) {
    const clean = text.toLowerCase().trim();

    for (const rule of rules) {
      if (!rule.keywords || rule.keywords.length === 0) continue;

      if (rule.triggerType === 'exact') {
        if (rule.keywords.some((k: string) => clean === k.toLowerCase().trim())) {
          return rule;
        }
      } else if (rule.triggerType === 'contains') {
        if (rule.keywords.some((k: string) => clean.includes(k.toLowerCase().trim()))) {
          return rule;
        }
      } else if (rule.triggerType === 'regex') {
        for (const pattern of rule.keywords) {
          try {
            const re = new RegExp(pattern, 'i');
            if (re.test(clean)) return rule;
          } catch {}
        }
      }
    }

    // Default fallback rule if defined
    return rules.find((r) => r.triggerType === 'default');
  }

  /**
   * Resolve dynamic placeholders in reply message
   */
  public async resolveReplyMessage(rule: any, incomingText: string, customerPhone: string): Promise<string> {
    let reply = rule.replyMessage;

    // Handle dynamic order status lookup
    if (rule.dynamicAction === 'order_status_lookup') {
      try {
        // Search by phone or order ID in incoming text
        const cleanPhone = customerPhone.replace(/^92/, '0');
        const potentialId = incomingText.replace(/[^a-f0-9]/gi, '');
        const queryConditions: any[] = [
          { 'customerDetails.phone': { $regex: cleanPhone.slice(-9) } },
        ];
        if (potentialId.length === 24) {
          queryConditions.push({ _id: potentialId });
        }

        const order = await Order.findOne({
          $or: queryConditions,
        }).sort({ createdAt: -1 });

        if (order) {
          const shortId = order._id?.toString().slice(-8).toUpperCase();
          const itemsSummary = order.items
            .map((i: any) => `• ${i.name} x${i.quantity}`)
            .join('\n');

          reply =
            `السلام علیکم ${order.customerDetails.name || ''}!\n\n` +
            `Aapka order record mil gaya hai:\n\n` +
            `📋 *Order ID:* #${shortId}\n` +
            `📦 *Status:* *${order.status}*\n` +
            `💰 *Total Amount:* Rs. ${order.totalAmount?.toLocaleString()} (COD)\n` +
            (order.trackingNumber ? `🚚 *Courier Tracking:* ${order.courierName || 'Courier'} (CN: ${order.trackingNumber})\n` : '') +
            `\n*Items:*\n${itemsSummary}\n\n` +
            `Kisi bhi mazeed maloomat ke liye hum se rabta karein.`;
        }
      } catch (err) {
        console.error('Error looking up order for WhatsApp reply:', err);
      }
    }

    return reply;
  }

  /**
   * Send arbitrary outbound text message to a specific phone number
   */
  public async sendTextMessage(toPhone: string, text: string): Promise<boolean> {
    try {
      if (!this.sock || this.state.status !== 'CONNECTED') {
        console.warn('[WhatsAppBot] Cannot send message: bot is not connected.');
        return false;
      }

      const cleanPhone = toPhone.replace(/[^0-9]/g, '');
      if (!cleanPhone) return false;

      const jid = `${cleanPhone}@s.whatsapp.net`;
      await this.sock.sendMessage(jid, { text });
      console.log(`[WhatsAppBot] Outbound message sent successfully to ${cleanPhone}`);
      return true;
    } catch (err) {
      console.error('[WhatsAppBot] Error sending outbound message:', err);
      return false;
    }
  }

  /**
   * Disconnect and wipe credentials to allow fresh QR scan
   */
  public async logout(): Promise<BotState> {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
        this.sock.end?.();
        this.sock = null;
      }

      if (fs.existsSync(this.authDir)) {
        fs.rmSync(this.authDir, { recursive: true, force: true });
      }

      this.state.status = 'DISCONNECTED';
      this.state.phoneNumber = null;
      this.state.qrCodeBase64 = null;
      this.state.error = null;
      return this.state;
    } catch (err: any) {
      console.error('[WhatsAppBot] Error during logout:', err);
      this.state.error = err.message || 'Error logging out.';
      return this.state;
    }
  }
}

export default WhatsAppBotManager;

