import { ImageResponse } from 'next/og';
import { getCachedProduct } from '../../../lib/cache';

export const runtime = 'edge';
export const alt = 'Pak-o-Drive Product Showcase';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;
  const product = await getCachedProduct(id);

  const title = product?.name || 'Pak-o-Drive Featured Product';
  const price = product?.price ? `PKR ${product.price.toLocaleString()}` : '';
  const category = product?.category || 'Automotive & Tech';
  const imageUrl = product?.image || 'https://pakodrive.com/img/carousel-1.png';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '50px 60px',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Left Info Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            maxWidth: '650px',
          }}
        >
          {/* Top Brand Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                background: '#ea580c',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              PAK-O-DRIVE
            </span>
            <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: 600 }}>{category}</span>
          </div>

          {/* Center Product Title & Price */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {title.length > 55 ? title.slice(0, 52) + '...' : title}
            </h1>

            {price && (
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  color: '#38bdf8',
                  letterSpacing: '-1px',
                }}
              >
                {price}
              </div>
            )}
          </div>

          {/* Bottom Badges */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              paddingTop: '20px',
            }}
          >
            <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 700 }}>
              🚚 Cash On Delivery Available
            </span>
            <span style={{ fontSize: '18px', color: '#f59e0b', fontWeight: 700 }}>
              🛡️ 7-Day Warranty
            </span>
          </div>
        </div>

        {/* Right Product Image Showcase */}
        <div
          style={{
            width: '420px',
            height: '420px',
            background: '#ffffff',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
