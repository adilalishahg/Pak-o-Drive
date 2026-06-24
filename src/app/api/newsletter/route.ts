import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Subscriber from '../../../models/Subscriber';
import { Resend } from 'resend';
import { getWelcomeEmailHtml } from '../../../lib/emails/welcomeTemplate';
import SiteInfo from '../../../models/SiteInfo';

export async function GET() {
  try {
    await dbConnect();
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const { email, source = 'footer' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Already subscribed — return success without duplicate insert
    const existing = await Subscriber.findOne({ email: trimmedEmail });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true,
      });
    }

    // Create subscriber with source context and default operational flags
    const newSubscriber = new Subscriber({
      email: trimmedEmail,
      source: source || 'footer',
      status: 'active',
      isCustomer: false,
    });
    await newSubscriber.save();

    // ── Welcome Email — fully non-blocking, decoupled from response ────────
    // We do NOT await this. The subscriber gets a 201 immediately.
    // Any Resend failure is caught and logged silently.
    void (async () => {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.log('[Newsletter] Skipping welcome email: RESEND_API_KEY not set.');
        return;
      }
      try {
        let siteName = 'Electro';
        let logoText = 'Electro';
        let supportEmail = 'support@pakodrive.com';
        let phone = '+0123 456 7890';
        let whatsapp = '+923001234567';
        let website = 'pakodrive.com';

        try {
          const siteInfo = await SiteInfo.findOne({}).lean();
          if (siteInfo) {
            siteName    = (siteInfo as any).siteName    || siteName;
            logoText    = (siteInfo as any).logoText    || logoText;
            supportEmail= (siteInfo as any).supportEmail|| (siteInfo as any).email || supportEmail;
            phone       = (siteInfo as any).phone       || phone;
            whatsapp    = (siteInfo as any).whatsapp    || whatsapp;
            website     = (siteInfo as any).website     || website;
          }
        } catch (dbErr) {
          console.error('[Newsletter] Could not fetch SiteInfo for welcome email:', dbErr);
        }

        const resend = new Resend(apiKey);
        let fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        // Public-domain senders will be rejected by Resend unless verified —
        // fall back to the sandbox sender so staging always works.
        const publicDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com'];
        if (publicDomains.some(d => fromEmail.includes(d))) {
          console.warn(`[Resend] Public domain detected in RESEND_FROM_EMAIL. Falling back to sandbox sender.`);
          fromEmail = `${logoText} <onboarding@resend.dev>`;
        } else if (fromEmail === 'onboarding@resend.dev') {
          fromEmail = `${logoText} <onboarding@resend.dev>`;
        }

        const html = getWelcomeEmailHtml({ siteName, logoText, supportEmail, phone, whatsapp, website });

        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: trimmedEmail,
          subject: `Welcome to ${siteName}! Here is 10% off your first order ⚡`,
          html,
        });

        if (error) {
          console.error('[Resend] Welcome email send failed:', error);
        } else {
          console.log(`[Resend] Welcome email sent to ${trimmedEmail} — ID: ${data?.id}`);
        }
      } catch (emailErr) {
        console.error('[Resend] Unhandled error in welcome email background task:', emailErr);
      }
    })();
    // ───────────────────────────────────────────────────────────────────────

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed to the newsletter!', data: newSubscriber },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Please specify a subscriber ID.' }, { status: 400 });
    }

    const deleted = await Subscriber.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Subscriber not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscriber removed successfully!' });
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
