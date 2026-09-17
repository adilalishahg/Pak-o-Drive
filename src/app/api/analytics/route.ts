import { NextResponse } from 'next/server';
import { fetchDashboardAnalytics, trackAnalyticsInteraction } from '@/lib/analytics/analyticsService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7days';

    const data = await fetchDashboardAnalytics(range);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const doc = await trackAnalyticsInteraction(body);

    return NextResponse.json({ success: true, doc });
  } catch (error: any) {
    console.error('Error recording analytics event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
