const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', reject);
  });
}

const CATEGORY_CLIPS = {
  nature: [
    { id: 'misty-mountains', url: 'https://cdn.coverr.co/videos/coverr-misty-mountains-in-sao-vicente-portugal-3617/1080p.mp4' },
    { id: 'above-misty-forest', url: 'https://cdn.coverr.co/videos/coverr-above-a-misty-forest-518/1080p.mp4' },
    { id: 'waterfall-near-road', url: 'https://cdn.coverr.co/videos/coverr-waterfall-near-a-road-6235/1080p.mp4' },
  ],
  roads: [
    { id: 'sports-car-curve', local: 'public/img/viral-reels/mixkit/52427.mp4' },
    { id: 'nissan-night-rain', local: 'public/img/viral-reels/raw/nissan-300zx.mp4' },
    { id: 'black-suv-road', url: 'https://cdn.coverr.co/videos/coverr-black-suv-on-the-road-4297/1080p.mp4' },
  ],
  beach: [
    { id: 'calm-ocean-waves', url: 'https://cdn.coverr.co/videos/coverr-calm-waves-in-an-ocean-gulf-4513/1080p.mp4' },
    { id: 'waves-ocean-moody', url: 'https://cdn.coverr.co/videos/coverr-waves-in-the-ocean-9488/1080p.mp4' },
    { id: 'sunrise-beach-coast', url: 'https://cdn.coverr.co/videos/coverr-sunrise-on-the-beach-9704/1080p.mp4' },
  ],
  buildings: [
    { id: 'manhattan-skyline', url: 'https://cdn.coverr.co/videos/coverr-manhattan-skyline-7479/1080p.mp4' },
    { id: 'timelapse-night-cityscape', url: 'https://cdn.coverr.co/videos/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453/1080p.mp4' },
    { id: 'houston-night-skyline', url: 'https://cdn.coverr.co/videos/coverr-houston-texas-at-night-4130/1080p.mp4' },
  ],
  sky: [
    { id: 'airplane-window-clouds', url: 'https://cdn.coverr.co/videos/coverr-view-of-a-city-from-plane-window-6971/1080p.mp4' },
    { id: 'pink-sunset-clouds', url: 'https://cdn.coverr.co/videos/coverr-pink-sunset-timelapse-4178/1080p.mp4' },
    { id: 'airplane-wing-clouds', local: 'public/img/viral-reels/profile-samples/top2-reel.mp4' },
  ],
  rain: [
    { id: 'storm-city-rain', url: 'https://cdn.coverr.co/videos/coverr-storm-in-vilnius-lithuania-5273/1080p.mp4' },
    { id: 'misty-forest-drive', url: 'https://cdn.coverr.co/videos/coverr-woman-driving-through-a-misty-forest-7158/1080p.mp4' },
    { id: 'nissan-night-rain-close', local: 'public/img/viral-reels/raw/nissan-300zx.mp4' },
  ]
};

async function main() {
  const baseDir = path.resolve(process.cwd(), 'public/img/viral-reels/library');
  fs.mkdirSync(baseDir, { recursive: true });

  for (const [cat, clips] of Object.entries(CATEGORY_CLIPS)) {
    const catDir = path.join(baseDir, cat);
    fs.mkdirSync(catDir, { recursive: true });

    for (const c of clips) {
      const dest = path.join(catDir, `${c.id}.mp4`);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
        console.log(`✓ Already exists: ${cat}/${c.id}.mp4`);
        continue;
      }

      if (c.local && fs.existsSync(c.local)) {
        fs.copyFileSync(c.local, dest);
        console.log(`✓ Copied local asset: ${cat}/${c.id}.mp4`);
      } else if (c.url) {
        try {
          console.log(`⬇️ Downloading ${cat}/${c.id}.mp4...`);
          await download(c.url, dest);
          console.log(`✓ Downloaded ${cat}/${c.id}.mp4 (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(1)} MB)`);
        } catch (err) {
          console.warn(`⚠️ Failed to download ${c.id}: ${err.message}`);
        }
      }
    }
  }

  console.log('\n🎉 Multi-Category Video Asset Library Setup Complete!');
}

main().catch(console.error);
