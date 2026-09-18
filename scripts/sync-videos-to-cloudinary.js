const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env' });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret || cloudName === 'dvasdadxzc') {
  console.error('❌ Cloudinary credentials not configured in .env.');
  console.log('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env first.');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const VIDEOS_TO_SYNC = {
  beach: [
    'https://cdn.coverr.co/videos/coverr-calm-waves-in-an-ocean-gulf-4513/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-waves-in-the-ocean-9488/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-sunrise-on-the-beach-9704/1080p.mp4',
  ],
  buildings: [
    'https://cdn.coverr.co/videos/coverr-houston-texas-at-night-4130/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-manhattan-skyline-7479/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-temp-zna6gen-3-alpha-2777358279-a-dynamic-time-lapse-mp4-5453/1080p.mp4',
  ],
  nature: [
    'https://cdn.coverr.co/videos/coverr-above-a-misty-forest-518/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-misty-mountains-in-sao-vicente-portugal-3617/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-waterfall-near-a-road-6235/1080p.mp4',
  ],
  rain: [
    'https://cdn.coverr.co/videos/coverr-woman-driving-through-a-misty-forest-7158/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-storm-in-vilnius-lithuania-5273/1080p.mp4',
  ],
  roads: [
    'https://cdn.coverr.co/videos/coverr-black-suv-on-the-road-4297/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-woman-driving-through-a-misty-forest-7158/1080p.mp4',
  ],
  sky: [
    'https://cdn.coverr.co/videos/coverr-view-of-a-city-from-plane-window-6971/1080p.mp4',
    'https://cdn.coverr.co/videos/coverr-pink-sunset-timelapse-4178/1080p.mp4',
  ],
};

async function main() {
  console.log(`🚀 Starting Cloudinary Video Migration for cloud: [${cloudName}]...`);
  const results = {};

  for (const [category, urls] of Object.entries(VIDEOS_TO_SYNC)) {
    results[category] = [];
    console.log(`\n📁 Category [${category}]:`);

    for (const url of urls) {
      const slug = url.split('/').slice(-2, -1)[0] || 'clip';
      const publicId = `pakodrive/viral-reels/${category}/${slug}`;

      try {
        console.log(`   ⬆️ Uploading ${slug}...`);
        const res = await cloudinary.uploader.upload(url, {
          resource_type: 'video',
          public_id: publicId,
          overwrite: false,
        });
        console.log(`   ✓ Hosted on Cloudinary: ${res.secure_url}`);
        results[category].push(res.secure_url);
      } catch (err) {
        console.warn(`   ⚠️ Upload warning for ${slug}:`, err.message);
        results[category].push(url);
      }
    }
  }

  console.log('\n🎉 Migration Complete!');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
