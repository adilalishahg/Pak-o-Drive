const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', reject);
  });
}

async function main() {
  const clips = [
    { id: '35540', url: 'https://assets.mixkit.co/videos/35540/35540-720.mp4' },
    { id: '64', url: 'https://assets.mixkit.co/videos/64/64-1080.mp4' },
    { id: '74', url: 'https://assets.mixkit.co/videos/74/74-1080.mp4' },
    { id: '52427', url: 'https://assets.mixkit.co/videos/52427/52427-1080.mp4' },
    { id: '63', url: 'https://assets.mixkit.co/videos/63/63-1080.mp4' },
  ];

  fs.mkdirSync('public/img/viral-reels/mixkit', { recursive: true });

  for (const c of clips) {
    const mp4 = `public/img/viral-reels/mixkit/${c.id}.mp4`;
    const jpg = `public/img/viral-reels/mixkit/${c.id}-frame.jpg`;
    console.log(`Downloading ${c.id}...`);
    await download(c.url, mp4);
    execSync(`"${ffmpeg.path}" -y -ss 00:00:02 -i "${mp4}" -vframes 1 "${jpg}"`, { stdio: 'ignore' });
    console.log(`Extracted frame for ${c.id}`);
  }
}

main();
