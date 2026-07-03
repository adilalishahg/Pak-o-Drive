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
    const orderMatch = {
      status: { $ne: 'Cancelled' },
      ...(orderDateFilter.createdAt ? { createdAt: orderDateFilter.createdAt } : {})
    };
    const viewsMatch = {
      type: 'pageview',
      ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {})
    };

    // Parallelize all standalone DB requests
    const [
      attributionAggregation,
      ordersBySource,
      ordersSummary,
      uniqueSessionsCount,
      productsCount,
      unreadContactsCount,
      activePromosCount,
      pageviewsCount,
      cartClicksCount,
      whatsappClicksCount,
      searchesCount,
      checkoutSessions,
      funnelProductViewSessions,
      funnelAddToCartSessions,
      funnelBeginCheckoutSessions,
      topSearches,
      popularCategoriesAgg,
      mobileCount,
      desktopCount,
      ageDemographics,
      genderDemographics,
      osAggregation,
      browserAggregation,
      locationAggregation,
      rawFeed,
      viewsTrendAgg,
      ordersTrendAgg,
      topProductsAgg
    ] = await Promise.all([
      // Attribution visits & cart adds
      Analytics.aggregate([
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
      ]),
      // Orders by UTM source
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: { $ifNull: ["$utmSource", "organic"] },
            purchases: { $sum: 1 },
            revenue: { $sum: "$totalAmount" }
          }
        }
      ]),
      // Orders count and total revenue
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: null,
            totalOrdersCount: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ]),
      // Distinct sessions count
      Analytics.distinct('session_id', dateFilter),
      // Counts of entities
      Product.countDocuments(),
      Contact.countDocuments(),
      Promotion.countDocuments(),
      Analytics.countDocuments({ type: 'pageview', ...dateFilter }),
      Analytics.countDocuments({ type: 'interaction', interactionType: 'add_to_cart', ...dateFilter }),
      Analytics.countDocuments({ type: 'interaction', interactionType: 'whatsapp_click', ...dateFilter }),
      Analytics.countDocuments({ type: 'interaction', interactionType: 'search_intent', ...dateFilter }),
      // Checkout success sessions
      Analytics.distinct('session_id', {
        type: 'interaction',
        interactionType: 'checkout_success',
        ...dateFilter
      }),
      // Funnel views
      Analytics.aggregate([
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
      ]),
      // Funnel cart additions
      Analytics.aggregate([
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
      ]),
      // Funnel checkouts
      Analytics.aggregate([
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
      ]),
      // Search keywords
      Analytics.aggregate([
        { $match: { type: 'interaction', interactionType: 'search_intent', ...dateFilter } },
        { $group: { _id: '$metadata.keyword', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      // Categories view counts
      Analytics.aggregate([
        { $match: { type: 'interaction', interactionType: 'view_product', ...dateFilter } },
        { $group: { _id: '$metadata.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      // Devices
      Analytics.countDocuments({ device: 'Mobile', ...dateFilter }),
      Analytics.countDocuments({ device: 'Desktop', ...dateFilter }),
      // Age breakdown
      Analytics.aggregate([
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
      ]),
      // Gender breakdown
      Analytics.aggregate([
        { $match: { gender: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]),
      // OS breakdown
      Analytics.aggregate([
        { $match: { os: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      // Browser breakdown
      Analytics.aggregate([
        { $match: { browser: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      // Top Cities
      Analytics.aggregate([
        { $match: { city: { $exists: true, $nin: [null, '', 'Unknown'] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Feed
      Analytics.find({ type: 'interaction', ...dateFilter })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
      // Pageviews trends (in local Pakistan timezone to avoid offset mismatches)
      Analytics.aggregate([
        { $match: viewsMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: range === 'today' ? '%Y-%m-%d-%H' : '%Y-%m-%d',
                date: '$timestamp',
                timezone: 'Asia/Karachi'
              }
            },
            count: { $sum: 1 }
          }
        }
      ]),
      // Orders trends (in local Pakistan timezone)
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: range === 'today' ? '%Y-%m-%d-%H' : '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Karachi'
              }
            },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Top Selling Products Aggregation
      Order.aggregate([
        { $match: orderMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            quantity: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          }
        },
        { $sort: { quantity: -1 } },
        { $limit: 5 }
      ])
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

    const totalOrdersCount = ordersSummary[0]?.totalOrdersCount || 0;
    const totalRevenue = ordersSummary[0]?.totalRevenue || 0;
    const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

    const uniqueSessionsCountVal = uniqueSessionsCount.length || 0;
    const conversionRate = uniqueSessionsCountVal > 0 ? ((totalOrdersCount / uniqueSessionsCountVal) * 100) : 0;

    // Abandoned Cart Leak Calculator (depends on checkoutSessions)
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

    const funnelTotalSessions = uniqueSessionsCountVal;
    const funnelProductViewSessionsCount = funnelProductViewSessions[0]?.count || 0;
    const funnelAddToCartSessionsCount = funnelAddToCartSessions[0]?.count || 0;
    const funnelBeginCheckoutSessionsCount = funnelBeginCheckoutSessions[0]?.count || 0;
    const funnelPurchases = totalOrdersCount;

    const stepPct = (current: number, previous: number): number => {
      if (previous === 0) return 0;
      return parseFloat(((current / previous) * 100).toFixed(1));
    };

    // Build the structured funnel object
    const conversionFunnel = [
      {
        step: 1,
        label: 'Total Visits',
        description: 'Unique sessions on the store',
        count: funnelTotalSessions,
        conversionFromPrevious: 100,
        conversionToEnd: stepPct(funnelPurchases, funnelTotalSessions),
      },
      {
        step: 2,
        label: 'Product Views',
        description: 'Sessions that viewed at least one product',
        count: funnelProductViewSessionsCount,
        conversionFromPrevious: stepPct(funnelProductViewSessionsCount, funnelTotalSessions),
        conversionToEnd: stepPct(funnelPurchases, funnelProductViewSessionsCount),
      },
      {
        step: 3,
        label: 'Add to Cart',
        description: 'Sessions that added at least one item to cart',
        count: funnelAddToCartSessionsCount,
        conversionFromPrevious: stepPct(funnelAddToCartSessionsCount, funnelProductViewSessionsCount),
        conversionToEnd: stepPct(funnelPurchases, funnelAddToCartSessionsCount),
      },
      {
        step: 4,
        label: 'Initiated Checkout',
        description: 'Sessions that started the checkout process',
        count: funnelBeginCheckoutSessionsCount,
        conversionFromPrevious: stepPct(funnelBeginCheckoutSessionsCount, funnelAddToCartSessionsCount),
        conversionToEnd: stepPct(funnelPurchases, funnelBeginCheckoutSessionsCount),
      },
      {
        step: 5,
        label: 'Purchases',
        description: 'Completed orders placed',
        count: funnelPurchases,
        conversionFromPrevious: stepPct(funnelPurchases, funnelBeginCheckoutSessionsCount),
        conversionToEnd: 100,
      },
    ];

    const searches = topSearches.filter(s => s._id).map(s => ({ keyword: s._id, count: s.count }));
    const categories = popularCategoriesAgg.filter(c => c._id).map(c => ({ category: c._id, count: c.count }));

    const finalAgeData = ageDemographics.filter(a => a._id).map(a => ({ range: a._id, count: a.count }));
    const finalGenderData = genderDemographics.filter(g => g._id).map(g => ({ gender: g._id, count: g.count }));
    const finalOsData = osAggregation.filter(o => o._id).map(o => ({ os: o._id, count: o.count }));
    const finalBrowserData = browserAggregation.filter(b => b._id).map(b => ({ browser: b._id, count: b.count }));
    const finalLocationData = locationAggregation.filter(l => l._id).map(l => ({ city: l._id, count: l.count }));

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

    // 4. Daily Sales & Conversion Graph Metrics (in-memory lookup mapping)
    const chartLabels: string[] = [];
    const revenueData: number[] = [];
    const conversionData: number[] = [];
    const pageviewsData: number[] = [];

    const viewsMap = new Map<string, number>();
    viewsTrendAgg.forEach(item => {
      if (item._id) viewsMap.set(item._id, item.count);
    });

    const ordersMap = new Map<string, { revenue: number; count: number }>();
    ordersTrendAgg.forEach(item => {
      if (item._id) ordersMap.set(item._id, { revenue: item.revenue, count: item.count });
    });

    // Formatting date helper for O(1) in-memory lookups
    const getTzKey = (d: Date, withHour: boolean) => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(d);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;
      
      if (withHour) {
        return `${year}-${month}-${day}-${hour}`;
      }
      return `${year}-${month}-${day}`;
    };

    if (range === 'today') {
      // 24 hours trend
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(now.getHours() - i);
        date.setMinutes(0, 0, 0);

        const tzKey = getTzKey(date, true);
        const label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        chartLabels.push(label);

        const views = viewsMap.get(tzKey) || 0;
        pageviewsData.push(views);

        const orderInfo = ordersMap.get(tzKey) || { revenue: 0, count: 0 };
        revenueData.push(orderInfo.revenue);
        conversionData.push(views > 0 ? ((orderInfo.count / views) * 100) : 0);
      }
    } else {
      // Daily trend (7 or 30 days)
      const dayCount = range === '30days' || range === 'all' ? 30 : 7;
      for (let i = dayCount - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const tzKey = getTzKey(date, false);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartLabels.push(label);

        const views = viewsMap.get(tzKey) || 0;
        pageviewsData.push(views);

        const orderInfo = ordersMap.get(tzKey) || { revenue: 0, count: 0 };
        revenueData.push(orderInfo.revenue);
        conversionData.push(views > 0 ? ((orderInfo.count / views) * 100) : 0);
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
          uniqueSessionsCount: uniqueSessionsCountVal,
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
        topProducts: topProductsAgg,
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
