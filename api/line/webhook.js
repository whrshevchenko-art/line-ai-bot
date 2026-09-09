export default async function handler(req, res) {
  // LINEからのPOSTだけ受け付ける
  if (req.method === "POST") {
    console.log("LINE Webhook received:");
    console.log(JSON.stringify(req.body, null, 2));

    // LINEには必ず200を返す
    return res.status(200).json({
      status: "ok"
    });
  }

  // 動作確認用
  return res.status(200).send("LINE AI Bot is running");
}
