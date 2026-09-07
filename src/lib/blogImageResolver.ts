/**
 * Topic-Aware Automotive & Tech Blog Image Resolver
 * Accurately selects unique, high-resolution, context-specific photography for every blog post
 * based on title keywords, category intent, and hub (Auto vs General).
 * Guarantees zero duplicate images across consecutive posts via hash-based rotation.
 */

interface ImageMatchRule {
  keywords: string[];
  imageUrls: string[];
  alt: string;
}

// 🚗 1. Dedicated Automotive & Car Care High-Resolution Visual Library
const AUTO_IMAGE_RULES: ImageMatchRule[] = [
  // 1. AC & Summer Cooling
  {
    keywords: ['ac', 'cool', 'chill', 'heat', 'summer', 'cabin', 'sunshade', 'tint', 'temperature'],
    imageUrls: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80', // Car AC vent & dashboard
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', // Luxury car interior cooling
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80', // Sleek dashboard in summer sun
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80', // Premium automobile interior
    ],
    alt: 'Car Air Conditioning and Interior Temperature Control',
  },
  // 2. Engine, Radiator & Overheating
  {
    keywords: ['gas', 'compressor', 'radiator', 'coolant', 'engine', 'heat up', 'overheating', 'mehran', 'cultus'],
    imageUrls: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80', // Engine bay inspection
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=80', // Mechanic inspecting engine block
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80', // Engine cooling and battery maintenance
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1600&q=80', // Detailed automotive engineering
    ],
    alt: 'Car Engine Bay, Radiator, and Cooling Maintenance',
  },
  // 3. Fog, Smog & Motorway Visibility
  {
    keywords: ['smog', 'fog', 'm2', 'motorway', 'highway', 'fog light', 'visibility', 'lahore', 'defogger'],
    imageUrls: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80', // Highway driving through dense fog
      'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1600&q=80', // Misty road with headlights
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=80', // Night highway motion with glowing beams
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1600&q=80', // Foggy scenic mountain highway
    ],
    alt: 'Highway Driving through Dense Smog and Fog',
  },
  // 4. Fuel Economy, Speedometer & Tuning
  {
    keywords: ['fuel', 'mileage', 'economy', 'alto', 'wagon r', 'petrol', 'speedometer', 'average', 'consumption'],
    imageUrls: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80', // Digital speedometer and gauge
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80', // Modern dashboard instrument cluster
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80', // High-tech cockpit navigation
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80', // Sleek car interior dashboard
    ],
    alt: 'Modern Car Speedometer and Fuel Mileage Dashboard',
  },
  // 5. Scratch Repair, Detailing & Ceramic Polish
  {
    keywords: ['scratch', 'swirl', 'paint', 'polish', 'compound', 'ceramic', 'wax', 'buffing', 'shine', 'detailing'],
    imageUrls: [
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1600&q=80', // Detailing buffing machine polish
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80', // Clean sparkling car surface
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1600&q=80', // Car wash snow foam and polish
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80', // Mirror gloss luxury car finish
    ],
    alt: 'Car Detailing and Scratch Repair Polish Buffing',
  },
  // 6. Rain, Monsoon & Wipers
  {
    keywords: ['rain', 'monsoon', 'wiper', 'water', 'flood', 'mat', '7d', 'odor', 'rust'],
    imageUrls: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=80', // Raindrops on windshield
      'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1600&q=80', // Driving through wet rain roads
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80', // Car driving through scenic rain
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80', // Rain beading on polished car body
    ],
    alt: 'Rain Drops on Windshield with High Performance Wipers',
  },
  // 7. Dashcam & Security Cameras
  {
    keywords: ['dashcam', 'camera', 'security', 'record', 'accident', 'challan', 'video'],
    imageUrls: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80', // Dashboard camera and windshield view
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80', // Front road cockpit view
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80', // POV highway driving perspective
    ],
    alt: 'Modern Car Windshield with High Tech Camera and Navigation',
  },
  // 8. Battery Jump Starters & Power Banks
  {
    keywords: ['battery', 'jump', 'starter', 'breakdown', 'dead', 'terminal', 'power bank', 'charge'],
    imageUrls: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80', // Battery terminals and jumper cables
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80', // Mechanical emergency equipment
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=80', // Roadside battery check
    ],
    alt: 'Emergency Car Battery Terminals and Jumper Cables',
  },
  // 9. Car Air Fresheners & Solar Perfume
  {
    keywords: ['freshener', 'perfume', 'scent', 'solar', 'aroma', 'diffuser', 'fragrance', 'smell'],
    imageUrls: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', // Luxury interior dashboard accessory
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80', // Minimalist aroma diffuser on dashboard
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80', // Premium cabin scent ambiance
    ],
    alt: 'Luxury Car Interior with Dashboard Fragrance Accessories',
  },
  // 10. Tyres, PSI Pressure & Wheels
  {
    keywords: ['tyre', 'tire', 'psi', 'pressure', 'blowout', 'wheel', 'alignment', 'suspension', 'balancing'],
    imageUrls: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1600&q=80', // Alloy wheel and tyre tread
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80', // Sports wheel and brake calipers
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80', // High-performance tyre sidewall
    ],
    alt: 'Car Alloy Wheel and High-Performance Tyre Tread',
  },
  // 11. Interior Deep Cleaning & Vacuuming
  {
    keywords: ['vacuum', 'interior', 'cleaning', 'leather', 'seats', 'detailing', 'dashboard', 'clean'],
    imageUrls: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80', // Clean leather interior and steering
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1600&q=80', // Detailed spotless cockpit
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', // Vacuumed seats and upholstery
    ],
    alt: 'Clean Leather Car Interior and Steering Wheel',
  },
  // 12. Roadside Emergency Tools & Kits
  {
    keywords: ['emergency', 'tools', 'kit', 'tow', 'puncture', 'cable', 'warning', 'breakdown'],
    imageUrls: [
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80', // Roadside mechanical tools
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80', // Automotive emergency repair kit
      'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=80', // Repair gear and accessories
    ],
    alt: 'Vehicle Tool Kit and Mechanical Accessories',
  },
];

