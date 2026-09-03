import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const isCar = (category || '').includes('car') || /car|mirror|drl|polish|wax|perfume|mehran|corolla/i.test(cleanTitle);
    const isAudio = (category || '').includes('mobile') || /earbuds|headphone|audio|wireless/i.test(cleanTitle);

    // Rule-based intelligent Pakistani e-commerce copywriter engine
    let hook = '';
    let whyYouNeedBullets: string[] = [];
    let specs: Record<string, string> = {};

    if (isAudio) {
      hook = `Elevate your audio experience with the ${cleanTitle}. Featuring high-definition acoustics, instant Bluetooth 5.3 pairing, and an ergonomic lightweight build designed for all-day daily comfort.`;
      whyYouNeedBullets = [
        'Crystal Clear HD Sound & Deep Bass Acoustic Drivers',
        'Instant Auto-Connect Bluetooth 5.3 with Zero Audio Lag',
        'All-Day Long Battery Endurance with Fast Type-C Charging Case',
        'Built-in Noise Cancellation Mic for Clear Calling on the Go',
        'Sweatproof & Ergonomic Snug Fit for Gym, Commuting & Daily Use',
      ];
      specs = {
        'Connectivity': 'Bluetooth 5.3 (10m range)',
        'Battery Life': 'Up to 24 Hours with Charging Case',
        'Charging Port': 'Type-C Fast Charge',
        'Compatibility': 'Universal (Android, iOS, Laptops, Tablets)',
        'Warranty': '7-Day Replacement & Testing Guarantee',
      };
    } else if (isCar) {
      hook = `Give your vehicle the upgrade it deserves with the ${cleanTitle}. Precision-engineered for durability, effortless DIY installation, and maximum reliability on Pakistani roads.`;
      whyYouNeedBullets = [
        'OEM Standard Direct Fitment with zero vehicle modifications needed',
        'Built with Heavy-Duty Weather-Resistant Materials for Pakistani Climate',
        'Enhances Driving Safety, Style & Vehicle Value Instantly',
        '100% Brand New Condition with Bubble-Wrapped Safe Dispatch',
        'Doorstep Cash on Delivery with 7-Day Easy Return Guarantee',
      ];
      specs = {
        'Vehicle Compatibility': cleanTitle.includes('Mehran') ? 'Suzuki Mehran (All Models)' : 'Universal Fitment',
        'Material Grade': 'High-Impact ABS & Premium Finishes',
        'Installation': 'Direct DIY Bolt-On / Adhesive Application',
        'Origin': 'Verified Quality Automotive Parts',
        'Warranty': '7-Day Easy Exchange Policy',
      };
    } else {
      hook = `Simplify your daily lifestyle with the ${cleanTitle}. Engineered with premium grade materials, sleek ergonomics, and dependable performance built to last.`;
      whyYouNeedBullets = [
        'Engineered for Long-Lasting Durability and Daily Usability',
        'Compact, Portable & Modern Space-Saving Design',
        '100% Safe, Non-Toxic & Energy-Efficient Materials',
        'Simple Plug-and-Play Setup straight out of the box',
        'Backed by Pak-o-Drive Doorstep Cash on Delivery Across Pakistan',
      ];
      specs = {
        'Build Quality': 'Premium Certified Materials',
        'Power / Usage': 'Standard Pakistani Household & Daily Use',
        'Package Includes': '1x Main Unit, User Guide, Secure Packaging',
        'Warranty': '7-Day Testing & Return Guarantee',
      };
    }

    const fullDescription = `${hook}

✅ Why You Need This:
${whyYouNeedBullets.map((b) => `• ${b}`).join('\n')}

What's in the Box:
• 1x ${cleanTitle}
• Secure Fragile Protective Packaging
• Pak-o-Drive Quality Verification Seal`;

    const seoTitle = `${cleanTitle} - Best Price in Pakistan | Pak-o-Drive`;
    const seoDescription = `Buy ${cleanTitle} at best price in Pakistan with Cash on Delivery. 100% original quality, fast courier shipping & 7-day easy returns at Pak-o-Drive.`;

    return NextResponse.json({
      success: true,
      data: {
        title: cleanTitle,
        hook,
        description: fullDescription,
        specifications: specs,
        seoTitle,
        seoDescription,
      },
    });
  } catch (error: any) {
    console.error('AI Generate Product Error:', error);
    return NextResponse.json({ error: 'Failed to generate product copy' }, { status: 500 });
  }
}
