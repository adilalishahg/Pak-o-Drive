/**
 * Category Icon Intelligence & Validation Service for Pak-o-Drive
 * 
 * Verifies icons against active FontAwesome Free & Bootstrap Icon libraries.
 * If missing, invalid, or suboptimal, automatically selects the best matching icon
 * using semantic keyword mapping and multi-provider AI fallback.
 */

// Comprehensive Active Icon Registry supported in Pak-o-Drive stylesheets
export const ACTIVE_ICON_REGISTRY = new Set([
  // Automotive & Vehicles
  'fas fa-car', 'fas fa-car-side', 'fas fa-car-battery', 'fas fa-car-crash',
  'fas fa-motorcycle', 'fas fa-biking', 'fas fa-truck', 'fas fa-truck-pickup',
  'fas fa-gas-pump', 'fas fa-tachometer-alt', 'fas fa-oil-can', 'fas fa-wrench',
  'fas fa-tools', 'fas fa-screwdriver', 'fas fa-hammer', 'fas fa-cog', 'fas fa-cogs',
  'fas fa-shield-alt', 'fas fa-spray-can', 'fas fa-soap', 'fas fa-broom',
  'fas fa-couch', 'fas fa-steering-wheel', 'fas fa-key', 'fas fa-compass',

  // Mobile, Electronics & Gadgets
  'fas fa-mobile-alt', 'fas fa-mobile', 'fas fa-tablet-alt', 'fas fa-laptop',
  'fas fa-desktop', 'fas fa-tv', 'fas fa-bolt', 'fas fa-plug', 'fas fa-battery-full',
  'fas fa-battery-three-quarters', 'fas fa-battery-half', 'fas fa-charging-station',
  'fas fa-microchip', 'fas fa-memory', 'fas fa-sd-card', 'fas fa-sim-card',
  'fas fa-wifi', 'fas fa-broadcast-tower', 'fas fa-satellite-dish', 'fas fa-rss',
  'fas fa-hdd', 'fas fa-usb', 'fab fa-usb', 'fas fa-power-off', 'fas fa-gamepad',

  // Audio, Video & Smart Home
  'fas fa-headphones', 'fas fa-headphones-alt', 'fas fa-headset', 'fas fa-volume-up',
  'fas fa-music', 'fas fa-microphone', 'fas fa-microphone-alt', 'fas fa-podcast',
  'fas fa-video', 'fas fa-camera', 'fas fa-camera-retro', 'fas fa-video-slash',
  'fas fa-lightbulb', 'fas fa-sun', 'fas fa-moon', 'fas fa-magic', 'fas fa-fan',
  'fas fa-clock', 'fas fa-stopwatch', 'fas fa-hourglass-half',

  // Home, Kitchen, Lifestyle & Personal Care
  'fas fa-home', 'fas fa-blender', 'fas fa-mug-hot', 'fas fa-coffee', 'fas fa-utensils',
  'fas fa-cut', 'fas fa-spa', 'fas fa-heartbeat', 'fas fa-heart', 'fas fa-user-check',
  'fas fa-user-shield', 'fas fa-tshirt', 'fas fa-shoe-prints', 'fas fa-glasses',
  'fas fa-shopping-bag', 'fas fa-shopping-cart', 'fas fa-shopping-basket', 'fas fa-box',
  'fas fa-boxes', 'fas fa-box-open', 'fas fa-gift', 'fas fa-tags', 'fas fa-tag',
  'fas fa-lock', 'fas fa-unlock', 'fas fa-bell', 'fas fa-fire', 'fas fa-award',
  'fas fa-star', 'fas fa-crown', 'fas fa-gem', 'fas fa-ring', 'fas fa-eye',

  // Bootstrap Icons Fallbacks
  'bi bi-car-front', 'bi bi-phone', 'bi bi-lightning-charge', 'bi bi-headphones',
  'bi bi-smartwatch', 'bi bi-laptop', 'bi bi-camera-video', 'bi bi-house-door',
]);

