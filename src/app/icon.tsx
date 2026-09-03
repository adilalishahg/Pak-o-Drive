import { ImageResponse } from 'next/og';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: '50%',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 320"
          width="180"
          height="180"
          fill="none"
        >
          <defs>
            <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C0FF" />
              <stop offset="100%" stopColor="#0080E6" />
            </linearGradient>
            <linearGradient id="orangeGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#FFA000" />
            </linearGradient>
            <linearGradient id="darkBlueArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066CC" />
              <stop offset="100%" stopColor="#004499" />
            </linearGradient>
          </defs>

          <g transform="translate(12, 10)">
            <path d="M 175 65 A 95 95 0 0 1 250 170" stroke="#FF7B00" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.95"/>
            <path d="M 70 210 A 95 95 0 0 1 110 260" stroke="#FF7B00" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M 85 105 A 85 85 0 0 1 200 70" stroke="url(#darkBlueArc)" strokeWidth="11" strokeLinecap="round" fill="none"/>
            <path d="M 120 250 A 85 85 0 0 0 240 215" stroke="url(#blueGlow)" strokeWidth="13" strokeLinecap="round" fill="none"/>
            <path d="M 145 268 A 95 95 0 0 0 230 245" stroke="#0099FF" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M 50 150 A 110 110 0 0 0 95 240" stroke="#00B4D8" strokeWidth="15" strokeLinecap="round" fill="none"/>
            <path d="M 38 185 C 36 225, 80 255, 140 240 C 205 220, 245 155, 275 85" stroke="url(#orangeGlow)" strokeWidth="19" strokeLinecap="round" fill="none"/>
            <polygon points="275,55 295,95 248,82" fill="#FF8800"/>
            <polygon points="275,55 248,82 265,98" fill="#E65100" opacity="0.6"/>
            <polygon points="215,20 162,130 220,130 115,280 158,165 105,165" fill="#0066B3" />
            <polygon points="210,25 168,135 225,135 125,270 162,160 112,160" fill="url(#blueGlow)" />
            <polygon points="210,25 178,135 198,135 125,270 155,160 128,160" fill="#E0F7FF" opacity="0.45"/>
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
