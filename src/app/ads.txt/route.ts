import { NextResponse } from 'next/server';

export async function GET() {
  const clientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ||
    process.env.ADSENSE_PUB_ID ||
    'pub-0000000000000000';

  // Normalize ca-pub-XXXX to pub-XXXX
  const pubId = clientId.startsWith('ca-') ? clientId.replace(/^ca-/, '') : clientId;

  const content = `# Google AdSense ads.txt for Pak-o-Drive
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
