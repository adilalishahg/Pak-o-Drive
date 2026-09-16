/**
 * WhatsApp Auto-Responder Bot Engine
 * Modular engine facade for backwards compatibility.
 */
import { WhatsAppBotManager } from './manager';

export * from './types';
export * from './intentGuard';
export * from './matcher';
export * from './replyResolver';
export * from './manager';

export { WhatsAppBotManager };
export default WhatsAppBotManager;
