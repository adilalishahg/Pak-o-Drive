import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebChatMessage {
  id: string;
  sender: 'visitor' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  notifiedToAdmin?: boolean;
  createdAt: Date;
}

export interface IWebChatSession {
  sessionId: string; // e.g. W482 or web_session_xxx
  shortCode: string; // e.g. W482
  visitorPhone?: string;
  visitorName?: string;
  isAgentLive: boolean;
  messages: IWebChatMessage[];
  lastActiveAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWebChatSessionDocument extends IWebChatSession, Document {}

const WebChatMessageSchema = new Schema<IWebChatMessage>(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ['visitor', 'bot', 'agent'], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    notifiedToAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WebChatSessionSchema = new Schema<IWebChatSessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    shortCode: { type: String, required: true, index: true },
    visitorPhone: { type: String },
    visitorName: { type: String, default: 'Web Visitor' },
    isAgentLive: { type: Boolean, default: false, index: true },
    messages: [WebChatMessageSchema],
    lastActiveAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

const WebChatSession: Model<IWebChatSessionDocument> =
  mongoose.models.WebChatSession ||
  mongoose.model<IWebChatSessionDocument>('WebChatSession', WebChatSessionSchema);

export default WebChatSession;
