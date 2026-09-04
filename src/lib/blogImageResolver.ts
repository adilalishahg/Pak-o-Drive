/**
 * Topic-Aware Automotive & Tech Blog Image Resolver
 * Accurately selects high-resolution, context-specific photography for every blog post
 * based on title keywords, category intent, and hub (Auto vs General).
 */

interface ImageMatchRule {
  keywords: string[];
  imageUrl: string;
  alt: string;
}

// 🚗 1. Dedicated Automotive & Car Care High-Resolution Visual Library
const AUTO_IMAGE_RULES: ImageMatchRule[] = [
  {
    keywords: ['ac', 'cool', 'chill', 'heat', 'summer', 'cabin', 'sunshade', 'tint', 'temperature'],
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80',
    alt: 'Car Air Conditioning Vent and Dashboard in Summer',
  },
  {
    keywords: ['gas', 'compressor', 'radiator', 'coolant', 'engine', 'heat up', 'overheating', 'mehran'],
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80',
    alt: 'Car Engine Bay Maintenance and Inspection',
  },
  {
    keywords: ['smog', 'fog', 'm2', 'motorway', 'highway', 'fog light', 'visibility', 'lahore'],
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=80',
    alt: 'Highway Driving through Dense Smog and Fog',
  },
  {
    keywords: ['fuel', 'mileage', 'economy', 'alto', 'wagon r', 'cultus', 'petrol', 'speedometer'],
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80',
    alt: 'Modern Car Speedometer and Fuel Mileage Dashboard',
  },
  {
    keywords: ['scratch', 'swirl', 'paint', 'polish', 'compound', 'ceramic', 'wax', 'buffing', 'shine'],
    imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1600&q=80',
    alt: 'Car Detailing and Scratch Repair Polish Buffing',
  },
  {
    keywords: ['rain', 'monsoon', 'wiper', 'water', 'flood', 'mat', '7d', 'odor', 'rust'],
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1600&q=80',
    alt: 'Rain Drops on Windshield with High Performance Wipers',
  },
  {
    keywords: ['dashcam', 'camera', 'security', 'record', 'accident', 'challan'],
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80',
    alt: 'Modern Car Windshield with High Tech Camera and Navigation',
  },
  {
    keywords: ['battery', 'jump', 'starter', 'breakdown', 'dead', 'terminal', 'power bank'],
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Emergency Car Battery Terminals and Jumper Cables',
  },
  {
    keywords: ['freshener', 'perfume', 'scent', 'solar', 'aroma', 'diffuser', 'fragrance'],
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    alt: 'Luxury Car Interior with Dashboard Fragrance Accessories',
  },
  {
    keywords: ['tyre', 'tire', 'psi', 'pressure', 'blowout', 'wheel', 'alignment', 'suspension', 'balancing'],
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1600&q=80',
    alt: 'Car Alloy Wheel and High-Performance Tyre Tread',
  },
  {
    keywords: ['vacuum', 'interior', 'cleaning', 'leather', 'seats', 'detailing', 'dashboard'],
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1600&q=80',
    alt: 'Clean Leather Car Interior and Steering Wheel',
  },
  {
    keywords: ['emergency', 'tools', 'kit', 'tow', 'puncture', 'cable', 'warning light'],
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80',
    alt: 'Vehicle Tool Kit and Mechanical Accessories',
  },
];

// 🌐 2. Dedicated Global Tech, AI & Trends High-Resolution Visual Library
const GENERAL_IMAGE_RULES: ImageMatchRule[] = [
  {
    keywords: ['ai', 'generative', 'automation', 'chatgpt', 'agent', 'model', 'neural', 'machine learning'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1600&q=80',
    alt: 'Artificial Intelligence and Neural Network Concept',
  },
  {
    keywords: ['cyber', 'security', 'hack', 'password', 'whatsapp', 'banking', 'privacy', 'encryption'],
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
    alt: 'Cybersecurity Lock and Digital Data Encryption',
  },
  {
    keywords: ['smartphone', 'phone', 'foldable', 'camera', 'screen', 'mobile', 'battery'],
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    alt: 'Futuristic Smartphone Display and Digital Interface',
  },
  {
    keywords: ['satellite', 'internet', '5g', 'starlink', 'connectivity', 'remote', 'network'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    alt: 'Global Satellite Connectivity and High-Speed Network Earth Orbit',
  },
  {
    keywords: ['desk', 'gadget', 'productivity', 'workspace', 'home office', 'ergonomic', 'setup'],
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80',
    alt: 'Modern Ergonomic Desk Setup with Productivity Gadgets',
  },
  {
    keywords: ['infrastructure', 'train', 'city', 'mega', 'canal', 'futuristic', 'architecture', 'high-speed'],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    alt: 'Futuristic Mega City and High-Speed Bullet Train',
  },
  {
    keywords: ['solar', 'clean', 'energy', 'green', 'hydrogen', 'renewable', 'climate'],
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
    alt: 'Solar Panels Array and Renewable Clean Energy',
  },
  {
    keywords: ['inflation', 'economy', 'supply chain', 'prices', 'currency', 'budget'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
    alt: 'Global Economics, Trading Charts and Currency Trends',
  },
  {
    keywords: ['sleep', 'circadian', 'insomnia', 'night', 'rest', 'morning', 'fatigue'],
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1600&q=80',
    alt: 'Peaceful Bedroom with Optimal Sleep Environment',
  },
  {
    keywords: ['immune', 'health', 'wellness', 'habit', 'inflammation', 'nutrition', 'superfood'],
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80',
    alt: 'Fresh Organic Foods for Natural Immune Vitality',
  },
  {
    keywords: ['wardrobe', 'capsule', 'fashion', 'style', 'clothing', 'minimalist', 'budget'],
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    alt: 'Curated Minimalist Capsule Wardrobe Collection',
  },
  {
    keywords: ['viral', 'tiktok', 'reels', 'algorithm', 'social media', 'creator', 'video'],
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80',
    alt: 'Smartphone Recording for Viral Social Media Engagement',
  },
];

/**
 * Resolve the most accurate, high-definition photo for any blog topic
 */
export function resolveBlogCoverImage(
  topic: string,
  category: string = '',
  hub: 'auto' | 'general' = 'auto',
  extraKeywords: string[] = []
): string {
  const searchCorpus = `${topic} ${category} ${extraKeywords.join(' ')}`.toLowerCase();

  // 1. Select the appropriate rule set based on hub
  const rules = hub === 'auto' ? AUTO_IMAGE_RULES : GENERAL_IMAGE_RULES;

  // 2. Score rules based on keyword hits in the title and keywords
  let bestMatch: ImageMatchRule | null = null;
  let highestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (searchCorpus.includes(kw)) {
        // Higher weight if the keyword is in the topic title itself
        score += topic.toLowerCase().includes(kw) ? 3 : 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  // 3. Return best match if score > 0
  if (bestMatch && highestScore > 0) {
    return bestMatch.imageUrl;
  }

  // 4. Default fallbacks if no specific keyword matched
  if (hub === 'auto') {
    return 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80'; // Clean car cockpit
  }

  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'; // Clean tech motherboard/hardware
}
