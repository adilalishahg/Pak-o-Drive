import { NextResponse } from 'next/server';

interface UnfulfilledLog {
  query: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

// Keep recent 200 unfulfilled searches in memory
const unfulfilledSearches: UnfulfilledLog[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body.query || '').trim();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const logEntry: UnfulfilledLog = {
      query,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
    };

    // Prevent duplicate logs within 10 seconds for same query
    const isRecentDuplicate = unfulfilledSearches.some(
      (l) => l.query.toLowerCase() === query.toLowerCase() && Date.now() - new Date(l.timestamp).getTime() < 10000
    );

    if (!isRecentDuplicate) {
      unfulfilledSearches.unshift(logEntry);
      if (unfulfilledSearches.length > 200) {
        unfulfilledSearches.pop();
      }

      console.log(`[UnfulfilledSearchAlert] Customer searched for missing product: "${query}" at ${logEntry.timestamp}`);
    }

    return NextResponse.json({ success: true, logged: !isRecentDuplicate });
  } catch (error: any) {
    console.error('Error logging unfulfilled search:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    total: unfulfilledSearches.length,
    recentSearches: unfulfilledSearches.slice(0, 50),
  });
}
