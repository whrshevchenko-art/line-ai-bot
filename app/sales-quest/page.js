"use client";

import { useEffect, useRef, useState } from "react";

const labels = {
  problem_discovery: "課題発掘",
  numbers: "数字確認",
  problem_awareness: "課題認識",
  interest: "興味喚起",
  conversation_control: "会話コントロール",
};

const stateLabels = {
  trust: {
    label: "信頼度",
    icon: "💚",
    description: "営業担当者への信頼",
  },
  problem_awareness: {
    label: "課題認識",
    icon: "🎯",
    description: "自店の課題に気づいている度合い",
  },
  gap_awareness: {
    label: "GAP認識",
    icon: "📐",
    description: "現状と理想の差への認識",
  },
  urgency: {
    label: "緊急度",
    icon: "🔥",
    description: "今すぐ改善したい度合い",
  },
  interest: {
    label: "興味",
    icon: "💡",
    description: "改善やHPへの興味",
  },
  resistance: {
    label: "警戒心",
    icon: "🛡️",
    description: "営業への警戒心。低いほど良い",
  },
};

function getUserId() {
  const key = "sales-quest-user-id";
  let id = window.localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }

  return id;
}

function normalizeState(state = {}) {
  return {
    trust: Number(state.trust ?? 25),
    problem_awareness: Number(state.problem_awareness ?? 15),
    gap_awareness: Number(state.gap_awareness ?? 5),
    urgency: Number(state.urgency ?? 10),
    interest: Number(state.interest ?? 10),
    resistance: Number(state.resistance ?? 35),
  };
}

function StateBar({ type, value }) {
  const config = stateLabels[type];
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div
      className={`stateItem ${
        type === "resistance" ? "danger" : ""
      }`}
    >
      <div className="stateTop">
        <span className="stateName">
          <span className="stateIcon">
            {config.icon}
          </span>
          {config.label}
        </span>

        <strong>{safeValue}</strong>
      </div>

      <div className="stateBar">
        <i style={{ width: `${safeValue}%` }} />
      </div>

      <small>{config.description}</small>
    </div>
  );
}

