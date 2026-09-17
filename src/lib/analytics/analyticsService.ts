import dbConnect from '../mongodb';
import Order from '../../models/Order';
import Product from '../../models/Product';
import Analytics from '../../models/Analytics';
import Contact from '../../models/Contact';
import Promotion from '../../models/Promotion';

export async function fetchDashboardAnalytics(range: string = '7days') {
  await dbConnect();

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
    dateFilter = {};
    orderDateFilter = {};
  }

  const matchStage = dateFilter.timestamp ? { $match: dateFilter } : { $match: {} };
  const orderMatch = {
    status: { $ne: 'Cancelled' },
    ...(orderDateFilter.createdAt ? { createdAt: orderDateFilter.createdAt } : {})
  };
  const viewsMatch = {
    type: 'pageview',
    ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {})
  };

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
    topProductsAgg,
    attributionCampaignsAggregation,
    ordersByCampaign
  ] = await Promise.all([
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
    Analytics.distinct('session_id', dateFilter),
    Product.countDocuments(),
    Contact.countDocuments(),
    Promotion.countDocuments(),
    Analytics.countDocuments({ type: 'pageview', ...dateFilter }),
    Analytics.countDocuments({ type: 'interaction', interactionType: 'add_to_cart', ...dateFilter }),
    Analytics.countDocuments({ type: 'interaction', interactionType: 'whatsapp_click', ...dateFilter }),
    Analytics.countDocuments({ type: 'interaction', interactionType: 'search_intent', ...dateFilter }),
    Analytics.distinct('session_id', {
      type: 'interaction',
      interactionType: 'checkout_success',
      ...dateFilter
    }),
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
    Analytics.aggregate([
      { $match: { type: 'interaction', interactionType: 'search_intent', ...dateFilter } },
      { $group: { _id: '$metadata.keyword', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Analytics.aggregate([
      { $match: { type: 'interaction', interactionType: 'view_product', ...dateFilter } },
      { $group: { _id: '$metadata.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]),
    Analytics.countDocuments({ device: 'Mobile', ...dateFilter }),
    Analytics.countDocuments({ device: 'Desktop', ...dateFilter }),
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
    Analytics.aggregate([
      { $match: { gender: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]),
    Analytics.aggregate([
      { $match: { os: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$os", count: { $sum: -1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Analytics.aggregate([
      { $match: { browser: { $exists: true, $nin: [null, ''] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Analytics.aggregate([
      { $match: { city: { $exists: true, $nin: [null, '', 'Unknown'] }, ...(dateFilter.timestamp ? { timestamp: dateFilter.timestamp } : {}) } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Analytics.find({ type: 'interaction', ...dateFilter })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),
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
    ]),
    Analytics.aggregate([
      matchStage,
      { $match: { utm_campaign: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: {
            utm_campaign: "$utm_campaign",
            utm_source: { $ifNull: ["$utm_source", "ad"] },
            session_id: "$session_id"
          },
          hasAddToCart: {
            $max: { $cond: [{ $eq: ["$interactionType", "add_to_cart"] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: {
            campaign: "$_id.utm_campaign",
            source: "$_id.utm_source"
          },
          visits: { $sum: 1 },
          add_to_carts: { $sum: "$hasAddToCart" }
        }
      }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, utmCampaign: { $exists: true, $ne: null }, ...(orderDateFilter.createdAt ? { createdAt: orderDateFilter.createdAt } : {}) } },
      {
        $group: {
          _id: "$utmCampaign",
          purchases: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ])
  ]);

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

  const campaignsTable = attributionCampaignsAggregation.map((camp: any) => {
    const campaignName = camp._id.campaign;
    const sourceName = camp._id.source;
    const orderStats = ordersByCampaign.find((o: any) => o._id === campaignName) || { purchases: 0, revenue: 0 };
    return {
      campaign: campaignName,
      source: sourceName,
      visits: camp.visits,
      add_to_carts: camp.add_to_carts,
      purchases: orderStats.purchases,
      revenue: orderStats.revenue,
      roas: orderStats.revenue > 0 ? (orderStats.revenue / (camp.visits * 15)) : 0
    };
  });

  const totalOrdersCount = ordersSummary[0]?.totalOrdersCount || 0;
  const totalRevenue = ordersSummary[0]?.totalRevenue || 0;
  const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;
  const uniqueSessionsCountVal = uniqueSessionsCount.length || 0;
  const conversionRate = uniqueSessionsCountVal > 0 ? ((totalOrdersCount / uniqueSessionsCountVal) * 100) : 0;

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

  return {
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
    campaigns: campaignsTable,
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
  };
}

export async function trackAnalyticsInteraction(body: any) {
  await dbConnect();
  const { type, path, interactionType, utm_source, utm_medium, utm_campaign, session_id, device, landing_page, metadata } = body;

  const doc = await Analytics.create({
    type: type || 'pageview',
    path: path || '/',
    interactionType,
    utm_source,
    utm_medium,
    utm_campaign,
    session_id,
    device,
    landing_page,
    metadata,
    timestamp: new Date()
  });

  return doc;
}
