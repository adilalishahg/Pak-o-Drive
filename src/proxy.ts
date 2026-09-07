import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Known social media and chat link preview crawlers
 */
const SOCIAL_BOTS = [
  'whatsapp',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'telegrambot',
  'slackbot',
  'discordbot',
];

/**
 * Next.js 16 Proxy Convention (formerly Middleware)
 * Runs server-side before request completion.
 */
export function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // Fast check: is this a social preview crawler?
  const isSocialCrawler = SOCIAL_BOTS.some((bot) => userAgent.includes(bot));
  if (!isSocialCrawler) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Don't intercept static assets, APIs, or files with extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rewrite to the lightweight OG crawler response (~1.8KB instead of 1.8MB)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-og-target-path', pathname);

  const url = request.nextUrl.clone();
  url.pathname = '/api/og/crawler';
  url.search = `?path=${encodeURIComponent(pathname)}`;

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}
