import dbConnect from './mongodb';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
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
  if (s.includes('deliver') || s.includes('delivered') || s.includes('pahunch')) return 'Delivered';
  if (s.includes('ship') || s.includes('shipped') || s.includes('rawana')) return 'Shipped';
  if (s.includes('way') || s.includes('on the way') || s.includes('transit')) return 'On the Way';
  if (s.includes('process') || s.includes('processing') || s.includes('taiari')) return 'Processing';
  if (s.includes('cancel') || s.includes('cancelled') || s.includes('mansookh')) return 'Cancelled';
  if (s.includes('pend') || s.includes('pending') || s.includes('intezar')) return 'Pending';
  return null;
}

/**
 * Detects if the prompt is an actionable database command
 */
export async function detectActionWithAI(userQuery: string): Promise<any | null> {
  const prompt = `
You are an intent classification parser for the Pak-o-Drive E-commerce Admin Panel.
Analyze if the user prompt is instructing to modify, update, delete, or create data in the database (Orders, Products, Categories, Promotions).

Valid operations:
1. "update_order_status": params: { identifier: string (orderId or customer name or phone or "all_pending" or "all_cancelled"), newStatus: "Pending"|"Processing"|"On the Way"|"Shipped"|"Delivered"|"Cancelled" }
2. "update_order_details": params: { identifier: string, address?: string, phone?: string, trackingNumber?: string, courierName?: string }
3. "delete_order": params: { identifier: string }
4. "delete_orders_bulk": params: { status?: string, dateBefore?: string, dateAfter?: string, deleteAll?: boolean }
5. "update_product": params: { productName: string, price?: number, originalPrice?: number, stock?: number }
6. "delete_product": params: { productName: string }
7. "create_product": params: { name: string, price: number, category: string, stock?: number, description?: string }
8. "create_promotion": params: { code: string, discountPercent: number, expiryDays?: number }
9. "create_category": params: { name: string, parentCategory?: string }

User Message: "${userQuery}"

Output ONLY a raw JSON object (no markdown, no backticks):
{
  "isAction": true or false,
  "operation": "...",
  "params": { ... },
  "isDestructive": true or false
}
If NOT an action (just asking for advice, trends, or stats), return {"isAction": false}.
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
    // Fall back to regex heuristics below
  }

  // Regex Heuristics fallback
  const lower = userQuery.toLowerCase().trim();

  // 1. Order status update: e.g. "order #123 delivered kar do"
  if (/(status|mark|update|kar do|kardo)\s+.*?(delivered|shipped|processing|cancelled|pending)/i.test(lower)) {
    const statusMatch = normalizeOrderStatus(lower);
    const idMatch = userQuery.match(/#?([a-f0-9]{24}|\d{3,8})/i)?.[1] || '';
    if (statusMatch) {
      return {
        isAction: true,
        operation: 'update_order_status',
        params: { identifier: idMatch, newStatus: statusMatch },
        isDestructive: false,
      };
    }
  }

  // 2. Delete orders bulk
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

  // 3. Product price or stock update
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

    let filter: any = {};
    if (identifier && mongoose.Types.ObjectId.isValid(identifier)) {
      filter._id = new mongoose.Types.ObjectId(identifier);
    } else if (identifier && /^\d+$/.test(identifier)) {
      filter.$or = [
        { 'customerDetails.phone': { $regex: identifier } },
        { trackingNumber: { $regex: identifier } },
      ];
    } else if (identifier && identifier.toLowerCase().includes('all_pending')) {
      filter.status = 'Pending';
    } else if (identifier && identifier.length > 2) {
      filter.$or = [
        { 'customerDetails.name': { $regex: identifier, $options: 'i' } },
        { 'customerDetails.phone': { $regex: identifier } },
      ];
    } else {
      // If no identifier provided, update the latest pending order
      filter.status = 'Pending';
    }

    const matchedOrders = await Order.find(filter).limit(10).lean();
    if (matchedOrders.length === 0) {
      return {
        handled: true,
        reply: `❌ Diye gaye query ke mutabiq koi order nahi mila. Baraye meherbani sahi Order ID, customer name ya phone number likhein.`,
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
            note: 'Updated via AI Executive Copilot',
          },
        },
      }
    );

    return {
      handled: true,
      reply: `✅ **Status Updated!** ${matchedOrders.length} order(s) ka status successfully **"${targetStatus}"** kar diya gaya hai.\n\n- Updated IDs: ${matchedOrders.map((o: any) => `#${o._id.toString().slice(-6)}`).join(', ')}`,
      actionExecuted: {
        type: 'update_order_status',
        description: `${matchedOrders.length} order(s) marked as ${targetStatus}`,
        count: matchedOrders.length,
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

  return { handled: false, reply: '' };
}
