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
      'وعلیکم السلام! *Pak-o-Drive Support* mein khush-amdeed 🛒✨\n\n' +
      'Hum aapki kia madad kar sakte hain? Number reply karein:\n\n' +
      '1️⃣ *Order Status Maloom Karein*\n' +
      '2️⃣ *Payment & Bank / JazzCash Details*\n' +
      '3️⃣ *7-Day Return & Replacement Policy*\n' +
      '4️⃣ *Human Agent se Rabta Karein*\n\n' +
      '👉 Ya apna sawal direct type karein.',
    dynamicAction: 'interactive_menu',
    enabled: true,
    priority: 1,
  },
  {
    name: 'Order Status & Tracking Lookup',
    triggerType: 'contains',
    keywords: ['order', 'track', 'status', 'parcel', 'dispatch', 'delivery', 'kab milega', '1'],
    replyMessage:
      'Aapka order hamare pas process ho raha hai.\n\n' +
      '📦 *Order Verification & Tracking:*\n' +
      'Agar aapne website se order place kiya hai tou aapka order 24 ghante ke andar courier rider ko hand over kar diya jata hai.\n\n' +
      'Aap apna Order ID (e.g. #12345) ya phone number share karein taake hum live tracking check kar sakein.',
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
      '📦 *Cash On Delivery (COD):* Aap parcel milne par rider ko cash de sakte hain.\n\n' +
      '📲 *Online Payment (JazzCash / EasyPaisa / Bank Transfer):*\n' +
      '• *Bank Name:* Meezan Bank\n' +
      '• *Account Title:* PAKODRIVE OFFICIAL\n' +
      '• *Account Number:* 0101-0203040506\n' +
      '• *JazzCash / EasyPaisa:* 0318-5205667 (Title: Pak-o-Drive)\n\n' +
      'Payment karne ke baad screenshot isi chat par send karein.',
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
      'Pak-o-Drive par har product par 100% peace-of-mind guarantee milti hai:\n\n' +
      '1. Agar product damaged ya wrong receive ho, tou 7 din ke andar replacement free of cost hoti hai.\n' +
      '2. Baraye meharbani parcel unboxing ki short video ya photo isi chat par share karein.\n\n' +
      'Hamari support team 1-2 hours mein aapka issue resolve karegi.',
    dynamicAction: 'returns_policy',
    enabled: true,
    priority: 4,
  },
  {
    name: 'Human Agent Handoff',
    triggerType: 'contains',
    keywords: ['agent', 'human', 'admin', 'call', 'talk', 'baat', 'banda', 'representative', '4'],
    replyMessage:
      '👨‍💼 *Live Support Agent Handoff*\n\n' +
      'Aapka message hamare customer support agent ko forward kar diya gaya hai.\n\n' +
      'Hamara support team member thori hi der mein aapse isi chat par rabta karega. Shukriya!',
    dynamicAction: 'agent_handoff',
    enabled: true,
    priority: 5,
  },
];

const WhatsAppRule: Model<IWhatsAppRuleDocument> =
  mongoose.models.WhatsAppRule ||
  mongoose.model<IWhatsAppRuleDocument>('WhatsAppRule', WhatsAppRuleSchema);

export default WhatsAppRule;
