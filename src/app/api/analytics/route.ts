import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Analytics from '../../../models/Analytics';
import Contact from '../../../models/Contact';
import Promotion from '../../../models/Promotion';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7days';

    let dateFilter: any = {};
    let orderDateFilter: any = {};
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { timestamp: { $gte: startOfDay } };
      orderDateFilter = { createdAt: { $gte: startOfDay } };
    } else if (range === '7days') {
      const startOf7Days = new Date(now);
      startOf7Days.setDate(now.getDate() - 7);
      startOf7Days.setHours(0, 0, 0, 0);
      dateFilter = { timestamp: { $gte: startOf7Days } };
      orderDateFilter = { createdAt: { $gte: startOf7Days } };
    } else if (range === '30days') {
      const startOf30Days = new Date(now);
      startOf30Days.setDate(now.getDate() - 30);
      startOf30Days.setHours(0, 0, 0, 0);
      dateFilter = { timestamp: { $gte: startOf30Days } };
      orderDateFilter = { createdAt: { $gte: startOf30Days } };
    } else {
      // 'all'
      dateFilter = {};
      orderDateFilter = {};
    }

    // 1. Marketing Attribution & ROAS Analysis (Instagram vs TikTok vs Organic)
    const matchStage = dateFilter.timestamp ? { $match: dateFilter } : { $match: {} };
    const attributionAggregation = await Analytics.aggregate([
      matchStage,
      {
        $group: {
          _id: {
            utm_source: { $ifNull: ["$utm_source", "organic"] },
            session_id: "$session_id"
          },
          hasAddToCart: {
            $max: { $cond: [{ $eq: ["$interactionType", "add_to_cart"] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: "$_id.utm_source",
          visits: { $sum: 1 },
          add_to_carts: { $sum: "$hasAddToCart" }
        }
      }
    ]);

    // Gather order purchases by UTM source to compute revenue/ROAS per marketing channel
    const orderMatch = {
      status: { $ne: 'Cancelled' },
      ...(orderDateFilter.createdAt ? { createdAt: orderDateFilter.createdAt } : {})
    };
    
    const ordersBySource = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: { $ifNull: ["$utmSource", "organic"] },
          purchases: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Merged visits & purchases for attribution summary table
    const attributionTable = attributionAggregation.map(channel => {
      const sourceName = channel._id || 'organic';
      const orderStats = ordersBySource.find(o => o._id === sourceName) || { purchases: 0, revenue: 0 };
      
      return {
        source: sourceName,
        visits: channel.visits,
        add_to_carts: channel.add_to_carts,
        purchases: orderStats.purchases,
        revenue: orderStats.revenue,
        roas: orderStats.revenue > 0 ? (orderStats.revenue / (channel.visits * 15)) : 0
      };
    });

    // Calculate the summary stats
    const orders = await Order.find(orderMatch);
    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

    const uniqueSessionsCount = await Analytics.distinct('session_id', dateFilter).then(arr => arr.length) || 0;
    const conversionRate = uniqueSessionsCount > 0 ? ((totalOrdersCount / uniqueSessionsCount) * 100) : 0;

    const productsCount = await Product.countDocuments();
    const unreadContactsCount = await Contact.countDocuments();
    const activePromosCount = await Promotion.countDocuments();
    const pageviewsCount = await Analytics.countDocuments({ type: 'pageview', ...dateFilter });
    const cartClicksCount = await Analytics.countDocuments({ type: 'interaction', interactionType: 'add_to_cart', ...dateFilter });
    const whatsappClicksCount = await Analytics.countDocuments({ type: 'interaction', interactionType: 'whatsapp_click', ...dateFilter });
    const searchesCount = await Analytics.countDocuments({ type: 'interaction', interactionType: 'search_intent', ...dateFilter });

    // Abandoned Cart Leak Calculator
    const checkoutSessions = await Analytics.distinct('session_id', {
      type: 'interaction',
      interactionType: 'checkout_success',
      ...dateFilter
    });
    const leakAgg = await Analytics.aggregate([
      {
        $match: {
          type: 'interaction',
          interactionType: 'add_to_cart',
          ...dateFilter,
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
    const abandonedCartLeak = leakAgg[0]?.total || 0;

    // ── 5. CONVERSION FUNNEL ANALYSIS ────────────────────────────────────────
    //
    // We calculate distinct session counts at each funnel step so that one
    // user visiting 10 pages still counts as 1 visit — not 10.
    //
    // Funnel Steps:
    //   Step 1 — Total Sessions (unique visitors)
    //   Step 2 — Product Views  (sessions that viewed at least 1 product)
    //   Step 3 — Add to Carts   (sessions that added at least 1 item)
    //   Step 4 — Begin Checkout (sessions that initiated checkout)
    //   Step 5 — Purchases      (orders placed — from Order collection)
    //
    // For Steps 1-4 we use the Analytics collection (client-side events).
    // For Step 5 we use the Order collection (server-side ground truth).

    // Step 1: Total unique sessions in the date window
    const funnelTotalSessions = uniqueSessionsCount; // already computed above

    // Step 2: Sessions that fired at least one view_product interaction
    const funnelProductViewSessions = await Analytics.aggregate([
      {
        $match: {
          type: 'interaction',
          interactionType: 'view_product',
          ...dateFilter,
          session_id: { $exists: true, $nin: [null, ''] },
        },
      },
      { $group: { _id: '$session_id' } },
      { $count: 'count' },
    ]).then((r) => r[0]?.count || 0);

    // Step 3: Sessions that fired at least one add_to_cart interaction
    const funnelAddToCartSessions = await Analytics.aggregate([
      {
        $match: {
          type: 'interaction',
          interactionType: 'add_to_cart',
          ...dateFilter,
          session_id: { $exists: true, $nin: [null, ''] },
        },
      },
      { $group: { _id: '$session_id' } },
      { $count: 'count' },
    ]).then((r) => r[0]?.count || 0);

    // Step 4: Sessions that fired at least one begin_checkout interaction
    const funnelBeginCheckoutSessions = await Analytics.aggregate([
      {
        $match: {
          type: 'interaction',
          interactionType: 'begin_checkout',
          ...dateFilter,
          session_id: { $exists: true, $nin: [null, ''] },
        },
      },
      { $group: { _id: '$session_id' } },
      { $count: 'count' },
    ]).then((r) => r[0]?.count || 0);

    // Step 5: Successful purchases (from Order collection — server-side truth)
    const funnelPurchases = totalOrdersCount; // already computed above

    /**
     * Helper: compute step-over-step drop-off percentage.
     * "What % of the PREVIOUS step made it to THIS step?"
     * Returns 0 if the previous step count is 0 (avoids division by zero).
     */
    const stepPct = (current: number, previous: number): number => {
      if (previous === 0) return 0;
      return parseFloat(((current / previous) * 100).toFixed(1));
    };

    // Build the structured funnel object returned in the API response
    const conversionFunnel = [
      {
        step: 1,
        label: 'Total Visits',
        description: 'Unique sessions on the store',
        count: funnelTotalSessions,
        // Top of funnel — 100% by definition
        conversionFromPrevious: 100,
        // Overall funnel conversion from this step to purchase
        conversionToEnd: stepPct(funnelPurchases, funnelTotalSessions),
      },
      {
        step: 2,
        label: 'Product Views',
        description: 'Sessions that viewed at least one product',
        count: funnelProductViewSessions,
        conversionFromPrevious: stepPct(funnelProductViewSessions, funnelTotalSessions),
        conversionToEnd: stepPct(funnelPurchases, funnelProductViewSessions),
      },
      {
        step: 3,
        label: 'Add to Cart',
        description: 'Sessions that added at least one item to cart',
        count: funnelAddToCartSessions,
        conversionFromPrevious: stepPct(funnelAddToCartSessions, funnelProductViewSessions),
        conversionToEnd: stepPct(funnelPurchases, funnelAddToCartSessions),
      },
      {
        step: 4,
        label: 'Initiated Checkout',
        description: 'Sessions that started the checkout process',
        count: funnelBeginCheckoutSessions,
        conversionFromPrevious: stepPct(funnelBeginCheckoutSessions, funnelAddToCartSessions),
        conversionToEnd: stepPct(funnelPurchases, funnelBeginCheckoutSessions),
      },
      {
        step: 5,
        label: 'Purchases',
        description: 'Completed orders placed',
        count: funnelPurchases,
        conversionFromPrevious: stepPct(funnelPurchases, funnelBeginCheckoutSessions),
        conversionToEnd: 100,
      },
    ];
    // ─────────────────────────────────────────────────────────────────────────

    // 2. User Insights Cards
    // Top Searched Intent keywords
    const topSearches = await Analytics.aggregate([
      { $match: { type: 'interaction', interactionType: 'search_intent', ...dateFilter } },
      { $group: { _id: '$metadata.keyword', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const searches = topSearches.filter(s => s._id).map(s => ({ keyword: s._id, count: s.count }));

    // Most Popular Categories
    const popularCategoriesAgg = await Analytics.aggregate([
      { $match: { type: 'interaction', interactionType: 'view_product', ...dateFilter } },
      { $group: { _id: '$metadata.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    const categories = popularCategoriesAgg.filter(c => c._id).map(c => ({ category: c._id, count: c.count }));

    // Device Breakdown (Mobile vs Desktop)
    const mobileCount = await Analytics.countDocuments({ device: 'Mobile', ...dateFilter });
    const desktopCount = await Analytics.countDocuments({ device: 'Desktop', ...dateFilter });

    // Demographics Aggregations (Age & Gender)
    const ageDemographics = await Analytics.aggregate([
      { $match: { age: { $exists: true, $ne: null }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      {
        $project: {
          ageRange: {
            $cond: [
              { $lt: ["$age", 25] }, "18-24",
              {
                $cond: [
                  { $lt: ["$age", 35] }, "25-34",
                  {
                    $cond: [
                      { $lt: ["$age", 45] }, "35-44",
                      {
                        $cond: [
                          { $lt: ["$age", 55] }, "45-54",
                          "55+"
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$ageRange",
          count: { $sum: 1 }
        }
      }
    ]);

    const genderDemographics = await Analytics.aggregate([
      { $match: { gender: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    // Platform & Browser Aggregations
    const osAggregation = await Analytics.aggregate([
      { $match: { os: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$os", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const browserAggregation = await Analytics.aggregate([
      { $match: { browser: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Location Aggregations
    const locationAggregation = await Analytics.aggregate([
      { $match: { city: { $exists: true, $nin: [null, '', 'Unknown'] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const finalAgeData = ageDemographics.filter(a => a._id).map(a => ({ range: a._id, count: a.count }));
    const finalGenderData = genderDemographics.filter(g => g._id).map(g => ({ gender: g._id, count: g.count }));
    const finalOsData = osAggregation.filter(o => o._id).map(o => ({ os: o._id, count: o.count }));
    const finalBrowserData = browserAggregation.filter(b => b._id).map(b => ({ browser: b._id, count: b.count }));
    const finalLocationData = locationAggregation.filter(l => l._id).map(l => ({ city: l._id, count: l.count }));
    
    // 3. Live Activity Feed (last 10 database actions)
    const rawFeed = await Analytics.find({ type: 'interaction', ...dateFilter })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const activityFeed = rawFeed.map((action: any) => {
      let description = `User performed action: ${action.interactionType}`;
      if (action.interactionType === 'view_product') {
        description = `User viewed product: "${action.metadata?.product_name || 'Product'}"`;
      } else if (action.interactionType === 'add_to_cart') {
        description = `User added product to cart`;
      } else if (action.interactionType === 'search_intent') {
        description = `User searched for "${action.metadata?.keyword || ''}"`;
      } else if (action.interactionType === 'whatsapp_click') {
        description = `User clicked WhatsApp Support`;
      } else if (action.interactionType === 'checkout_success') {
        description = `User successfully completed order checkout`;
      }

      return {
        _id: action._id,
        description,
        device: action.device || 'Desktop',
        source: action.utm_source || 'organic',
        timestamp: action.timestamp
      };
    });

    // 4. Daily Sales & Conversion Graph Metrics
    const chartLabels = [];
    const revenueData = [];
    const conversionData = [];
    const pageviewsData = [];

    if (range === 'today') {
      // 24 hours trend
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(now.getHours() - i);
        const startOfHour = new Date(date.setMinutes(0, 0, 0));
        const endOfHour = new Date(date.setMinutes(59, 59, 999));

        const label = startOfHour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        chartLabels.push(label);

        const views = await Analytics.countDocuments({
          type: 'pageview',
          timestamp: { $gte: startOfHour, $lte: endOfHour },
        });
        pageviewsData.push(views);

        const hourOrders = await Order.find({
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfHour, $lte: endOfHour },
        });
        const hourSales = hourOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        revenueData.push(hourSales);
        conversionData.push(views > 0 ? ((hourOrders.length / views) * 100) : 0);
      }
    } else {
      // Daily trend (7 or 30 days)
      const dayCount = range === '30days' || range === 'all' ? 30 : 7;
      for (let i = dayCount - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const label = startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartLabels.push(label);

        const views = await Analytics.countDocuments({
          type: 'pageview',
          timestamp: { $gte: startOfDay, $lte: endOfDay },
        });
        pageviewsData.push(views);

        const dayOrders = await Order.find({
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
        const daySales = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        revenueData.push(daySales);
        conversionData.push(views > 0 ? ((dayOrders.length / views) * 100) : 0);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          revenue: totalRevenue,
          orders: totalOrdersCount,
          averageOrderValue,
          conversionRate,
          uniqueSessionsCount,
          products: productsCount,
          unreadContacts: unreadContactsCount,
          activePromos: activePromosCount,
          pageviews: pageviewsCount,
          cartClicks: cartClicksCount,
          whatsappClicks: whatsappClicksCount,
          searchesCount: searchesCount,
          abandonedCartLeak
        },
        marketing: attributionTable,
        // Multi-step conversion funnel — each element has:
        //   step, label, description, count,
        //   conversionFromPrevious (%), conversionToEnd (%)
        funnel: conversionFunnel,
        insights: {
          searches,
          categories,
          devices: {
            mobile: mobileCount,
            desktop: desktopCount
          },
          demographics: {
            age: finalAgeData,
            gender: finalGenderData
          },
          platforms: {
            os: finalOsData,
            browsers: finalBrowserData
          },
          locations: finalLocationData
        },
        feed: activityFeed,
        charts: {
          labels: chartLabels,
          revenue: revenueData,
          sales: revenueData,
          pageviews: pageviewsData,
          conversion: conversionData
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const { type, path, interactionType, utm_source, utm_medium, utm_campaign, session_id, device, landing_page, metadata } = body;

    if (!type || !path) {
      return NextResponse.json({ success: false, error: 'Type and path are required' }, { status: 400 });
    }

    // 1. Extract IP & Geo-Location details
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const vercelCountry = request.headers.get('x-vercel-ip-country') || 'PK';
    
    const resolvedCity = vercelCity || 'Unknown';
    const resolvedCountry = vercelCountry;
    const resolvedLocation = vercelCity ? `${vercelCity}, ${vercelCountry}` : `Unknown, ${vercelCountry}`;

    // 2. Parse Operating System & Browser from user-agent
    const userAgent = request.headers.get('user-agent') || '';
    let parsedOs = 'Windows';
    let parsedBrowser = 'Chrome';

    if (userAgent.includes('Windows')) parsedOs = 'Windows';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) parsedOs = 'macOS';
    else if (userAgent.includes('Linux')) parsedOs = 'Linux';
    else if (userAgent.includes('Android')) parsedOs = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) parsedOs = 'iOS';

    if (userAgent.includes('Firefox')) parsedBrowser = 'Firefox';
    else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) parsedBrowser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) parsedBrowser = 'Safari';
    else if (userAgent.includes('Edge')) parsedBrowser = 'Edge';

    const log = new Analytics({
      type,
      path,
      interactionType: type === 'interaction' ? interactionType : undefined,
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      session_id: session_id || undefined,
      device: device || undefined,
      os: parsedOs,
      browser: parsedBrowser,
      city: resolvedCity,
      country: resolvedCountry,
      location: resolvedLocation,
      landing_page: landing_page || undefined,
      metadata: metadata || {},
      timestamp: new Date(),
    });

    await log.save();
    return NextResponse.json({ success: true, message: 'Event logged successfully' });
  } catch (error: any) {
    console.error('Error logging analytics event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
