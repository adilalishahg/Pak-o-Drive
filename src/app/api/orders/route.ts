import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';

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

      // Check stock
      if (dbProduct.stock < cartItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} items remaining.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = dbProduct.price * cartItem.quantity;
      calculatedTotal += itemTotal;

      resolvedItems.push({
        productId: dbProduct._id.toString(),
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: cartItem.quantity,
        image: dbProduct.image,
      });

      // Decrement stock
      dbProduct.stock -= cartItem.quantity;
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
