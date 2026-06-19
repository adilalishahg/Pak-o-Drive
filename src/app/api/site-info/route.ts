import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import SiteInfo from '../../../models/SiteInfo';

export async function GET() {
  try {
    await dbConnect();
    let info = await SiteInfo.findOne({});
    if (!info) info = await SiteInfo.create({});
    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    delete body._id; delete body.__v; delete body.createdAt;
    const info = await SiteInfo.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true, runValidators: true }
    );
    return NextResponse.json({ success: true, message: 'Site info saved!', data: info });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
