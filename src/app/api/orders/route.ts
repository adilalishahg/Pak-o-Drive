import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import { fireConversionEvent } from '../../../utils/conversionApi';

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

    // Validate inputs
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

    // Resolve product info from DB to ensure prices and names are accurate and secure
    const resolvedItems = [];
    let calculatedTotal = 0;

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

      // Check stock
      if (stockLimit < cartItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${dbProduct.name}${matchedVariant ? ` (${matchedVariant.name})` : ''}". Only ${stockLimit} items remaining.`,
          },
          { status: 400 }
        );
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

      // Decrement stock
      if (matchedVariant) {
        matchedVariant.stock -= cartItem.quantity;
        dbProduct.markModified('variants');
      } else {
        dbProduct.stock -= cartItem.quantity;
      }
      await dbProduct.save();
    }

    // Save order
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

    // ── SERVER-SIDE CONVERSION TRACKING (Meta CAPI + TikTok Events API) ───────
    // TRUE fire-and-forget: we intentionally do NOT await this Promise.
    // The customer receives their 201 Order Success response immediately after
    // the DB write. CAPI/TikTok calls execute asynchronously in the background
    // without blocking the response or risking a Vercel 30 s function timeout.
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
      // Silently log — a CAPI failure must never surface to the customer.
      console.error('[CAPI] Non-blocking conversion event failed:', capiErr);
    });
    // ─────────────────────────────────────────────────────────────────────────

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