// Semantic keyword-to-icon mapping matrix
const SEMANTIC_ICON_RULES: Array<{ keywords: string[]; icon: string }> = [
  // Mobile, Smartphones & Accessories
  {
    keywords: ['mobile-accessories', 'mobile-tech', 'mobile', 'smartphone', 'phone', 'iphone', 'android', 'case', 'protector'],
    icon: 'fas fa-mobile-alt',
  },
  {
    keywords: ['charger', 'fast-charger', 'cable', 'wire', 'adapter', 'pd', 'type-c', 'usb', 'charging'],
    icon: 'fas fa-bolt',
  },
  {
    keywords: ['power-bank', 'powerbank', 'battery', 'battery-pack', 'accumulator'],
    icon: 'fas fa-battery-full',
  },
  {
    keywords: ['earbud', 'earbuds', 'headphone', 'headphones', 'airpod', 'earphone', 'audio', 'sound', 'speaker', 'handsfree', 'bluetooth', 'tws'],
    icon: 'fas fa-headphones',
  },
  {
    keywords: ['smartwatch', 'smart-watch', 'watch', 'band', 'fitness-tracker', 'clock'],
    icon: 'fas fa-clock',
  },

  // Car / Automotive Specifics
  {
    keywords: ['car-accessories', 'car', 'automotive', 'vehicle', 'auto', 'drive', 'engine', 'motor'],
    icon: 'fas fa-car',
  },
  {
    keywords: ['interior', 'seat', 'cushion', 'steering', 'mat', 'dashboard', 'cover', 'trunk'],
    icon: 'fas fa-car-side',
  },
  {
    keywords: ['perfume', 'perfumes', 'freshener', 'scent', 'fragrance', 'aroma', 'diffuser', 'spray'],
    icon: 'fas fa-spray-can',
  },
  {
    keywords: ['detailing', 'polish', 'wash', 'cleaner', 'shampoo', 'microfiber', 'towel', 'wax'],
    icon: 'fas fa-soap',
  },
  {
    keywords: ['dashcam', 'dvr', 'rear-view', 'parking-sensor', 'car-camera', 'camera'],
    icon: 'fas fa-video',
  },
  {
    keywords: ['led', 'light', 'ambient', 'headlight', 'fog', 'bulb', 'neon', 'lamp'],
    icon: 'fas fa-lightbulb',
  },
  {
    keywords: ['tool', 'repair', 'jack', 'wrench', 'screwdriver', 'pump', 'inflator'],
    icon: 'fas fa-tools',
  },
  {
    keywords: ['security', 'lock', 'alarm', 'anti-theft', 'tracker', 'gps'],
    icon: 'fas fa-shield-alt',
  },

  // Bike & Motorcycling
  {
    keywords: ['bike', 'motorcycle', 'scooty', 'rider', 'riding', 'helmet', 'biker'],
    icon: 'fas fa-motorcycle',
  },
  {
    keywords: ['glove', 'safety-gear', 'jacket', 'knee-guard'],
    icon: 'fas fa-shield-alt',
  },

  {
    keywords: ['mount', 'holder', 'tripod', 'stand', 'magnetic-mount'],
    icon: 'fas fa-camera',
  },

  // Home & Kitchen Gadgets
  {
    keywords: ['home', 'kitchen', 'appliance', 'house', 'room'],
    icon: 'fas fa-home',
  },
  {
    keywords: ['blender', 'mixer', 'juicer', 'chopper', 'grinder'],
    icon: 'fas fa-blender',
  },
  {
    keywords: ['vacuum', 'mini-vacuum', 'cleaner', 'duster', 'sweeper'],
    icon: 'fas fa-broom',
  },
  {
    keywords: ['bottle', 'mug', 'cup', 'thermos', 'thermal', 'flask', 'tumbler'],
    icon: 'fas fa-mug-hot',
  },
  {
    keywords: ['organizer', 'storage', 'rack', 'hanger', 'wardrobe'],
    icon: 'fas fa-boxes',
  },

  // Personal Care & Grooming
  {
    keywords: ['shaver', 'trimmer', 'clipper', 'grooming', 'hair', 'beard'],
    icon: 'fas fa-cut',
  },
  {
    keywords: ['massager', 'massage', 'health', 'pain-relief', 'posture', 'therapy'],
    icon: 'fas fa-heartbeat',
  },
  {
    keywords: ['lifestyle', 'personal-care', 'skincare', 'beauty', 'spa'],
    icon: 'fas fa-user-check',
  },
  {
    keywords: ['gaming', 'game', 'controller', 'joystick', 'console'],
    icon: 'fas fa-gamepad',
  },
  {
    keywords: ['clothing', 'fashion', 'shirt', 'tshirt', 'apparel', 'wear'],
    icon: 'fas fa-tshirt',
  },
  {
    keywords: ['shoes', 'footwear', 'sneaker', 'boots'],
    icon: 'fas fa-shoe-prints',
  },
];

