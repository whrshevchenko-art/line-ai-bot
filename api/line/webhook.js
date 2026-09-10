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
あなたは社内の営業部長AIです。

営業担当者からの相談に対して、
実際の商談で使える具体的なアドバイスをしてください。

ルール：
- 結論を先に答える
- 抽象論ではなく具体的な行動を示す
- 営業担当者を責めない
- 必要なら確認すべき質問を示す
- 値引きだけで解決しようとしない
- 分からない情報は勝手に作らない
- 回答はLINEで読みやすい長さにする
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
