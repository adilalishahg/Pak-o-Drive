import mongoose from 'mongoose';
import dbConnect from './mongodb';
import Product from '../models/Product';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';

export interface TrendingAdIntelligence {
  id: string;
  productName: string;
  category: string;
  platform: 'TikTok' | 'Meta' | 'Instagram' | 'All';
  isExistingInStore: boolean;
  storeProductId?: string;
  storeProductSlug?: string;
  estimatedDemandScore: number; // 1-100
  competitorAdAngle: string;
  competitorPricePKR: number;
  estimatedSourcingCostPKR: number;
  suggestedRetailPricePKR: number;
  estimatedProfitMarginPKR: number;
  viralHook: {
    textOnScreen: string;
    verbalHookUrdu: string;
    hookStyle: 'Problem-Agitation' | 'Curiosity-Gap' | 'Luxury-Flex' | 'Before-After' | 'Urgency-FOMO';
  };
  videoProductionGuide: {
    conceptOverview: string;
    cameraSetup: string;
    sceneBreakdown: Array<{
      timeSeconds: string;
      visualShot: string;
      audioVoiceover: string;
      cameraAngle: string;
    }>;
    shootingTipsUrdu: string;
  };
  voiceoverScriptUrdu: string;
  adTargetingKeywords: string[];
  referenceAdStyle: string;
}

import SiteInfo from '../models/SiteInfo';

export interface IntelligenceReportPayload {
  generatedAt: string;
  marketSummary: string;
  topTrends: TrendingAdIntelligence[];
  limit?: number;
}

export async function generateTrendingIntelligence(requestedLimit?: number): Promise<IntelligenceReportPayload> {
  await dbConnect();

  let limit = requestedLimit;
  if (!limit || limit <= 0) {
    try {
      const siteInfo = await SiteInfo.findOne().lean();
      limit = siteInfo?.trendingProductLimit || 10;
    } catch {
      limit = 10;
    }
  }

  const activeLimit: number = limit || 10;

  // Fetch products from store according to limit
  const storeProducts = await Product.find({ stock: { $gt: 0 } })
    .select('name price slug category image')
    .limit(activeLimit)
    .lean();

  const storeProductSummary = storeProducts
    .map((p: any) => `• ${p.name} (Price: Rs. ${p.price}, Cat: ${p.category || 'Accessories'}, Slug: ${p.slug || p._id})`)
    .join('\n');

  const apiKey = getApiKey();

  if (!apiKey) {
    return getFallbackIntelligence(storeProducts, activeLimit);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const existingCount = Math.max(1, Math.ceil(activeLimit * 0.6));
    const newCount = Math.max(1, activeLimit - existingCount);


    const prompt = `You are a master Pakistani E-Commerce Growth Hacker, Media Buyer, and Viral Creative Director specializing in automotive accessories and tech gadgets for the Pakistani market (TikTok Ads, Instagram Reels, Facebook Ads).

Current Live Products in Pak-o-Drive Store:
${storeProductSummary || 'Universal Ambient LED Lights, Fast Car Charger, Solar Freshener, Dash Cam'}

Task:
Analyze current high-performing viral ad trends in Pakistan (2026) for automotive & gadget e-commerce.
Generate EXACTLY ${activeLimit} detailed trend intelligence dossiers:
- ${existingCount} based on existing store products (or closely related items)
- ${newCount} high-demand new winning products not yet in the store

For EACH item, provide in valid JSON format:
1. id (string)
2. productName (string)
3. category (string)
4. platform ("TikTok" | "Meta" | "Instagram" | "All")
5. isExistingInStore (boolean)
6. estimatedDemandScore (number 70-99)
7. competitorAdAngle (concise explanation of psychological angle)
8. competitorPricePKR (number)
9. estimatedSourcingCostPKR (number)
10. suggestedRetailPricePKR (number)
11. estimatedProfitMarginPKR (number)
12. viralHook: {
      textOnScreen: string (bold, eye-catching text),
      verbalHookUrdu: string (natural Roman Urdu first 3-second line),
      hookStyle: "Problem-Agitation" | "Curiosity-Gap" | "Luxury-Flex" | "Before-After" | "Urgency-FOMO"
    }
13. videoProductionGuide: {
      conceptOverview: string,
      cameraSetup: string (e.g. Smartphone iPhone/Android, Night Mode, Tripod),
      sceneBreakdown: [
        { timeSeconds: "0:00 - 0:03", visualShot: string, audioVoiceover: string, cameraAngle: string },
        { timeSeconds: "0:03 - 0:08", visualShot: string, audioVoiceover: string, cameraAngle: string },
        { timeSeconds: "0:08 - 0:15", visualShot: string, audioVoiceover: string, cameraAngle: string },
        { timeSeconds: "0:15 - 0:22", visualShot: string, audioVoiceover: string, cameraAngle: string },
        { timeSeconds: "0:22 - 0:30", visualShot: string, audioVoiceover: string, cameraAngle: string }
      ],
      shootingTipsUrdu: string (practical smartphone shooting tips in car)
    }
14. voiceoverScriptUrdu: string (complete Roman Urdu script with emojis)
15. adTargetingKeywords: string[] (5-7 Facebook/TikTok interest keywords)
16. referenceAdStyle: string (e.g. "Viral POV Car Transformation")

Return ONLY a valid JSON object matching this structure:
{
  "generatedAt": "${new Date().toISOString()}",
  "marketSummary": "Brief 2-line executive summary of Pakistani automotive TikTok/Meta trends today",
  "topTrends": [ ...${activeLimit} items... ]
}`;

    const res = await model.generateContent(prompt);
    const rawText = res.response.text().trim();
    const cleanJson = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return { ...parsed, limit: activeLimit };
  } catch (err) {
    console.error('[IntelligenceEngine] Gemini generation error, using curated fallback:', err);
    return getFallbackIntelligence(storeProducts, activeLimit);
  }
}


