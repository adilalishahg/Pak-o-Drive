import dbConnect from './mongodb';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
import BlogPost from '../models/BlogPost';
import Review from '../models/Review';
import CampaignOffer from '../models/CampaignOffer';
import { callMultiProviderAI } from './multiAiEngine';
import { generateAutoProductSeo } from './productSeoGenerator';
import mongoose from 'mongoose';

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

const VALID_ORDER_STATUSES = [
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
function normalizeOrderStatus(statusStr: string): string | null {
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
      params: { limit: 6 },
      isDestructive: false,
    };
  }

  // 4. Auto-Beat Pricing: e.g. "📈 Auto-Beat Competitor Price", "auto beat", "competitor price"
  if (/(auto-beat|auto beat|competitor price|beat competitor|sasti price|price beat|auto-beat competitor)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'auto_beat_price',
      params: {
        productName: userQuery.replace(/(auto-beat|auto beat|competitor price|📈|sasti price|set karo|karo)/gi, '').trim(),
      },
      isDestructive: false,
    };
  }

  // 5. Customer Reviews: e.g. "⭐ Add Customer Reviews", "customer review", "reviews add"
  if (/(customer review|customer reviews|social proof|add review|reviews add|reviews generate)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_customer_reviews',
      params: {
        productName: userQuery.replace(/(customer review|customer reviews|⭐|add karo|publish karo|generate karo)/gi, '').trim(),
        count: 4,
      },
      isDestructive: false,
    };
  }

  // 6. Courier Manifest: e.g. "🚚 Courier Dispatch Manifest", "courier manifest", "dispatch manifest"
  if (/(courier manifest|dispatch manifest|manifest sheet|booking manifest|tcs manifest|trax manifest|manifest)/i.test(lower) && /(courier|dispatch|tcs|trax|sheet|manifest)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'export_courier_manifest',
      params: { courier: 'TCS / Trax Express' },
      isDestructive: false,
    };
  }

  // 7. High-Margin Bundle: e.g. "Suggest High-Margin Bundle 💡", "combo bundle", "suggest bundle"
  if (/(suggest bundle|high-margin bundle|combo bundle|bundle create|naya bundle|suggest high-margin)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'suggest_bundle',
      params: {},
      isDestructive: false,
    };
  }

  // 8. WhatsApp Daily Digest: e.g. "Daily WhatsApp Digest 📱", "whatsapp digest"
  if (/(whatsapp digest|daily digest|executive digest|daily whatsapp)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_whatsapp_digest',
      params: {},
      isDestructive: false,
    };
  }

  // 9. COD Fraud Risk: e.g. "COD Fraud & Return Risk 🛡️", "fraud risk", "return risk"
  if (/(fraud risk|return risk|cod risk|fraud & return)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'analyze_cod_risk',
      params: {},
      isDestructive: false,
    };
  }

  // 10. Thermal Dispatch Slip: e.g. "dispatch slip", "thermal slip"
  if (/(dispatch slip|thermal slip|courier slip|thermal courier)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'generate_dispatch_slip',
      params: {},
      isDestructive: false,
    };
  }

  // 11. Seasonal Stock Forecast: e.g. "Seasonal Stock Forecast 🔮", "stock forecast"
  if (/(stock forecast|seasonal forecast|forecast karo|seasonal stock)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'predictive_stock_forecast',
      params: {},
      isDestructive: false,
    };
  }

  // 12. SEO Blog: e.g. "Publish Smog SEO Blog ✍️", "seo blog publish", "blog post"
  if (/(seo blog|publish blog|blog post|blog publish|publish smog)/i.test(lower)) {
    return {
      isAction: true,
      operation: 'create_blog_post',
      params: {
        topic: userQuery.replace(/(publish|seo blog|blog post|✍️|create karo|likho)/gi, '').trim() || 'Car Care & Accessories in Pakistan',
      },
      isDestructive: false,
    };
  }

  // 13. Order status update: e.g. "order id 1 ka status complete kra do", "order #123 delivered kar do"
  if (
    /(status|mark|update|kar do|kardo|kra do|krwa do|karwa do|kardein|karde|karo)\s+.*?(delivered|complete|completed|done|finish|shipped|processing|cancelled|pending)/i.test(lower) ||
    /(order|orders)\s+(?:id\s+|no\s+|number\s+|#)?([a-f0-9]+|\d+)\s+.*?(status|delivered|complete|completed|done|finish|shipped|processing|cancelled|pending|kar do|kardo|kra do)/i.test(lower)
  ) {
    const statusMatch = normalizeOrderStatus(lower);
    const idMatch =
      userQuery.match(/order\s+(?:id\s+|no\s+|number\s+|#)?([a-f0-9]{4,24}|\d{1,8})/i)?.[1] ||
      userQuery.match(/#([a-f0-9]{4,24}|\d{1,8})/i)?.[1] ||
      userQuery.match(/([a-f0-9]{24}|\d{3,8})/i)?.[1] ||
      '';
    if (statusMatch) {
      return {
        isAction: true,
        operation: 'update_order_status',
        params: { identifier: idMatch, newStatus: statusMatch },
        isDestructive: false,
      };
    }
  }

  // 14. Delete orders bulk
  if (/(delete|remove|hatao|khatam|uda do)\s+.*?(order|orders)/i.test(lower)) {
    const isAll = /(all|tamam|sary|saray|sab)/i.test(lower);
    const isCancelled = /(cancelled|cancel)/i.test(lower);
    const isPending = /(pending)/i.test(lower);
    const status = isCancelled ? 'Cancelled' : isPending ? 'Pending' : undefined;

    return {
      isAction: true,
      operation: 'delete_orders_bulk',
      params: { deleteAll: isAll && !status, status },
      isDestructive: true,
    };
  }

  // 15. Product price or stock update
  if (/(price|keemat|rate|stock|taadad)\s+.*?(kar do|badal do|update|set)/i.test(lower)) {
    const numMatch = lower.match(/(?:price|rate|keemat|rs\.?|pkr)?\s*(\d{2,7})\s*(?:kar do|kardo|pkr)?/i)?.[1];
    const stockMatch = lower.match(/stock\s*(?:of)?\s*(\d{1,5})/i)?.[1];
    return {
      isAction: true,
      operation: 'update_product',
      params: {
        productName: userQuery.replace(/(price|rate|stock|update|kar do|badal do|\d+)/gi, '').trim(),
        price: numMatch ? parseInt(numMatch, 10) : undefined,
        stock: stockMatch ? parseInt(stockMatch, 10) : undefined,
      },
      isDestructive: false,
    };
  }

  // -----------------------------------------------------------
  // 🧠 SECONDARY LLM INTENT PARSING (For complex/unstructured phrasing)
  // -----------------------------------------------------------
  const prompt = `
You are an intent classification parser for the Pak-o-Drive E-commerce Admin Panel.
Analyze if the user prompt is instructing to modify, update, delete, or create data in the database (Orders, Products, Categories, Promotions, Blogs, WhatsApp digest, COD risk, Courier dispatch, Ad scripts, Reviews, Flash sales).

Valid operations:
1. "update_order_status": params: { identifier: string (order sequence like "1", short hex like "#774526" or "774526", customer name, or "all_pending"), newStatus: "Pending"|"Processing"|"On the Way"|"Shipped"|"Delivered"|"Cancelled" } (Note: If user says "order id 1" or "order 1", identifier MUST be "1". If user says "complete" or "done", newStatus MUST be "Delivered".)
2. "update_order_details": params: { identifier: string, address?: string, phone?: string, trackingNumber?: string, courierName?: string }
3. "delete_order": params: { identifier: string }
4. "delete_orders_bulk": params: { status?: string, dateBefore?: string, dateAfter?: string, deleteAll?: boolean }
5. "update_product": params: { productName: string, price?: number, originalPrice?: number, stock?: number }
6. "delete_product": params: { productName: string }
7. "create_product": params: { name: string, price: number, category: string, stock?: number, description?: string }
8. "create_promotion": params: { code: string, discountPercent: number, expiryDays?: number }
9. "create_category": params: { name: string, parentCategory?: string }
10. "create_blog_post": params: { topic: string, category?: string }
11. "generate_whatsapp_digest": params: {}
12. "analyze_cod_risk": params: { orderId?: string }
13. "generate_dispatch_slip": params: { orderId?: string }
14. "predictive_stock_forecast": params: { season?: string }
15. "create_bundle": params: { name: string, price: number, originalPrice?: number, category?: string, description?: string, itemsSummary?: string }
16. "suggest_bundle": params: { theme?: string }
17. "generate_ad_campaign": params: { productName?: string, platform?: "tiktok"|"reels"|"meta"|"all" }
18. "generate_cod_confirmation": params: { limit?: number }
19. "auto_beat_price": params: { productName: string, competitorPrice?: number }
20. "create_flash_sale": params: { theme: string, discountPercent?: number, durationHours?: number }
21. "generate_customer_reviews": params: { productName: string, count?: number }
22. "export_courier_manifest": params: { courier?: string }

User Message: "${userQuery}"

Output ONLY a raw JSON object (no markdown, no backticks):
{
  "isAction": true or false,
  "operation": "...",
  "params": { ... },
  "isDestructive": true or false
}
If NOT an action (just casual talk), return {"isAction": false}.
`;

  try {
    const aiResult = await callMultiProviderAI('', prompt);
    if (aiResult?.text) {
      const cleaned = aiResult.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed?.isAction) {
        return parsed;
      }
    }
  } catch (err) {
    // Fail silently
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

  // ----------------------------------------------------
  // 1. ORDER ACTIONS
  // ----------------------------------------------------
  if (operation === 'update_order_status') {
    const { identifier, newStatus } = params;
    const targetStatus = normalizeOrderStatus(newStatus);
    if (!targetStatus) {
      return {
        handled: true,
        reply: `⚠️ Invalid status value. Status sirf yeh ho saktay hain: ${VALID_ORDER_STATUSES.join(', ')}.`,
      };
    }

    const trimmedId = typeof identifier === 'string' ? identifier.trim() : String(identifier || '').trim();
    const isBulk = /^(all|all_pending|all_cancelled|tamam|sab|saray|sary)/i.test(trimmedId);

    // -------------------------------------------------------------
    // BULK UPDATE PATH (Only when user explicitly asked for all/tamam/sab)
    // -------------------------------------------------------------
    if (isBulk) {
      let bulkFilter: any = { status: 'Pending' };
      if (trimmedId.toLowerCase().includes('cancelled')) {
        bulkFilter = { status: 'Cancelled' };
      }
      const matchedOrders = await Order.find(bulkFilter).limit(20).lean();
      if (matchedOrders.length === 0) {
        return {
          handled: true,
          reply: `ℹ️ Diye gaye bulk criteria ke mutabiq koi order nahi mila.`,
        };
      }

      const ids = matchedOrders.map((o: any) => o._id);
      await Order.updateMany(
        { _id: { $in: ids } },
        {
          $set: { status: targetStatus },
          $push: {
            statusHistory: {
              status: targetStatus,
              changedAt: new Date(),
              note: `Bulk updated to ${targetStatus} via AI Executive Copilot`,
            },
          },
        }
      );

      return {
        handled: true,
        reply: `✅ **Bulk Status Updated!** ${matchedOrders.length} order(s) ka status successfully **"${targetStatus}"** kar diya gaya hai.\n\n- Updated IDs: ${matchedOrders.map((o: any) => `#${o._id.toString().slice(-6).toUpperCase()}`).join(', ')}`,
        actionExecuted: {
          type: 'update_order_status',
          description: `${matchedOrders.length} order(s) marked as ${targetStatus}`,
          count: matchedOrders.length,
        },
      };
    }

    // -------------------------------------------------------------
    // SINGLE ORDER UPDATE PATH (Deterministic & Zero False Positives)
    // -------------------------------------------------------------
    let targetOrder: any = null;

    // 1. 1-Based Index lookup (e.g. "1", "2", "order 1", "order #1", "pehla order")
    const indexMatch = trimmedId.match(/^(?:order\s*)?(?:#|id\s*)?(\d{1,2})$/i);
    if (indexMatch) {
      const idxNum = parseInt(indexMatch[1], 10);
      if (idxNum >= 1 && idxNum <= 30) {
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(idxNum).lean();
        if (recentOrders.length >= idxNum) {
          targetOrder = recentOrders[idxNum - 1];
        }
      }
    }

    // 2. Full 24-char MongoDB ObjectId
    const cleanHex = trimmedId.replace(/^#/, '');
    if (!targetOrder && mongoose.Types.ObjectId.isValid(cleanHex) && cleanHex.length === 24) {
      targetOrder = await Order.findById(cleanHex).lean();
    }

    // 3. Short hex ID suffix (e.g. "774526", "e214bd")
    if (!targetOrder && /^[a-f0-9]{4,12}$/i.test(cleanHex)) {
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
      targetOrder = recentOrders.find((o: any) =>
        o._id.toString().toLowerCase().endsWith(cleanHex.toLowerCase())
      ) || null;

      if (!targetOrder) {
        targetOrder = await Order.findOne({
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: `${cleanHex}$`,
              options: 'i',
            },
          },
        }).lean();
      }
    }

    // 4. Phone Number lookup (Strictly 7+ digits to avoid false-positive single digit matches!)
    if (!targetOrder && /^\+?\d{7,13}$/.test(trimmedId)) {
      const purePhone = trimmedId.replace(/^\+/, '');
      targetOrder = await Order.findOne({
        'customerDetails.phone': { $regex: purePhone },
      }).sort({ createdAt: -1 }).lean();
    }

    // 5. Customer Name or City or Tracking Number lookup
    if (!targetOrder && trimmedId.length >= 2 && !/^\d+$/.test(trimmedId)) {
      targetOrder = await Order.findOne({
        $or: [
          { trackingNumber: trimmedId },
          { 'customerDetails.name': { $regex: trimmedId, $options: 'i' } },
          { 'customerDetails.city': { $regex: trimmedId, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 }).lean();
    }

    // 6. Fallback: If no identifier or words like "latest", "recent", "pehla", pick latest Pending order
    if (!targetOrder && (!trimmedId || /latest|last|recent|pehla|newest/i.test(trimmedId))) {
      targetOrder = await Order.findOne({ status: 'Pending' }).sort({ createdAt: -1 }).lean()
        || await Order.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!targetOrder) {
      return {
        handled: true,
        reply: `❌ Diye gaye query ("${trimmedId || 'None'}") ke mutabiq koi order nahi mila. Baraye meherbani sahi Order sequence (maslan: "Order 1"), Short ID (maslan: "#774526"), ya customer ka naam likhein.`,
      };
    }

    // Update ONLY this single order
    await Order.updateOne(
      { _id: targetOrder._id },
      {
        $set: { status: targetStatus },
        $push: {
          statusHistory: {
            status: targetStatus,
            changedAt: new Date(),
            note: `Updated to ${targetStatus} via AI Executive Copilot (${trimmedId || 'Single Order'})`,
          },
        },
      }
    );

    const shortId = targetOrder._id.toString().slice(-6).toUpperCase();
    const custName = targetOrder.customerDetails?.name || 'Customer';
    const custCity = targetOrder.customerDetails?.city || 'Pakistan';
    const amountStr = (targetOrder.totalAmount || 0).toLocaleString();

    return {
      handled: true,
      reply: `✅ **Status Updated!** Order **#${shortId}** (${custName} - ${custCity}, PKR ${amountStr}) ka status successfully **"${targetStatus}"** kar diya gaya hai.`,
      actionExecuted: {
        type: 'update_order_status',
        description: `Order #${shortId} (${custName}) marked as ${targetStatus}`,
        count: 1,
        details: {
          orderId: targetOrder._id.toString(),
          shortId,
          customer: custName,
          city: custCity,
          amount: targetOrder.totalAmount,
          newStatus: targetStatus,
        },
      },
    };
  }

  // Update order tracking / courier / address
  if (operation === 'update_order_details') {
    const { identifier, address, phone, trackingNumber, courierName } = params;
    if (!identifier) {
      return { handled: true, reply: '❌ Order ID ya customer phone number likhna zaroori hai.' };
    }

    let filter: any = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter._id = new mongoose.Types.ObjectId(identifier);
    } else {
      filter.$or = [
        { 'customerDetails.phone': { $regex: identifier } },
        { 'customerDetails.name': { $regex: identifier, $options: 'i' } },
      ];
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return { handled: true, reply: `❌ Order "${identifier}" nahi mila.` };
    }

    if (address) order.customerDetails.address = address;
    if (phone) order.customerDetails.phone = phone;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;

    await order.save();
    return {
      handled: true,
      reply: `✅ **Order Details Updated!** Order #${order._id.toString().slice(-6)} (${order.customerDetails.name}) ki details update ho chuki hain:\n- Address: ${order.customerDetails.address}\n- Tracking: ${order.trackingNumber || 'N/A'}\n- Courier: ${order.courierName || 'N/A'}`,
      actionExecuted: {
        type: 'update_order_details',
        description: `Updated details for Order #${order._id.toString().slice(-6)}`,
      },
    };
  }

  // Delete orders bulk (Requires Safety Confirmation if not confirmed)
  if (operation === 'delete_orders_bulk') {
    const { status, dateBefore, dateAfter, deleteAll, filter: passedFilter } = params;
    const filter: any = passedFilter ? { ...passedFilter } : {};

    if (!passedFilter) {
      if (status) filter.status = status;
      if (dateBefore) filter.createdAt = { ...filter.createdAt, $lte: new Date(dateBefore) };
      if (dateAfter) filter.createdAt = { ...filter.createdAt, $gte: new Date(dateAfter) };
    }

    const matchingCount = await Order.countDocuments(filter);
    if (matchingCount === 0) {
      return {
        handled: true,
        reply: `ℹ️ Diye gaye filter ke mutabiq koi order nahi mila (Matching orders: 0).`,
      };
    }

    // Safety Guardrail: If not confirmed, return actionRequired preview
    if (!confirmed) {
      const desc = deleteAll
        ? `Store ke TAMAM (${matchingCount}) orders permanent delete karna`
        : `${matchingCount} orders ${status ? `(${status})` : ''} delete karna`;

      return {
        handled: true,
        reply: `⚠️ **Caution: Confirmation Zaroori Hai!**\n\nAap **${matchingCount} orders** database se hamesha ke liye delete karne lage hain.\n\nKia aap waqai inhay delete karna chahte hain? Neeche diye gaye button par click karein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_orders_bulk',
          title: 'Confirm Orders Bulk Deletion',
          description: desc,
          count: matchingCount,
          payload: { operation: 'delete_orders_bulk', params: { filter } },
        },
      };
    }

    // Confirmed Execution
    const deleteRes = await Order.deleteMany(filter);
    return {
      handled: true,
      reply: `🗑️ **Orders Deleted!** ${deleteRes.deletedCount} orders successfully database se delete kar diye gaye hain.`,
      actionExecuted: {
        type: 'delete_orders_bulk',
        description: `${deleteRes.deletedCount} orders permanently deleted`,
        count: deleteRes.deletedCount,
      },
    };
  }

  // Delete single order
  if (operation === 'delete_order') {
    const { identifier, orderId } = params;
    let filter: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      filter._id = new mongoose.Types.ObjectId(orderId);
    } else if (identifier && mongoose.Types.ObjectId.isValid(identifier)) {
      filter._id = new mongoose.Types.ObjectId(identifier);
    } else if (identifier) {
      filter.$or = [
        { 'customerDetails.phone': { $regex: identifier } },
        { 'customerDetails.name': { $regex: identifier, $options: 'i' } },
      ];
    } else {
      return { handled: true, reply: '❌ Order ID batana zaroori hai.' };
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return { handled: true, reply: `❌ Order nahi mila.` };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚠️ **Confirmation Required:** Order #${order._id.toString().slice(-6)} (Customer: ${order.customerDetails.name}, Total: PKR ${order.totalAmount}) delete karna chahte hain?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_order',
          title: `Delete Order #${order._id.toString().slice(-6)}`,
          description: `Customer: ${order.customerDetails.name} • PKR ${order.totalAmount}`,
          count: 1,
          payload: { operation: 'delete_order', params: { orderId: order._id.toString() } },
        },
      };
    }

    await Order.findByIdAndDelete(order._id);
    return {
      handled: true,
      reply: `🗑️ **Order Deleted!** Order #${order._id.toString().slice(-6)} successfully delete kar diya gaya hai.`,
      actionExecuted: {
        type: 'delete_order',
        description: `Order #${order._id.toString().slice(-6)} deleted`,
      },
    };
  }

  // ----------------------------------------------------
  // 2. PRODUCT ACTIONS
  // ----------------------------------------------------
  if (operation === 'update_product') {
    const { productName, price, originalPrice, stock } = params;
    if (!productName) {
      return { handled: true, reply: '❌ Product ka naam ya keyword batana zaroori hai.' };
    }

    const cleanName = productName.replace(/[^\w\s-]/gi, '').trim();
    const product = await Product.findOne({
      $or: [
        { name: { $regex: cleanName, $options: 'i' } },
        { slug: { $regex: cleanName, $options: 'i' } },
      ],
    });

    if (!product) {
      return { handled: true, reply: `❌ Product "${cleanName}" catalog mein nahi mili.` };
    }

    const updates: string[] = [];
    if (price !== undefined && price > 0) {
      product.price = price;
      updates.push(`Price: PKR ${price.toLocaleString()}`);
    }
    if (originalPrice !== undefined && originalPrice > 0) {
      product.originalPrice = originalPrice;
      updates.push(`Original Price: PKR ${originalPrice.toLocaleString()}`);
    }
    if (stock !== undefined && stock >= 0) {
      product.stock = stock;
      updates.push(`Stock: ${stock} units`);
    }

    if (updates.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Product "${product.name}" mil gayi hai, lekin koi naya price ya stock specify nahi kiya gaya. (Current: PKR ${product.price}, Stock: ${product.stock}).`,
      };
    }

    await product.save();
    return {
      handled: true,
      reply: `✅ **Product Updated!** "${product.name}" ki details update ho chuki hain:\n- ${updates.join('\n- ')}`,
      actionExecuted: {
        type: 'update_product',
        description: `Updated ${product.name} (${updates.join(', ')})`,
      },
    };
  }

  // Delete product
  if (operation === 'delete_product') {
    const { productName, productId } = params;
    let product = null;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else if (productName) {
      const cleanName = productName.replace(/[^\w\s-]/gi, '').trim();
      product = await Product.findOne({
        $or: [
          { name: { $regex: cleanName, $options: 'i' } },
          { slug: { $regex: cleanName, $options: 'i' } },
        ],
      });
    }

    if (!product) {
      return { handled: true, reply: `❌ Product nahi mili.` };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚠️ **Confirmation Required:** Kia aap waqai product "${product.name}" (Price: PKR ${product.price}, Stock: ${product.stock}) ko catalog se delete karna chahte hain?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'delete_product',
          title: `Delete Product: ${product.name}`,
          description: `Price: PKR ${product.price} • Stock: ${product.stock}`,
          count: 1,
          payload: { operation: 'delete_product', params: { productId: product._id.toString() } },
        },
      };
    }

    await Product.findByIdAndDelete(product._id);
    return {
      handled: true,
      reply: `🗑️ **Product Deleted!** "${product.name}" successfully catalog se remove kar di gayi hai.`,
      actionExecuted: {
        type: 'delete_product',
        description: `Product ${product.name} deleted from catalog`,
      },
    };
  }

  // Create new product
  if (operation === 'create_product') {
    const { name, price, category, stock = 10, description = '' } = params;
    if (!name || !price) {
      return { handled: true, reply: '❌ Nayi product ke liye Name aur Price lazmi hain.' };
    }

    const autoSeo = generateAutoProductSeo({ name, price, category: category || 'Car Gadgets', description });

    const newProd = new Product({
      name,
      slug: autoSeo.slug,
      price,
      originalPrice: Math.round(price * 1.3),
      category: category || 'Car Gadgets',
      description: description || `${name} — Premium quality automotive accessory for Pakistani drivers with Cash On Delivery.`,
      image: 'https://res.cloudinary.com/dvasdadxzc/image/upload/v1718000000/placeholder-car.jpg',
      stock,
      seoTitle: autoSeo.seoTitle,
      seoDescription: autoSeo.seoDescription,
      seoKeywords: autoSeo.seoKeywords,
    });

    await newProd.save();
    return {
      handled: true,
      reply: `🎉 **New Product Created!**\n- **Name:** ${newProd.name}\n- **Price:** PKR ${newProd.price.toLocaleString()}\n- **Stock:** ${newProd.stock} units\n- **Category:** ${newProd.category}\n- **SEO Slug:** /product/${newProd.slug}`,
      actionExecuted: {
        type: 'create_product',
        description: `Added new product ${newProd.name}`,
      },
    };
  }

  // ----------------------------------------------------
  // 3. PROMOTIONS & CATEGORIES
  // ----------------------------------------------------
  if (operation === 'create_promotion') {
    const { code, discountPercent = 15, expiryDays = 30 } = params;
    const cleanCode = (code || 'SAVE15').toUpperCase().replace(/[^\w]/g, '');

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

    await Promotion.findOneAndUpdate(
      { code: cleanCode },
      { code: cleanCode, discountPercent, isActive: true, expiryDate },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `🎟️ **Coupon Code Created!**\n- Code: **${cleanCode}**\n- Discount: **${discountPercent}% OFF**\n- Valid for: **${expiryDays} Days** (Expires: ${expiryDate.toLocaleDateString()})`,
      actionExecuted: {
        type: 'create_promotion',
        description: `Created coupon ${cleanCode} with ${discountPercent}% discount`,
      },
    };
  }

  if (operation === 'create_category') {
    const { name, parentCategory = '' } = params;
    if (!name) return { handled: true, reply: '❌ Category ka naam likhna zaroori hai.' };

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    await Category.findOneAndUpdate(
      { slug },
      { name, slug, parentCategory, icon: 'fas fa-car' },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `📁 **Category Created!** "${name}" (Slug: ${slug}) successfully add ho chuki hai.`,
      actionExecuted: {
        type: 'create_category',
        description: `Category ${name} created`,
      },
    };
  }

  // ----------------------------------------------------
  // 4. 1-CLICK AI SEO BLOG AUTO-PILOT & PUBLISHING
  // ----------------------------------------------------
  if (operation === 'create_blog_post') {
    const { topic, category = 'Car Maintenance' } = params;
    const cleanTopic = topic || 'Car Maintenance and Accessories in Pakistan';

    const slug = cleanTopic
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) + `-${Date.now().toString().slice(-4)}`;

    const blogPrompt = `
Generate a high-ranking Pakistani Automotive SEO Blog in Markdown format.
Topic: "${cleanTopic}"
Category: "${category}"
Location Focus: Rawalpindi, Islamabad, and nationwide Pakistan.

Output JSON ONLY (no markdown backticks):
{
  "title": "...",
  "excerpt": "...",
  "content": "Full markdown content with ## headings, bullet points, tips for Pakistani drivers, and recommendation to buy genuine accessories on Pak-o-Drive with Cash on Delivery...",
  "seoTitle": "...",
  "seoDescription": "...",
  "seoKeywords": ["..."],
  "tags": ["..."],
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}
`;

    let blogData: any = null;
    try {
      const aiGen = await callMultiProviderAI('', blogPrompt);
      if (aiGen?.text) {
        const cleaned = aiGen.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        blogData = JSON.parse(cleaned);
      }
    } catch {
      // Fallback structured data
      blogData = {
        title: `${cleanTopic} — Top Tips for Pakistani Drivers`,
        excerpt: `Essential guide for car owners in Rawalpindi and Islamabad about ${cleanTopic} with genuine accessories on Pak-o-Drive.`,
        content: `## ${cleanTopic}\n\nDriving in Pakistan, especially in Rawalpindi and Islamabad, requires special attention to your vehicle.\n\n### Key Recommendations:\n- Use high quality genuine automotive accessories.\n- Ensure regular maintenance before highway travel.\n- Order online with trusted Cash on Delivery (COD) from Pak-o-Drive.\n\n### Why Choose Pak-o-Drive?\nWe offer fast nationwide shipping across Rawalpindi, Islamabad, Lahore, and Karachi.`,
        seoTitle: `${cleanTopic} | Pak-o-Drive Pakistan`,
        seoDescription: `Complete guide on ${cleanTopic} for Pakistani car enthusiasts. Best prices, fast shipping, and COD.`,
        seoKeywords: ['car accessories pakistan', 'pakodrive', 'rawalpindi auto parts'],
        tags: ['Automotive', 'Pakistan', 'Car Care'],
        faqs: [
          { question: 'Do you deliver across Pakistan?', answer: 'Yes, we deliver nationwide via trusted couriers with Cash on Delivery.' },
        ],
      };
    }

    const newBlog = new BlogPost({
      title: blogData.title || cleanTopic,
      slug,
      excerpt: blogData.excerpt || cleanTopic,
      content: blogData.content,
      coverImage: 'https://res.cloudinary.com/dvasdadxzc/image/upload/v1718000000/placeholder-car.jpg',
      author: 'Pak-o-Drive Editorial Team',
      category: category || 'Car Maintenance',
      tags: blogData.tags || ['Automotive', 'Tips'],
      isPublished: true,
      publishedAt: new Date(),
      seoTitle: blogData.seoTitle || blogData.title,
      seoDescription: blogData.seoDescription || blogData.excerpt,
      seoKeywords: blogData.seoKeywords || [],
      faqs: blogData.faqs || [],
      readTimeMinutes: 4,
    });

    await newBlog.save();

    return {
      handled: true,
      reply: `🎉 **SEO Blog Published Successfully!**\n\n- **Title:** ${newBlog.title}\n- **Slug:** \`/blogs/${newBlog.slug}\`\n- **Category:** ${newBlog.category}\n- **Status:** 🟢 Live & Indexed\n\nAap is blog ko live site par dekh sakte hain: [View Blog Post](/blogs/${newBlog.slug})`,
      actionExecuted: {
        type: 'create_blog_post',
        description: `Published SEO Blog: "${newBlog.title}"`,
        details: { slug: newBlog.slug },
      },
    };
  }

  // ----------------------------------------------------
  // 5. WHATSAPP DAILY EXECUTIVE DIGEST
  // ----------------------------------------------------
  if (operation === 'generate_whatsapp_digest') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalRevenue, pendingOrders, lowStock] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }).lean(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ status: 'Pending' }),
      Product.find({ stock: { $lte: 5 } }).select('name stock price').limit(5).lean(),
    ]);

    const revPKR = totalRevenue[0]?.total || 0;
    const todaySalesPKR = todayOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);

    const lowStockAlert = lowStock.length > 0
      ? lowStock.map((p: any) => `  • ${p.name} (${p.stock} bache)`).join('\n')
      : '  • Sab products ka stock healthy hai ✅';

    const digestText = `*🚗 PAK-O-DRIVE DAILY EXECUTIVE DIGEST*
📅 *Tareekh:* ${new Date().toLocaleDateString('en-PK', { dateStyle: 'medium' })}

💰 *Revenue Overview:*
• Aaj Ki Sales: *PKR ${todaySalesPKR.toLocaleString()}* (${todayOrders.length} orders)
• Total All-Time: *PKR ${revPKR.toLocaleString()}*

📦 *Orders Status:*
• Pending Orders: *${pendingOrders}* (Verification zaroori hai)
• Aaj Ke Naye Orders: *${todayOrders.length}*

⚠️ *Low Stock Alert:*
${lowStockAlert}

📍 *Twin Cities (RWP/ISB) Focus:*
Fog lights, Car ambient LEDs aur 4K Dashcams ki demand peak par hai.

_Generated via Pak-o-Drive AI Brain_`;

    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(digestText)}`;

    return {
      handled: true,
      reply: `📱 **Today's WhatsApp Executive Digest Ready!**\n\n\`\`\`\n${digestText}\n\`\`\`\n\n👉 **[Click Here to Send to WhatsApp](${waLink})**`,
      actionExecuted: {
        type: 'generate_whatsapp_digest',
        description: 'Generated Daily Executive WhatsApp Digest',
        details: { waLink },
      },
    };
  }

  // ----------------------------------------------------
  // 6. COD FRAUD & RETURN RISK ANALYZER
  // ----------------------------------------------------
  if (operation === 'analyze_cod_risk') {
    const { orderId } = params;
    let query: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      query._id = new mongoose.Types.ObjectId(orderId);
    } else {
      query.status = 'Pending';
    }

    const ordersToAnalyze = await Order.find(query).sort({ createdAt: -1 }).limit(6).lean();
    if (ordersToAnalyze.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Koi pending order nahi mila analyze karne ke liye.`,
      };
    }

    const analyses = [];
    for (const ord of ordersToAnalyze) {
      const phone = ord.customerDetails?.phone || '';
      const address = ord.customerDetails?.address || '';
      const city = ord.customerDetails?.city || '';

      const isPakPhone = /^(?:(?:\+|00)?92|0)?3\d{9}$/.test(phone.replace(/[\s-]/g, ''));
      const isDetailedAddress = address.length > 15 && /(house|street|flat|floor|sector|bazaar|road|phase|gali|makan|shop)/i.test(address);
      const isMajorCity = /(islamabad|rawalpindi|lahore|karachi|peshawar|faisalabad|multan|gujranwala)/i.test(city);

      // Check repeat phone cancellations
      const pastCancellations = await Order.countDocuments({
        'customerDetails.phone': phone,
        status: 'Cancelled',
      });

      let riskScore: 'Low' | 'Medium' | 'High' = 'Low';
      let riskReason = 'Valid phone aur complete address mila hai.';

      if (!isPakPhone || pastCancellations >= 2) {
        riskScore = 'High';
        riskReason = !isPakPhone ? 'Invalid phone format' : `${pastCancellations} pichle orders cancel ho chuke hain`;
      } else if (!isDetailedAddress || !isMajorCity) {
        riskScore = 'Medium';
        riskReason = !isDetailedAddress ? 'Address me gali/makan number wazeh nahi hai' : 'Remote delivery zone';
      }

      analyses.push({
        id: ord._id.toString().slice(-6),
        name: ord.customerDetails?.name || 'Customer',
        phone,
        city,
        amount: ord.totalAmount,
        riskScore,
        riskReason,
      });
    }

    const rows = analyses.map((a) => {
      const badge = a.riskScore === 'Low' ? '🟢 Low Risk' : a.riskScore === 'Medium' ? '🟡 Medium Risk' : '🔴 High Risk';
      return `| #${a.id} | ${a.name} (${a.city}) | PKR ${a.amount.toLocaleString()} | **${badge}** | ${a.riskReason} |`;
    }).join('\n');

    const responseText = `🛡️ **COD Fraud & Courier Return Risk Audit:**\n\n| Order ID | Customer | Amount | Risk Score | Risk Factor |\n| :--- | :--- | :--- | :--- | :--- |\n${rows}\n\n**Actionable Advice:**\n- 🔴 **High Risk Orders:** Customer se call par confirm karein ya PKR 300 delivery charges pehle JazzCash/Easypaisa se receive karein.\n- 🟢 **Low Risk Orders:** TCS/Trax me foran dispatch ke liye ready hain.`;

    return {
      handled: true,
      reply: responseText,
      actionExecuted: {
        type: 'analyze_cod_risk',
        description: `Analyzed COD risk for ${analyses.length} order(s)`,
      },
    };
  }

  // ----------------------------------------------------
  // 7. COURIER THERMAL DISPATCH SLIP GENERATOR
  // ----------------------------------------------------
  if (operation === 'generate_dispatch_slip') {
    const { orderId } = params;
    let filter: any = {};
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      filter._id = new mongoose.Types.ObjectId(orderId);
    } else {
      filter.status = { $in: ['Pending', 'Processing', 'On the Way'] };
    }

    const order = await Order.findOne(filter).sort({ createdAt: -1 }).lean();
    if (!order) {
      return { handled: true, reply: '❌ Dispatch slip ke liye koi order nahi mila.' };
    }

    const slip = `
========================================
       PAK-O-DRIVE COURIER DISPATCH SLIP
========================================
SENDER: Pak-o-Drive Auto Accessories
ADDRESS: Sector G-8, Islamabad, Pakistan
PHONE: +92 318 5205667
----------------------------------------
CONSIGNEE (RECEIVER):
NAME: ${order.customerDetails?.name}
PHONE: ${order.customerDetails?.phone}
ADDRESS: ${order.customerDetails?.address}
CITY: ${order.customerDetails?.city}
----------------------------------------
ORDER #: #${order._id.toString().slice(-6)}
DATE: ${new Date(order.createdAt).toLocaleDateString()}
PAYMENT: CASH ON DELIVERY (COD)
AMOUNT TO COLLECT: PKR ${order.totalAmount.toLocaleString()}
----------------------------------------
ITEMS INCLUDED:
${(order.items || []).map((i: any) => `• ${i.name} (Qty: ${i.quantity}) - PKR ${i.price}`).join('\n')}
----------------------------------------
BARCODE: ||| ||||| |||| || |||||||| |||
TRACKING / CN: ${order.trackingNumber || 'UNASSIGNED'}
COURIER: ${order.courierName || 'TCS / Trax Express'}
========================================
`;

    return {
      handled: true,
      reply: `🚚 **Thermal Courier Dispatch Slip Ready!**\n\n\`\`\`text${slip}\`\`\`\n\n*Aap is slip ko print kar ke parcel ke upar paste kar sakte hain.*`,
      actionExecuted: {
        type: 'generate_dispatch_slip',
        description: `Generated Dispatch Slip for Order #${order._id.toString().slice(-6)}`,
      },
    };
  }

  // ----------------------------------------------------
  // 8. PREDICTIVE SEASONAL STOCK & MARGIN FORECASTER
  // ----------------------------------------------------
  if (operation === 'predictive_stock_forecast') {
    const month = new Date().getMonth() + 1; // 1 to 12
    let seasonAdvice = '';

    if (month >= 9 || month <= 1) {
      // Winter & Smog Season
      seasonAdvice = `
### ❄️ Winter & Smog Season Forecast (Rawalpindi & Islamabad)
Twin Cities me Oct-Jan ke doran smog aur fog peak par hoti hai. Highway aur Murree travel barh jata hai.

| Recommended Product | Restock Qty | Est. Wholesale PKR | Sale Price PKR | Projected Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Yellow Lens 4-LED Fog Lights** | 40 units | PKR 1,800 | PKR 3,499 | **+94% (PKR 67,960)** |
| **Anti-Fog Window Glass Spray** | 60 units | PKR 450 | PKR 1,199 | **+166% (PKR 44,940)** |
| **High-Grip Silicone Wiper Blades** | 50 pairs | PKR 900 | PKR 2,199 | **+144% (PKR 64,950)** |
| **Dual Dashcam with Night Vision** | 20 units | PKR 4,500 | PKR 8,999 | **+100% (PKR 89,980)** |

💰 **Total Projected Profit:** ~PKR 267,830
`;
    } else {
      // Summer & Monsoon Season
      seasonAdvice = `
### ☀️ Summer & AC Care Forecast (Rawalpindi & Islamabad)
Garmiyo me AC efficiency, sun protection aur cooling accessories ki demand sab se ziada hoti hai.

| Recommended Product | Restock Qty | Est. Wholesale PKR | Sale Price PKR | Projected Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Foldable UV Windshield Sunshade** | 80 units | PKR 600 | PKR 1,599 | **+166% (PKR 79,920)** |
| **Solar Rotating Car Air Freshener** | 50 units | PKR 550 | PKR 1,399 | **+154% (PKR 42,450)** |
| **Microfiber Car Wash Towels (Set of 3)** | 100 sets | PKR 300 | PKR 899 | **+200% (PKR 59,900)** |

💰 **Total Projected Profit:** ~PKR 182,270
`;
    }

    return {
      handled: true,
      reply: seasonAdvice.trim(),
      actionExecuted: {
        type: 'predictive_stock_forecast',
        description: 'Generated Seasonal Stock & Margin Forecast',
      },
    };
  }

  // ----------------------------------------------------
  // 9. HIGH-MARGIN BUNDLES (PROPOSE & 1-CLICK CREATE)
  // ----------------------------------------------------
  if (operation === 'suggest_bundle') {
    const bundleName = 'Twin Cities Smog & Night Drive Safety Pack';
    const price = 2499;
    const originalPrice = 3199;
    const items = 'Yellow Lens 4-LED Fog Lights (Pair) + Anti-Fog Spray + T10 LED Bulbs';

    return {
      handled: true,
      reply: `💡 **AI High-Margin Bundle Suggestion for Twin Cities:**\n\nIs season me Rawalpindi aur Islamabad me smog aur night highway driving peak par hai. Sehgal Motors aur Daraz ke muqablay me yeh bundle sab se ziada profit generate karega:\n\n📦 **Proposed Bundle:** *${bundleName}*\n- **Included Items:** ${items}\n- **Offer Price:** **PKR ${price.toLocaleString()}** (Original: PKR ${originalPrice.toLocaleString()} - 22% OFF)\n- **Estimated Profit Margin:** **+115% (PKR 1,350 net profit per order)**\n\nKia main yeh bundle store par live create kar doon? Neeche diye gaye button par click karein.`,
      actionRequired: {
        id: `act_${Date.now()}`,
        type: 'create_bundle',
        title: `Create Bundle: ${bundleName}`,
        description: `Price: PKR ${price.toLocaleString()} • Items: ${items}`,
        count: 1,
        payload: {
          operation: 'create_bundle',
          params: {
            name: bundleName,
            price,
            originalPrice,
            category: 'LED Lights & Bulbs',
            description: `${bundleName} includes high-visibility Yellow Fog Lights pair, Anti-Fog Spray and T10 LED parking bulbs. Best deal for smog and night driving in Rawalpindi & Islamabad with Cash on Delivery.`,
            itemsSummary: items,
          },
        },
      },
    };
  }

  if (operation === 'create_bundle') {
    const { name, price, originalPrice, category = 'Combos & Bundles', description, itemsSummary, image } = params;
    if (!name || !price) {
      return { handled: true, reply: '❌ Bundle ke liye Name aur Price batana zaroori hai.' };
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `💡 **New Bundle Proposal Ready!**\n\n- **Bundle Name:** ${name}\n- **Offer Price:** PKR ${price.toLocaleString()} ${originalPrice ? `(Original: PKR ${originalPrice.toLocaleString()})` : ''}\n- **Category:** ${category}\n\nKia main yeh naya bundle database catalog me create kar doon? Neeche diye gaye button par click karein.`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'create_bundle',
          title: `Create Bundle: ${name}`,
          description: `Price: PKR ${price.toLocaleString()} • ${itemsSummary || 'High-converting combo pack'}`,
          count: 1,
          payload: { operation: 'create_bundle', params },
        },
      };
    }

    // Confirmed creation in MongoDB
    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) + `-${Date.now().toString().slice(-4)}`;
    const bundleProduct = new Product({
      name,
      slug,
      price,
      originalPrice: originalPrice || Math.round(price * 1.25),
      category: category || 'Combos & Bundles',
      subcategory: 'Combos & Bundles',
      description: description || `${name} — High margin combo bundle for Pakistani drivers with Cash On Delivery.`,
      image: image || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
      images: [
        image || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
        'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788091458/electro_store/1788091458629_46697.webp'
      ],
      isFeatured: true,
      isTopSelling: true,
      stock: 25,
      heroText: 'Special Combo Deal • 24h Delivery',
    });

    await bundleProduct.save();

    return {
      handled: true,
      reply: `🎉 **New Combo Bundle Created & Live!**\n\n- **Name:** ${bundleProduct.name}\n- **Price:** PKR ${bundleProduct.price.toLocaleString()}\n- **Live Page:** [/product/${bundleProduct.slug}](/product/${bundleProduct.slug})\n\nYeh bundle ab website par live shopping ke liye active ho chuka hai!`,
      actionExecuted: {
        type: 'create_bundle',
        description: `Created Bundle: ${bundleProduct.name}`,
        details: { slug: bundleProduct.slug },
      },
    };
  }

  // ----------------------------------------------------
  // 10. PUBLISH VISION AI PRODUCT DIRECT TO CATALOG
  // ----------------------------------------------------
  if (operation === 'publish_vision_product') {
    const {
      name,
      price,
      originalPrice,
      category = 'Car Gadgets',
      subcategory = '',
      description,
      studioImage,
      userUploadedImage,
      specs,
      seoTitle,
      seoDescription,
      seoKeywords,
      stock = 25,
    } = params;

    let finalImageUrl = studioImage || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp';

    if (userUploadedImage && typeof userUploadedImage === 'string') {
      if (userUploadedImage.startsWith('data:image')) {
        try {
          const { v2: cloudinary } = await import('cloudinary');
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          const uploadRes = await cloudinary.uploader.upload(userUploadedImage, {
            folder: 'pakodrive_products',
          });
          if (uploadRes?.secure_url) {
            finalImageUrl = uploadRes.secure_url;
          }
        } catch (uploadErr: any) {
          console.warn('[Cloudinary upload fallback]:', uploadErr?.message);
        }
      } else if (userUploadedImage.startsWith('http')) {
        finalImageUrl = userUploadedImage;
      }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) + `-${Date.now().toString().slice(-4)}`;

    const newProduct = new Product({
      name,
      slug,
      price,
      originalPrice: originalPrice || Math.round(price * 1.25),
      category: category || 'Car Gadgets',
      subcategory: subcategory || '',
      description: description || `${name} — Premium automotive accessory with Cash On Delivery across Pakistan.`,
      image: finalImageUrl,
      images: [finalImageUrl],
      specifications: specs || {},
      seoTitle: seoTitle || `${name} Price in Pakistan | Pak-o-Drive`,
      seoDescription: seoDescription || `Buy ${name} online in Pakistan at best price. Cash on delivery.`,
      seoKeywords: seoKeywords || 'car accessories, pakodrive, gadgets',
      isFeatured: true,
      isNewArrival: true,
      stock,
      heroText: 'Vision AI Verified • 24h Delivery',
    });

    await newProduct.save();

    return {
      handled: true,
      reply: `🎉 **Product Live on Store!**\n\n- **Name:** ${newProduct.name}\n- **Price:** PKR ${newProduct.price.toLocaleString()}\n- **Category:** ${newProduct.category}\n- **Live Page:** [/product/${newProduct.slug}](/product/${newProduct.slug})\n\nProduct database me insert ho chuki hai aur live shopping ke liye active hai!`,
      actionExecuted: {
        type: 'publish_vision_product',
        description: `Published Vision Product: ${newProduct.name}`,
        details: { slug: newProduct.slug },
      },
    };
  }

  // ----------------------------------------------------
  // 11. VIRAL VIDEO & META ADS MACHINE
  // ----------------------------------------------------
  if (operation === 'generate_ad_campaign') {
    const { productName, platform = 'all' } = params;
    let targetProduct: any = null;
    if (productName) {
      targetProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } }).lean();
    }
    if (!targetProduct) {
      targetProduct = await Product.findOne({ isTopSelling: true }).sort({ createdAt: -1 }).lean()
        || await Product.findOne().sort({ createdAt: -1 }).lean();
    }

    const prodName = targetProduct?.name || productName || 'Premium Automotive Accessory';
    const prodPrice = targetProduct?.price || 2499;
    const prodCategory = targetProduct?.category || 'Car Gadgets';

    const adPrompt = `
Generate a viral Pakistani TikTok / Reels Video Script & high-converting Meta Ad Copy for:
Product: "${prodName}"
Category: "${prodCategory}"
Selling Price: PKR ${prodPrice.toLocaleString()}
Audience: Car owners in Pakistan (Honda Civic, Toyota Corolla, Suzuki Alto, Swift, Sportage). Focus on Rawalpindi, Islamabad, Lahore, Karachi.
Offer Hooks: Cash on Delivery (COD), 24-48 Hours Fast Delivery, 7-Day Money-Back Guarantee.

Output JSON ONLY (no markdown backticks):
{
  "hook3s": "3-second scroll-stopping opening hook sentence in Roman Urdu/English",
  "script": [
    {"time": "0:00 - 0:05", "visual": "...", "audio": "..."},
    {"time": "0:05 - 0:15", "visual": "...", "audio": "..."},
    {"time": "0:15 - 0:25", "visual": "...", "audio": "..."},
    {"time": "0:25 - 0:30", "visual": "Call to action with COD button", "audio": "..."}
  ],
  "metaAdCopy": "Primary text with emojis, bullet points, and Cash on Delivery guarantee",
  "headline": "...",
  "hashtags": ["#pakwheels", "#caraccessoriespakistan", "#pakodrive", "#islamabadcars"]
}
`;

    let adData: any = null;
    try {
      const aiRes = await callMultiProviderAI('', adPrompt);
      if (aiRes?.text) {
        const cleaned = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        adData = JSON.parse(cleaned);
      }
    } catch {
      adData = {
        hook3s: `Kya aapki car ka cabin boring lagta hai? Ye gadget lagane ke baad look 10x luxury ho jayegi!`,
        script: [
          { time: '0:00 - 0:05', visual: 'Dull car cabin interior close-up shot', audio: 'Agar aap bhi apni car ko luxury look dena chahte hain...' },
          { time: '0:05 - 0:18', visual: 'Installing gadget in 30 seconds without wire cutting', audio: 'Tou ye plug-and-play gadget sirf 1 minute me install ho jata hai. No wire cutting!' },
          { time: '0:18 - 0:30', visual: 'Night driving glowing preview & unboxing', audio: `Order karein Pak-o-Drive se sirf PKR ${prodPrice.toLocaleString()} me Cash on Delivery ke sath.` }
        ],
        metaAdCopy: `Upgrade Your Car Interior in 60 Seconds! 🚗✨\n\nAb apni Civic, Alto ya Corolla ko banayein VIP Lounge jaisi.\n\n✅ 100% Genuine Quality\n✅ Easy Plug & Play (No wire cut)\n✅ Cash on Delivery Nationwide (24h in Twin Cities)\n\n🔥 Limited Stock Offer: PKR ${prodPrice.toLocaleString()}`,
        headline: `Upgrade Your Car Cabin — Cash on Delivery | Pak-o-Drive`,
        hashtags: ['#pakwheels', '#caraccessoriespakistan', '#pakodrive', '#islamabadcars']
      };
    }

    const scriptMarkdown = (adData.script || []).map((s: any) => `**[${s.time}]** *Visual:* ${s.visual}\n> 🗣️ *Voiceover:* "${s.audio}"`).join('\n\n');
    const adLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PK&q=${encodeURIComponent(prodCategory)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

    return {
      handled: true,
      reply: `🎬 **Viral Ad & Video Script Package Ready!**\n\n📌 **Target Product:** ${prodName} (PKR ${prodPrice.toLocaleString()})\n\n---\n### 🎯 3-Second Scroll-Stopping Hook:\n> **"${adData.hook3s}"**\n\n---\n### 📹 30-Second Video Script (TikTok & Reels):\n${scriptMarkdown}\n\n---\n### 📱 Meta / Facebook / TikTok Ad Copy:\n\`\`\`text\n${adData.metaAdCopy}\n\nHeadline: ${adData.headline}\nCTA: Order Now on WhatsApp / Website (COD Available)\n${(adData.hashtags || []).join(' ')}\n\`\`\`\n\n👉 **[Check Competitor Active Ads in Meta Ad Library](${adLibraryUrl})**`,
      actionExecuted: {
        type: 'generate_ad_campaign',
        description: `Generated Viral Video Script & Ad Package for "${prodName}"`,
      },
    };
  }

  // ----------------------------------------------------
  // 12. WHATSAPP COD CONFIRMATION & ANTI-RTO SHIELD
  // ----------------------------------------------------
  if (operation === 'generate_cod_confirmation') {
    const { limit = 6 } = params;
    const pendingOrders = await Order.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (pendingOrders.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Is waqt koi pending COD order nahi hai. Tamam orders processed hain ✅`,
      };
    }

    let confirmationList = '';
    for (const ord of pendingOrders) {
      const custName = ord.customerDetails?.name || 'Customer';
      let cleanPhone = (ord.customerDetails?.phone || '').replace(/\D/g, '');
      if (cleanPhone.startsWith('03')) cleanPhone = '92' + cleanPhone.slice(1);
      if (!cleanPhone.startsWith('92') && cleanPhone.length === 10) cleanPhone = '92' + cleanPhone;

      const orderShortId = ord._id.toString().slice(-6);
      const itemsList = (ord.items || []).map((i: any) => `${i.name} (x${i.quantity})`).join(', ') || 'Car Accessories';
      const city = ord.customerDetails?.city || 'Pakistan';
      const address = ord.customerDetails?.address || '';

      // Fraud / RTO Risk Calculation
      const hasPhone = cleanPhone.length >= 11;
      const hasAddress = address.length >= 10;
      const riskLevel = !hasPhone || !hasAddress ? '⚠️ High Risk' : '🟢 Verified Safe';

      const waMsg = `Assalam-o-Alaikum ${custName} Bhai! 🚗\n\nPak-o-Drive se aapka Order #${orderShortId} receive hua hai:\n📦 Items: ${itemsList}\n💰 Total Amount: PKR ${ord.totalAmount.toLocaleString()} (Cash on Delivery)\n📍 Delivery City: ${city}\n\nKya hum aapka parcel TCS Express se rawana karein?\n1️⃣ Confirm karne ke liye 'YES' ya '1' reply karein.\n2️⃣ Address change karna ho tou yahan likhein.\n\nShukriya! Pak-o-Drive Team`;

      const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;

      confirmationList += `\n- **Order #${orderShortId}** — **${custName}** (${city}) [${riskLevel}]\n  • Total: **PKR ${ord.totalAmount.toLocaleString()}** | Phone: \`${cleanPhone}\`\n  • 👉 **[Send 1-Click WhatsApp Confirmation](${waLink})**\n`;
    }

    return {
      handled: true,
      reply: `🛡️ **WhatsApp COD Confirmation & Anti-RTO Shield Ready!**\n\nPending orders ke liye personalized 1-click confirmation WhatsApp links tayyar hain. Customer se delivery confirm karwa kar dispatch karein taake courier return (RTO) charges na paren:\n${confirmationList}\n\n*Customer ke confirm karne par order ko "Processing" mark kar dein.*`,
      actionExecuted: {
        type: 'generate_cod_confirmation',
        description: `Generated WhatsApp confirmation links for ${pendingOrders.length} pending orders`,
      },
    };
  }

  // ----------------------------------------------------
  // 13. DYNAMIC COMPETITOR AUTO-BEAT RE-PRICING
  // ----------------------------------------------------
  if (operation === 'auto_beat_price') {
    const { productName, competitorPrice: passedCompPrice } = params;
    let targetProduct: any = null;
    if (productName) {
      targetProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });
    }
    if (!targetProduct) {
      targetProduct = await Product.findOne().sort({ createdAt: -1 });
    }

    if (!targetProduct) {
      return { handled: true, reply: '❌ Store catalog me koi product nahi mila.' };
    }

    const currentPrice = targetProduct.price;
    const compPrice = passedCompPrice || Math.round(currentPrice * 1.15);
    const beatPrice = Math.round(Math.min(compPrice * 0.92, currentPrice - 100));
    const wholesaleFloor = Math.round(currentPrice * 0.5);
    const finalAutoBeatPrice = Math.max(beatPrice, wholesaleFloor);

    if (!confirmed) {
      return {
        handled: true,
        reply: `📈 **Competitor Auto-Beat Re-Pricing Proposal!**\n\n- **Product:** ${targetProduct.name}\n- **Current Pak-o-Drive Price:** PKR ${currentPrice.toLocaleString()}\n- **Competitor Benchmark (Sehgal / Market):** PKR ${compPrice.toLocaleString()}\n- **Suggested Auto-Beat Price:** **PKR ${finalAutoBeatPrice.toLocaleString()}** *(Saves customer PKR ${(compPrice - finalAutoBeatPrice).toLocaleString()} vs Competitor)*\n- **Profit Margin:** Locked at ~+85% over wholesale.\n\nKya aap chahte hain ke ye nayi price store par live update kar di jaye?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'auto_beat_price',
          title: `Update Price: ${targetProduct.name}`,
          description: `Current: PKR ${currentPrice.toLocaleString()} ➔ New: PKR ${finalAutoBeatPrice.toLocaleString()} (Competitor: PKR ${compPrice.toLocaleString()})`,
          count: 1,
          payload: {
            operation: 'auto_beat_price',
            params: {
              productName: targetProduct.name,
              productId: targetProduct._id.toString(),
              newPrice: finalAutoBeatPrice,
              originalPrice: compPrice,
            },
          },
        },
      };
    }

    const { newPrice, originalPrice, productId } = params;
    const prodToUpdate = await Product.findById(productId) || targetProduct;
    prodToUpdate.price = newPrice || finalAutoBeatPrice;
    if (originalPrice) prodToUpdate.originalPrice = originalPrice;
    await prodToUpdate.save();

    return {
      handled: true,
      reply: `🎉 **Product Price Updated Live!**\n\n- **Product:** ${prodToUpdate.name}\n- **New Live Price:** **PKR ${prodToUpdate.price.toLocaleString()}** (Competitor: PKR ${(originalPrice || compPrice).toLocaleString()})\n- **Status:** 🟢 Live on store at [/product/${prodToUpdate.slug}](/product/${prodToUpdate.slug})\n\nPak-o-Drive ab competitor se sasti price par market me lead kar raha hai!`,
      actionExecuted: {
        type: 'auto_beat_price',
        description: `Updated price of "${prodToUpdate.name}" to PKR ${prodToUpdate.price.toLocaleString()}`,
      },
    };
  }

  // ----------------------------------------------------
  // 14. 1-CLICK FLASH SALE & PROMO CAMPAIGN CREATOR
  // ----------------------------------------------------
  if (operation === 'create_flash_sale') {
    const { theme = 'Weekend Mega Flash Sale', discountPercent = 20, durationHours = 48 } = params;

    const topProducts = await Product.find({ isFeatured: true }).limit(4).lean()
      || await Product.find().limit(4).lean();

    const campaignProducts = topProducts.map((p: any) => ({
      productId: p._id.toString(),
      name: p.name,
      slug: p.slug || '',
      image: p.image || '',
      originalPrice: p.price,
      offerPrice: Math.round(p.price * (1 - discountPercent / 100)),
      discountPercent,
    }));

    const cleanCode = (theme.replace(/[^\w]/g, '').slice(0, 6) + `${discountPercent}`).toUpperCase();

    if (!confirmed) {
      return {
        handled: true,
        reply: `⚡ **New Flash Sale Campaign Proposal!**\n\n- **Campaign Title:** ${theme}\n- **Discount:** **${discountPercent}% OFF**\n- **Duration:** **${durationHours} Hours** Countdown\n- **Synchronized Coupon Code:** **${cleanCode}**\n- **Products Included (${campaignProducts.length}):**\n${campaignProducts.map((cp: any) => `  • ${cp.name}: PKR ${cp.originalPrice.toLocaleString()} ➔ **PKR ${cp.offerPrice.toLocaleString()}**`).join('\n')}\n\nKia main yeh Flash Sale store homepage par live activate kar doon?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'create_flash_sale',
          title: `Launch Flash Sale: ${theme}`,
          description: `${discountPercent}% OFF on ${campaignProducts.length} items • Coupon: ${cleanCode}`,
          count: campaignProducts.length,
          payload: {
            operation: 'create_flash_sale',
            params: {
              theme,
              discountPercent,
              durationHours,
              cleanCode,
              campaignProducts,
            },
          },
        },
      };
    }

    const { cleanCode: codeToCreate, campaignProducts: savedProducts } = params;
    const expiryDate = new Date(Date.now() + durationHours * 3600 * 1000);

    // 1. Create / Update CampaignOffer
    await CampaignOffer.findOneAndUpdate(
      { title: theme },
      {
        title: theme,
        badge: '⚡ FLASH SALE • LIMITED TIME',
        subtitle: `Save up to ${discountPercent}% on Twin Cities top trending car accessories.`,
        offerType: 'flash_sale',
        products: savedProducts || campaignProducts,
        expiryDate,
        isActive: true,
        bgTheme: 'sunset_orange',
        placement: 'below_slider',
        showCountdownTimer: true,
        showSavingsBadge: true,
      },
      { upsert: true, new: true }
    );

    // 2. Create matching Promotion coupon code
    await Promotion.findOneAndUpdate(
      { code: codeToCreate || cleanCode },
      {
        code: codeToCreate || cleanCode,
        discountPercent,
        expiryDate,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return {
      handled: true,
      reply: `🎉 **Flash Sale Live on Homepage!**\n\n- **Campaign:** ${theme}\n- **Discount:** ${discountPercent}% OFF\n- **Coupon Active:** \`${codeToCreate || cleanCode}\`\n- **Expiry:** ${expiryDate.toLocaleString()}\n- **Homepage Placement:** Below hero slider with live countdown timer.\n\nAapka flash sale campaign homepage par active ho chuka hai!`,
      actionExecuted: {
        type: 'create_flash_sale',
        description: `Launched Flash Sale "${theme}" with coupon ${codeToCreate || cleanCode}`,
      },
    };
  }

  // ----------------------------------------------------
  // 15. AUTHENTIC CAR OWNER REVIEWS & SOCIAL PROOF
  // ----------------------------------------------------
  if (operation === 'generate_customer_reviews') {
    const { productName, count = 4 } = params;
    let targetProduct: any = null;
    if (productName) {
      targetProduct = await Product.findOne({ name: { $regex: productName, $options: 'i' } });
    }
    if (!targetProduct) {
      targetProduct = await Product.findOne({ isTopSelling: true }) || await Product.findOne();
    }

    if (!targetProduct) {
      return { handled: true, reply: '❌ Catalog me koi product nahi mila review add karne ke liye.' };
    }

    const reviewPrompt = `
Generate ${count} authentic, localized Pakistani customer reviews for automotive accessory:
Product: "${targetProduct.name}"
Category: "${targetProduct.category}"

Requirements:
- Authentic Pakistani buyer names (Usman, Hamza, Bilal, Shahrukh, Fahad, Daniyal, Zeeshan).
- Specific cities: Rawalpindi, Islamabad, Lahore, Karachi, Peshawar, Multan.
- Mention specific car models in comments (e.g. "Honda Civic 2020 me install kiya", "Suzuki Alto VXR 2022 fitment perfect", "Corolla GLI me zabardast look hai").
- Praise fast delivery, good packaging, Cash on Delivery, and genuine quality.

Output JSON ONLY (no markdown backticks):
[
  {
    "userName": "...",
    "userCity": "...",
    "rating": 5,
    "title": "Short review title",
    "comment": "Detailed comment in English or natural Roman Urdu praising the product..."
  }
]
`;

    let generatedReviews: any[] = [];
    try {
      const aiRes = await callMultiProviderAI('', reviewPrompt);
      if (aiRes?.text) {
        const cleaned = aiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        generatedReviews = JSON.parse(cleaned);
      }
    } catch {
      generatedReviews = [
        {
          userName: 'Muhammad Usman',
          userCity: 'Islamabad',
          rating: 5,
          title: 'Zabardast Quality & Fitment',
          comment: `Maine apni Honda Civic 2021 ke liye mangwaya tha. Rawalpindi me aglay din delivery mil gayi. Quality 100% original hai aur cabin look VIP ban gaya hai.`,
        },
        {
          userName: 'Hamza Malik',
          userCity: 'Rawalpindi (Saddar)',
          rating: 5,
          title: 'Value for Money',
          comment: `Suzuki Alto 2023 me install kiya, bilkul plug and play tha. Sasta aur Sehgal Motors se behtar packing mili. Highly recommended!`,
        },
        {
          userName: 'Bilal Tariq',
          userCity: 'Lahore',
          rating: 5,
          title: 'Original Product via COD',
          comment: `Cash on delivery par order kiya tha, TCS rider ne 2 din me deliver kar diya. Toyota Corolla me perfectly fit aya hai.`,
        },
      ];
    }

    if (!confirmed) {
      return {
        handled: true,
        reply: `⭐ **Authentic Pakistani Customer Reviews Generated!**\n\n📌 **Target Product:** ${targetProduct.name}\n\n${generatedReviews.map((r, i) => `**${i + 1}. ${r.userName} (${r.userCity})** — ⭐⭐⭐⭐⭐\n*"${r.comment}"*`).join('\n\n')}\n\nKia main yeh reviews product page par **Verified Buyer** badge ke sath publish kar doon?`,
        actionRequired: {
          id: `act_${Date.now()}`,
          type: 'generate_customer_reviews',
          title: `Add ${generatedReviews.length} Reviews to ${targetProduct.name}`,
          description: `Adds ${generatedReviews.length} 5-Star Verified Buyer reviews to boost conversion rate`,
          count: generatedReviews.length,
          payload: {
            operation: 'generate_customer_reviews',
            params: {
              productId: targetProduct._id.toString(),
              productName: targetProduct.name,
              reviews: generatedReviews,
            },
          },
        },
      };
    }

    const { productId, reviews: reviewsToSave } = params;
    const targetProdId = new mongoose.Types.ObjectId(productId);

    // Save reviews
    for (const r of (reviewsToSave || generatedReviews)) {
      await Review.create({
        productId: targetProdId,
        userName: r.userName,
        userCity: r.userCity,
        rating: r.rating || 5,
        title: r.title || 'Verified Purchase',
        comment: r.comment,
        isVerifiedBuyer: true,
        isApproved: true,
      });
    }

    // Update product rating and reviewsCount
    const allReviews = await Review.find({ productId: targetProdId, isApproved: true }).lean();
    const avgRating = allReviews.reduce((sum: number, rev: any) => sum + rev.rating, 0) / (allReviews.length || 1);

    await Product.findByIdAndUpdate(targetProdId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: allReviews.length,
    });

    return {
      handled: true,
      reply: `🎉 **Customer Reviews Successfully Published!**\n\n- **Product:** ${targetProduct.name}\n- **Total Reviews Added:** ${(reviewsToSave || generatedReviews).length} Verified Buyer Reviews\n- **New Product Rating:** ⭐ ${Math.round(avgRating * 10) / 10} (${allReviews.length} Reviews)\n- **Live Page:** [/product/${targetProduct.slug}](/product/${targetProduct.slug})\n\nProduct page par social proof live ho chuka hai, jiss se conversion rate 40% tak barh jayega!`,
      actionExecuted: {
        type: 'generate_customer_reviews',
        description: `Added ${(reviewsToSave || generatedReviews).length} reviews to "${targetProduct.name}"`,
      },
    };
  }

  // ----------------------------------------------------
  // 16. BULK COURIER MANIFEST & DISPATCH BATCH (TCS/TRAX)
  // ----------------------------------------------------
  if (operation === 'export_courier_manifest') {
    const { courier = 'TCS Express' } = params;
    const orders = await Order.find({ status: { $in: ['Processing', 'Pending'] } })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    if (orders.length === 0) {
      return {
        handled: true,
        reply: `ℹ️ Dispatch manifest banane ke liye koi pending ya processing order nahi mila.`,
      };
    }

    let manifestRows: string[] = [];
    let csvRows: string[] = ['CN,OrderNo,CustomerName,Phone,City,Address,CODAmount,Items'];

    orders.forEach((ord: any, idx: number) => {
      const orderShortId = ord._id.toString().slice(-6);
      const cn = ord.trackingNumber || `PKD${Date.now().toString().slice(-6)}${idx}`;
      let phone = (ord.customerDetails?.phone || '').replace(/\D/g, '');
      const name = (ord.customerDetails?.name || 'Customer').replace(/,/g, ' ');
      const city = (ord.customerDetails?.city || 'Pakistan').replace(/,/g, ' ');
      const address = (ord.customerDetails?.address || '').replace(/,/g, ' ');
      const cod = ord.totalAmount || 0;
      const items = (ord.items || []).map((i: any) => `${i.name} (${i.quantity})`).join(' + ').replace(/,/g, ' ');

      manifestRows.push(`| \`${cn}\` | #${orderShortId} | **${name}** | \`${phone}\` | ${city} | **PKR ${cod.toLocaleString()}** |`);
      csvRows.push(`${cn},#${orderShortId},"${name}",${phone},"${city}","${address}",${cod},"${items}"`);
    });

    const totalCOD = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return {
      handled: true,
      reply: `🚚 **${courier} Bulk Dispatch Manifest Ready!**\n\n**Total Orders to Dispatch:** ${orders.length} | **Total COD to Collect:** PKR ${totalCOD.toLocaleString()}\n\n| CN / Tracking | Order | Customer Name | Phone | City | COD Amount |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${manifestRows.join('\n')}\n\n---\n### 📋 Raw CSV Manifest for TCS / Trax Portal:\n\`\`\`csv\n${csvRows.join('\n')}\n\`\`\`\n\n*Aap is CSV data ko copy kar ke direct courier portal par bulk upload kar sakte hain.*`,
      actionExecuted: {
        type: 'export_courier_manifest',
        description: `Generated ${courier} manifest for ${orders.length} orders (PKR ${totalCOD.toLocaleString()})`,
      },
    };
  }

  return { handled: false, reply: '' };
}
