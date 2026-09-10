/**
 * Unified Site URL Resolver
 * Resolves the primary canonical site URL across local, preview, and production environments.
 * Gracefully supports:
 * 1. NEXT_SITE_URL (Vercel Server-Side or non-public)
 * 2. NEXT_PUBLIC_SITE_URL (Standard client/server)
 * 3. NEXT_PUBLIC_APP_URL
 * 4. VERCEL_PROJECT_PRODUCTION_URL (Automatic Vercel System Env)
 */
export function getSiteUrl(): string {
  const envUrl = (
    process.env.NEXT_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL
  )?.replace(/\/$/, '');

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return envUrl || 'https://www.pakodrive.pk';
}