/**
 * High-quality curated default intelligence for Pakistani market
 */
function getFallbackIntelligence(storeProducts: any[], limit: number = 10): IntelligenceReportPayload {

  const ambientProd = storeProducts.find((p) => /ambient|light|led/i.test(p.name));
  const chargerProd = storeProducts.find((p) => /charger|fast|cable/i.test(p.name));

  return {
    generatedAt: new Date().toISOString(),
    marketSummary:
      'Pakistani TikTok & Meta feeds par interior luxury aesthetics aur problem-solver car gadgets 4.2x higher conversion rate deliver kar rahe hain with Cash on Delivery focus.',
    topTrends: [
      {
        id: 'trend_1',
        productName: ambientProd?.name || 'Universal 64-Color Dynamic App-Controlled Ambient Lighting',
        category: 'Interior Styling',
        platform: 'TikTok',
        isExistingInStore: Boolean(ambientProd),
        storeProductId: ambientProd?._id?.toString(),
        storeProductSlug: ambientProd?.slug || ambientProd?._id?.toString(),
        estimatedDemandScore: 96,
        competitorAdAngle:
          'Luxury Interior Transformation: Meharban/Purani gari ko bina wire cut kiye Mercedes/Audi jesi luxury look dena.',
        competitorPricePKR: 3200,
        estimatedSourcingCostPKR: 1400,
        suggestedRetailPricePKR: 2850,
        estimatedProfitMarginPKR: 1450,
        viralHook: {
          textOnScreen: '🚨 Stop Driving A Boring Car At Night!',
          verbalHookUrdu: 'Bhai agar aapki gari me ambient lighting nahi lagi tou aap 2026 me nahi 2010 me travel kar rahe hain!',
          hookStyle: 'Before-After',
        },
        videoProductionGuide: {
          conceptOverview: 'Night drive POV transition from dark boring dashboard to vibrant dynamic neon glow.',
          cameraSetup: 'Smartphone back camera (0.5x Ultra-Wide), Night Mode ON, Car interior lights OFF.',
          sceneBreakdown: [
            {
              timeSeconds: '0:00 - 0:03',
              visualShot: 'Andheri gari me snap finger transition',
              audioVoiceover: 'Bhai agar aapki gari raat ko aam si lagti hai tou ye dekhein!',
              cameraAngle: 'POV Driver seat looking at dashboard',
            },
            {
              timeSeconds: '0:03 - 0:09',
              visualShot: 'Mobile app se color change karte hue music sync mode',
              audioVoiceover: 'Phone app se 64 colors switch karein aur beat ke sath lights dance kareingi.',
              cameraAngle: 'Close-up on Phone Screen & Dashboard strips',
            },
            {
              timeSeconds: '0:09 - 0:16',
              visualShot: 'Easy USB plug-in demonstration (No wire cutting)',
              audioVoiceover: 'Zero wiring cut! Sirf USB lagao aur 5 minute me install.',
              cameraAngle: 'Side angle near USB port',
            },
            {
              timeSeconds: '0:16 - 0:24',
              visualShot: 'Wide cinematic shot of car driving at night with glowing interior',
              audioVoiceover: 'Pakistan bhar me Free Cash on Delivery aur 7-Day Warranty.',
              cameraAngle: 'Front passenger looking at driver & cockpit',
            },
            {
              timeSeconds: '0:24 - 0:30',
              visualShot: 'Call to action card with Order Now button pointer',
              audioVoiceover: 'Abhi nechy diye gaye link par click karein aur apna discount claim karein!',
              cameraAngle: 'Product box on dashboard',
            },
          ],
          shootingTipsUrdu:
            'Raat ke waqt kisi khule road ya parking me shoot karein. Camera lens achi tarah saaf karein taake lights me lens flare na aye.',
        },
        voiceoverScriptUrdu:
          'Assalam-o-Alaikum car lovers! Kia aapki gari raat ko andhere me bore lagti hai? ✨ Ab apni kisi bhi gari ko banaein Mercedes jesi luxury! 🚗 Universal 64-Color Dynamic Ambient Light jo direct USB se connect hoti hai — koi wire cutting nahi! Phone app se colors change karein aur music beats par sync karein. Pure Pakistan me Free Cash on Delivery! Order karne ke liye bio me link check karein.',
        adTargetingKeywords: [
          'Honda Civic Pakistan',
          'Toyota Corolla Modification',
          'Car Tuning & Styling',
          'PakWheels',
          'Online Shopping Pakistan',
        ],
        referenceAdStyle: 'POV Night Drive Neon Transformation',
      },
      {
        id: 'trend_2',
        productName: chargerProd?.name || '3-in-1 Retractable Super Fast Dual Port Car Charger',
        category: 'Car Electronics',
        platform: 'Meta',
        isExistingInStore: Boolean(chargerProd),
        storeProductId: chargerProd?._id?.toString(),
        storeProductSlug: chargerProd?.slug || chargerProd?._id?.toString(),
        estimatedDemandScore: 92,
        competitorAdAngle:
          'Tangled Wires Solution: Gari me bikhri hui cables aur slow charging ki tension hamesha ke liye khatam.',
        competitorPricePKR: 2499,
        estimatedSourcingCostPKR: 1100,
        suggestedRetailPricePKR: 2200,
        estimatedProfitMarginPKR: 1100,
        viralHook: {
          textOnScreen: '❌ Stop Using Tangled Messy Cables in Your Car!',
          verbalHookUrdu: 'Gari me phaili hui taaron se tang aa chuke hain? Ye 1-second retractable gadget dekhein!',
          hookStyle: 'Problem-Agitation',
        },
        videoProductionGuide: {
          conceptOverview: 'Problem demonstration (cluttered cables) vs instant tidy pull-to-retract satisfaction.',
          cameraSetup: 'Standard smartphone at eye-level handheld in center console.',
          sceneBreakdown: [
            {
              timeSeconds: '0:00 - 0:03',
              visualShot: 'Messy entangled cables near gear shifter, frustrated hand',
              audioVoiceover: 'Gari me har waqt taaron ka janjal bana rehta hai?',
              cameraAngle: 'Close-up Center Console',
            },
            {
              timeSeconds: '0:03 - 0:09',
              visualShot: 'Plugging in 3-in-1 Retractable charger, pulling cable smoothly',
              audioVoiceover: 'Ye hai 3-in-1 Retractable Super Fast Charger! Ek click me cable wapis andar.',
              cameraAngle: 'Medium shot Cigarette lighter socket',
            },
            {
              timeSeconds: '0:09 - 0:16',
              visualShot: 'iPhone and Type-C Android charging simultaneously with Fast Charge indicator',
              audioVoiceover: 'iPhone aur Android dono 65W ultra fast speed se charge hotay hain.',
              cameraAngle: 'Close-up Phone Battery Charging Animation',
            },
            {
              timeSeconds: '0:16 - 0:24',
              visualShot: 'Clean, spotless dashboard & console view',
              audioVoiceover: 'Gari clean aur premium lagti hai. Cash on Delivery available.',
              cameraAngle: 'Wide Cabin shot',
            },
            {
              timeSeconds: '0:24 - 0:30',
              visualShot: 'Packaging box reveal & Order CTA',
              audioVoiceover: 'Shop Now par click karein aur Rs. 1,000 off claim karein!',
              cameraAngle: 'Hand holding charger toward camera',
            },
          ],
          shootingTipsUrdu:
            'Din ke waqt natural daylight me shoot karein taake cable pull aur retract ki smooth animation clear dikhay.',
        },
        voiceoverScriptUrdu:
          'Bhai kia aapki gari me bhi charging cables ka bura haal rehta hai? ⚡ Ye 3-in-1 Retractable Fast Charger aapki gari ko clean aur modern banata hai! Type-C aur Lightning dono cables andar se nikalti hain aur use ke baad automatic roll ho jati hain. Super Fast 65W charging! Pak-o-Drive par Free Delivery ke sath order karein.',
        adTargetingKeywords: [
          'Smartphone Accessories',
          'Fast Charging',
          'Uber / Careem Drivers Pakistan',
          'Tech Gadgets Pakistan',
          'Automotive electronics',
        ],
        referenceAdStyle: 'Problem vs Solution Satisfying Retract',
      },
      {
        id: 'trend_3',
        productName: 'Solar Powered Dual-Ring Auto-Rotating Dashboard Freshener',
        category: 'Car Aromatherapy',
        platform: 'TikTok',
        isExistingInStore: false,
        estimatedDemandScore: 89,
        competitorAdAngle:
          'Perpetual Motion Solar Magic: Bina battery dhoop me ghoomne wala luxury cologne jo gari ki smell door kare.',
        competitorPricePKR: 1850,
        estimatedSourcingCostPKR: 750,
        suggestedRetailPricePKR: 1650,
        estimatedProfitMarginPKR: 900,
        viralHook: {
          textOnScreen: '☀️ Zero Battery! Spins Only In Sunlight!',
          verbalHookUrdu: 'Bina battery ya charging ke dhoop aate hi ghoomne lag jata hai!',
          hookStyle: 'Curiosity-Gap',
        },
        videoProductionGuide: {
          conceptOverview: 'Sunlight trigger demonstration and levitating spinning illusion on car dashboard.',
          cameraSetup: 'Sunny day dashboard shot with shallow depth of field (Portrait mode).',
          sceneBreakdown: [
            {
              timeSeconds: '0:00 - 0:03',
              visualShot: 'Shadow on dashboard freshener (still), then moving hand away to let sun hit it (starts spinning fast)',
              audioVoiceover: 'Ye koi aam freshener nahi hai! Jaise hi dhoop lagti hai, ye automatic ghoomta hai.',
              cameraAngle: 'Front Dashboard Portrait shot',
            },
            {
              timeSeconds: '0:03 - 0:10',
              visualShot: 'Slow motion spinning rings looking like floating gyroscope',
              audioVoiceover: 'Solar energy se continuous fragrance phailata hai bina kisi battery ke.',
              cameraAngle: 'Macro 45-degree angle',
            },
            {
              timeSeconds: '0:10 - 0:18',
              visualShot: 'Opening base, inserting solid aroma ring (no liquid leak)',
              audioVoiceover: 'Solid cologne ring leak-proof hai, AC ke sath pure cabin me smell fresh rehti hai.',
              cameraAngle: 'Hand unboxing & refill placement',
            },
            {
              timeSeconds: '0:18 - 0:30',
              visualShot: 'Customer smiling entering car, COD delivery sticker',
              audioVoiceover: 'Abhi order karein aur Free Cash on Delivery hasil karein!',
              cameraAngle: 'Driver door open perspective',
            },
          ],
          shootingTipsUrdu:
            'Dopahar ke waqt bright sunlight me gari park karke shoot karein taake solar rotation instant aur fast dikhay.',
        },
        voiceoverScriptUrdu:
          'Gari me bad smell se pareshan hain? 🚗✨ Ye Solar Levitating Dual-Ring Car Freshener dekhein! Isme koi battery nahi dalti — dhoop aate hi automatic spin karta hai aur pure cabin me long-lasting luxury fragrance phailata hai. Solid natural cologne ring leak-free hai. Cash On Delivery available across Pakistan!',
        adTargetingKeywords: [
          'Car detailing Pakistan',
          'Perfumes & Fragrances',
          'Luxury Lifestyle',
          'Car Interior Accessories',
        ],
        referenceAdStyle: 'Sunlight Activation Visual ASMR',
      },
      {
        id: 'trend_4',
        productName: 'High-Pressure Cordless Wireless Car Washer Foam Gun',
        category: 'Car Care & Cleaning',
        platform: 'Meta',
        isExistingInStore: false,
        estimatedDemandScore: 94,
        competitorAdAngle:
          'Save Car Wash Money: Har hafte service station par Rs. 1,000 bachao, ghar par 5 minute me snow foam wash karo.',
        competitorPricePKR: 6500,
        estimatedSourcingCostPKR: 3200,
        suggestedRetailPricePKR: 5499,
        estimatedProfitMarginPKR: 2299,
        viralHook: {
          textOnScreen: '💰 Stop Paying Rs. 1000 Every Week for Car Wash!',
          verbalHookUrdu: 'Service station walon ko har hafte hazaron rupay dena band karein!',
          hookStyle: 'Problem-Agitation',
        },
        videoProductionGuide: {
          conceptOverview: 'Dirty muddy car tire/bonnet blasted clean with thick foam and high pressure stream from bucket.',
          cameraSetup: 'Outdoor daylight, 60fps slow-motion water splash shots.',
          sceneBreakdown: [
            {
              timeSeconds: '0:00 - 0:04',
              visualShot: 'Dirty muddy wheel rim blasted with high pressure nozzle, instant clean strip',
              audioVoiceover: 'Kia aap bhi service station ke lambe intizar se pareshan hain?',
              cameraAngle: 'Low angle tire close-up',
            },
            {
              timeSeconds: '0:04 - 0:11',
              visualShot: 'Dropping hose into normal water bucket (no tap required), pulling trigger',
              audioVoiceover: 'Bina bijli ya direct nalka ke — sirf bucket se high pressure foam spray karein!',
              cameraAngle: 'Wide shot showing person washing in driveway',
            },
            {
              timeSeconds: '0:11 - 0:18',
              visualShot: 'Thick snow foam bottle attachment spraying entire car in white foam',
              audioVoiceover: 'Rechargeable lithium battery 45 minutes tak zabardast pressure deti hai.',
              cameraAngle: 'Front 3/4 car profile',
            },
            {
              timeSeconds: '0:18 - 0:30',
              visualShot: 'Shiny clean car result, complete briefcase kit with nozzles',
              audioVoiceover: 'Full kit Cash on Delivery par mangwane ke liye neeche click karein!',
              cameraAngle: 'Kit unboxing case on bonnet',
            },
          ],
          shootingTipsUrdu:
            'Water splash ko slow motion (60fps ya 120fps) me record karein. Dirt vs clean area ka direct comparison dikhayein.',
        },
        voiceoverScriptUrdu:
          'Service station par har hafte waqt aur paisa zaya mat karein! 🚿 Ye Cordless High Pressure Car Washer Gun aapko ghar bethe professional car wash ka maza deti hai. Kisi bijli ke wire ya tap ki zaroorat nahi — bucket me pipe dalein aur high pressure water & foam wash karein! Rechargeable battery ke sath. 7-Day Replacement Guarantee & Free COD!',
        adTargetingKeywords: [
          'Car Detailing Pakistan',
          'Pressure Washers',
          'DIY Car Care',
          'Toyota Hilux / Revo Pakistan',
          'Honda Civic Lovers',
        ],
        referenceAdStyle: 'High-Pressure Water Blasting Satisfying ASMR',
      },
      {
        id: 'trend_5',
        productName: 'HD 1080P Dual Lens Dash Cam with Night Vision & Parking Monitor',
        category: 'Driving Safety & Security',
        platform: 'All',
        isExistingInStore: false,
        estimatedDemandScore: 91,
        competitorAdAngle:
          'Road Protection & Evidence: Traffic police challan, road rash, ya fake accident claims se 100% video proof ke sath bachein.',
        competitorPricePKR: 5800,
        estimatedSourcingCostPKR: 2600,
        suggestedRetailPricePKR: 4999,
        estimatedProfitMarginPKR: 2399,
        viralHook: {
          textOnScreen: '🛡️ Every Pakistani Driver Needs This For Safety!',
          verbalHookUrdu: 'Pakistan ki roads par gari chalate hain tou ye camera aapko baray nuqsan se bacha sakta hai!',
          hookStyle: 'Urgency-FOMO',
        },
        videoProductionGuide: {
          conceptOverview: 'Front & rear dual recording split screen with loop recording and shock sensor demonstration.',
          cameraSetup: 'Windshield mounting view + daytime and nighttime road footage sample.',
          sceneBreakdown: [
            {
              timeSeconds: '0:00 - 0:03',
              visualShot: 'POV close call near-miss on Pakistani road, camera recording',
              audioVoiceover: 'Road par kisi bhi misunderstanding me aapke pas proof hona lazmi hai!',
              cameraAngle: 'Behind Rearview Mirror POV',
            },
            {
              timeSeconds: '0:03 - 0:10',
              visualShot: 'Crystal clear HD screen showing Front and Back camera simultaneous feed',
              audioVoiceover: 'Dual Lens HD Dash Cam jo front aur rear dono record karta hai crystal clear night vision ke sath.',
              cameraAngle: 'Close-up Dashcam IPS Display',
            },
            {
              timeSeconds: '0:10 - 0:18',
              visualShot: 'G-Sensor Gari hilti hai tou auto-lock recording trigger hoti hai',
              audioVoiceover: 'Parking monitor aur auto crash lock recording ke sath.',
              cameraAngle: 'Finger tapping dashcam screen',
            },
            {
              timeSeconds: '0:18 - 0:30',
              visualShot: 'Package box with memory card offer and Order Now button',
              audioVoiceover: 'Apni gari aur family ki safety ke liye abhi Cash on Delivery par order karein!',
              cameraAngle: 'Packaging on dashboard with COD badge',
            },
          ],
          shootingTipsUrdu:
            'Gari ke windscreen par clean suction cup se mount karein aur raat ke time road recording ka sample clear dikhayein.',
        },
        voiceoverScriptUrdu:
          'Pakistan ki roads par gari chalate waqt safety sab se pehle! 📹 HD Dual Lens Dash Cam aapki gari ke aagay aur peeche dono sides ko 1080P clarity me record karta hai. Night vision, parking sensor, aur automatic shock recording ke sath. Kisi bhi fake accident ya dispute me aapka solid proof! Free Home Delivery & Cash on Delivery across Pakistan.',
        adTargetingKeywords: [
          'Car Insurance Pakistan',
          'Motorway Police Pakistan',
          'Road Safety',
          'Driving in Karachi / Lahore / Islamabad',
        ],
        referenceAdStyle: 'Real Road Safety POV Evidence',
      },
    ],
  };
}
