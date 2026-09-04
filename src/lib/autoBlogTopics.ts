import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AutoTopic {
  topic: string;
  category: string;
  keywords: string[];
  hub: 'auto' | 'general';
}

export const AUTO_CATEGORIES = [
  'Car Maintenance',
  'Seasonal Car Care',
  'Fuel Economy & Tuning',
  'Smart Car Gadgets',
  'Driving Safety & Rules',
] as const;

export const GENERAL_CATEGORIES = [
  'Technology & AI',
  'Global & World',
  'Health & Wellness',
  'Fashion & Lifestyle',
  'Trending & Viral News',
] as const;

export const BLOG_CATEGORIES = [
  ...AUTO_CATEGORIES,
  ...GENERAL_CATEGORIES,
] as const;

/**
 * 🚗 1. Curated High-Intent Pak-o-Drive Automotive Topics (English for Pakistani Motorists)
 * Engineered for #1 Google SEO ranking, car problem-solving, and direct COD store orders.
 */
export const CURATED_AUTO_TOPICS: AutoTopic[] = [
  {
    topic: 'Top 5 Ways to Keep Your Car Cabin Chilled in 45°C Pakistan Summer Heat',
    category: 'Seasonal Car Care',
    hub: 'auto',
    keywords: ['car ac cooling hacks', 'pakistan summer heat car', 'windshield sunshade review', 'car cabin temperature reduction', 'ceramic tint film pakistan'],
  },
  {
    topic: 'Why Your Car AC Is Blowing Warm Air: Condenser Dust, Low Gas & DIY Checks for Pakistani Drivers',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['car ac not cooling properly', 'ac compressor oil check', 'ac vent foam cleaner', 'ac gas recharge price pakistan', 'diy car ac repair'],
  },
  {
    topic: 'Driving Through Dense Winter Smog on the M2 Motorway: Critical Fog Light & Defogger Rules',
    category: 'Driving Safety & Rules',
    hub: 'auto',
    keywords: ['m2 motorway smog rules', 'anti fog glass spray', 'car defogger hack', 'led fog lights pakistan', 'safe driving in smog lahore'],
  },
  {
    topic: 'Suzuki Alto & Wagon R Fuel Economy Masterclass: How to Consistently Extract 20+ KM/L in City Traffic',
    category: 'Fuel Economy & Tuning',
    hub: 'auto',
    keywords: ['suzuki alto fuel average', 'wagon r mileage tips', 'increase car fuel economy pakistan', 'tyre pressure fuel savings', 'obd2 scanner mileage'],
  },
  {
    topic: 'Car Paint Swirl Marks & Scratch Repair: Polishing Compounds vs Ceramic Wax Coats',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['remove car scratches pakistan', 'swirl mark remover paste', 'ceramic coating at home', 'car detailing polish compound', 'microfiber buffing towel'],
  },
  {
    topic: 'Monsoon Rain Car Care: Preventing Floor Rust, Damp Odors, and Windshield Fogging',
    category: 'Seasonal Car Care',
    hub: 'auto',
    keywords: ['monsoon car care pakistan', '7d floor mats waterproof', 'windshield wiper replacement', 'prevent car carpet smell', 'rain repellent water beading'],
  },
  {
    topic: 'Why Every Pakistani Driver Needs a Car Dashcam: Accident Proof, Police Challans & Insurance Claims',
    category: 'Smart Car Gadgets',
    hub: 'auto',
    keywords: ['best car dashcam pakistan', 'dash camera installation', 'accident video proof car', 'night vision dashcam review', 'car security camera'],
  },
  {
    topic: 'Emergency Car Battery Jump Starters: How Portable Power Banks Save You from Roadside Breakdown',
    category: 'Smart Car Gadgets',
    hub: 'auto',
    keywords: ['portable car jump starter', 'dead battery roadside help', 'jump start power bank review', 'car battery terminal care', 'emergency car kit pakistan'],
  },
  {
    topic: 'Solar Powered Car Air Fresheners vs Traditional Perfume Sprays: Which Lasts Longer in Intense Heat?',
    category: 'Smart Car Gadgets',
    hub: 'auto',
    keywords: ['solar car air freshener review', 'car perfume vs organic diffuser', 'eliminate car smoke smell', 'long lasting car fragrance pakistan', 'dashboard air freshener'],
  },
  {
    topic: 'Preventing Highway Tyre Blowouts in Extreme Summer: The Exact PSI Pressure Formula',
    category: 'Driving Safety & Rules',
    hub: 'auto',
    keywords: ['tyre blowout prevention motorway', 'summer tyre pressure psi', 'digital tyre inflator gauge', 'nitrogen vs air in car tyres', 'check tyre tread wear'],
  },
  {
    topic: 'Complete DIY Car Interior Deep Cleaning: Dashboard Protection, Leather Seats & High-Power Vacuums',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['diy car interior cleaning', 'portable high power car vacuum', 'dashboard uv polish spray', 'clean fabric car seats', 'car detailing accessories'],
  },
  {
    topic: 'Suzuki Mehran & Cultus Cooling System Optimization: Radiator Cleaning & Coolant Guide',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['mehran engine heat up solution', 'radiator coolant vs water', 'cultus thermostat valve', 'fan direct cooling pros cons', 'prevent engine overheating'],
  },
  {
    topic: 'Top 7 Essential Car Emergency Tools Every Family Vehicle in Pakistan Must Carry',
    category: 'Smart Car Gadgets',
    hub: 'auto',
    keywords: ['emergency car accessories pakistan', 'puncture repair kit tubeless', 'tow cable heavy duty', 'emergency led warning light', 'first aid kit for car'],
  },
  {
    topic: 'How to Protect Your Car Paint from Sun UV Damage, Bird Droppings & Acidic Dust',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['car paint uv protection', 'waterproof car top cover', 'bird drop stain removal', 'ceramic quick detailer spray', 'car exterior preservation'],
  },
  {
    topic: 'Understanding Wheel Balancing, Alignment & Suspension Noises on Pakistani Roads',
    category: 'Car Maintenance',
    hub: 'auto',
    keywords: ['wheel alignment signs car', 'suspension noise causes pothole', 'wheel balancing importance', 'tie rod end ball joint symptoms', 'smooth car ride tips'],
  },
];

