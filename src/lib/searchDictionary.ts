/**
 * Pakistani Roman Urdu & Colloquial E-Commerce Search Dictionary
 * Maps natural everyday shopping phrases to catalog keywords and product categories.
 */

const SYNONYM_MAP: Record<string, string[]> = {
  // Mirrors & Glass
  sheesha: ['mirror', 'glass'],
  sheeshey: ['mirror', 'glass'],
  aaina: ['mirror'],
  sideview: ['side door mirror'],

  // Cleaning & Detailing
  kapra: ['towel', 'microfiber', 'drying'],
  kapre: ['towel', 'microfiber'],
  safai: ['towel', 'microfiber', 'polish', 'cleaner'],
  saaf: ['towel', 'microfiber', 'cleaner'],
  pochha: ['towel', 'microfiber'],
  dhona: ['towel', 'polish', 'wax'],

  // Fragrances & Perfumes
  khushbu: ['perfume', 'freshner', 'spray', 'aroma'],
  khushboo: ['perfume', 'freshner', 'spray', 'aroma'],
  attar: ['perfume', 'freshner', 'spray'],
  itar: ['perfume', 'freshner'],
  badbu: ['perfume', 'freshner', 'spray'],

  // Lighting & LEDs
  light: ['led', 'cob', 'running', 'lights'],
  lights: ['led', 'cob', 'running', 'lights'],
  roshni: ['led', 'lights'],
  andhera: ['led', 'lights', 'drl'],
  batti: ['led', 'lights'],
  battiyan: ['led', 'lights'],
  drl: ['daytime running', 'cob', 'led'],

  // Polish & Wax
  chamak: ['polish', 'wax', 'shine'],
  polish: ['wax', '7cf', 'cosmic', 'shine'],
  shine: ['polish', 'wax'],

  // Tape & Adhesives
  tape: ['3m', 'foam tape', 'adhesive'],
  chipkana: ['tape', '3m'],
  jodna: ['tape', '3m'],

  // Electronics & Audio
  handsfree: ['earbuds', 'wireless', 'audio', 'headphone'],
  earbuds: ['handsfree', 'wireless', 'audio', 'bluetooth'],
  earbud: ['earbuds', 'handsfree', 'wireless', 'audio', 'bluetooth'],
  headphone: ['earbuds', 'wireless', 'audio'],
  airpods: ['earbuds', 'wireless'],
  bluetooth: ['earbuds', 'wireless'],
  wireless: ['earbuds', 'bluetooth', 'handsfree', 'charger'],
  battery: ['heavy battery', 'battery backup', 'mah', 'power bank'],
  kaano: ['earbuds', 'audio'],

  // Mounts & Holders
  stand: ['mount', 'tripod', 'holder'],
  holder: ['mount', 'stand'],
  pakarne: ['mount', 'holder'],

  // Vehicles
  mehran: ['suzuki mehran', 'mehran'],
  alto: ['suzuki alto', 'alto'],
  cultus: ['suzuki cultus', 'cultus'],
  civic: ['honda civic', 'civic'],
  corolla: ['toyota corolla', 'corolla'],
};

const STOP_WORDS = new Set([
  'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe', 'aur', 'or',
  'wala', 'wali', 'wale', 'chahiye', 'karna', 'karo', 'kahan', 'hai', 'hain',
  'the', 'for', 'in', 'of', 'and', 'with', 'to', 'a', 'an'
]);

/**
 * Expands a raw search string with Roman Urdu synonyms
 * Example: "mehran ka sheesha" -> ["mehran", "sheesha", "mirror", "glass"]
 */
export function expandSearchQuery(query: string): string[] {
  if (!query || !query.trim()) return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w));

  const expanded = new Set<string>();

  // Add the cleaned original tokens
  rawTokens.forEach((t) => expanded.add(t));

  // Check synonym mappings
  rawTokens.forEach((token) => {
    if (SYNONYM_MAP[token]) {
      SYNONYM_MAP[token].forEach((syn) => expanded.add(syn));
    }
  });

  return Array.from(expanded);
}
