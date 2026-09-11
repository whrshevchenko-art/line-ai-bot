const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const conversations = new Map();

// ==================================================
// ナレッジ取得
// ==================================================

async function getKnowledge() {
  const { data, error } = await supabase
    .from("knowledge")
    .select("id, title, category, content, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("knowledge取得エラー:", error);
    throw error;
  }

  return data || [];
}

// ==================================================
// 日本語向け簡易関連度計算
// ==================================================

function createKeywords(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[。、！？,.!?「」『』（）()【】［］\[\]・]/g, " ");

  const keywords = new Set();

  // 空白区切りの単語
  normalized
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .forEach((word) => {
      keywords.add(word);
    });

  // 日本語は空白がないことが多いので2〜4文字の部分文字列も作る
  for (let length = 2; length <= 4; length++) {
    for (let i = 0; i <= normalized.length - length; i++) {
      const part = normalized.slice(i, i + length).trim();

      if (
        part.length >= 2 &&
        !/^[\s\W_]+$/.test(part)
      ) {
        keywords.add(part);
      }
    }
  }

  return Array.from(keywords);
}

function calculateRelevance(userMessage, item) {
  const keywords = createKeywords(userMessage);

  if (keywords.length === 0) {
    return 0;
  }

  const title = String(item.title || "").toLowerCase();
  const category = String(item.category || "").toLowerCase();
  const content = String(item.content || "").toLowerCase();

  let score = 0;

  for (const keyword of keywords) {
    if (title.includes(keyword)) {
      score += 10;
    }

    if (category.includes(keyword)) {
      score += 5;
    }

    if (content.includes(keyword)) {
      score += 1;
    }
  }

  return score;
}

// ==================================================
// 質問に関連するナレッジを取得
// ==================================================

async function searchKnowledge(userMessage) {
  const knowledge = await getKnowledge();

  if (knowledge.length === 0) {
    return [];
  }

  const scored = knowledge.map((item) => ({
    ...item,
    relevance: calculateRelevance(userMessage, item)
  }));

  scored.sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }

    return new Date(b.created_at || 0) -
      new Date(a.created_at || 0);
  });

  // 関連度があるものを優先
  const relevant = scored.filter(
    (item) => item.relevance > 0
  );

  // 関連するものがなければ最新ナレッジを少し渡す
  const selected =
    relevant.length > 0
      ? relevant.slice(0, 8)
      : scored.slice(0, 5);

  // AIへ渡しすぎないように制限
  const result = [];

  let totalLength = 0;

  for (const item of selected) {
    const maxItemLength = 12000;

    const content = String(item.content || "")
      .slice(0, maxItemLength);

    const block = `
【ナレッジID】
${item.id}

【タイトル】
${item.title}

【カテゴリ】
${item.category}

【本文】
${content}
`;

    if (totalLength + block.length > 30000) {
      break;
    }

    result.push(block);

    totalLength += block.length;
  }

  console.log(
    "ナレッジ検索:",
    knowledge.length,
    "件中",
    result.length,
    "件をAIへ送信"
  );

  return result;
}