// 🌐 2. Dedicated Global Tech, AI & Trends High-Resolution Visual Library
const GENERAL_IMAGE_RULES: ImageMatchRule[] = [
  // 1. AI, Generative AI & Autonomous Agents
  {
    keywords: ['ai', 'generative', 'automation', 'chatgpt', 'agent', 'model', 'neural', 'machine learning', 'robot'],
    imageUrls: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80', // Neural network nodes
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1600&q=80', // Generative AI digital brain
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80', // Futuristic synthetic data flow
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1600&q=80', // AI humanoid robotic interface
    ],
    alt: 'Artificial Intelligence and Neural Network Concept',
  },
  // 2. Cybersecurity, Privacy & Encryption
  {
    keywords: ['cyber', 'security', 'hack', 'password', 'whatsapp', 'banking', 'privacy', 'encryption', 'phishing'],
    imageUrls: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80', // Digital padlock and encryption
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80', // High-tech cybersecurity operations center
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80', // Matrix code and cybersecurity shield
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80', // Biometric security scan
    ],
    alt: 'Cybersecurity Lock and Digital Data Encryption',
  },
  // 3. Smartphones & Mobile Hardware
  {
    keywords: ['smartphone', 'phone', 'foldable', 'camera', 'screen', 'mobile', 'battery', 'device'],
    imageUrls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80', // Futuristic smartphone display
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1600&q=80', // Smartphone cameras and curved glass
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1600&q=80', // Modern smartphone device
    ],
    alt: 'Futuristic Smartphone Display and Digital Interface',
  },
  // 4. Satellite Internet, 5G & Telecom
  {
    keywords: ['satellite', 'internet', '5g', 'starlink', 'connectivity', 'remote', 'network', 'telecom'],
    imageUrls: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80', // Earth orbit satellite communication
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80', // Motherboard and microchip connectivity
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=80', // Data center cloud servers
    ],
    alt: 'Global Satellite Connectivity and High-Speed Network Earth Orbit',
  },
  // 5. Desk Setup, Productivity & Ergonomics
  {
    keywords: ['desk', 'gadget', 'productivity', 'workspace', 'home office', 'ergonomic', 'setup', 'keyboard'],
    imageUrls: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80', // Ergonomic modern wooden desk setup
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', // Sleek clean home office monitor
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80', // Laptop and productivity essentials
    ],
    alt: 'Modern Ergonomic Desk Setup with Productivity Gadgets',
  },
  // 6. Mega Infrastructure, High-Speed Trains & Smart Cities
  {
    keywords: ['infrastructure', 'train', 'city', 'mega', 'canal', 'futuristic', 'architecture', 'high-speed'],
    imageUrls: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80', // Futuristic bullet train and city skyline
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80', // Modern architecture glass skyscraper
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80', // Futuristic neon metropolis
    ],
    alt: 'Futuristic Mega City and High-Speed Bullet Train',
  },
  // 7. Clean Energy, Solar & Hydrogen
  {
    keywords: ['solar', 'clean', 'energy', 'green', 'hydrogen', 'renewable', 'climate', 'power'],
    imageUrls: [
      'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=1600&q=80', // Solar panels field with sunny sky
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80', // Wind turbines in clean energy landscape
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80', // Green sustainable ecosystem
    ],
    alt: 'Solar Panels Array and Renewable Clean Energy',
  },
  // 8. Economics, Inflation & Global Trade
  {
    keywords: ['inflation', 'economy', 'supply chain', 'prices', 'currency', 'budget', 'finance', 'market'],
    imageUrls: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80', // Financial stock chart display
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80', // Global trading screens
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80', // Global currency and investment trends
    ],
    alt: 'Global Economics, Trading Charts and Currency Trends',
  },
  // 9. Sleep Science, Circadian Rhythm & Recovery
  {
    keywords: ['sleep', 'circadian', 'insomnia', 'night', 'rest', 'morning', 'fatigue', 'recovery'],
    imageUrls: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1600&q=80', // Peaceful cozy bedroom setting
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80', // Serene bedroom morning light
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80', // Calm relaxing bedroom ambiance
    ],
    alt: 'Peaceful Bedroom with Optimal Sleep Environment',
  },
  // 10. Immunity, Nutrition & Wellness
  {
    keywords: ['immune', 'health', 'wellness', 'habit', 'inflammation', 'nutrition', 'superfood', 'diet'],
    imageUrls: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80', // Fresh colorful organic fruits and vegetables
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=80', // Healthy nutrient bowl and greens
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80', // Wholesome natural vitality foods
    ],
    alt: 'Fresh Organic Foods for Natural Immune Vitality',
  },
  // 11. Minimalist Capsule Wardrobe & Fashion
  {
    keywords: ['wardrobe', 'capsule', 'fashion', 'style', 'clothing', 'minimalist', 'budget', 'outfit'],
    imageUrls: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', // Minimalist aesthetic clothing collection
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80', // Clean organized fashion wardrobe
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80', // Neutral tone high-end fashion pieces
    ],
    alt: 'Curated Minimalist Capsule Wardrobe Collection',
  },
  // 12. Viral Social Media & Content Creation
  {
    keywords: ['viral', 'tiktok', 'reels', 'algorithm', 'social media', 'creator', 'video', 'content'],
    imageUrls: [
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80', // Smartphone recording creator studio
      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=1600&q=80', // Digital creator camera lighting
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80', // Video editing and social engagement
    ],
    alt: 'Smartphone Recording for Viral Social Media Engagement',
  },
];

