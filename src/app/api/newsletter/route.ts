import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Subscriber from '../../../models/Subscriber';

// GET: Retrieve all newsletter subscribers
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

// POST: Subscribe a new email to the newsletter
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: trimmedEmail });
    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'You are already subscribed to our newsletter!', 
        alreadySubscribed: true 
      });
    }

    const newSubscriber = new Subscriber({ email: trimmedEmail });
    await newSubscriber.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to the newsletter!', 
      data: newSubscriber 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Unsubscribe/remove a newsletter subscriber
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
