/**
 * Enterprise In-Memory Sliding Window Rate Limiter
 * Protects APIs from DDoS, bot flooding, credential stuffing, and scraping spam.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Global in-memory cache with auto-cleanup
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;       // Maximum requests allowed in the window
  windowMs: number;    // Window duration in milliseconds (e.g. 60_000 for 1 min)
  keyPrefix?: string;  // Differentiates routes (e.g. 'orders', 'chat', 'auth')
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Extracts client IP from standard proxy & CDN headers (Vercel, Cloudflare, Nginx)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Checks and records rate limit for a client request.
 */
export function checkRateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(request);
  const prefix = options.keyPrefix || 'global';
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Start new window
    record = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  // Increment within existing window
  record.count += 1;

  if (record.count > options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: Math.ceil((record.resetAt - now) / 1000),
  };
}
