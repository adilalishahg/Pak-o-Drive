const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');

for (const name of ['porsche-gt3', 'porsche-911', 'cars-driving-night', '../profile-samples/top2-reel']) {
  const video = `public/img/viral-reels/raw/${name}.mp4`;
  const frame = `public/img/viral-reels/raw/${name}-frame.jpg`;
  if (fs.existsSync(video)) {
    execSync(`"${ffmpeg.path}" -y -ss 00:00:02 -i "${video}" -vframes 1 "${frame}"`);
    console.log('Extracted frame:', frame);
  }
}
