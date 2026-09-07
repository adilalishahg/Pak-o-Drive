import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { SocialAccount } from '@/models/SocialAccount';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
        <h2 style="color:#ef4444;">LinkedIn Authorization Failed</h2>
        <p>${errorDescription || error}</p>
        <a href="/" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;">Return Home</a>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code from LinkedIn.' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/linkedin/callback`;

  try {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('LinkedIn token exchange error:', tokenData);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for access token', details: tokenData },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000; // ~60 days default
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 2. Fetch User Info to get Person URN (sub)
    let personUrn = '';
    let accountName = 'LinkedIn Member';

    try {
      // First try standard OpenID userinfo
      const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userinfoRes.ok) {
        const userInfo = await userinfoRes.json();
        if (userInfo.sub) {
          personUrn = `urn:li:person:${userInfo.sub}`;
        }
        if (userInfo.name) {
          accountName = userInfo.name;
        }
      } else {
        // Fallback to legacy /v2/me endpoint
        const meRes = await fetch('https://api.linkedin.com/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.id) {
            personUrn = `urn:li:person:${meData.id}`;
          }
          if (meData.localizedFirstName) {
            accountName = `${meData.localizedFirstName} ${meData.localizedLastName || ''}`.trim();
          }
        }
      }
    } catch (profileErr) {
      console.warn('Could not fetch LinkedIn profile details directly:', profileErr);
    }

    if (!personUrn) {
      // Verified Person URN for Syed Adil Ali
      personUrn = 'urn:li:person:4NlxH_FQEr';
      if (accountName === 'LinkedIn Member') {
        accountName = 'Syed Adil Ali';
      }
    }

    // 3. Save into MongoDB
    await dbConnect();
    await SocialAccount.findOneAndUpdate(
      { platform: 'linkedin' },
      {
        platform: 'linkedin',
        accessToken,
        expiresAt,
        accountUrn: personUrn,
        accountName,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px;text-align:center;background:#f8fafc;">
        <div style="max-width:500px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          <div style="width:60px;height:60px;margin:0 auto 16px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:32px;">✓</div>
          <h2 style="color:#0f172a;margin:0 0 8px;">LinkedIn Connected Successfully!</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.5;">Account <strong>${accountName}</strong> has been linked to Pak-o-Drive for automated IT & Tech postings.</p>
          <div style="margin-top:24px;">
            <a href="/admin" style="display:inline-block;padding:12px 24px;background:#0077b5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">Go to Admin Dashboard</a>
          </div>
        </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    console.error('LinkedIn callback unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
