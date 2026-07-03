const url = require('url');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse query parameters
  const { query } = url.parse(req.url, true);
  const text = query.text;

  if (!text) {
    res.status(400).json({ error: 'Text query parameter is required' });
    return;
  }

  // 요금폭탄 방지: 외부 도메인에서 본 API 무단 도용(Hotlinking) 차단
  const referer = req.headers.referer || '';
  const isLocal = referer.includes('localhost') || referer.includes('127.0.0.1');
  const isVercel = referer.includes('vercel.app');
  
  if (referer && !isLocal && !isVercel) {
    res.status(403).json({ error: 'Access denied: Hotlinking is prohibited.' });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Google API key is not configured' });
    return;
  }

  try {
    // Call the official Google Cloud Text-to-Speech REST API
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'ja-JP',
          name: 'ja-JP-Wavenet-B', // Premium WaveNet neural voice (Female)
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.75, // Slowed down by 0.75x for senior convenience
          pitch: 0.0
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: `Google TTS API Error: ${errText}` });
      return;
    }

    const data = await response.json();
    const audioContent = data.audioContent; // Base64 encoded audio string

    if (!audioContent) {
      res.status(500).json({ error: 'No audio content returned from Google TTS' });
      return;
    }

    // Convert Base64 string to a binary buffer and return as audio/mpeg stream
    const buffer = Buffer.from(audioContent, 'base64');
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    // Cache the audio file at the edge (Vercel CDN) and in the user's browser for 7 days
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400');
    
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