/**
 * Normalizes an icon string into standard class format (e.g., "fa-car" -> "fas fa-car")
 */
export function normalizeIconClass(rawIcon?: string): string {
  if (!rawIcon || typeof rawIcon !== 'string') return '';
  const trimmed = rawIcon.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('bi ') || trimmed.startsWith('bi-')) {
    return trimmed.startsWith('bi ') ? trimmed : `bi ${trimmed}`;
  }

  if (trimmed.startsWith('fas fa-') || trimmed.startsWith('far fa-') || trimmed.startsWith('fab fa-')) {
    return trimmed;
  }

  if (trimmed.startsWith('fa-')) {
    return `fas ${trimmed}`;
  }

  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return `fas fa-${trimmed}`;
  }

  return trimmed;
}

/**
 * Validates if the icon exists in the active icon registry.
 */
export function isIconValidInActiveLibrary(iconClass: string): boolean {
  if (!iconClass) return false;
  const normalized = normalizeIconClass(iconClass);
  return ACTIVE_ICON_REGISTRY.has(normalized);
}

/**
 * Fast synchronous semantic heuristic matcher for category icons.
 */
export function getBestCategoryIcon(categoryNameOrSlug: string, userProvidedIcon?: string): string {
  if (userProvidedIcon) {
    const normalized = normalizeIconClass(userProvidedIcon);
    if (isIconValidInActiveLibrary(normalized) && normalized !== 'fas fa-tag') {
      return normalized;
    }
  }

  const clean = categoryNameOrSlug.toLowerCase().trim();
  const words = clean.replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean);

  // Exact rule search with exact word & phrase boundaries
  for (const rule of SEMANTIC_ICON_RULES) {
    for (const kw of rule.keywords) {
      const cleanKw = kw.replace(/[^a-z0-9]+/g, ' ').trim();
      if (clean === kw || clean === cleanKw) {
        return rule.icon;
      }
      if (words.includes(kw) || words.includes(cleanKw)) {
        return rule.icon;
      }
      if (clean.includes(cleanKw) && cleanKw.length > 3) {
        return rule.icon;
      }
    }
  }

  return 'fas fa-tag';
}

/**
 * AI-Powered Category Icon Analyzer
 * Calls Gemini / Multi-AI if available to intelligently pick the best icon for niche terms,
 * then strictly validates it against the active FontAwesome registry.
 */