/**
 * 🌐 2. Curated High-CPC Global Trends & Tech Topics (For High AdSense RPM)
 * Specially designed for massive organic search reach, high AdSense CPC, and viral engagement.
 */
export const CURATED_GENERAL_TOPICS: AutoTopic[] = [
  {
    topic: 'How Generative AI & Autonomous Agents Are Transforming Remote Work, Freelancing and Careers in 2026',
    category: 'Technology & AI',
    hub: 'general',
    keywords: ['generative ai impact', 'ai tools for productivity', 'freelancing with ai', 'future of tech jobs', 'autonomous ai agents'],
  },
  {
    topic: 'Top 7 Critical Cybersecurity Habits to Protect Your WhatsApp, Banking Apps, and Passwords from Hackers',
    category: 'Technology & AI',
    hub: 'general',
    keywords: ['cybersecurity tips', 'prevent whatsapp hack', 'two factor authentication guide', 'avoid banking scams online', 'password security manager'],
  },
  {
    topic: 'The Evolution of Smartphones: AI Cameras, Foldable Screens, and Next-Gen Battery Innovations',
    category: 'Technology & AI',
    hub: 'general',
    keywords: ['smartphone innovations', 'foldable phones review', 'ai mobile camera tips', 'fast charging battery life', 'flagship vs budget phones'],
  },
  {
    topic: 'High-Speed Satellite Internet & 5G: How Global Connectivity Is Reaching Remote Areas',
    category: 'Technology & AI',
    hub: 'general',
    keywords: ['starlink satellite internet', '5g network speeds', 'portable wifi gadgets', 'remote work connectivity', 'global internet access'],
  },
  {
    topic: 'Must-Have Smart Home & Desk Gadgets to Double Your Daily Productivity and Focus',
    category: 'Technology & AI',
    hub: 'general',
    keywords: ['smart desk setup', 'productivity gadgets', 'ergonomic workspace essentials', 'usb c power banks', 'cable management hacks'],
  },
  {
    topic: 'Mega Infrastructure Projects Reshaping the World: Futuristic Cities, High-Speed Trains & Canals',
    category: 'Global & World',
    hub: 'general',
    keywords: ['futuristic mega projects', 'high speed rail network', 'smart city innovations', 'global engineering wonders', 'future architecture'],
  },
  {
    topic: 'The Global Transition to Clean Energy: Solar Power, Hydrogen, and the Reality of Green Tech',
    category: 'Global & World',
    hub: 'general',
    keywords: ['solar energy revolution', 'green hydrogen energy', 'renewable energy trends', 'climate change tech solutions', 'energy saving hacks'],
  },
  {
    topic: 'Understanding Global Inflation: How International Supply Chains Dictate Everyday Consumer Prices',
    category: 'Global & World',
    hub: 'general',
    keywords: ['global inflation causes', 'supply chain economics', 'smart budgeting tips', 'currency value shifts', 'cost of living strategies'],
  },
  {
    topic: 'The Science of Deep Sleep: How to Fix Your Circadian Rhythm & Wake Up Energized Every Morning',
    category: 'Health & Wellness',
    hub: 'general',
    keywords: ['deep sleep science', 'fix circadian rhythm', 'sleep hygiene checklist', 'melatonin vs natural sleep', 'reduce morning fatigue'],
  },
  {
    topic: '10 Simple Daily Habits to Strengthen Your Immune System and Fight Chronic Inflammation Naturally',
    category: 'Health & Wellness',
    hub: 'general',
    keywords: ['boost immune system naturally', 'anti inflammatory daily habits', 'superfoods for vitality', 'gut health micro-biome', 'preventive healthcare tips'],
  },
  {
    topic: 'How to Build a Timeless Capsule Wardrobe: Look Effortlessly Stylish on Any Budget',
    category: 'Fashion & Lifestyle',
    hub: 'general',
    keywords: ['capsule wardrobe essentials', 'timeless fashion styling', 'budget friendly elegance', 'versatile clothing combinations', 'minimalist lifestyle wardrobe'],
  },
  {
    topic: 'Why Certain Content Goes Viral: The Psychology Behind TikTok, Reels, and Social Media Algorithms',
    category: 'Trending & Viral News',
    hub: 'general',
    keywords: ['why content goes viral', 'social media algorithm secrets', 'short form video engagement', 'viral storytelling psychology', 'digital creator growth'],
  },
];

