import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import BlogPost from '@/models/BlogPost';

export const runtime = 'nodejs'; // Node runtime for reliable dbConnect and external image fetching

/**
 * GET /api/og/card
 * Query params:
 * - type: 'product' | 'home' | 'blog' | 'auto' | 'generic'
 * - slug: product or article slug
 * - title: custom title override
 * - price: custom price override (e.g. "1899")
 * - image: custom image URL override
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'home';
    const slug = searchParams.get('slug') || '';
    const customTitle = searchParams.get('title') || '';
    const customPrice = searchParams.get('price') || '';
    const customImage = searchParams.get('image') || '';

    let title = customTitle || "Pak-o-Drive™ | Pakistan's #1 Car Accessories Store";
    let subtitle = "Viral Automotive Gadgets, LED Headlights & Smart Interior Accessories";
    let priceText = customPrice ? `Rs. ${Number(customPrice).toLocaleString()}` : '';
    let categoryText = "AUTOMOTIVE ESSENTIALS";
    let imageUrl = customImage || '';

    // If type is product and slug provided, look up product in DB
    if (type === 'product' && slug) {
      try {
        await dbConnect();
        const p = await Product.findOne({
          $or: [{ slug: slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
        }).select('name price category image description isBundle').lean();

        if (p) {
          title = p.name;
          priceText = `Rs. ${p.price.toLocaleString()}`;
          categoryText = (p.category || 'CAR ACCESSORIES').toUpperCase();
          if (p.image) {
            imageUrl = p.image;
          }
          if (p.description) {
            subtitle = p.description.slice(0, 110).replace(/[*#]/g, '') + '...';
          }
        }
      } catch (dbErr) {
        console.warn('OG Card DB lookup error:', dbErr);
      }
    } else if ((type === 'blog' || type === 'auto') && slug) {
      try {
        await dbConnect();
        const post = await BlogPost.findOne({ slug }).select('title excerpt category coverImage readTime').lean();
        if (post) {
          title = post.title;
          categoryText = (post.category || 'AUTO JOURNAL').toUpperCase();
          subtitle = post.excerpt ? post.excerpt.slice(0, 120) + '...' : "Research, vehicle guides & real-world road tests for Pakistani motorists.";
          if (post.coverImage) {
            imageUrl = post.coverImage;
          }
          priceText = `${post.readTime || 4} MIN READ`;
        }
      } catch (dbErr) {
        console.warn('OG Card blog lookup error:', dbErr);
      }
    }

    // Cloudinary optimization for embedding in ImageResponse
    if (imageUrl && imageUrl.includes('res.cloudinary.com') && imageUrl.includes('/upload/')) {
      imageUrl = imageUrl.replace('/upload/', '/upload/f_jpg,q_80,w_800,h_800,c_pad,b_white/');
      imageUrl = imageUrl.replace(/\.(webp|png|jpeg)$/i, '.jpg');
    }

    // 1200 x 630 High-Contrast Dark Executive Canvas (AAA Typography, Logo Overlay, Trust Badges)
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0a0f1d',
            backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(234, 88, 12, 0.18) 0%, transparent 60%), radial-gradient(circle at 10% 90%, rgba(14, 165, 233, 0.16) 0%, transparent 60%)',
            padding: '44px 52px',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif',
            position: 'relative',
            color: '#ffffff',
          }}
        >
          {/* Top Brand Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingBottom: '24px',
              borderBottom: '1.5px solid rgba(51, 65, 85, 0.6)',
            }}
          >
            {/* Logo Badge (Lightning Bolt + PAKODRIVE) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
                }}
              >
                {/* SVG Lightning Icon */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    color: '#ffffff',
                    lineHeight: '1.1',
                  }}
                >
                  PAK-O-DRIVE<span style={{ color: '#ea580c' }}>.PK</span>
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}
                >
                  Pakistan&apos;s #1 Automotive Store
                </span>
              </div>
            </div>

            {/* Category Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '30px',
                backgroundColor: 'rgba(234, 88, 12, 0.14)',
                border: '1px solid rgba(234, 88, 12, 0.35)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#fb923c',
                  letterSpacing: '1px',
                }}
              >
                {categoryText}
              </span>
            </div>
          </div>

          {/* Main Body: Two Columns (Product Photo / Logo on Left + Info & Badges on Right) */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '40px',
              marginTop: '28px',
            }}
          >
            {/* Left Box: Product Image in Rounded Card with Accent Border */}
            <div
              style={{
                width: '420px',
                height: '420px',
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '16px',
                  }}
                />
              ) : (
                /* Fallback Branded Big Emblem */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                  }}
                >
                  <svg width="110" height="110" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                      fill="#ea580c"
                      stroke="#ea580c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>PAK-O-DRIVE</span>
                </div>
              )}

              {/* Watermark Logo Stamp in Corner */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                PAKODRIVE.PK 🇵🇰
              </div>
            </div>

            {/* Right Column: Title, Price Tag, Subtitle & Pakistani Trust Indicators */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                gap: '18px',
              }}
            >
              {/* Product / Article Title */}
              <h1
                style={{
                  fontSize: title.length > 55 ? '32px' : '38px',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: '1.25',
                  margin: 0,
                }}
              >
                {title.length > 80 ? title.slice(0, 77) + '...' : title}
              </h1>

              {/* Subtitle / Excerpt */}
              <p
                style={{
                  fontSize: '16px',
                  color: '#94a3b8',
                  lineHeight: '1.45',
                  margin: 0,
                }}
              >
                {subtitle}
              </p>

              {/* Price & Delivery Highlights */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                {priceText && (
                  <div
                    style={{
                      padding: '10px 22px',
                      borderRadius: '14px',
                      backgroundColor: '#10b981',
                      color: '#022c22',
                      fontSize: '26px',
                      fontWeight: 900,
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    {priceText}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
                    Cash on Delivery Available
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Nationwide Dispatch via TCS &amp; Trax
                  </span>
                </div>
              </div>

              {/* Trust Reassurance Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(51, 65, 85, 0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>🛡️</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>7-Day Warranty</span>
                </div>
                <span style={{ color: '#475569' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>24-48h Dispatch</span>
                </div>
                <span style={{ color: '#475569' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>🇵🇰</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>250+ Pak Cities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('OG Card Generation Error:', error);
    // Emergency Fallback 1200x630 Solid
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0f1d',
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '48px', fontWeight: 900 }}>PAK-O-DRIVE™</h1>
          <p style={{ fontSize: '20px', color: '#94a3b8' }}>Pakistan&apos;s #1 Car Accessories Store</p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
