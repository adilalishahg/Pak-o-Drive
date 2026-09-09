import mongoose, { Schema, Document, Model } from 'mongoose';

export type WhatsAppTriggerType = 'contains' | 'exact' | 'regex' | 'default';

export type WhatsAppDynamicAction =
  | 'none'
  | 'order_status_lookup'
  | 'interactive_menu'
  | 'bank_details'
  | 'agent_handoff'
  | 'returns_policy';

export interface IWhatsAppRule {
  _id?: string;
  name: string;
  triggerType: WhatsAppTriggerType;
  keywords: string[];
  replyMessage: string;
  dynamicAction: WhatsAppDynamicAction;
  enabled: boolean;
  priority: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IWhatsAppRuleDocument extends Omit<IWhatsAppRule, '_id'>, Document {}

const WhatsAppRuleSchema = new Schema<IWhatsAppRuleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    triggerType: {
      type: String,
      enum: ['contains', 'exact', 'regex', 'default'],
      default: 'contains',
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    replyMessage: {
      type: String,
      required: [true, 'Reply message is required'],
      trim: true,
    },
    dynamicAction: {
      type: String,
      enum: [
        'none',
        'order_status_lookup',
        'interactive_menu',
        'bank_details',
        'agent_handoff',
        'returns_policy',
      ],
      default: 'none',
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 10,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-seeded default rules for Pakistani E-Commerce
export const DEFAULT_WHATSAPP_RULES: Omit<IWhatsAppRule, '_id'>[] = [
  {
    name: 'Interactive Main Menu (Greeting)',
    triggerType: 'contains',
    keywords: ['hi', 'hello', 'salam', 'assalam', 'aoa', 'menu', 'help', 'start'],
    replyMessage:
      'Hello! Welcome to *Pak-o-Drive Support* 🛒✨\n\n' +
      'How can we assist you today? Please reply with a number or type your query:\n\n' +
      '1️⃣ *Track Order Status*\n' +
      '2️⃣ *Payment & Bank / JazzCash Details*\n' +
      '3️⃣ *7-Day Return & Replacement Policy*\n' +
      '4️⃣ *Connect with Live Support Agent*\n\n' +
      '👉 Or simply type your question below.',
    dynamicAction: 'interactive_menu',
    enabled: true,
    priority: 1,
  },
  {
    name: 'Order Status & Tracking Lookup',
    triggerType: 'contains',
    keywords: [
      'order status',
      'track order',
      'track my order',
      'parcel status',
      'tracking status',
      'order tracking',
      'mera order',
      'order kahan hai',
      'parcel kahan',
      'kab milega',
      'kab pohanchega',
      '1',
    ],
    replyMessage:
      'We are looking up your order details.\n\n' +
      '📦 *Order Verification & Tracking:*\n' +
      'Orders placed on our store are verified and handed over to our courier partner within 24 hours.\n\n' +
      'Please reply with your Order ID (e.g., #12345) or 11-digit mobile number so we can check your live parcel tracking.',
    dynamicAction: 'order_status_lookup',
    enabled: true,
    priority: 2,
  },

  {
    name: 'Bank / JazzCash / Payment Details',
    triggerType: 'contains',
    keywords: ['bank', 'jazzcash', 'easypaisa', 'payment', 'account', 'advance', '2'],
    replyMessage:
      '💳 *Pak-o-Drive Payment Accounts*\n\n' +
      '📦 *Cash On Delivery (COD):* Pay in cash upon receiving your parcel at your doorstep.\n\n' +
      '📲 *Online Payment (JazzCash / EasyPaisa / Bank Transfer):*\n' +
      '• *Bank Name:* Meezan Bank\n' +
      '• *Account Title:* PAKODRIVE OFFICIAL\n' +
      '• *Account Number:* 0101-0203040506\n' +
      '• *JazzCash / EasyPaisa:* 0318-5205667 (Title: Pak-o-Drive)\n\n' +
      'After completing your transfer, please share a screenshot of the receipt in this chat.',
    dynamicAction: 'bank_details',
    enabled: true,
    priority: 3,
  },
  {
    name: '7-Day Return & Replacement Guarantee',
    triggerType: 'contains',
    keywords: ['return', 'refund', 'exchange', 'wapsi', 'change', 'faulty', 'defect', 'kharab', '3'],
    replyMessage:
      '🛡️ *7-Day Return & Easy Replacement Policy*\n\n' +
      'Pak-o-Drive provides a 100% peace-of-mind guarantee on every order:\n\n' +
      '1. If a product is delivered damaged or incorrect, we provide a free replacement within 7 days.\n' +
      '2. Please share a brief unboxing video or photo in this chat.\n\n' +
      'Our customer support team will review and resolve your request within 1-2 hours.',
    dynamicAction: 'returns_policy',
    enabled: true,
    priority: 4,
  },
  {
    name: 'Human Agent Handoff',
    triggerType: 'contains',
    keywords: [
      'agent',
      'human agent',
      'live agent',
      'support agent',
      'admin rabta',
      'representative',
      'customer support',
      '!agent',
      '4',
    ],
    replyMessage:
      '👨‍💼 *Live Support Agent Handoff*\n\n' +
      'Your message has been forwarded to our customer support team.\n\n' +
      'A support specialist will assist you in this chat shortly. Thank you for reaching out!',
    dynamicAction: 'agent_handoff',
    enabled: true,
    priority: 5,
  },
];

const WhatsAppRule: Model<IWhatsAppRuleDocument> =
  mongoose.models.WhatsAppRule ||
  mongoose.model<IWhatsAppRuleDocument>('WhatsAppRule', WhatsAppRuleSchema);

export default WhatsAppRule;