function CustomerInfo({ customer }) {
  if (!customer) {
    return null;
  }

  const infoItems = [
    {
      label: "業種",
      value: customer.industry || "-",
    },
    {
      label: "店舗規模",
      value: customer.business_size || "-",
    },
    {
      label: "経営者",
      value: customer.owner_type || "-",
    },
    {
      label: "新規客 / 月",
      value:
        customer.current_new_customers != null
          ? `${customer.current_new_customers}名`
          : "-",
    },
    {
      label: "理想の新規 / 月",
      value:
        customer.ideal_new_customers != null
          ? `${customer.ideal_new_customers}名`
          : "-",
    },
    {
      label: "平均単価",
      value:
        customer.average_spend != null
          ? `${Number(
              customer.average_spend
            ).toLocaleString()}円`
          : "-",
    },
    {
      label: "GBP",
      value:
        customer.gbp_status ||
        customer.gbp_usage ||
        "運用中",
    },
    {
      label: "口コミ",
      value:
        customer.review_count != null
          ? `${customer.review_count}件`
          : "-",
    },
    {
      label: "HP",
      value:
        customer.website_status ||
        customer.hp_status ||
        "あり",
    },
  ];

  return (
    <div className="customerInfo">
      <div className="customerInfoHeader">
        <div>
          <p className="eyebrow">
            CUSTOMER PROFILE
          </p>

          <h3>顧客情報</h3>
        </div>

        <span className="researchBadge">
          ℹ INFO
        </span>
      </div>

      <div className="infoGrid">
        {infoItems.map((item) => (
          <div
            className="infoItem"
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {(customer.strengths ||
        customer.gbp_strengths ||
        customer.website_issue ||
        customer.hp_issue) && (
        <div className="customerNotes">
          <p>🔎 参考情報</p>

          {customer.strengths &&
            typeof customer.strengths ===
              "string" && (
              <div>
                <span>強み</span>
                <b>{customer.strengths}</b>
              </div>
            )}

          {customer.gbp_strengths &&
            typeof customer.gbp_strengths ===
              "string" && (
              <div>
                <span>GBP</span>
                <b>{customer.gbp_strengths}</b>
              </div>
            )}

          {(customer.website_issue ||
            customer.hp_issue) && (
            <div>
              <span>Web</span>
              <b>
                {customer.website_issue ||
                  customer.hp_issue}
              </b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTip(level) {
  if (level <= 1) {
    return {
      title: "まずは現状を聞こう",
      text:
        "いきなりHPを提案するより、まず顧客の現状・数字・困っていることを聞いてみましょう。",
    };
  }

  if (level === 2) {
    return {
      title: "現状と理想を比べよう",
      text:
        "「今どうなっているか」と「本当はどうなりたいか」を聞くと、GAPが見えてきます。",
    };
  }

  if (level === 3) {
    return {
      title: "数字を使って深掘り",
      text:
        "新規客数や単価などを聞いて、顧客自身にGAPの大きさを認識してもらいましょう。",
    };
  }

  if (level === 4) {
    return {
      title: "GAPを未来につなげる",
      text:
        "GAPが埋まったら何が変わるのか。店舗の未来や理想まで掘り下げてみましょう。",
    };
  }

  return {
    title: "顧客に気づかせろ",
    text:
      "答えを先に言うのではなく、顧客自身が「ここを改善したい」と気づく質問を選びましょう。",
  };
}

export default function SalesQuestPage() {
  const [userId, setUserId] = useState("");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [customerState, setCustomerState] =
    useState(normalizeState());

  const [psychologyHint, setPsychologyHint] =
    useState("");

  const [stats, setStats] = useState({
    level: 1,
    exp: 0,
    average_score: 0,
    best_score: 0,
  });

  const endRef = useRef(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function request(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || "通信に失敗しました。"
      );
    }

    return data;
  }

  async function start() {
    setLoading(true);
    setError("");
    setResult(null);
    setPsychologyHint("");

    try {
      const data = await request(
        "/api/sales-quest/start",
        {
          userId,
        }
      );

      setSession(data.session);
      setStats(data.stats);

      setCustomerState(
        normalizeState(
          data.session?.customer_state
        )
      );

      setMessages([
        {
          role: "assistant",
          content: data.opening,
        },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function send(event) {
    event.preventDefault();

    const content = input.trim();

    if (
      !content ||
      !session ||
      loading ||
      session.status !== "in_progress"
    ) {
      return;
    }

    setInput("");
    setError("");

    setMessages((old) => [
      ...old,
      {
        role: "user",
        content,
      },
    ]);

    setLoading(true);

    try {
      const data = await request(
        "/api/sales-quest/chat",
        {
          sessionId: session.id,
          message: content,
        }
      );

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);

      setSession((old) => ({
        ...old,
        status: data.status,
      }));

      if (data.customer_state) {
        setCustomerState(
          normalizeState(data.customer_state)
        );
      }

      setPsychologyHint(
        data.psychology_hint || ""
      );
    } catch (e) {
      setMessages((old) =>
        old.slice(0, -1)
      );
      setInput(content);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    if (!session || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await request(
        "/api/sales-quest/finish",
        {
          sessionId: session.id,
        }
      );

      setResult(data);
      setStats(data.stats || stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSession(null);
    setMessages([]);
    setResult(null);
    setInput("");
    setError("");
    setPsychologyHint("");
    setCustomerState(normalizeState());
  }

  const expInLevel =
    Number(stats.exp || 0) % 100;

  const currentTip = getTip(
    Number(stats.level || 1)
  );

  return (
    <main className="page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #090d18;
          color: #edf1ff;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            "Hiragino Kaku Gothic ProN",
            Meiryo,
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          border: 0;
        }
      `}</style>

      <section className="shell">
        <header>
          <a href="/" className="back">
            ← AI部長に戻る
          </a>

          <div className="brand">
            <span>⚔</span>

            <div>
              <small>
                SALES INTELLIGENCE TRAINING
              </small>

              <h1>営業クエスト</h1>
            </div>
          </div>

          <div className="levelBox">
            <div className="levelTitle">
              <span>営業 Lv.{stats.level}</span>

              <small>
                {stats.level <= 1
                  ? "新人営業"
                  : stats.level === 2
                  ? "見習い営業"
                  : stats.level === 3
                  ? "一人前営業"
                  : stats.level === 4
                  ? "エース営業"
                  : "営業魔王"}
              </small>
            </div>

            <div className="bar">
              <i
                style={{
                  width: `${expInLevel}%`,
                }}
              />
            </div>

            <small className="expText">
              {expInLevel} / 100 EXP
            </small>
          </div>
        </header>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!session && !result && (
          <section className="startCard">
            <p className="eyebrow">
              STAGE 1
            </p>

            <h2>
              興味なし → 興味あり
            </h2>

            <p className="lead">
              警戒している店舗オーナーから、
              「もう少し詳しく聞きたい」を
              引き出しましょう。
              <br />
              正解の選択肢はありません。
              自由に営業してください。
            </p>

            <div className="rules">
              <span>🎯 課題を聞き出す</span>
              <span>🔢 数字で状況を捉える</span>
              <span>📐 GAPを作る</span>
              <span>💬 興味を引き出す</span>
            </div>

            <div className="startTip">
              <span>💡 BEGINNER TIP</span>

              <strong>
                {currentTip.title}
              </strong>

              <p>{currentTip.text}</p>
            </div>

            <button
              className="primary"
              disabled={!userId || loading}
              onClick={start}
            >
              {loading
                ? "顧客を準備中..."
                : "QUEST START"}
            </button>

            <div className="miniStats">
              <div>
                <b>
                  {stats.average_score || "-"}
                </b>

                <small>
                  平均スコア
                </small>
              </div>

              <div>
                <b>
                  {stats.best_score || "-"}
                </b>

                <small>
                  最高スコア
                </small>
              </div>
            </div>
          </section>
        )}

        {session && !result && (
          <section className="quest">
            <div className="questHead">
              <div>
                <p className="eyebrow">
                  STAGE 1 / LIVE ROLEPLAY
                </p>

                <h2>
                  {session.customer.industry}
                  オーナー
                </h2>

                <p>
                  {session.customer.business_size}
                  ・
                  {session.customer.owner_type}
                </p>
              </div>

              <div
                className={`status ${session.status}`}
              >
                {session.status === "cleared"
                  ? "興味あり！"
                  : session.status === "failed"
                  ? "会話終了"
                  : "商談中"}
              </div>
            </div>

            <div className="battleLayout">
              <div className="chatArea">
                <div className="chat">
                  {messages.map(
                    (item, index) => (
                      <div
                        className={`message ${item.role}`}
                        key={index}
                      >
                        <span>
                          {item.role === "user"
                            ? "あなた"
                            : "顧客"}
                        </span>

                        <p>
                          {item.content}
                        </p>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="message assistant">
                      <span>
                        顧客
                      </span>

                      <p className="thinking">
                        考えています…
                      </p>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>

                {psychologyHint && (
                  <div className="psychology">
                    <span>
                      👁 CUSTOMER INSIGHT
                    </span>

                    <p>
                      {psychologyHint}
                    </p>
                  </div>
                )}

                <div className="liveTip">
                  <span>💡 TIPS</span>

                  <div>
                    <strong>
                      {currentTip.title}
                    </strong>

                    <p>
                      {currentTip.text}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={send}
                  className="composer"
                >
                  <input
                    value={input}
                    disabled={
                      loading ||
                      session.status !==
                        "in_progress"
                    }
                    onChange={(e) =>
                      setInput(
                        e.target.value
                      )
                    }
                    placeholder="自由に営業してみよう…"
                    maxLength={5000}
                  />

                  <button
                    className="send"
                    disabled={
                      loading ||
                      !input.trim() ||
                      session.status !==
                        "in_progress"
                    }
                  >
                    送信
                  </button>
                </form>

                <div className="finish">
                  <span>
                    会話を終えたら、
                    AI評価を受けましょう。
                  </span>

                  <button
                    onClick={finish}
                    disabled={loading}
                  >
                    会話を終了して採点
                  </button>
                </div>
              </div>

              <aside className="sidePanel">
                <CustomerInfo
                  customer={session.customer}
                />

                <div className="statePanel">
                  <div className="stateHeader">
                    <div>
                      <p className="eyebrow">
                        CUSTOMER STATUS
                      </p>

                      <h3>
                        顧客心理
                      </h3>
                    </div>

                    <span className="live">
                      ● LIVE
                    </span>
                  </div>

                  <div className="stateList">
                    <StateBar
                      type="trust"
                      value={
                        customerState.trust
                      }
                    />

                    <StateBar
                      type="problem_awareness"
                      value={
                        customerState.problem_awareness
                      }
                    />

                    <StateBar
                      type="gap_awareness"
                      value={
                        customerState.gap_awareness
                      }
                    />

                    <StateBar
                      type="urgency"
                      value={
                        customerState.urgency
                      }
                    />

                    <StateBar
                      type="interest"
                      value={
                        customerState.interest
                      }
                    />

                    <StateBar
                      type="resistance"
                      value={
                        customerState.resistance
                      }
                    />
                  </div>

                  <div className="stateLegend">
                    <span>
                      📈 上がるほど良い
                    </span>

                    <span>
                      🛡️ 警戒心は低いほど良い
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {result && (
          <section className="result">
            <p className="eyebrow">
              {result.status === "cleared"
                ? "QUEST CLEAR"
                : "QUEST RESULT"}
            </p>

            <h2>
              {result.evaluation.total}
              <small> / 100</small>
            </h2>

            <p className="scoreCaption">
              営業スコア　+
              {result.expGained} EXP
            </p>

            <div className="scoreGrid">
              {Object.entries(
                result.evaluation.scores
              ).map(
                ([key, value]) => (
                  <div key={key}>
                    <span>
                      {labels[key]}
                    </span>

                    <b>
                      {value}
                      <small>
                        /20
                      </small>
                    </b>

                    <i>
                      <em
                        style={{
                          width: `${value * 5}%`,
                        }}
                      />
                    </i>
                  </div>
                )
              )}
            </div>

            <div className="feedback">
              <article>
                <h3>GOOD</h3>

                {result.evaluation.goodPoints.map(
                  (item, index) => (
                    <p key={index}>
                      ・{item}
                    </p>
                  )
                )}
              </article>

              <article>
                <h3>NEXT</h3>

                {result.evaluation.improvements.map(
                  (item, index) => (
                    <p key={index}>
                      ・{item}
                    </p>
                  )
                )}
              </article>
            </div>

            <div className="summary">
              {result.evaluation.summary}
            </div>

            <button
              className="primary"
              onClick={reset}
            >
              もう一度挑戦する
            </button>
          </section>
        )}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 36px 18px;
          background:
            radial-gradient(
              circle at top,
              #24305b 0,
              #0b1020 43%,
              #090d18 100%
            );
        }

        .shell {
          max-width: 1180px;
          margin: auto;
        }

        header {
          display: flex;
          align-items: center;
          gap: 24px;
          min-height: 70px;
          margin-bottom: 38px;
        }

        .back {
          color: #a9b5dc;
          text-decoration: none;
          font-size: 13px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-right: auto;
        }

        .brand > span {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #9c6cff,
              #5a36d8
            );
          font-size: 20px;
        }

        .brand small,
        .eyebrow {
          font-size: 10px;
          letter-spacing: 1.5px;
          color: #ac95ff;
          font-weight: 800;
          margin: 0;
        }

        .brand h1 {
          font-size: 21px;
          margin: 2px 0 0;
        }

        .levelBox {
          min-width: 155px;
        }

        .levelTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-weight: 800;
          font-size: 13px;
        }

        .levelTitle small {
          color: #9ca8c9;
          font-size: 9px;
          font-weight: 600;
        }

        .expText {
          display: block;
          color: #9ca8c9;
          font-size: 10px;
          margin-top: 5px;
          text-align: right;
        }

        .bar {
          height: 6px;
          width: 155px;
          background: #252e4a;
          border-radius: 9px;
          margin-top: 7px;
          overflow: hidden;
        }

        .bar i {
          height: 100%;
          display: block;
          background: #a578ff;
          border-radius: 9px;
          transition: width 0.4s ease;
        }

        .startCard,
        .quest,
        .result {
          background: rgba(20, 27, 49, 0.9);
          border: 1px solid #323d63;
          border-radius: 20px;
          box-shadow:
            0 20px 70px rgba(0, 0, 0, 0.25);
        }

        .startCard {
          text-align: center;
          padding: 68px 40px;
        }

        .startCard h2,
        .quest h2 {
          font-size: 28px;
          margin: 8px 0 12px;
        }

        .lead {
          max-width: 590px;
          color: #bdc6df;
          font-size: 14px;
          line-height: 1.8;
          margin: 0 auto 26px;
        }

        .rules {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin: 0 0 25px;
        }

        .rules span {
          font-size: 12px;
          padding: 9px 12px;
          background: #202a48;
          border-radius: 8px;
          color: #d6dcf0;
        }

        .startTip {
          max-width: 560px;
          margin: 0 auto 28px;
          padding: 14px 17px;
          text-align: left;
          background: #17152b;
          border: 1px solid #514174;
          border-radius: 12px;
        }

        .startTip > span,
        .liveTip > span {
          display: block;
          color: #b997ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
          margin-bottom: 6px;
        }

        .startTip strong {
          display: block;
          color: #eee8ff;
          font-size: 12px;
        }

        .startTip p {
          color: #aeb6ce;
          font-size: 11px;
          line-height: 1.55;
          margin: 5px 0 0;
        }

        .primary,
        .send {
          background:
            linear-gradient(
              135deg,
              #9b6bff,
              #7046eb
            );
          color: white;
          font-weight: 800;
          border-radius: 10px;
          padding: 13px 24px;
          cursor: pointer;
          box-shadow:
            0 8px 20px #6f45eb33;
        }

        .primary:disabled,
        .send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .miniStats {
          display: flex;
          justify-content: center;
          gap: 1px;
          margin: 44px auto 0;
          max-width: 360px;
          border-top: 1px solid #303a5c;
          padding-top: 22px;
        }

        .miniStats div {
          width: 50%;
        }

        .miniStats b {
          display: block;
          font-size: 24px;
        }

        .miniStats small,
        .scoreCaption {
          display: block;
          color: #9ca8c9;
          font-size: 11px;
          margin-top: 5px;
        }

        .quest {
          overflow: hidden;
        }

        .questHead {
          display: flex;
          justify-content: space-between;
          padding: 24px 28px;
          border-bottom: 1px solid #303a5c;
        }

        .questHead h2 {
          font-size: 20px;
          margin: 5px 0;
        }

        .questHead p:not(.eyebrow) {
          font-size: 12px;
          color: #aab5d1;
          margin: 0;
        }

        .status {
          height: max-content;
          padding: 8px 11px;
          border-radius: 20px;
          background: #243052;
          color: #bfcaf1;
          font-size: 11px;
          font-weight: 800;
        }

        .status.cleared {
          background: #164a3a;
          color: #87f5c0;
        }

        .status.failed {
          background: #532a38;
          color: #ffc0cf;
        }

        .battleLayout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          min-height: 520px;
        }

        .chatArea {
          min-width: 0;
          border-right: 1px solid #303a5c;
        }

        .chat {
          min-height: 370px;
          max-height: 52vh;
          overflow: auto;
          padding: 25px;
        }

        .message {
          max-width: 78%;
          margin-bottom: 18px;
        }

        .message.user {
          margin-left: auto;
        }

        .message span {
          font-size: 10px;
          font-weight: 800;
          color: #acb7d5;
        }

        .message p {
          background: #222b48;
          border-radius: 4px 13px 13px 13px;
          padding: 12px 14px;
          margin: 5px 0 0;
          line-height: 1.65;
          font-size: 13px;
          white-space: pre-wrap;
        }

        .message.user p {
          background: #7850e8;
          border-radius: 13px 4px 13px 13px;
        }

        .thinking {
          color: #aab5d1;
          font-style: italic;
        }

        .psychology {
          margin: 0 22px 12px;
          padding: 12px 14px;
          border: 1px solid #514174;
          background: #17152b;
          border-radius: 10px;
        }

        .psychology span {
          color: #b997ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .psychology p {
          color: #cfc5ed;
          font-size: 11px;
          margin: 5px 0 0;
          line-height: 1.5;
        }

        .liveTip {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin: 0 22px 14px;
          padding: 10px 13px;
          background: #131a2d;
          border: 1px solid #2d3858;
          border-radius: 9px;
        }

        .liveTip > span {
          flex-shrink: 0;
          margin: 2px 0 0;
        }

        .liveTip strong {
          color: #dcd5ef;
          font-size: 10px;
        }

        .liveTip p {
          color: #8995b5;
          font-size: 10px;
          line-height: 1.45;
          margin: 3px 0 0;
        }

        .composer {
          display: flex;
          gap: 10px;
          padding: 18px 22px;
          border-top: 1px solid #303a5c;
        }

        .composer input {
          min-width: 0;
          flex: 1;
          color: white;
          background: #11172a;
          border: 1px solid #374365;
          border-radius: 10px;
          padding: 12px 13px;
          outline: none;
        }

        .send {
          padding: 11px 18px;
        }

        .finish {
          border-top: 1px solid #303a5c;
          padding: 14px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #99a7c8;
          font-size: 11px;
        }

        .finish button {
          cursor: pointer;
          color: #c9b9ff;
          background: transparent;
          font-weight: 700;
        }

        .sidePanel {
          background: rgba(10, 15, 30, 0.42);
        }

        .customerInfo {
          padding: 20px;
          border-bottom: 1px solid #303a5c;
        }

        .customerInfoHeader,
        .stateHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .customerInfoHeader {
          margin-bottom: 15px;
        }

        .customerInfoHeader h3,
        .stateHeader h3 {
          margin: 4px 0 0;
          font-size: 16px;
        }

        .researchBadge {
          font-size: 8px;
          font-weight: 900;
          color: #9cb2ef;
          border: 1px solid #35436a;
          background: #18213b;
          border-radius: 6px;
          padding: 5px 6px;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .infoItem {
          padding: 9px 10px;
          background: #151d34;
          border: 1px solid #252f4b;
          border-radius: 8px;
        }

        .infoItem span {
          display: block;
          color: #7785aa;
          font-size: 8px;
          margin-bottom: 3px;
        }

        .infoItem strong {
          display: block;
          color: #dbe2f3;
          font-size: 10px;
          line-height: 1.35;
        }

        .customerNotes {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #252f4b;
        }

        .customerNotes > p {
          color: #8e9abc;
          font-size: 9px;
          margin: 0 0 7px;
        }

        .customerNotes > div {
          display: flex;
          gap: 7px;
          margin-top: 5px;
        }

        .customerNotes span {
          flex-shrink: 0;
          color: #7180a4;
          font-size: 8px;
        }

        .customerNotes b {
          color: #bfc8dc;
          font-size: 9px;
          font-weight: 600;
          line-height: 1.4;
        }

        .statePanel {
          padding: 20px;
        }

        .stateHeader {
          margin-bottom: 18px;
        }

        .live {
          font-size: 9px;
          color: #7cf0bb;
          font-weight: 900;
          letter-spacing: 1px;
          padding: 5px 7px;
          border: 1px solid #285c49;
          border-radius: 6px;
          background: #10251f;
        }

        .stateList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .stateItem {
          padding-bottom: 11px;
          border-bottom: 1px solid #252f4b;
        }

        .stateTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 7px;
        }

        .stateName {
          font-size: 11px;
          font-weight: 800;
          color: #d7dded;
        }

        .stateIcon {
          margin-right: 5px;
        }

        .stateTop strong {
          font-size: 14px;
          color: #cbb8ff;
        }

        .stateBar {
          height: 7px;
          background: #242e49;
          border-radius: 10px;
          overflow: hidden;
        }

        .stateBar i {
          display: block;
          height: 100%;
          border-radius: 10px;
          background:
            linear-gradient(
              90deg,
              #6441d2,
              #ad83ff
            );
          transition: width 0.5s ease;
        }

        .stateItem small {
          display: block;
          margin-top: 5px;
          color: #7785aa;
          font-size: 8px;
          line-height: 1.4;
        }

        .stateItem.danger .stateTop strong {
          color: #ff9caf;
        }

        .stateItem.danger .stateBar i {
          background:
            linear-gradient(
              90deg,
              #a44763,
              #ff7995
            );
        }

        .stateLegend {
          margin-top: 18px;
          padding-top: 13px;
          border-top: 1px solid #303a5c;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stateLegend span {
          font-size: 8px;
          color: #7683a5;
        }

        .result {
          text-align: center;
          padding: 40px;
        }

        .result h2 {
          font-size: 68px;
          line-height: 1;
          margin: 8px 0 0;
          color: #cfb8ff;
        }

        .result h2 small {
          font-size: 21px;
          color: #8995b8;
        }

        .scoreCaption {
          margin-bottom: 32px;
        }

        .scoreGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          text-align: left;
          margin-bottom: 28px;
        }

        .scoreGrid > div {
          padding: 13px;
          background: #171f37;
          border-radius: 11px;
        }

        .scoreGrid span {
          font-size: 10px;
          color: #aeb8d2;
          display: block;
        }

        .scoreGrid b {
          font-size: 21px;
          display: block;
          margin: 7px 0;
        }

        .scoreGrid b small {
          font-size: 10px;
          color: #8e9ab9;
        }

        .scoreGrid i {
          display: block;
          height: 4px;
          border-radius: 4px;
          background: #2d3858;
          overflow: hidden;
        }

        .scoreGrid em {
          display: block;
          height: 100%;
          background: #a578ff;
        }

        .feedback {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          text-align: left;
        }

        .feedback article {
          padding: 18px;
          background: #171f37;
          border-radius: 11px;
        }

        .feedback h3 {
          color: #ad8aff;
          margin: 0 0 10px;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .feedback p,
        .summary {
          font-size: 12px;
          color: #c4cde1;
          line-height: 1.65;
          margin: 5px 0;
        }

        .summary {
          max-width: 650px;
          margin: 24px auto;
        }

        .error {
          padding: 12px 15px;
          border: 1px solid #843b55;
          color: #ffc3d0;
          background: #42202c;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        @media (max-width: 900px) {
          .battleLayout {
            grid-template-columns: 1fr;
          }

          .chatArea {
            border-right: 0;
            border-bottom: 1px solid #303a5c;
          }

          .sidePanel {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .customerInfo {
            border-bottom: 0;
            border-right: 1px solid #303a5c;
          }
        }

        @media (max-width: 850px) {
          header {
            gap: 15px;
          }

          .levelBox {
            min-width: 140px;
          }

          .bar {
            width: 140px;
          }

          .sidePanel {
            display: block;
          }

          .customerInfo {
            border-right: 0;
            border-bottom: 1px solid #303a5c;
          }

          .stateList {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 20px 12px;
          }

          header {
            flex-wrap: wrap;
            margin-bottom: 24px;
          }

          .back {
            order: 3;
            width: 100%;
          }

          .levelBox {
            margin-left: auto;
          }

          .startCard,
          .result {
            padding: 36px 20px;
          }

          .startCard h2 {
            font-size: 23px;
          }

          .scoreGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .questHead {
            padding: 18px;
          }

          .composer {
            padding: 13px;
          }

          .finish {
            gap: 13px;
          }

          .finish span {
            display: none;
          }

          .feedback {
            grid-template-columns: 1fr;
          }

          .message {
            max-width: 90%;
          }

          .stateList {
            grid-template-columns: 1fr;
          }

          .infoGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}
