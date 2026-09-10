const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ユーザーごとの会話履歴
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

      // ユーザーを識別
      const userId =
        event.source.userId ||
        event.source.groupId ||
        event.source.roomId;

      // 会話履歴がなければ作る
      if (!conversations.has(userId)) {
        conversations.set(userId, []);
      }

      const history = conversations.get(userId);

      // まず即レス
      const firstResponse = await fetch(
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
                text: "ちょっと待ってな。今整理するわ。"
              }
            ]
          })
        }
      );

      console.log(
        "LINE first response:",
        firstResponse.status
      );

      // 今回の相談を履歴に追加
      history.push({
        role: "user",
        content: userMessage
      });

      // 会話履歴が長くなりすぎないように直近20件だけ保持
      const recentHistory = history.slice(-20);

      const aiResponse = await openai.responses.create({
        model: "gpt-5",

        instructions: `
あなたは社内の営業部長AI。

営業担当者とLINEで会話しながら、
案件を一緒に考える頼れる営業部長として振る舞う。

【話し方】
- 自然な関西弁
- 気さく
- 上から目線にしない
- 堅苦しい敬語は禁止
- 「〜やな」「〜やで」「〜した方がええ」「〜ちゃう？」を自然に使う
- 営業担当者の味方
- 必要なときは率直に指摘する
- ふざけすぎない

【回答】
- とにかく短く
- 基本3〜6行程度
- 長くても10行以内
- 一度に全部説明しない
- 会話しながら必要な情報を聞く
- 毎回「結論：」「理由：」などの見出しを付けない
- 箇条書きは必要な場合だけ
- トーク例を出す場合は基本1つ
- 「信頼関係を築きましょう」などの抽象論だけで終わらない
- 必ず営業担当者が次に何をすればいいか分かるようにする

【会話】
前の発言を踏まえて回答する。

例えば、

営業：
「価格高いって言われた」

部長：
「それ、まず『高い』の意味を確認しよ。
競合より高いんか、予算的に厳しいんかで全然ちゃうで。
ちなみに競合の名前とか価格って出てた？」

営業：
「A社より高い」

部長：
「なるほど、競合比較やな。
A社が月5000円ってことなら、価格だけで勝負したらしんどい。
うちとの違いを聞かせて、価格以外の比較に持っていこ。
A社との機能差って分かってる？」

このように、短いやり取りを積み重ねて相談を深掘りする。

【重要】
会社の商品情報や料金、社内ルールなど、
知らない情報を勝手に作らない。

分からない場合は素直に聞く。

営業担当者が欲しいのは長い説明ではなく、
「この案件、次どう動いたらええ？」への答え。
`,

        input: recentHistory
      });

      const aiText =
        aiResponse.output_text ||
        "すまん、ちょっと回答うまく作れんかった。";

      console.log("AI response:", aiText);

      // AIの回答を履歴に追加
      history.push({
        role: "assistant",
        content: aiText
      });

      // LINEへPush
      if (userId) {
        const pushResponse = await fetch(
          "https://api.line.me/v2/bot/message/push",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              to: userId,
              messages: [
                {
                  type: "text",
                  text: aiText
                }
              ]
            })
          }
        );

        const pushResult = await pushResponse.text();

        console.log(
          "LINE push status:",
          pushResponse.status
        );

        console.log(
          "LINE push response:",
          pushResult
        );
      }
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
