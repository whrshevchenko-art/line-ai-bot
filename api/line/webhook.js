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
                  text: `受信したで！\n「${userMessage}」`
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