/**
 * Combined Curated Library for backward compatibility
 */
export const CURATED_VIRAL_TOPICS: AutoTopic[] = [
  ...CURATED_AUTO_TOPICS,
  ...CURATED_GENERAL_TOPICS,
];

/**
 * Dynamic Topic Generator:
 * Discovers fresh, high-ranking topics tailored to either the 'auto' or 'general' hub.
 */
export async function generateFreshDynamicTopic(
  existingTitles: string[],
  targetHub: 'auto' | 'general' = 'auto'
): Promise<AutoTopic> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  const categories = targetHub === 'auto' ? AUTO_CATEGORIES : GENERAL_CATEGORIES;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json',
        },
      });

      const hubInstructions =
        targetHub === 'auto'
          ? `Focus exclusively on automotive car care, DIY maintenance, Pakistani driving realities (summer heat, AC, smog, fuel savings on Alto/Mehran/Corolla), car accessories, or dashcams.`
          : `Focus on modern high-CPC technology & AI breakthroughs, global engineering trends, cybersecurity, health science, or modern lifestyle.`;

      const prompt = `
You are a senior digital content strategist for a high-authority publication.
We want to publish a comprehensive, high-search-intent blog guide in "${randomCategory}" under the "${targetHub}" hub.
${hubInstructions}

The following titles already exist on our website:
${JSON.stringify(existingTitles.slice(-30))}

Suggest ONE completely original, compelling, and high-search-volume topic in "${randomCategory}".

Criteria:
1. Must NOT repeat or closely resemble existing titles.
2. Must address practical questions people search on Google every day.
3. High click-through potential without being misleading clickbait.

Return ONLY valid JSON:
{
  "topic": "String (Compelling H1 title under 80 characters)",
  "category": "${randomCategory}",
  "keywords": ["String", "String", "String", "String", "String"]
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (parsed.topic) {
        return {
          topic: parsed.topic.trim(),
          category: parsed.category || randomCategory,
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ['guide', 'tips', 'reviews'],
          hub: targetHub,
        };
      }
    } catch (err) {
      console.warn('[AutoBlog] Dynamic topic generator fallback:', err);
    }
  }

  // Fallback: pick an unused topic from the respective hub curated library
  const pool = targetHub === 'auto' ? CURATED_AUTO_TOPICS : CURATED_GENERAL_TOPICS;
  const unused = pool.find(
    (t) => !existingTitles.some((existing) => existing.toLowerCase().includes(t.topic.toLowerCase().slice(0, 25)))
  );

  return unused || pool[Math.floor(Math.random() * pool.length)];
}
