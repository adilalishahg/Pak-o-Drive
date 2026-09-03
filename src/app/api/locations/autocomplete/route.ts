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
    const rawQuery = (searchParams.get('q') || '').trim();
    const cityFilter = (searchParams.get('city') || '').trim();

    if (!rawQuery || rawQuery.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const googleKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // ── OPTION A: Google Places Autocomplete (If Google API Key is provided) ──
    if (googleKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          rawQuery
        )}&components=country:pk&language=en&key=${googleKey}`;
        const gRes = await fetch(googleUrl, { next: { revalidate: 3600 } });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === 'OK' && Array.isArray(gData.predictions) && gData.predictions.length > 0) {
            const suggestions: SuggestionItem[] = gData.predictions.slice(0, 6).map((p: any, idx: number) => {
              const mainText = p.structured_formatting?.main_text || p.description.split(',')[0];
              const secondaryText = p.structured_formatting?.secondary_text || p.description;

              // Detect city from secondaryText or description
              const matchedCity = PAKISTAN_MAJOR_CITIES.find((c) =>
                p.description.toLowerCase().includes(c.toLowerCase())
              );

              return {
                id: `gloc_${idx}_${Date.now()}`,
                name: mainText,
                subText: secondaryText,
                fullAddress: p.description,
                city: matchedCity || undefined,
              };
            });
            return NextResponse.json({ success: true, suggestions, source: 'google' });
          }
        }
      } catch (gErr) {
        console.warn('Google Places autocomplete error, falling back to OSM:', gErr);
      }
    }

    // ── OPTION B: Smart Pakistani Progressive Geocoder (100% Free OpenStreetMap + Photon) ──
    let items: any[] = [];
    let detectedLandmark = '';

    // Step 1: Try exact query in Pakistan
    const cleanQuery = rawQuery.replace(/[,]+/g, ', ').replace(/\s+/g, ' ').trim();
    const exactNominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery.includes('Pakistan') ? cleanQuery : `${cleanQuery}, Pakistan`
    )}&countrycodes=pk&addressdetails=1&limit=6`;

    try {
      const res = await fetch(exactNominatimUrl, {
        headers: {
          'User-Agent': 'Pak-o-Drive-Ecommerce/1.0 (https://www.pakodrive.pk)',
          'Accept-Language': 'en',
        },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        items = await res.json();
      }
    } catch {
      // Fall through
    }

    // Step 2: Progressive Landmark Split (e.g. "wedding palace ,muslim town,rawalpindi")
    // When a specific building/hall is typed with an area/city, split landmark from the area
    if (!items || items.length === 0) {
      const segments = cleanQuery.split(/[,–-]/).map((s) => s.trim()).filter(Boolean);

      if (segments.length > 1) {
        detectedLandmark = segments[0]; // e.g. "wedding palace"
        const broaderAreaQuery = segments.slice(1).join(', '); // e.g. "muslim town, rawalpindi"

        try {
          const broaderUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            broaderAreaQuery.includes('Pakistan') ? broaderAreaQuery : `${broaderAreaQuery}, Pakistan`
          )}&countrycodes=pk&addressdetails=1&limit=6`;

          const bRes = await fetch(broaderUrl, {
            headers: {
              'User-Agent': 'Pak-o-Drive-Ecommerce/1.0 (https://www.pakodrive.pk)',
              'Accept-Language': 'en',
            },
            next: { revalidate: 3600 },
          });
          if (bRes.ok) {
            items = await bRes.json();
          }
        } catch {
          // Fall through
        }
      }
    }

    // Step 3: Fallback to Photon
    if (!items || items.length === 0) {
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          cleanQuery
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
      } catch {
        // Fall through
      }
    }

    // Step 4: Clean, deduplicate, and attach detected landmark
    const suggestions: SuggestionItem[] = (items || []).slice(0, 6).map((item, idx) => {
      const addr = item.address || {};
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
      const road = addr.road || addr.street || '';
      const rawCity = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';

      // Match closest city from PAKISTAN_MAJOR_CITIES
      const matchedCity = PAKISTAN_MAJOR_CITIES.find(
        (c) =>
          rawCity.toLowerCase().includes(c.toLowerCase()) ||
          item.display_name.toLowerCase().includes(c.toLowerCase())
      );

      const baseParts = [road, suburb, matchedCity || rawCity].filter(Boolean);
      let cleanName = baseParts.length > 0 ? baseParts.join(', ') : item.display_name.split(',')[0];

      // If user typed a specific venue/hall/house prefix that we stripped earlier, prepend it!
      if (detectedLandmark && !cleanName.toLowerCase().includes(detectedLandmark.toLowerCase())) {
        cleanName = `${detectedLandmark}, ${cleanName}`;
      }

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

    return NextResponse.json({ success: true, suggestions, source: 'osm' });
  } catch (error: any) {
    console.error('Location autocomplete error:', error);
    return NextResponse.json({ success: false, suggestions: [], error: error.message });
  }
}
