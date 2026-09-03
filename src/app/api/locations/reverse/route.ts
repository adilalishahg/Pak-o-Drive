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

    const googleKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // ── OPTION A: Google Geocoding API (If Google API Key is present) ──
    if (googleKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
          lat
        )},${encodeURIComponent(lng)}&key=${googleKey}&language=en`;

        const gRes = await fetch(googleUrl, { next: { revalidate: 86400 } });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
            const best = gData.results[0];
            const formatted = best.formatted_address || '';

            // Detect City
            let detectedCity = '';
            for (const comp of best.address_components || []) {
              if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) {
                const match = PAKISTAN_MAJOR_CITIES.find(
                  (c) => c.toLowerCase() === comp.long_name.toLowerCase()
                );
                if (match) {
                  detectedCity = match;
                  break;
                }
              }
            }

            // Bahria Town Phases 1-8 are served by Rawalpindi courier hubs
            if (!detectedCity || /Bahria Town Phase [1-8]/i.test(formatted)) {
              detectedCity = 'Rawalpindi';
            }

            return NextResponse.json({
              success: true,
              data: {
                formattedAddress: formatted.replace(/, Pakistan$/i, '').trim(),
                fullDisplayName: formatted,
                city: detectedCity,
                lat,
                lng,
              },
              source: 'google',
            });
          }
        }
      } catch (gErr) {
        console.warn('Google reverse geocode failed, falling back to OSM:', gErr);
      }
    }

    // ── OPTION B: OpenStreetMap High-Precision Zoom=18 Reverse Geocoder (Free) ──
    // zoom=18 forces street, plaza, commercial hub, and house level resolution
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

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

    // High precision landmark and commercial hub resolution (e.g. "Civic Center", "Sector A", "Plaza")
    const landmark =
      addr.commercial ||
      addr.retail ||
      addr.amenity ||
      addr.building ||
      addr.shop ||
      data.name ||
      '';
    const block = addr.block || addr.city_block || addr.neighbourhood || '';
    const road = addr.road || addr.street || '';
    const suburb = addr.suburb || addr.residential || addr.quarter || '';
    const rawCity =
      addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';

    // Match closest city from PAKISTAN_MAJOR_CITIES
    let detectedCity = PAKISTAN_MAJOR_CITIES.find(
      (c) =>
        rawCity.toLowerCase().includes(c.toLowerCase()) ||
        (data.display_name && data.display_name.toLowerCase().includes(c.toLowerCase()))
    );

    // Bahria Town Phases 1-8 are in Rawalpindi courier routing
    const fullText = `${landmark} ${block} ${road} ${suburb} ${data.display_name || ''}`;
    if (/Bahria Town Phase [1-8]/i.test(fullText) || /Civic Center/i.test(fullText)) {
      detectedCity = 'Rawalpindi';
    }

    if (!detectedCity) {
      detectedCity = rawCity || 'Pakistan';
    }

    // Construct a high-accuracy, readable delivery address:
    // e.g. "Civic Center, Bahria Town Phase 4"
    const preciseParts = [landmark, block, road, suburb].filter(Boolean);
    const uniqueParts: string[] = [];
    for (const part of preciseParts) {
      if (!uniqueParts.some((u) => u.toLowerCase().includes(part.toLowerCase()))) {
        uniqueParts.push(part);
      }
    }

    const formattedAddress =
      uniqueParts.length > 0
        ? uniqueParts.join(', ')
        : (data.display_name || '').split(',').slice(0, 3).join(', ');

    return NextResponse.json({
      success: true,
      data: {
        formattedAddress,
        fullDisplayName: data.display_name,
        city: detectedCity,
        landmark,
        road,
        suburb,
        lat,
        lng,
      },
      source: 'osm',
    });
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to detect location' }, { status: 500 });
  }
}
