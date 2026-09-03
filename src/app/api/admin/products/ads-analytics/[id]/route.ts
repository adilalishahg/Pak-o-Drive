import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../../../lib/mongodb';
import Product from '../../../../../../models/Product';
import Order from '../../../../../../models/Order';
import { formatLiveAdLinks } from '../../../../../../lib/intelligenceEngine';
import { resolveProductAdIntelligence } from '../../../../../../lib/adIntelligenceAi';
import { ISingleProductAdDetails } from '../../../../../../types/productAds';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Enforce Admin Authentication
    const cookieHeader = request.headers.get('cookie') || '';
    const hasAdminCookie = cookieHeader.includes('admin_token=pakodrive_admin_secret_token');
    const authHeader = request.headers.get('authorization') || '';
    const hasAuthHeader = authHeader === 'Bearer pakodrive_admin_secret_token';

    if (!hasAdminCookie && !hasAuthHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication session required.' },
        { status: 401 }
      );
    }

    await dbConnect();

    let productDoc: any = null;
    let isStoreProduct = true;

    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      productDoc = await Product.findById(id).lean();
    }

    if (!productDoc) {
      // Try slug query
      productDoc = await Product.findOne({ slug: id }).lean();
    }

    let productName = 'Trending Product';
    let productPrice = 3500;
    let originalPrice: number | undefined = undefined;
    let category = 'Electronics & Gadgets';
    let image = '/img/product-placeholder.png';
    let stock = 10;
    let storeId = id;

    if (productDoc) {
      productName = productDoc.name || 'Product';
      productPrice = Number(productDoc.price) || 0;
      originalPrice = productDoc.originalPrice ? Number(productDoc.originalPrice) : undefined;
      category = productDoc.category || 'General';
      image = productDoc.image || '/img/product-placeholder.png';
      stock = Number(productDoc.stock) || 0;
      storeId = String(productDoc._id);
    } else {
      isStoreProduct = false;
      // Handle trend item format
      productName = id.replace(/^trend_/, '').replace(/-/g, ' ').replace(/_/g, ' ');
      productName = productName.replace(/\b\w/g, (l) => l.toUpperCase());
    }

    // 2. Aggregate Sales for this Product from Orders
    const orders = await Order.find({ status: { $ne: 'Cancelled' } })
      .select('items')
      .lean();

    let totalSold = 0;
    let totalRevenuePKR = 0;
    let ordersCount = 0;

    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (
            (item.productId && String(item.productId) === storeId) ||
            (item.name && item.name.toLowerCase().trim() === productName.toLowerCase().trim())
          ) {
            const qty = Number(item.quantity) || 1;
            totalSold += qty;
            totalRevenuePKR += (Number(item.price) || productPrice) * qty;
            ordersCount += 1;
          }
        });
      }
    });

    // 3. Generate Dynamic Ad Intelligence & Scripts
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      hash = (hash << 5) - hash + productName.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const activeAdsCountPK = 10 + (absHash % 28) + Math.min(15, Math.floor(totalSold / 2));
    const demandScore = Math.min(99, Math.max(55, 65 + (absHash % 30) + Math.floor(totalSold * 1.5)));
    const estimatedDailySpendPKR = Math.round(activeAdsCountPK * (1800 + (absHash % 1500)));
    const competitorPricePKR = Math.round(productPrice * (1 + ((absHash % 20) - 8) / 100));
    const estimatedSourcingCostPKR = Math.round(productPrice * 0.45);
    const estimatedProfitMarginPKR = productPrice - estimatedSourcingCostPKR - 350; // deducting estimated shipping

    const aiAdData = await resolveProductAdIntelligence(productName, category, productPrice);
    const liveLinks = formatLiveAdLinks(aiAdData.coreMarketTerm);

    const verbalHooks = [
      `Agar aap bhi roz is maslay se tang hain, tou yeh video aapke lye hai!`,
      `Pakistani market mein yeh viral gadget sab se zyada kyu bik raha hai? Dekhein khud!`,
      `Stop scrolling! Yeh ek aisi cheez hai jo har Pakistani ke pas honi chahiye!`,
      `Kam paison mein itna premium feature? Daraz aur market se aadhay rate par!`,
      `Yeh choti si device aapke rozana ke hazaron rupay bacha sakti hai!`,
    ];

    const screenTexts = [
      `🔥 Trending in Pakistan Right Now!`,
      `⚠️ Market Rate: Rs. ${competitorPricePKR} vs Pak-o-Drive: Rs. ${productPrice}`,
      `📦 Cash on Delivery All Over Pakistan!`,
      `⚡ 3 Din Ki Limited Discount Offer!`,
      `💯 100% Original & Checked Quality`,
    ];

    const voiceoverScripts = [
      `Kia aap bhi standard accessories se tang aa chukay hain? Paish hai ${aiAdData.coreMarketTerm}! Iski build quality aur performance unmatchable hai. Abhi order karein pure Pakistan mein Cash on Delivery ke sath. Stock limited hai!`,
      `Internet par viral yeh ${aiAdData.coreMarketTerm} ab official Pak-o-Drive par available hai. Wholesale price aur 7 days return guarantee ke sath apne ghar mangwayein. Click order now button!`,
      `Yeh gadget aapki rozmarrah ki zindagi ko 10 gunna aasan bana dega! Check karein iski unboxing aur features. Cash on Delivery available nationwide.`,
    ];

    const details: ISingleProductAdDetails = {
      id: storeId,
      name: productName,
      image,
      category,
      price: productPrice,
      originalPrice,
      stock,
      isStoreProduct,
      coreMarketTerm: aiAdData.coreMarketTerm,
      marketKeywords: aiAdData.marketKeywords,
      totalSold,
      totalRevenuePKR,
      ordersCount,
      activeAdsCountPK,
      estimatedDailySpendPKR,
      demandScore,
      platforms: ['Meta', 'TikTok', 'Instagram', 'Google'],
      topAdAngle: 'Problem-Solution Video Hook (Reels/TikTok Format)',
      competitorPricePKR,
      metaAdLibraryPkUrl: liveLinks.metaAdLibraryPk,
      tiktokSearchPkUrl: liveLinks.tiktokSearchPk,
      youtubeReviewPkUrl: liveLinks.youtubeSearchPk,
      topCompetitorAds: aiAdData.topCompetitorAds,

      viralHook: {
        textOnScreen: screenTexts[absHash % screenTexts.length],
        verbalHookUrdu: verbalHooks[absHash % verbalHooks.length],
        hookStyle: 'Problem-Agitation & Viral Curiosity',
      },

      voiceoverScriptUrdu: voiceoverScripts[absHash % voiceoverScripts.length],

      videoProductionGuide: {
        conceptOverview: `High-energy 15-25 second vertical 9:16 UGC style video shot on phone camera with clear lighting and ambient background sound.`,
        cameraSetup: `Smartphone 4K/60fps or 1080p, Ring light or soft daylight window setup.`,
        sceneBreakdown: [
          {
            timeSeconds: '0:00 - 0:03',
            visualShot: `Close-up fast cut of the common daily frustration or unboxing moment.`,
            audioVoiceover: verbalHooks[absHash % verbalHooks.length],
            cameraAngle: `First-person POV hand-held shot.`,
          },
          {
            timeSeconds: '0:03 - 0:08',
            visualShot: `Reveal of ${productName} in action with macro shots of key connectors/buttons.`,
            audioVoiceover: `Paish hai yeh viral gadget jo aapki yeh problem foran hal karta hai.`,
            cameraAngle: `45-degree tabletop product close-up with soft background blur.`,
          },
          {
            timeSeconds: '0:08 - 0:15',
            visualShot: `Side-by-side or before-after demonstration showing immediate tangible result.`,
            audioVoiceover: `Iski testing dekhein! Market mein Rs. ${competitorPricePKR} ka hai jabkay hum direct importer price Rs. ${productPrice} mein de rahay hain.`,
            cameraAngle: `Eye-level engaging demonstration.`,
          },
          {
            timeSeconds: '0:15 - 0:20',
            visualShot: `Boxing up, showing secure bubble wrap parcel with Cash on Delivery slip.`,
            audioVoiceover: `Pure Pakistan mein Cash on Delivery aur 7-days check guarantee! Abhi Shop Now par tap karein.`,
            cameraAngle: `Top-down call to action shot pointing towards screen button.`,
          },
        ],
        shootingTipsUrdu: `Camera ko hamesha 9:16 vertical pakrein. Pehle 3 second mein hook tez rakhein taake user scroll na kare. Price aur Cash on Delivery ka text screen par barri font mein lagayein.`,
      },

      adTargetingKeywords: [
        'Online Shopping Pakistan',
        'Cash on Delivery',
        `${category} Pakistan`,
        'Lahore Shopping',
        'Karachi Online Deals',
        'Islamabad & Rawalpindi Tech',
        'Gadgets & Accessories',
        'TikTok Viral Deals',
      ],

      referenceAdStyle: 'Fast-paced TikTok UGC Product Demo + Pakistani COD Trust Badge',
      estimatedSourcingCostPKR,
      estimatedProfitMarginPKR,
    };

    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    console.error('Error fetching single product ad details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch single product ad details' },
      { status: 500 }
    );
  }
}
