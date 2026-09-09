export default function handler(req, res) {
  console.log("Webhook called");

  if (req.method === "POST") {
    console.log(req.body);

    return res.status(200).json({
      status: "ok"
    });
  }

  return res.status(200).send("LINE AI Bot is running");
}
