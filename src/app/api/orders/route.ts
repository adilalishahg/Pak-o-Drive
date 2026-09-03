import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import CampaignOffer from '../../../models/CampaignOffer';
import { fireConversionEvent } from '../../../utils/conversionApi';
import { sendAdminOrderNotification } from '../../../lib/whatsappNotification';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    // Safe capped pagination to prevent RAM exhaustion under 50,000+ orders
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      const cleanSearch = search.trim();
      query.$or = [
        { 'customerDetails.name': { $regex: cleanSearch, $options: 'i' } },
        { 'customerDetails.phone': { $regex: cleanSearch, $options: 'i' } },
        { 'customerDetails.city': { $regex: cleanSearch, $options: 'i' } },
        { trackingNumber: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      count: orders.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: orders,
    });
  } catch (error: any) {
    console.error('Error fetching orders API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 0. Anti-DDoS & Bot Flood Protection (Max 10 orders per minute per IP)
    const rateCheck = checkRateLimit(request, {
      limit: 10,
      windowMs: 60 * 1000,
      keyPrefix: 'orders_post',
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many checkout requests. Please wait ${rateCheck.reset} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.reset),
          },
        }
      );
    }

    await dbConnect();
    const body = await request.json();


    const { customerDetails, items, utmSource, utmMedium, utmCampaign } = body;

    // 1. Validate inputs
    if (!customerDetails || !customerDetails.name || !customerDetails.phone || !customerDetails.address || !customerDetails.city) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required shipping details: Name, Phone, Address, and City.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty. Please add items to checkout.' },
        { status: 400 }
      );
    }

    // 2. Idempotency & Double-Click Guard:
    // Check if an identical order was placed by this phone within the last 20 seconds
    const cleanPhone = customerDetails.phone.trim();
    const recentDuplicate = await Order.findOne({
      'customerDetails.phone': cleanPhone,
      createdAt: { $gte: new Date(Date.now() - 20 * 1000) },
    }).sort({ createdAt: -1 });

    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'Order already processed!',
        orderId: recentDuplicate._id.toString(),
        data: recentDuplicate,
      });
    }

    // 3. Resolve product info & calculate totals
    const resolvedItems = [];
    let calculatedTotal = 0;
    const stockDecrementsToRollback: { productId: string; variantId?: string; quantity: number }[] = [];

    for (const cartItem of items) {
      // Check if item is a promotional Campaign Offer / Bundle
      const isBundle =
        typeof cartItem.productId === 'string' &&
        (cartItem.productId.startsWith('bundle_') || cartItem.productId.startsWith('offer_'));

      if (isBundle) {
        const rawOfferId = cartItem.productId.replace(/^(bundle_|offer_)/, '');
        let offer = null;
        if (mongoose.Types.ObjectId.isValid(rawOfferId)) {
          offer = await CampaignOffer.findById(rawOfferId);
        }

        if (offer) {
          const dealPrice =
            offer.offerType === 'combo_bundle' && offer.bundlePrice > 0
              ? offer.bundlePrice
              : offer.products.reduce((a: number, b: any) => a + (b.offerPrice || 0), 0);
          const includedNames = offer.products.map((p: any) => p.name).join(' + ');

          resolvedItems.push({
            productId: cartItem.productId,
            name: `${offer.title} (${offer.products.length} Items Package)`,
            price: dealPrice,
            quantity: cartItem.quantity,
            image: offer.products[0]?.image || '/img/product-placeholder.png',
            variantName: cartItem.variantName || `Package Deal: ${includedNames}`,
            variantId: cartItem.variantId || `var_${offer._id}`,
          });

          calculatedTotal += dealPrice * cartItem.quantity;
          continue; // Bundle items bypass individual single-product stock decrements
        }
      }

      let dbProduct = null;
      if (mongoose.Types.ObjectId.isValid(cartItem.productId)) {
        dbProduct = await Product.findById(cartItem.productId);
      }
      if (!dbProduct) {
        dbProduct = await Product.findOne({ slug: cartItem.productId });
      }

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product with ID or Slug "${cartItem.productId}" not found.` },
          { status: 404 }
        );
      }

      let resolvedPrice = dbProduct.price;
      let resolvedImage = dbProduct.image;
      let stockLimit = dbProduct.stock;
      let matchedVariant: any = null;

      if (dbProduct.variants && dbProduct.variants.length > 0) {
        if (cartItem.variantId) {
          matchedVariant = dbProduct.variants.find(
            (v: any) => v._id?.toString() === cartItem.variantId.toString()
          );
        }
        if (!matchedVariant && cartItem.variantName) {
          matchedVariant = dbProduct.variants.find(
            (v: any) => v.name === cartItem.variantName
          );
        }
      }

      if (matchedVariant) {
        resolvedPrice = matchedVariant.price;
        resolvedImage = matchedVariant.image || dbProduct.image;
        stockLimit = matchedVariant.stock;
      }

      // Check stock before atomic operation
      if (stockLimit >= 0 && stockLimit < cartItem.quantity) {
        // Rollback any earlier decremented items in this transaction
        await rollbackStock(stockDecrementsToRollback);
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${dbProduct.name}${matchedVariant ? ` (${matchedVariant.name})` : ''}". Only ${stockLimit} items remaining.`,
          },
          { status: 400 }
        );
      }

      // 4. Atomic Stock Decrement (prevents race-condition overselling in flash sales)
      if (stockLimit >= 0) {
        if (matchedVariant && matchedVariant._id) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: dbProduct._id,
              'variants._id': matchedVariant._id,
              'variants.stock': { $gte: cartItem.quantity },
            },
            {
              $inc: { 'variants.$.stock': -cartItem.quantity },
            },
            { new: true }
          );

          if (!updated) {
            await rollbackStock(stockDecrementsToRollback);
            return NextResponse.json(
              {
                success: false,
                error: `Stock ran out for "${dbProduct.name} (${matchedVariant.name})" just now. Please adjust your cart.`,
              },
              { status: 400 }
            );
          }

          stockDecrementsToRollback.push({
            productId: dbProduct._id.toString(),
            variantId: matchedVariant._id.toString(),
            quantity: cartItem.quantity,
          });
        } else {
          const updated = await Product.findOneAndUpdate(
            {
              _id: dbProduct._id,
              stock: { $gte: cartItem.quantity },
            },
            {
              $inc: { stock: -cartItem.quantity },
            },
            { new: true }
          );

          if (!updated) {
            await rollbackStock(stockDecrementsToRollback);
            return NextResponse.json(
              {
                success: false,
                error: `Stock ran out for "${dbProduct.name}" just now. Please adjust your cart.`,
              },
              { status: 400 }
            );
          }

          stockDecrementsToRollback.push({
            productId: dbProduct._id.toString(),
            quantity: cartItem.quantity,
          });
        }
      }

      const itemTotal = resolvedPrice * cartItem.quantity;
      calculatedTotal += itemTotal;

      resolvedItems.push({
        productId: dbProduct._id.toString(),
        name: dbProduct.name,
        price: resolvedPrice,
        quantity: cartItem.quantity,
        image: resolvedImage,
        variantName: matchedVariant ? matchedVariant.name : undefined,
        variantId: matchedVariant ? matchedVariant._id?.toString() : undefined,
      });
    }

    // 5. Save order in MongoDB
    const order = new Order({
      customerDetails,
      items: resolvedItems,
      totalAmount: calculatedTotal,
      paymentMethod: 'COD',
      status: 'Pending',
      whatsappSent: false,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    });

    const savedOrder = await order.save();

    // 6. Asynchronous WhatsApp Admin Order Notification
    void sendAdminOrderNotification(savedOrder).catch((waErr) => {
      console.error('[WhatsAppOrderAlert] Non-blocking admin notification failed:', waErr);
    });

    // 7. Asynchronous Conversion Tracking (Meta CAPI + TikTok)
    void fireConversionEvent({
      orderId: savedOrder._id.toString(),
      value: calculatedTotal,
      email: customerDetails.email,
      phone: customerDetails.phone,
      clientIp:
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        '',
      userAgent: request.headers.get('user-agent') || '',
      contentIds: resolvedItems.map((i) => i.productId),
      contentNames: resolvedItems.map((i) => i.name),
      utmSource: utmSource,
    }).catch((capiErr) => {
      console.error('[CAPI] Non-blocking conversion event failed:', capiErr);
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully!',
      orderId: savedOrder._id.toString(),
      data: savedOrder,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Helper to roll back stock in case a later item fails in a multi-item checkout
 */
async function rollbackStock(decrements: { productId: string; variantId?: string; quantity: number }[]) {
  for (const dec of decrements) {
    try {
      if (dec.variantId) {
        await Product.updateOne(
          { _id: dec.productId, 'variants._id': dec.variantId },
          { $inc: { 'variants.$.stock': dec.quantity } }
        );
      } else {
        await Product.updateOne(
          { _id: dec.productId },
          { $inc: { stock: dec.quantity } }
        );
      }
    } catch (err) {
      console.error('Failed to rollback stock item:', dec, err);
    }
  }
}
