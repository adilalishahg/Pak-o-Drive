import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import Analytics from '../../../../models/Analytics';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'revenue';
    const range = searchParams.get('range') || 'today';

    const now = new Date();
    let startDate = new Date();

    // Calculate exact date boundaries
    switch (range.toLowerCase()) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
      case 'this week':
      case '7days':
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
      case 'this month':
      case '30days':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
      case 'this year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate.setHours(0, 0, 0, 0); // fallback to today
    }

    let resultValue = 0;

    if (type === 'revenue') {
      const revenueAgg = await Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      resultValue = revenueAgg[0]?.total || 0;
    } else if (type === 'orders') {
      resultValue = await Order.countDocuments({
        status: { $ne: 'Cancelled' },
        createdAt: { $gte: startDate }
      });
    } else if (type === 'pageviews') {
      resultValue = await Analytics.countDocuments({
        type: 'pageview',
        timestamp: { $gte: startDate }
      });
    } else if (type === 'abandoned_cart') {
      // Find session IDs that successfully checked out in this period
      const checkoutSessions = await Analytics.distinct('session_id', {
        type: 'interaction',
        interactionType: 'checkout_success',
        timestamp: { $gte: startDate }
      });

      // Aggregate add_to_cart values for sessions that didn't check out
      const leakAgg = await Analytics.aggregate([
        {
          $match: {
            type: 'interaction',
            interactionType: 'add_to_cart',
            timestamp: { $gte: startDate },
            session_id: { $exists: true, $nin: checkoutSessions }
          }
        },
        {
          $project: {
            itemValue: {
              $multiply: [
                { $ifNull: ['$metadata.price', 0] },
                { $ifNull: ['$metadata.quantity', 1] }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$itemValue' }
          }
        }
      ]);
      resultValue = leakAgg[0]?.total || 0;
    } else if (type === 'avg_order_value' || type === 'average_order_value') {
      const ordersAgg = await Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]);
      const totalRevenue = ordersAgg[0]?.total || 0;
      const totalOrdersCount = ordersAgg[0]?.count || 0;
      resultValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;
    } else if (type === 'conversion_rate') {
      const totalOrdersCount = await Order.countDocuments({
        status: { $ne: 'Cancelled' },
        createdAt: { $gte: startDate }
      });
      const uniqueSessionsCount = await Analytics.distinct('session_id', {
        timestamp: { $gte: startDate }
      }).then(arr => arr.length) || 0;
      resultValue = uniqueSessionsCount > 0 ? ((totalOrdersCount / uniqueSessionsCount) * 100) : 0;
    } else if (type === 'sessions' || type === 'unique_sessions') {
      resultValue = await Analytics.distinct('session_id', {
        timestamp: { $gte: startDate }
      }).then(arr => arr.length) || 0;
    } else if (type === 'cart_clicks') {
      resultValue = await Analytics.countDocuments({
        type: 'interaction',
        interactionType: 'add_to_cart',
        timestamp: { $gte: startDate }
      });
    } else if (type === 'whatsapp_clicks') {
      resultValue = await Analytics.countDocuments({
        type: 'interaction',
        interactionType: 'whatsapp_click',
        timestamp: { $gte: startDate }
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Invalid metric type: ${type}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type,
      range,
      value: resultValue
    });
  } catch (error: any) {
    console.error(`Error in GET /api/analytics/card-metric:`, error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Database error occurred',
      value: 0
    }, { status: 500 });
  }
}
