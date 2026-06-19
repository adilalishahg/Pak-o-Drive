import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Contact from '../../../models/Contact';

export async function GET() {
  try {
    await dbConnect();
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: contacts.length, data: contacts });
  } catch (error: any) {
    console.error('Error fetching contacts API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Please provide name, email, subject and message.' }, { status: 400 });
    }

    const newContact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'Unread',
    });

    const saved = await newContact.save();
    return NextResponse.json({ success: true, message: 'Message sent successfully!', data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