// ==================================================
// Webhook
// ==================================================

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).send("LINE AI Bot is running");
  }

  try {

    const events = req.body.events || [];

    for (const event of events) {

      if (
        event.type !== "message" ||
        event.message.type !== "text"
      ) {
        continue;
      }

      const userMessage = event.message.text;

      const userId =
        event.source.userId ||
        event.source.groupId ||
        event.source.roomId;

      // ==================================================
      // 会話履歴
      // ==================================================

      if (!conversations.has(userId)) {
        conversations.set(userId, []);
      }

      const history = conversations.get(userId);

      history.push({
        role: "user",
        content: userMessage
      });

      const recentHistory = history.slice(-20);

      // ==================================================
      // Supabaseから関連ナレッジ取得
      // ==================================================

      let knowledgeContext = "";

      try {

        const knowledge = await searchKnowledge(
          userMessage
        );

        if (knowledge.length > 0) {

          knowledgeContext = `
━━━━━━━━━━━━━━━━━━
【今回の質問に関連する社内ナレッジ】
━━━━━━━━━━━━━━━━━━

${knowledge.join("\n")}

━━━━━━━━━━━━━━━━━━
【ナレッジここまで】
━━━━━━━━━━━━━━━━━━
`;

        } else {

          knowledgeContext = `
今回の質問に関連する社内ナレッジは
データベースから見つかりませんでした。
`;

        }

      } catch (error) {

        console.error(
          "ナレッジ検索エラー:",
          error
        );

        knowledgeContext = `
社内ナレッジの取得に失敗しました。

ナレッジに関する内容については、
推測で回答せず、
「社内ナレッジを確認できていない」
ことを明示してください。
`;

      }

      // ==================================================
      // AI回答
      // ==================================================

      const aiResponse = await openai.responses.create({

        model: "gpt-5",

        instructions: `
あなたは社内の営業部長AIです。

営業担当者とLINEで自然に会話してください。

今回の回答では、
Supabaseに登録されている社内ナレッジを
最優先の情報源として利用してください。

${knowledgeContext}

━━━━━━━━━━━━━━━━━━
【回答ルール】
━━━━━━━━━━━━━━━━━━

・社内ナレッジに書かれている内容を優先する
・社内ナレッジにない情報を勝手に社内ルールとして作らない
・一般的な営業知識と社内ナレッジを混同しない
・社内ナレッジと一般論が矛盾する場合は、社内ナレッジを優先する
・分からないことは分からないと伝える
・ナレッジの文章をそのまま長々と読み上げない
・営業担当者が「次に何をすればいいか」が分かるように答える
・質問に対して必要な部分だけ使う
・同じ説明を繰り返さない

━━━━━━━━━━━━━━━━━━
【営業プロセスについて】
━━━━━━━━━━━━━━━━━━

営業相談を受けた場合は、
登録されている社内ナレッジの営業プロセスを
前提として判断してください。

特に、

「興味があります」

と

「商談化する価値がある」

は同じではありません。

また、

「リサーチ」

と

「興味確認」

も同じではありません。

営業担当者が現在どの工程にいるのかを考え、
次に何をすべきなのかを具体的に回答してください。

━━━━━━━━━━━━━━━━━━
【キャラクター】
━━━━━━━━━━━━━━━━━━

・気さく
・自然な関西弁
・話を理解するのが早い
・営業相談には現実的で具体的
・率直だが嫌味にならない
・堅苦しくしない
・上から目線にならない

━━━━━━━━━━━━━━━━━━
【話し方】
━━━━━━━━━━━━━━━━━━

・LINEで話しているように自然に
・「〜やな」「〜やで」「〜ちゃう？」などを使う
・短くテンポよく
・基本1〜6行
・簡単な話なら1〜3行
・必要な場合だけ長くする
・毎回「結論」「理由」などの見出しを付けない
・営業マニュアルをそのまま読み上げない

━━━━━━━━━━━━━━━━━━
【営業相談】
━━━━━━━━━━━━━━━━━━

抽象論だけで終わらせない。

例えば、

「折り返しから興味ありで上がってきたけど、
どうしたらいい？」

なら、

・今どの工程なのか
・何を確認すべきか
・リサーチが必要なのか
・そのままアポに進めるのか
・ノーリサーチでいいのか

を判断してください。

「HPいらないと言われた」

なら、
いきなりHPのメリットを説明するのではなく、

・なぜいらないのか
・現在の課題は何なのか
・商談価値があるのか
・次に何を聞くべきか

を考えてください。

━━━━━━━━━━━━━━━━━━
【雑談】
━━━━━━━━━━━━━━━━━━

営業相談ではない普通の雑談には、
普通の雑談として自然に返してください。

━━━━━━━━━━━━━━━━━━
【最重要】
━━━━━━━━━━━━━━━━━━

社内ナレッジに情報がある場合は、
必ずその内容を踏まえて回答してください。

ただし、
ナレッジに書かれていることを
毎回すべて説明する必要はありません。

質問に必要な情報だけを使ってください。
`,

        input: recentHistory
      });

      const aiText =
        aiResponse.output_text ||
        "すまん、うまく返せんかった。";

      history.push({
        role: "assistant",
        content: aiText
      });

      console.log(
        "AI response:",
        aiText
      );

      // ==================================================
      // LINEへ返信
      // ==================================================

      const response = await fetch(
        "https://api.line.me/v2/bot/message/reply",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
          },

          body: JSON.stringify({
            replyToken: event.replyToken,

            messages: [
              {
                type: "text",
                text: aiText
              }
            ]
          })
        }
      );

      const result = await response.text();

      console.log(
        "LINE API status:",
        response.status
      );

      console.log(
        "LINE API response:",
        result
      );
    }

    return res.status(200).json({
      status: "ok"
    });

  } catch (error) {

    console.error(
      "Webhook error:",
      error
    );

    return res.status(200).json({
      status: "error"
    });
  }
};
