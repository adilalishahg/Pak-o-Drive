import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsDocument extends Document {
  type: 'pageview' | 'interaction';
  path: string;
  interactionType?: 
    | 'view_product' 
    | 'add_to_cart' 
    | 'search_intent' 
    | 'scroll_depth' 
    | 'checkout_abandonment' 
    | 'begin_checkout' 
    | 'checkout_success'
    | 'whatsapp_click';
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  session_id?: string;
  device?: 'Mobile' | 'Desktop';
  os?: string;
  browser?: string;
  age?: number;
  gender?: string;
  city?: string;
  country?: string;
  location?: string;
  landing_page?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalyticsDocument>(
  {
    type: { type: String, enum: ['pageview', 'interaction'], required: true },
    path: { type: String, required: true },
    interactionType: { 
      type: String, 
      enum: [
        'view_product', 
        'add_to_cart', 
        'search_intent', 
        'scroll_depth', 
        'checkout_abandonment', 
        'begin_checkout', 
        'checkout_success',
        'whatsapp_click'
      ] 
    },
    utm_source: { type: String },
    utm_medium: { type: String },
    utm_campaign: { type: String },
    session_id: { type: String },
    device: { type: String, enum: ['Mobile', 'Desktop'] },
    os: { type: String },
    browser: { type: String },
    age: { type: Number },
    gender: { type: String },
    city: { type: String },
    country: { type: String },
    location: { type: String },
    landing_page: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Add index for query optimization
AnalyticsSchema.index({ utm_source: 1, timestamp: -1 });
AnalyticsSchema.index({ session_id: 1 });
AnalyticsSchema.index({ type: 1, interactionType: 1 });
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ type: 1, interactionType: 1, timestamp: -1 });

export default mongoose.models.Analytics || mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema);