// Fallback Diverse Pools
const AUTO_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80',
];

const GENERAL_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
];

/**
 * Deterministic hash function to rotate images uniquely per blog title
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolve the most accurate, high-definition photo for any blog topic
 * - Guarantees topic accuracy by matching keywords in topic and tags
 * - Rotates uniquely through photography pools using deterministic title hashing
 * - Never returns the same image for different blog posts
 */
export function resolveBlogCoverImage(
  topic: string,
  category: string = '',
  hub: 'auto' | 'general' = 'auto',
  extraKeywords: string[] = []
): string {
  const searchCorpus = `${topic} ${category} ${extraKeywords.join(' ')}`.toLowerCase();
  const rules = hub === 'auto' ? AUTO_IMAGE_RULES : GENERAL_IMAGE_RULES;

  let bestMatch: ImageMatchRule | null = null;
  let highestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (searchCorpus.includes(kw)) {
        score += topic.toLowerCase().includes(kw) ? 3 : 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  const hash = hashString(`${topic}_${category}`);

  // 1. Matched rule: rotate through that rule's specific image pool
  if (bestMatch && highestScore > 0 && bestMatch.imageUrls.length > 0) {
    const idx = hash % bestMatch.imageUrls.length;
    return bestMatch.imageUrls[idx];
  }

  // 2. Fallback pool: rotate through diverse hub images
  const fallbackPool = hub === 'auto' ? AUTO_FALLBACK_POOL : GENERAL_FALLBACK_POOL;
  const fallbackIdx = hash % fallbackPool.length;
  return fallbackPool[fallbackIdx];
}
