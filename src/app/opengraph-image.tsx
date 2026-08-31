import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pak-o-Drive — Pakistan’s Trusted Automotive Accessories & Tech Store';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Ambient Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.35) 0%, rgba(234,88,12,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)',
          }}
        />

        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(234,88,12,0.4)',
            }}
          >
            🔥 PAKISTAN’S #1 AUTOMOTIVE &amp; TECH STORE
          </div>
        </div>

        {/* Center Brand Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontSize: '76px',
                fontWeight: 900,
                letterSpacing: '-2px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              PAK-O-DRIVE
            </span>
          </div>

          <p
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#94a3b8',
              maxWidth: '850px',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Premium Automotive Accessories, Sound Systems &amp; Smart Tech Gadgets
          </p>
        </div>

        {/* Bottom Trust Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '30px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', color: '#10b981', fontWeight: 700 }}>
            <span>🚚</span> Free Cash On Delivery
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', color: '#38bdf8', fontWeight: 700 }}>
            <span>🛡️</span> 7-Day Checking Warranty
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', color: '#f59e0b', fontWeight: 700 }}>
            <span>⚡</span> 100% Original Products
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
