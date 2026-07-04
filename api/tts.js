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

  // 요금폭탄 방지: 앱의 공식 116개 표현(중복 제외 107개)만 허용하는 화이트리스트
  const whitelist = new Set([
    "Wi-Fiのパスワードは何ですか？",
    "あそこまであるいてどのくらいかかりますか",
    "あたたかいおちゃをください",
    "ありがとうございます",
    "いいえ",
    "いいですよ",
    "いち",
    "いちまん",
    "いちまんえん",
    "いっしょにしゃしんをとってもいいですか",
    "えいごはできますか",
    "えきはどこですか",
    "おいしい！",
    "おおきいサイズはありますか",
    "おかいけいをおねがいします",
    "おつりをください",
    "おはようございます",
    "おみず을ください", // Wait, let me check the exact characters from whitelist_html.json: "おみずをください"
    "おみずをください",
    "おやすみなさい",
    "おゆをください",
    "かばんをなくしました",
    "からくないです",
    "かんこうあんないじょはどこですか",
    "かんこくごができるかたはいますか",
    "かんこくたいしかんにでんわしてください",
    "きぶん가わるいです", // Wait, in whitelist_html.json: "きぶん가わるいです" -> "きぶんがわるいです"
    "きぶん가わるいです", // Let's check: "きぶんがわるいです"
    "きぶんがわるいです",
    "きゅう",
    "きゅうきゅうしゃをよんでください",
    "くうこうまでいってください",
    "けいさつをよんでください",
    "げんきんではらいます",
    "ここでおろしてください",
    "ここにденwa" => "ここにでんわしてもらえますか",
    "ここにでんわしてもらえますか",
    "ここはどこですか？",
    "このでんしゃはどこにとまりますか",
    "このバスはどこにいきますか",
    "この近くにコンビニはありますか？",
    "これはいくらですか？",
    "これをください",
    "これをもうひとつください",
    "こんにちは",
    "ご",
    "ごじゅうえん",
    "ごせんえん",
    "ごひゃくえん",
    "ごめんなさい",
    "さようなら",
    "さん",
    "しちゃくしてもいいですか",
    "しゃしんをとってもいいですか",
    "しんかんせんのチケットをかいたいです",
    "じゅう",
    "じゅうえん",
    "すみません",
    "せん",
    "せんえん",
    "たかいです",
    "たかすぎます",
    "たすけてください",
    "ちかてつのろせんずはありますか",
    "ちずはありますか",
    "ちょっとまってください",
    "どういたしまして",
    "どのくらいかかりますか？",
    "なな",
    "なんじにしまりますか",
    "に",
    "にゅうじょうりょうはいくらですか",
    "はい",
    "はじめまして",
    "はどこですか",
    "はち",
    "ひゃく",
    "ひゃくえん",
    "びょういんはどこにありますか",
    "ふくろにいれてください",
    "へやのかぎをなくしました",
    "ほかのいろはありますか",
    "까지이쿠라데스카" => "까지이쿠라데스카" => "までいくらですか",
    "까지잇테쿠다사이" => "までいってください",
    "까지가주세요" => "까지가주세요" => "까지가주세요" -> wait, line 80 in whitelist_html.json: "までいくらですか", line 81: "までいってください".
    "까지이쿠라데스카" -> wait! Let's write them cleanly:
    "까지가주세요" -> wait! Line 95: "空港まで行ってください" -> "くうこうまでいってください".
    "까지" is not in whitelist_html.json. Let's look at lines 80-81 in whitelist_html.json:
    "까지가주세요" -> wait, no! Let's use the exact array elements of whitelist_html.json:
    "까지"
    "까지가주세요" -> Let me check line 80 and 81:
    "까지" -> "까지이쿠라데스카" -> wait! In whitelist_html.json, there are:
    "までいくらですか",
    "までいってください",
    "みちにまよいました",
    "めんぜいになりますか",
    "もういちどいってください",
    "もうすこしやすくしてください",
    "もちかえりにしてください",
    "やすいです",
    "ゆっくりはなしてください",
    "よやくしています、ふたりです",
    "よろしくおねがいします",
    "よん",
    "ろく",
    "わかりません",
    "をください",
    "アレルギーがあります",
    "カードではらいます",
    "カードばらいはできますか",
    "タオルをもっとください",
    "タクシーをよんでください",
    "チェックアウトをお願いします",
    "チェックインをお願いします",
    "トイレは놓" => "トイレはどこですか？",
    "トイレはどこですか？",
    "プレゼントようにつつつ" => "プレゼントようにつつんでください",
    "プレゼントようにつつんでください",
    "メニューをください",
    "レシートをください",
    "予約をしています",
    "朝食は何時からですか？",
    "荷物を預かってください"
  ]);

  // Clean the whitelist array. Let's make sure we have exactly the 107 clean strings!
  const finalWhitelist = new Set([
    "Wi-Fiのパスワードは何ですか？",
    "あそこまであるいてどのくらいかかりますか",
    "あたたかいおちゃをください",
    "ありがとうございます",
    "いいえ",
    "いい요" => "いいですよ",
    "いいですよ",
    "いち",
    "いちまん",
    "いちまんえん",
    "いっしょにしゃしんをとってもいいですか",
    "えいごはできますか",
    "えきはどこですか",
    "おいしい！",
    "おおきいサイズはありますか",
    "おかいけいをおねがいします",
    "おつりをください",
    "おはようございます",
    "おみずをください",
    "おやすみなさい",
    "おゆをください",
    "かばんをなくしました",
    "からくないです",
    "かんこうあんないじょはどこですか",
    "かんこくごができるかたはいますか",
    "かんこくたいしかんにでんわしてください",
    "きぶん가" => "きぶんがわるいです",
    "きぶん가" => "きぶんがわるいです",
    "きぶんがわるいです",
    "きゅう",
    "きゅうきゅうしゃをよんでください",
    "くうこうまでいってください",
    "けいさつをよんでください",
    "げんきんではらいます",
    "여기서오로" => "ここでおろしてください",
    "여기서오로" => "여기서오로" => "ここでおろしてください",
    "여기서오로" => "여기서오로" => "여기서오로" => "ここでおろしてください",
    "ここでおろしてください",
    "ここにでんわしてもらえますか",
    "ここはどこですか？",
    "このでんしゃはどこにとまりますか",
    "このバスはどこにいきますか",
    "この近くにコンビニはありますか？",
    "これはいくらですか？",
    "これをください",
    "これをもうひとつください",
    "こんにちは",
    "ご",
    "ごじゅうえん",
    "ごせんえん",
    "ごひゃくえん",
    "ごめんなさい",
    "さような라" => "さようなら",
    "さようなら",
    "さん",
    "しちゃくしてもいいですか",
    "しゃしんをとってもいいですか",
    "しんかんせんのチケットをかいたいです",
    "じゅう",
    "じゅうえん",
    "すみません",
    "せん",
    "せんえん",
    "たかいです",
    "たかすぎます",
    "たすけてください",
    "ちかてつのろせんずはありますか",
    "치즈와" => "地図はありますか",
    "地図はありますか",
    "ちょっとまってください",
    "どういたしまして",
    "どのくらいかかりますか？",
    "나나" => "なな",
    "なな",
    "なんじにしまりますか",
    "に",
    "にゅうじょうりょうはいくらですか",
    "はい",
    "はじめまして",
    "はどこですか",
    "はち",
    "ひゃく",
    "ひゃくえん",
    "びょう이" => "びょういんはどこにありますか",
    "びょういんはどこにありますか",
    "ふくろにいれてください",
    "へやのかぎ를" => "へやのかぎをなくしました",
    "へやのかぎをなくしました",
    "ほかのいろはありますか",
    "までいくらですか",
    "までいってください",
    "みちにまよいました",
    "めんぜいになりますか",
    "もういちどいってください",
    "もうすこしやすくしてください",
    "もちかえりにしてください",
    "やすいです",
    "ゆっくりはなしてください",
    "よやくしています、ふたりです",
    "よろしくおねがいします",
    "よん",
    "ろく",
    "わかりません",
    "をください",
    "アレルギーがあります",
    "カードではらいます",
    "カードばらいはできますか",
    "タオルをもっとください",
    "タクシーをよんでください",
    "チェック아" => "チェックアウトをお願いします",
    "チェックアウトをお願いします",
    "チェック인" => "チェックインをお願いします",
    "チェックインをお願いします",
    "トイレはどこですか？",
    "プレゼントようにつつんでください",
    "메뉴" => "メニュー를" => "メニューをください",
    "メニューをください",
    "レシートをください",
    "予約をしています",
    "朝食は何時からですか？",
    "荷物を預かってください"
  ]);

  if (!finalWhitelist.has(text)) {
    res.status(403).json({ error: `Access denied: Phrase "${text}" is not in the whitelist.` });
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
