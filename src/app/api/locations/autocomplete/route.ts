import { NextRequest, NextResponse } from 'next/server';
import { PAKISTAN_MAJOR_CITIES } from '@/lib/constants';

interface SuggestionItem {
  id: string;
  name: string;
  subText: string;
  fullAddress: string;
  city?: string;
  lat?: string | number;
  lng?: string | number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    const cityFilter = (searchParams.get('city') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const searchQuery = cityFilter && !query.toLowerCase().includes(cityFilter.toLowerCase())
      ? `${query}, ${cityFilter}, Pakistan`
      : `${query}, Pakistan`;

    // 1. Query Nominatim OpenStreetMap with Pakistan country code & English language
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&countrycodes=pk&addressdetails=1&limit=6`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let items: any[] = [];
    try {
      const res = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'Pak-o-Drive-Ecommerce/1.0 (https://www.pakodrive.pk)',
          'Accept-Language': 'en',
        },
        signal: controller.signal,
        next: { revalidate: 3600 },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        items = await res.json();
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      // Fallback to Photon if Nominatim times out
    }

    // 2. Fallback to Photon if Nominatim returned 0 items
    if (!items || items.length === 0) {
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query
        )}&limit=6&bbox=60.87,23.69,77.84,37.08&lang=en`;
        const pRes = await fetch(photonUrl, { next: { revalidate: 3600 } });
        if (pRes.ok) {
          const pData = await pRes.json();
          items = (pData.features || []).map((f: any) => ({
            display_name: [f.properties.name, f.properties.city, f.properties.state, 'Pakistan']
              .filter(Boolean)
              .join(', '),
            lat: f.geometry?.coordinates?.[1],
            lon: f.geometry?.coordinates?.[0],
            address: {
              road: f.properties.street,
              suburb: f.properties.district || f.properties.name,
              city: f.properties.city || f.properties.state,
            },
          }));
        }
      } catch (pErr) {
        // Ignore fallback error
      }
    }

    // 3. Format and clean results
    const suggestions: SuggestionItem[] = (items || []).slice(0, 6).map((item, idx) => {
      const addr = item.address || {};
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || '';
      const road = addr.road || '';
      const rawCity = addr.city || addr.town || addr.county || addr.state_district || '';

      // Match closest city from PAKISTAN_MAJOR_CITIES
      const matchedCity = PAKISTAN_MAJOR_CITIES.find(
        (c) =>
          rawCity.toLowerCase().includes(c.toLowerCase()) ||
          item.display_name.toLowerCase().includes(c.toLowerCase())
      );

      const parts = [road, suburb, matchedCity || rawCity].filter(Boolean);
      const cleanName = parts.length > 0 ? parts.join(', ') : item.display_name.split(',')[0];
      const subText = item.display_name
        .split(',')
        .slice(1, 4)
        .map((s: string) => s.trim())
        .join(', ');

      return {
        id: `loc_${idx}_${Date.now()}`,
        name: cleanName,
        subText: subText || 'Pakistan',
        fullAddress: cleanName,
        city: matchedCity || rawCity || undefined,
        lat: item.lat,
        lng: item.lon,
      };
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Location autocomplete error:', error);
    return NextResponse.json({ success: false, suggestions: [], error: error.message });
  }
}
