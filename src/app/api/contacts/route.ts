import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Contact from '../../../models/Contact';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

    const [total, contacts] = await Promise.all([
      Contact.countDocuments(),
      Contact.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      count: contacts.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: contacts,
    });
  } catch (error: any) {
    console.error('Error fetching contacts API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Spam Bot Protection: Max 5 messages/minute per IP
    const rateCheck = checkRateLimit(request, {
      limit: 5,
      windowMs: 60 * 1000,
      keyPrefix: 'contacts_post',
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: `Too many inquiries. Please wait ${rateCheck.reset} seconds before sending another message.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.reset) } }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Please provide name, email, subject and message.' }, { status: 400 });
    }

    const newContact = new Contact({
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 150),
      phone: phone ? String(phone).trim().slice(0, 30) : '',
      subject: String(subject).trim().slice(0, 200),
      message: String(message).trim().slice(0, 3000),
      status: 'Unread',
    });

    const saved = await newContact.save();
    return NextResponse.json({ success: true, message: 'Message sent successfully!', data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
