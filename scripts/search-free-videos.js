async function checkSources() {
  // Test Coverr
  try {
    const res = await fetch('https://coverr.co/api/videos?query=car&page=1');
    console.log('Coverr status:', res.status);
    if (res.ok) {
      const json = await res.json();
      console.log('Coverr results:', json.hits?.length || json.videos?.length);
    }
  } catch (e) {
    console.log('Coverr err:', e.message);
  }

  // Test Pexels public webpage HTML
  try {
    const res = await fetch('https://www.pexels.com/search/videos/dark%20car%20night/?orientation=portrait', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Pexels web status:', res.status);
    const html = await res.text();
    const mp4s = html.match(/https:\/\/[^"']+\.mp4[^"']*/g) || [];
    console.log('Pexels found mp4s:', mp4s.length);
    if (mp4s.length > 0) {
      console.log('Sample Pexels MP4:', mp4s[0]);
    }
  } catch (e) {
    console.log('Pexels web err:', e.message);
  }

  // Test Pixabay free key / API
  try {
    const res = await fetch('https://pixabay.com/api/videos/?key=23438072-4d2a1705607996c56784d5e94&q=night+car&video_type=film');
    console.log('Pixabay status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Pixabay hits:', data.hits?.length);
      if (data.hits?.length > 0) {
        console.log('Sample Pixabay video:', data.hits[0].videos?.medium?.url);
      }
    }
  } catch (e) {
    console.log('Pixabay err:', e.message);
  }
}

checkSources();
