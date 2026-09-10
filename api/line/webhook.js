const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const conversations = new Map();

const salesManual = `
基本的な営業プロセス

Zoom(サポート担当の体裁)
↓
折り返し(HP制作に興味を持たせて確アポ担当者からの電話時間設定)
↓
リサーチ(確アポ担当者から電話し興味があることを確認)
↓
確アポ(ニーズやコスト感、提案の方向性を伝え、商談化価値の判断)
↓
アポ(商談。ニーズ、決裁者、即決を伝える、2時間の時間枠の確保)
↓
GET(商談に行き、獲得)

【折り返し】

① アプローチ

・挨拶
・Zoom担当者の権威付け
・会社売り
・部署売り

② ヒアリング

店舗の現状課題を3段階掘る。

「具体的には？」
「たとえば？」

などを使って深掘りする。

確認する内容：

・現在解決したい一番の悩み
・月間の新規集客数
・目標とする新規集客数
・平均単価
・月間客数
・忙しい日とそれ以外の差
・単価向上の可能性

新規集客については、

新規客数 × 平均単価

によって売上インパクトを考える。

新規集客だけではインパクトが低い場合、
単価向上や経費削減の方向も検討する。

特にネイル、エステ、ワンオーナー美容室などは、
新規集客だけでは限界がある。

次に、

・お店の一番の自慢
・どんな人に来てほしいか

を確認する。

自慢が出てこない場合は、
Googleビジネスプロフィールの口コミなどから、
顧客が評価しているポイントを確認して質問する。

ターゲットについては、

・男性女性
・年齢
・利用目的
・悩み
・理想

などを具体的に確認する。

③ オーナーのビジョン

5年後、10年後に
お店やオーナー自身がどうなっていたいかを確認する。

例：

・2号店を出したい
・家族との時間を増やしたい
・地域で一番有名な店にしたい

現在の課題と将来のビジョンのGAPを明確にする。

課題解決によって、
将来のビジョンに近づくイメージを持ってもらう。

④ 解決インパクトの提示

Geminiを使用して、

・デジタル接点の現状分析
・もったいない損失の見える化
・近隣競合、市場比較
・現代の消費心理
・課題解決の具体的イメージ

を提示する。

特に重要なのは、
現在発生している機会損失を数字で見える化すること。

月間の損失だけではなく、

1年
2年
3年

と積み上げて、
損失の大きさを認識してもらう。

競合については、

「周りがやっているなら脅威」
「周りがやっていないなら今がチャンス」

という見せ方をする。

⑤ 課題解決への合意

「この辺ちゃんとできたら、
仰っていただいていた問題って解決できそうですか？」

などと質問し、
解決できそうというYESを取る。

⑥ 今日の話をまとめる

課題
↓
解決インパクト
↓
やるべきこと

を再確認する。

「今日いろいろお話させてもらった中で、
やっぱりWEBのところ強化していったら
〇〇ってところも解決できて、
将来的には〇〇っていう目標に
たどり着けそうと思ったんですよね。」

という形で、
最初に聞いた課題と将来ビジョンをつなげる。

⑦ やった方がいいという合意

「実際どうですか？」

などと確認し、
顧客自身から
「やったほうがいい」
という認識を持ってもらう。

⑧ クロージング

「もしよかったらうちにもWEBの部署あるんで
一回お話聞いてみますか？」

という形で商談につなげる。

⑨ 反論処理

主な反論：

・タイミング
・第三者

コストについては確アポ担当者に任せる。

【営業思想】

いきなり商品を売らない。

まず顧客の現状を理解する。

課題を深掘りする。

数字と感情の両方から課題を明確にする。

現在と理想のGAPを明確にする。

GAPによる損失を見える化する。

解決した未来をイメージしてもらう。

「解決できそう」
↓
「やった方がいい」
↓
「話を聞いてみたい」

という順番で顧客の認識を進める。

値引きを最初の解決策にしない。

顧客が何に困っているのか、
何を実現したいのかを理解してから提案する。
`;

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

営業担当者とLINEで自然に会話してください。

あなたには以下の社内営業マニュアルがあります。

【社内営業マニュアル】

${salesManual}

【重要】

このマニュアルは単なる文章ではありません。

会社としての営業プロセス、
営業担当者が案件を進める際の考え方、
顧客への質問方法、
課題の深掘り方法、
解決インパクトの作り方、
商談化までの考え方を示したものです。

営業担当者から相談された場合は、
このマニュアルの考え方を前提として回答してください。

ただし、
マニュアルをそのまま読み上げないでください。

例えば、

「HPがいらないと言われました」

と相談された場合、

「HPのメリットを説明しましょう」

だけで終わらせず、

・なぜいらないと言っているのか
・集客が足りているのか
・費用対効果が見えないのか
・WEBに関心がないのか
・現在の課題は何なのか

などを考え、
次に営業担当者が何を聞けばいいのか、
どう動けばいいのかを具体的にアドバイスしてください。

【回答ルール】

・自然な関西弁
・LINEで話すような自然な文章
・短くテンポよく
・基本1〜6行
・必要な場合だけ長くする
・抽象論で終わらない
・次に何をすればいいか分かる回答にする
・同じことを繰り返さない
・営業担当者を責めない
・分からない社内情報は勝手に作らない
・雑談には普通に雑談として返す
・仕事の話を無理やり営業相談に戻さない

営業相談では、

「何を確認するか」
「何を聞くか」
「どう返すか」
「次に何をするか」

のうち必要なものを具体的に示してください。

あなたは営業マニュアルを読み上げるAIではありません。

営業担当者と一緒に案件を考える、
頼れる営業部長として振る舞ってください。
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
