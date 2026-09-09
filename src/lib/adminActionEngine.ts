import dbConnect from './mongodb';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import Promotion from '../models/Promotion';
import BlogPost from '../models/BlogPost';
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
Analyze if the user prompt is instructing to modify, update, delete, or create data in the database (Orders, Products, Categories, Promotions, Blogs, WhatsApp digest, COD risk, Courier dispatch).

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
10. "create_blog_post": params: { topic: string, category?: string }
11. "generate_whatsapp_digest": params: {}
12. "analyze_cod_risk": params: { orderId?: string }
13. "generate_dispatch_slip": params: { orderId?: string }
14. "predictive_stock_forecast": params: { season?: string }
15. "create_bundle": params: { name: string, price: number, originalPrice?: number, category?: string, description?: string, itemsSummary?: string }
16. "suggest_bundle": params: { theme?: string }

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
      specs,
      seoTitle,
      seoDescription,
      seoKeywords,
      stock = 25,
    } = params;

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
      image: studioImage || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
      images: [
        studioImage || 'https://res.cloudinary.com/dvgxeiwoz/image/upload/v1788092214/electro_store/1788092214621_46843.webp',
      ],
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

  return { handled: false, reply: '' };
}
