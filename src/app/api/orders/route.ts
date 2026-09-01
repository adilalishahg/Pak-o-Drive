import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import { fireConversionEvent } from '../../../utils/conversionApi';
import { sendAdminOrderNotification } from '../../../lib/whatsappNotification';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching orders API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      const dbProduct = await Product.findById(cartItem.productId);

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product with ID ${cartItem.productId} not found.` },
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
