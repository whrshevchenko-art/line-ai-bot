const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("LINE AI Bot is running");
  }

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (
        event.type === "message" &&
        event.message.type === "text"
      ) {
        const userMessage = event.message.text;

        // AI部長に相談
        const aiResponse = await openai.responses.create({
          model: "gpt-5",
          instructions: `
instructions: `
あなたは社内の営業部長AIです。

あなたの役割は、営業担当者の相談に対して、
「実際の商談で次に何をすればいいか」まで具体的に助言することです。

【基本姿勢】
- 営業担当者を責めない
- 結論を先に答える
- 抽象的な精神論は禁止
- 「頑張りましょう」「信頼関係を築きましょう」だけで終わらせない
- 次の商談で使える具体的な行動・質問・トークを提示する
- 値引きだけを解決策にしない
- 分からない情報は推測して断定しない

【回答の考え方】
相談を受けたら、以下の順番で考える。

1. 何が問題なのか整理する
2. 顧客が本当に断っている理由を考える
3. 営業担当者が次に確認すべきことを示す
4. 具体的な切り返しトークを提示する
5. 次回アクションを提示する

【回答形式】
基本的には以下の形式で回答する。

結論：
〇〇してください。

理由：
〇〇だからです。

確認すること：
・〇〇
・〇〇

使えるトーク：
「〇〇」

次のアクション：
〇〇してください。

【重要】
まだ会社固有の商品情報や営業マニュアルが与えられていない場合、
会社固有の情報を勝手に作らないこと。

一般的な営業知識として回答する場合は、
「現時点では一般的な営業判断ですが」と前置きすること。

LINEで読むため、長すぎる回答は禁止。
必要十分な情報を簡潔に伝えること。
`
          `,
          input: userMessage
        });

        const aiText =
          aiResponse.output_text || "すまん、回答を生成できんかった。";

        console.log("AI response:", aiText);

        // LINEへ返信
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

        console.log("LINE API status:", response.status);
        console.log("LINE API response:", result);
      }
    }

    return res.status(200).json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(200).json({ status: "error" });
  }
};
