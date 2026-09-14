const https = require('https');
const fs = require('fs');

function getUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function main() {
  const pages = [
    'https://mixkit.co/free-stock-video/car/',
    'https://mixkit.co/free-stock-video/sports-car/',
    'https://mixkit.co/free-stock-video/car-night/',
    'https://mixkit.co/free-stock-video/driving-at-night/'
  ];

  const found = new Set();
  for (const page of pages) {
    const html = await getUrl(page);
    const matches = html.match(/https:\/\/assets\.mixkit\.co\/videos\/[^\s"']+\.mp4/g);
    if (matches) {
      matches.forEach(m => found.add(m));
    }
  }

  console.log('Total Mixkit MP4s found:', found.size);
  const arr = Array.from(found);
  arr.slice(0, 15).forEach((u, i) => console.log(`${i + 1}: ${u}`));
}

main();
