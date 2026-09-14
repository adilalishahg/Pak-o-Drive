const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const dotenv = require('dotenv');
dotenv.config();

async function getAudio() {
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const res = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media?fields=id,media_type,media_url,timestamp&limit=25&access_token=${accessToken}`);
  const data = await res.json();
  const video = data.data.find(m => m.media_type === 'VIDEO' && m.media_url);
  if (!video) throw new Error('No video found');

  if (!fs.existsSync('public/audio')) fs.mkdirSync('public/audio', { recursive: true });

  const file = fs.createWriteStream('temp_video.mp4');
  https.get(video.media_url, r => {
    r.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded video');
      execSync(`"${ffmpeg.path}" -y -i temp_video.mp4 -vn -acodec libmp3lame public/audio/aesthetic-lofi-trending.mp3`);
      fs.unlinkSync('temp_video.mp4');
      console.log('Saved public/audio/aesthetic-lofi-trending.mp3, size:', fs.statSync('public/audio/aesthetic-lofi-trending.mp3').size);
    });
  });
}
getAudio().catch(console.error);
