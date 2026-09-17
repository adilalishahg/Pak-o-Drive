import dbConnect from './mongodb';
import { handleCronActions } from './admin-actions/cronActions';
import { handleOrderActions } from './admin-actions/orderActions';
import { handleProductActions } from './admin-actions/productActions';
import { handlePromoActions } from './admin-actions/promoActions';
import { handleContentActions } from './admin-actions/contentActions';

export interface AdminActionRequired {
  id: string;
  type: string;
  title: string;
  description: string;
  count: number;
  payload: any;
}

export interface AdminActionResult {
  handled: boolean;
  reply: string;
  actionExecuted?: {
    type: string;
    description: string;
    count?: number;
    details?: any;
  };
  actionRequired?: AdminActionRequired;
}

export const VALID_ORDER_STATUSES = [
  'Pending',
  'Processing',
  'On the Way',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/**
 * Normalizes input status to exact valid Order status string
 */
export function normalizeOrderStatus(statusStr: string): string | null {
  if (!statusStr) return null;
  const s = statusStr.toLowerCase().trim();
  if (s.includes('deliver') || s.includes('complete') || s.includes('completed') || s.includes('done') || s.includes('finish') || s.includes('pahunch') || s.includes('khatam')) return 'Delivered';
  if (s.includes('ship') || s.includes('shipped') || s.includes('rawana') || s.includes('bhej')) return 'Shipped';
  if (s.includes('way') || s.includes('on the way') || s.includes('transit') || s.includes('raste')) return 'On the Way';
  if (s.includes('process') || s.includes('processing') || s.includes('taiari') || s.includes('pack')) return 'Processing';
  if (s.includes('cancel') || s.includes('cancelled') || s.includes('mansookh') || s.includes('radd')) return 'Cancelled';
  if (s.includes('pend') || s.includes('pending') || s.includes('intezar') || s.includes('wapas pending')) return 'Pending';
  return null;
}

/**
 * Detects if the prompt is an actionable database command
 */
export async function detectActionWithAI(userQuery: string): Promise<any | null> {
  const lower = userQuery.toLowerCase().trim();

  // -----------------------------------------------------------
  // ⚡ INSTANT DETERMINISTIC FAST-PATH (0ms latency, zero failure)
  // -----------------------------------------------------------

  // 1. Flash Sale: e.g. "⚡ Launch Flash Sale Event", "flash sale create karo", "sale event"
  if (/(flash sale|sale event|flash deal|mega sale|launch flash sale)/i.test(lower)) {
    const discountMatch = lower.match(/(\d{1,2})%/)?.[1];
    return {
      isAction: true,
      operation: 'create_flash_sale',
      params: {
        theme: userQuery.replace(/[⚡🔥🎉]/g, '').trim() || 'Weekend Mega Flash Sale',
        discountPercent: discountMatch ? parseInt(discountMatch, 10) : 20,
      },
      isDestructive: false,
    };
  }

  // 2. Viral Video / Ad Script: e.g. "🎬 Viral TikTok Video Script", "ad script", "tiktok"
  if (/(ad script|video script|tiktok|reels|ad copy|viral video|viral ad|viral tiktok)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_ad_campaign',
      params: {
        productName: userQuery.replace(/(ad script|video script|tiktok|reels|viral|🎬|banao|generate karo|copy)/gi, '').trim(),
      },
      isDestructive: false,
    };
  }

  // 3. WhatsApp COD Confirmation & Anti-RTO: e.g. "🛡️ WhatsApp COD Confirmation", "cod confirmation"
  if (/(whatsapp cod|cod confirmation|anti-rto|confirmation link|confirm order|confirmation)/i.test(lower) && /(whatsapp|cod|rto|order)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_cod_confirmation',
      params: {},
      isDestructive: false,
    };
  }

  // 4. Seasonal Stock & Margin Forecast: e.g. "📈 Predictive Stock & Margin Forecast", "forecast", "stock prediction"
  if (/(stock forecast|predictive stock|margin forecast|seasonal forecast|re-stock prediction|stock report)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'predictive_stock_forecast',
      params: {},
      isDestructive: false,
    };
  }

  // 5. High-Margin Bundle Suggestion: e.g. "💡 Propose High-Margin Bundle", "bundle suggestion", "create combo"
  if (/(bundle suggestion|propose bundle|suggest bundle|create bundle|high-margin bundle|combo pack)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'suggest_bundle',
      params: {},
      isDestructive: false,
    };
  }

  // 6. Auto-Beat Competitor Price: e.g. "📈 Auto-Beat Competitor Price", "competitor price", "beat price"
  if (/(auto-beat|beat price|competitor price|re-price|price drop|price update)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'auto_beat_price',
      params: {
        productName: userQuery.replace(/(auto-beat|beat price|competitor price|re-price|price|update|📈)/gi, '').trim(),
      },
      isDestructive: false,
    };
  }

  // 7. Authentic Customer Reviews Generator: e.g. "⭐ Generate Customer Reviews", "add reviews", "reviews"
  if (/(customer reviews|generate reviews|add reviews|social proof|fake reviews|reviews)/i.test(lower) && /(generate|add|banao|dalo|reviews)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_customer_reviews',
      params: {
        productName: userQuery.replace(/(customer reviews|generate reviews|add reviews|reviews|⭐|banao|dalo)/gi, '').trim(),
      },
      isDestructive: false,
    };
  }

  // 8. Bulk Courier Dispatch Manifest: e.g. "🚚 Export Bulk Courier Manifest", "courier manifest", "tcs manifest", "trax manifest"
  if (/(courier manifest|export manifest|dispatch manifest|tcs manifest|trax manifest|bulk manifest)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'export_courier_manifest',
      params: {},
      isDestructive: false,
    };
  }

  // 9. Status Update: e.g. "Order 1 ko shipped kardo", "update order status"
  if (/(status|shipped|delivered|processing|cancelled|pending|rawana|bhej|pahunch|mansookh)/i.test(lower) && /(order|#|all|tamam|sab)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'update_order_status',
      params: {
        identifier: userQuery,
        newStatus: userQuery,
      },
      isDestructive: false,
    };
  }

  // 10. WhatsApp Executive Digest: e.g. "whatsapp digest", "daily summary"
  if (/(whatsapp digest|daily summary|executive digest|today sales|sales report)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_whatsapp_digest',
      params: {},
      isDestructive: false,
    };
  }

  // 11. COD Risk Audit: e.g. "cod risk", "fraud audit", "analyze risk"
  if (/(cod risk|fraud audit|risk analysis|rto risk|check fraud)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'analyze_cod_risk',
      params: {},
      isDestructive: false,
    };
  }

  // 12. Dispatch Slip: e.g. "dispatch slip", "courier slip", "print slip"
  if (/(dispatch slip|courier slip|thermal slip|print slip)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_dispatch_slip',
      params: {},
      isDestructive: false,
    };
  }

  return null;
}

/**
 * Main Action Dispatcher
 */
export async function executeAdminAction(
  actionIntent: { operation: string; params: any; isDestructive?: boolean },
  confirmed: boolean = false
): Promise<AdminActionResult> {
  await dbConnect();
  const { operation, params } = actionIntent;

  const result =
    (await handleCronActions(operation, params, confirmed)) ||
    (await handleOrderActions(operation, params, confirmed)) ||
    (await handleProductActions(operation, params, confirmed)) ||
    (await handlePromoActions(operation, params, confirmed)) ||
    (await handleContentActions(operation, params, confirmed));

  if (result) return result;

  return { handled: false, reply: '' };
}
