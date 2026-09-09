export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("LINE AI Bot is running");
  }

  console.log("LINEからメッセージを受信しました");

  return res.status(200).json({
    message: "受信したで！"
  });
}
