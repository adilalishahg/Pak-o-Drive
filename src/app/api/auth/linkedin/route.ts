import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'LINKEDIN_CLIENT_ID is not configured in environment variables.' },
      { status: 500 }
    );
  }

  const { origin } = new URL(request.url);
  const redirectUri = `${origin}/api/auth/linkedin/callback`;

  // Scope: strictly w_member_social (which is 100% granted and approved)
  const scopes = 'w_member_social';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(authUrl);
}
