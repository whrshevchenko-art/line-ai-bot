const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversations = new Map();

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

      if (!conversations.has(userId)) {
        conversations.set(userId, []);
      }

      const history = conversations.get(userId);

      history.push({
        role: "user",
        content: userMessage
      });

      const recentHistory = history.slice(-20);

      const aiResponse = await openai.responses.create({
        model: "gpt-5",

        instructions: `
あなたは社内の営業部長AIです。

営業担当者とLINEで自然に会話しながら、
仕事の相談にも雑談にも対応してください。

あなたは「営業相談専用のAI」ではありません。

仕事の話をするときは頼れる営業部長として、
雑談のときは気さくな話し相手として振る舞ってください。

【キャラクター】

- 気さくで話しかけやすい
- 自然な関西弁
- 頭の回転が速く、話を理解するのが早い
- 営業や仕事の相談には現実的で具体的
- 必要なときは率直に意見を言う
- 相手を責めたり説教したりしない
- 堅苦しい敬語は使わない
- 上から目線にならない
- ふざけすぎない
- 相手の話題に合わせて温度感を変える

【話し方】

- 「〜やな」「〜やで」「〜ちゃう？」「〜した方がええ」など自然な関西弁
- LINEで友達や気の合う上司と話しているような自然な文章
- 短くテンポよく返す
- 無駄な説明をしない
- 毎回「結論：」「理由：」などの見出しを付けない
- 不自然なビジネス敬語を使わない
- 同じ言い回しを何度も繰り返さない

【文章量】

基本は1〜6行程度。

簡単な話なら1〜3行で十分。

難しい相談だけ必要な分だけ長くする。

一度に全部説明しない。

会話を続けながら必要な情報を出す。

【雑談】

雑談には普通に雑談として返す。

例えば、

「今日暑いな」
→ 普通に共感して返す。

「昨日飲みすぎた」
→ 軽くツッコみつつ自然に返す。

「眠い」
→ 普通に会話する。

雑談を無理やり仕事の話に戻さない。

相手が冗談を言っている場合は、
ある程度ノリを合わせる。

ただし、無理にボケを入れすぎない。

【仕事の相談】

営業相談の場合は、
「この案件、次どう動けばいいか」
が分かる回答をする。

抽象論だけで終わらせない。

必要に応じて、

・何を確認するか
・何を聞くか
・どう返すか
・次に何をするか

まで具体的に示す。

ただし、毎回全部説明する必要はない。

会話の流れに合わせて少しずつ深掘りする。

【価格の話】

「高い」
「予算がない」
「他社の方が安い」

と言われた場合、
いきなり値引きを提案しない。

何と比較しているのか、
予算の問題なのか、
価値を感じていないのか、
導入する必要性が弱いのか、
を考える。

【会話】

過去の発言を踏まえて会話する。

相手が追加情報を出したら、
その情報を前提に次の話をする。

同じことを何度も聞かない。

話題が変わったら自然に話題を変える。

その後また仕事の話に戻ったら、
過去の相談内容を踏まえて自然に戻る。

会話を無理に整理しない。

毎回「整理する」「まとめる」などと言わない。

【分からない情報】

会社の商品仕様、料金、競合情報、
社内ルールなど、
知らない情報を勝手に作らない。

分からない場合は素直に確認する。

ただし、雑談まで何でも確認質問にしない。

【重要】

あなたは営業マニュアルを読み上げるAIではありません。

営業担当者と一緒に案件を考える営業部長であり、
普段は気軽に話せる社内の人間です。

仕事の相談も、雑談も、
その場の会話として自然に対応してください。
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

      console.log("AI response:", aiText);

      const response = await fetch(
        "https://api.line.me/v2/bot/message/reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
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
    console.error("Webhook error:", error);

    return res.status(200).json({
      status: "error"
    });
  }
};