async function analyzeCategoryIconWithAI(categoryName: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a FontAwesome icon expert for an e-commerce website.
Given the category name "${categoryName}", reply with ONLY the single best FontAwesome 6 Free icon class (e.g. "fas fa-car", "fas fa-headphones", "fas fa-bolt", "fas fa-spray-can", "fas fa-video", "fas fa-tools", "fas fa-home", "fas fa-mobile-alt").
Do not write any explanation, reasoning, or markdown. Output exactly one icon class.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const candidate = normalizeIconClass(rawText.replace(/[`'"]/g, ''));
      if (isIconValidInActiveLibrary(candidate)) {
        return candidate;
      }
    }
  } catch (err) {
    console.warn('[CategoryIconService] AI icon analysis skipped:', err);
  }

  return null;
}

/**
 * Master async resolver for Category Icons:
 * 1. Checks if user icon is provided and strictly valid in active library.
 * 2. If not, analyzes with semantic heuristic matrix.
 * 3. If still defaulting to generic tag, queries AI engine and validates output.
 * 4. Guarantees a verified, visually stunning icon from the active library.
 */
export async function resolveCategoryIcon(categoryName: string, userProvidedIcon?: string): Promise<string> {
  // Step 1: User provided validation
  if (userProvidedIcon) {
    const normalized = normalizeIconClass(userProvidedIcon);
    if (isIconValidInActiveLibrary(normalized) && normalized !== 'fas fa-tag') {
      return normalized;
    }
  }

  // Step 2: Semantic Heuristic Analysis
  const heuristicIcon = getBestCategoryIcon(categoryName);
  if (heuristicIcon && heuristicIcon !== 'fas fa-tag') {
    return heuristicIcon;
  }

  // Step 3: AI Deep Analysis (if heuristic defaulted to generic tag)
  const aiIcon = await analyzeCategoryIconWithAI(categoryName);
  if (aiIcon && isIconValidInActiveLibrary(aiIcon)) {
    return aiIcon;
  }

  return heuristicIcon || 'fas fa-tag';
}

/**
 * Intelligently infers category name, slug, and verified icon from product name and description
 * when a JSON product has no category specified.
 */
export function inferCategoryFromProduct(productName: string, productDesc?: string): { name: string; slug: string; icon: string } {
  const text = `${productName} ${productDesc || ''}`.toLowerCase();

  if (text.includes('perfume') || text.includes('scent') || text.includes('fragrance') || text.includes('freshener') || text.includes('aroma') || text.includes('diffuser')) {
    return { name: 'Car Perfumes & Fresheners', slug: 'perfumes', icon: 'fas fa-spray-can' };
  }
  if (text.includes('phone') || text.includes('mobile') || text.includes('iphone') || text.includes('holder') || text.includes('mount') || text.includes('charger') || text.includes('cable')) {
    return { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: 'fas fa-mobile-alt' };
  }
  if (text.includes('led') || text.includes('light') || text.includes('ambient') || text.includes('headlight') || text.includes('fog light') || text.includes('neon')) {
    return { name: 'Car Lighting & LEDs', slug: 'car-lighting', icon: 'fas fa-lightbulb' };
  }
  if (text.includes('audio') || text.includes('speaker') || text.includes('headphone') || text.includes('earbud') || text.includes('bluetooth') || text.includes('sound')) {
    return { name: 'Audio & Gadgets', slug: 'audio-gadgets', icon: 'fas fa-headphones' };
  }
  if (text.includes('watch') || text.includes('smartwatch') || text.includes('clock') || text.includes('fitness')) {
    return { name: 'Smart Watches', slug: 'smartwatches', icon: 'fas fa-clock' };
  }
  if (text.includes('camera') || text.includes('dashcam') || text.includes('dvr') || text.includes('security')) {
    return { name: 'Dashcams & Security', slug: 'dashcams', icon: 'fas fa-video' };
  }
  if (text.includes('seat') || text.includes('mat') || text.includes('cushion') || text.includes('steering') || text.includes('interior') || text.includes('trunk')) {
    return { name: 'Car Interior', slug: 'car-interior', icon: 'fas fa-car-side' };
  }
  if (text.includes('wash') || text.includes('shampoo') || text.includes('polish') || text.includes('microfiber') || text.includes('cleaner') || text.includes('wax')) {
    return { name: 'Car Detailing & Care', slug: 'car-detailing', icon: 'fas fa-soap' };
  }
  if (text.includes('tool') || text.includes('wrench') || text.includes('jack') || text.includes('inflator') || text.includes('pump')) {
    return { name: 'Emergency Tools & Inflators', slug: 'tools', icon: 'fas fa-tools' };
  }
  if (text.includes('car') || text.includes('auto') || text.includes('vehicle') || text.includes('drive')) {
    return { name: 'Car Accessories', slug: 'car-accessories', icon: 'fas fa-car' };
  }

  const icon = getBestCategoryIcon(productName);
  return { name: 'Automotive & Gadgets', slug: 'automotive-gadgets', icon: icon !== 'fas fa-tag' ? icon : 'fas fa-car' };
}

