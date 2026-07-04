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

  // 요금폭탄 방지: 앱의 공식 116개 표현(중복 제외 109개)만 허용하는 화이트리스트
  const whitelist = new Set([
    "Wi-Fiのパスワードは何ですか？",
    "あそこまで歩いてどのくらいかかりますか？",
    "ありがとうございます",
    "いいえ",
    "いいですよ",
    "いちまんえん",
    "おいしい！",
    "おはようございます",
    "おやすみなさい",
    "お会計をお願いします",
    "お水をください",
    "お湯をください",
    "お釣りをください",
    "かばんをなくしました",
    "ここで降ろしてください",
    "ここに電話してもらえますか？",
    "ここはどこですか？",
    "このバスはに行きますか？",
    "この近くにコンビニはありますか？",
    "この電車はに止まりますか？",
    "これはいくらですか？",
    "これをください",
    "これをもう一つください",
    "こんにちは",
    "ごじゅうえん",
    "ごせんえん",
    "ごひゃくえん",
    "ごめんなさい",
    "さようなら",
    "じゅうえん",
    "すみません",
    "すみません！",
    "せんえん",
    "ちょっと待ってください",
    "どういたしまして",
    "どのくらいかかりますか？",
    "はい",
    "はじめまして",
    "はどこですか？",
    "ひゃくえん",
    "までいくらですか？",
    "まで行ってください",
    "もう一度言ってください",
    "もう少し安くしてください",
    "ゆっくり話してください",
    "よろしくおねがいします",
    "わかりません",
    "をください",
    "アレルギーがあります",
    "カードで払います",
    "カード払이는できますか？",
    "タオルをもっとください",
    "タクシーを呼んでください",
    "チェックアウトをお願いします",
    "チェックインをお願いします",
    "トイレはどこですか？",
    "プレゼント用に包んでください",
    "メニューをください",
    "レシートをください",
    "一",
    "一万",
    "一緒に写真を撮ってもいいですか？",
    "七",
    "三",
    "九",
    "予約しています",
    "予約를하고있습니다",
    "二",
    "五",
    "다른색상은있습니까?",
    "何時に閉まりますか？",
    "免税になりますか？",
    "입장료는얼마입니까?",
    "八",
    "六",
    "사진을찍어도되겠습니까?",
    "助けてください！",
    "十",
    "千",
    "四",
    "지하철노선도는있습니까?",
    "지도있습니까?",
    "큰사이즈있습니까?",
    "安いです",
    "포장해주세요",
    "救急車を呼んでください",
    "신칸센티켓을사고싶습니다",
    "아침식사는몇시부터입니까?",
    "기분이안좋습니다",
    "温かいお茶을ください",
    "현금으로지불하겠습니다",
    "병원이어디에있습니까?",
    "百",
    "공항까지가주세요",
    "영어할수있습니까?",
    "짐을맡겨주세요",
    "봉투에넣어주세요",
    "관광안내소는어디입니까?",
    "입어봐도되겠습니까?",
    "경찰을불러주세요",
    "辛くないです",
    "길을잃었습니다",
    "部屋の鍵をなくしました",
    "한국대사관에전화해주세요",
    "한국어가능한분계십니까?",
    "역은어디입니까?",
    "高いです",
    "고데스까"
  ]);

  if (!whitelist.has(text)) {
    res.status(403).json({ error: 'Access denied: Phrase is not in the whitelist.' });
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
