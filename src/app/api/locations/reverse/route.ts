import { NextRequest, NextResponse } from 'next/server';
import { PAKISTAN_MAJOR_CITIES } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: 'Latitude and Longitude are required' }, { status: 400 });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Pak-o-Drive-Ecommerce/1.0 (https://www.pakodrive.pk)',
        'Accept-Language': 'en',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Nominatim returned status ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.street || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
    const rawCity =
      addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';

    // Match closest city from PAKISTAN_MAJOR_CITIES
    const matchedCity = PAKISTAN_MAJOR_CITIES.find(
      (c) =>
        rawCity.toLowerCase().includes(c.toLowerCase()) ||
        (data.display_name && data.display_name.toLowerCase().includes(c.toLowerCase()))
    );

    const detectedCity = matchedCity || rawCity || '';

    // Construct a human-readable clean address suitable for courier delivery
    const addressParts = [road, suburb].filter(Boolean);
    const formattedAddress =
      addressParts.length > 0
        ? addressParts.join(', ')
        : (data.display_name || '').split(',').slice(0, 3).join(', ');

    return NextResponse.json({
      success: true,
      data: {
        formattedAddress,
        fullDisplayName: data.display_name,
        city: detectedCity,
        road,
        suburb,
        postcode: addr.postcode || '',
        lat,
        lng,
      },
    });
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to detect location' }, { status: 500 });
  }
}
