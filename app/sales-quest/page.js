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

function normalizeState(state = {}) {
  return {
    trust: Number(state.trust ?? 25),
    problem_awareness: Number(
      state.problem_awareness ?? 15
    ),
    gap_awareness: Number(
      state.gap_awareness ?? 5
    ),
    urgency: Number(state.urgency ?? 10),
    interest: Number(state.interest ?? 10),
    resistance: Number(state.resistance ?? 35),
  };
}

function getDifficulty(level) {
  const lv = Number(level || 1);

  if (lv >= 10) {
    return {
      name: "魔王級",
      icon: "👹",
      color: "red",
      description: "攻略情報なし。顧客の心理だけを読め。",
    };
  }

  if (lv >= 6) {
    return {
      name: "上級",
      icon: "⚔️",
      color: "gold",
      description: "ヒントは最小限。自力でGAPを作れ。",
    };
  }

  if (lv >= 3) {
    return {
      name: "中級",
      icon: "🛡️",
      color: "blue",
      description: "基本を意識しながら自力で攻略。",
    };
  }

  return {
    name: "初級",
    icon: "🌱",
    color: "green",
    description: "営業の基本を学びながら攻略。",
  };
}

function getTitle(level) {
  const lv = Number(level || 1);

  if (lv >= 20) return "営業大魔王";
  if (lv >= 15) return "伝説の営業";
  if (lv >= 10) return "営業魔王";
  if (lv >= 8) return "トップセールス";
  if (lv >= 6) return "エース営業";
  if (lv >= 4) return "一人前営業";
  if (lv >= 3) return "見習い卒業";
  if (lv >= 2) return "見習い営業";

  return "新人営業";
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

  if (level <= 5) {
    return {
      title: "顧客に気づかせろ",
      text:
        "答えを先に言うのではなく、顧客自身が「ここを改善したい」と気づく質問を選びましょう。",
    };
  }

  if (level <= 9) {
    return {
      title: "GAPを作れ",
      text:
        "数字・理想・未来をつなげて、顧客自身に「このままではもったいない」と気づかせましょう。",
    };
  }

  return {
    title: "自分で考えろ",
    text:
      "魔王級に攻略情報はない。顧客の反応を見て、次の一手を判断しましょう。",
  };
}

function getEmployeeStorageKey() {
  return "sales-quest-employee";
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

function QuestBoard({
  stats,
  employee,
  onStart,
  loading,
  onLogout,
}) {
  const difficulty = getDifficulty(stats.level);
  const tip = getTip(stats.level);

  const exp = Number(stats.exp || 0);
  const expInLevel = exp % 100;

  return (
    <section className="boardPage">
      <div className="heroTop">
        <div>
          <p className="eyebrow">
            ADVENTURER&apos;S GUILD
          </p>

          <h2>冒険者の城</h2>

          <p className="heroLead">
            ようこそ、{employee.name}。
            <br />
            今日も営業という名のダンジョンへ。
          </p>
        </div>

        <button
          className="logoutButton"
          onClick={onLogout}
        >
          ↪ 冒険者を変更
        </button>
      </div>

      <div className="adventurerCard">
        <div className="avatar">
          {employee.name?.slice(0, 1) || "冒"}
        </div>

        <div className="adventurerMain">
          <div className="adventurerName">
            {employee.name}
          </div>

          <div className="title">
            {getTitle(stats.level)}
          </div>

          <div className="expRow">
            <span>
              LEVEL {stats.level}
            </span>

            <span>
              {expInLevel} / 100 EXP
            </span>
          </div>

          <div className="expBar">
            <i
              style={{
                width: `${expInLevel}%`,
              }}
            />
          </div>
        </div>

        <div className="levelBadge">
          <small>営業</small>
          <strong>{stats.level}</strong>
          <span>LV</span>
        </div>
      </div>

      <div className="boardGrid">
        <div className="questBoard">
          <div className="sectionTitle">
            <div>
              <span className="sectionIcon">
                📜
              </span>

              <div>
                <small>QUEST BOARD</small>
                <h3>依頼掲示板</h3>
              </div>
            </div>

            <span className="available">
              ● AVAILABLE
            </span>
          </div>

          <div className="questCard active">
            <div className="questIcon">
              ⚔️
            </div>

            <div className="questContent">
              <div className="questMeta">
                <span>STAGE 1</span>
                <span>
                  {difficulty.icon}{" "}
                  {difficulty.name}
                </span>
              </div>

              <h3>
                興味なし → 興味あり
              </h3>

              <p>
                警戒している店舗オーナーから、
                「もう少し詳しく聞きたい」を
                引き出せ。
              </p>

              <div className="questObjective">
                <span>🎯 目標</span>
                <strong>
                  顧客にHPについて詳しく聞きたい
                  と言わせる
                </strong>
              </div>

              <button
                className="questStart"
                disabled={loading}
                onClick={onStart}
              >
                {loading
                  ? "顧客を召喚中..."
                  : "▶ QUEST START"}
              </button>
            </div>
          </div>

          <div className="lockedQuest">
            <span>🔒</span>

            <div>
              <strong>
                STAGE 2　？？？
              </strong>

              <small>
                STAGE 1をクリアすると解放されます
              </small>
            </div>
          </div>

          <div className="lockedQuest">
            <span>🔒</span>

            <div>
              <strong>
                STAGE 3　？？？
              </strong>

              <small>
                さらなる営業の試練
              </small>
            </div>
          </div>
        </div>

        <aside className="guildSide">
          <div className="guildCard">
            <div className="sectionTitle compact">
              <div>
                <span className="sectionIcon">
                  🏆
                </span>

                <div>
                  <small>ADVENTURER</small>
                  <h3>冒険者情報</h3>
                </div>
              </div>
            </div>

            <div className="guildStats">
              <div>
                <span>平均スコア</span>
                <strong>
                  {stats.average_score || "-"}
                </strong>
              </div>

              <div>
                <span>最高スコア</span>
                <strong>
                  {stats.best_score || "-"}
                </strong>
              </div>

              <div>
                <span>累計EXP</span>
                <strong>{exp}</strong>
              </div>
            </div>
          </div>

          <div className="tipCard">
            <span>💡 GUILD TIP</span>

            <strong>{tip.title}</strong>

            <p>{tip.text}</p>
          </div>

          <div className="difficultyCard">
            <span>⚔️ CURRENT DIFFICULTY</span>

            <strong>
              {difficulty.icon}{" "}
              {difficulty.name}
            </strong>

            <p>
              {difficulty.description}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function SalesQuestPage() {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [employeeSearch, setEmployeeSearch] =
    useState("");
  const [employeeLoading, setEmployeeLoading] =
    useState(true);

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
    loadEmployees();

    try {
      const saved =
        window.localStorage.getItem(
          getEmployeeStorageKey()
        );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed?.id) {
          setEmployee(parsed);
          setUserId(parsed.id);
        }
      }
    } catch {
      // localStorageが壊れていても画面は起動する
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

async function loadEmployees() {
  setEmployeeLoading(true);

  try {
    const response = await fetch("/api/employees", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("社員情報の取得に失敗しました。");
    }

    const data = await response.json();

    console.log("EMPLOYEE API DATA:", data);

    const employeeList = Array.isArray(data)
      ? data
      : Array.isArray(data?.employees)
        ? data.employees
        : [];

    console.log("EMPLOYEE LIST:", employeeList);

    const activeEmployees = employeeList.filter(
      (item) =>
        item &&
        item.active !== false &&
        item.quest_enabled !== false
    );

    console.log("冒険者データ:", activeEmployees);

    setEmployees(activeEmployees);
  } catch (e) {
    console.error("冒険者取得エラー:", e);
    setEmployees([]);
    setError(e.message);
  } finally {
    setEmployeeLoading(false);
  }
}
      );

const data = await response.json();

console.log("EMPLOYEE API DATA:", data);
console.log("EMPLOYEE API DATA TYPE:", typeof data);
console.log("IS ARRAY:", Array.isArray(data));
console.log("EMPLOYEES:", data?.employees);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "社員情報の取得に失敗しました。"
        );
      }

const employeeList = Array.isArray(data)
  ? data
  : Array.isArray(data?.employees)
    ? data.employees
    : [];

const activeEmployees = employeeList.filter(
  (item) =>
    item.active !== false &&
    item.quest_enabled !== false
);
      
console.log("冒険者データ:", activeEmployees);
      setEmployees(activeEmployees);
    } catch (e) {
      setError(e.message);
    } finally {
      setEmployeeLoading(false);
    }
  }

  async function loadStats(employeeId) {
    try {
      /*
       * 現在のstart APIがuserIdを受け取って
       * statsを返すため、ここでは直接取得せず
       * ログイン後にQUEST STARTした際に更新する。
       *
       * 既存データとの互換性も維持。
       */
      if (!employeeId) {
        return;
      }
    } catch {
      // stats取得失敗時は初期値を使用
    }
  }

  function selectEmployee(selected) {
    setEmployee(selected);
    setUserId(selected.id);
    setEmployeeSearch("");
    setError("");

    try {
      window.localStorage.setItem(
        getEmployeeStorageKey(),
        JSON.stringify(selected)
      );
    } catch {
      // 保存できなくてもゲーム自体は続行
    }

    loadStats(selected.id);
  }

  function logout() {
    setEmployee(null);
    setUserId("");
    setSession(null);
    setMessages([]);
    setResult(null);
    setInput("");
    setError("");
    setPsychologyHint("");
    setCustomerState(normalizeState());

    setStats({
      level: 1,
      exp: 0,
      average_score: 0,
      best_score: 0,
    });

    try {
      window.localStorage.removeItem(
        getEmployeeStorageKey()
      );
    } catch {
      // noop
    }
  }

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
    if (!userId) {
      return;
    }

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
      setStats(
        data.stats || {
          level: 1,
          exp: 0,
          average_score: 0,
          best_score: 0,
        }
      );

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
          normalizeState(
            data.customer_state
          )
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

  const filteredEmployees =
    employees.filter((item) => {
      const keyword =
        employeeSearch.trim().toLowerCase();

      if (!keyword) {
        return true;
      }

      return [
        item.name,
        item.department,
        item.office,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(keyword)
        );
    });

  const expInLevel =
    Number(stats.exp || 0) % 100;

  const currentTip = getTip(
    Number(stats.level || 1)
  );

  const difficulty = getDifficulty(
    Number(stats.level || 1)
  );

  return (
    <main className="page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #080b15;
          color: #edf1ff;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            "Hiragino Kaku Gothic ProN",
            Meiryo,
            sans-serif;
        }

        body {
          min-height: 100vh;
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
        <header className="header">
          <a href="/" className="back">
            ← AI部長
          </a>

          <div className="brand">
            <div className="brandIcon">
              ⚔️
            </div>

            <div>
              <small>
                SALES INTELLIGENCE TRAINING
              </small>

              <h1>営業クエスト</h1>
            </div>
          </div>

          {employee && (
            <div className="headerPlayer">
              <div className="headerAvatar">
                {employee.name?.slice(0, 1)}
              </div>

              <div>
                <strong>
                  {employee.name}
                </strong>

                <span>
                  Lv.{stats.level}{" "}
                  {getTitle(stats.level)}
                </span>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {!employee && (
          <section className="loginScreen">
            <div className="castle">
              <div className="castleGlow" />
              <div className="castleEmoji">
                🏰
              </div>
            </div>

            <p className="eyebrow">
              SALES ADVENTURE
            </p>

            <h2>
              営業の冒険へ
              <br />
              ようこそ。
            </h2>

            <p className="loginLead">
              冒険者を選択してください。
              <br />
              パスワード？そんなものはない。
              社内だからな。
            </p>

            <div className="loginPanel">
              <div className="loginPanelHeader">
                <div>
                  <small>
                    ADVENTURER SELECT
                  </small>

                  <strong>
                    冒険者を選択
                  </strong>
                </div>

                <span>
                  👥 {employees.length}名
                </span>
              </div>

              <div className="searchBox">
                <span>🔎</span>

                <input
                  value={employeeSearch}
                  onChange={(e) =>
                    setEmployeeSearch(
                      e.target.value
                    )
                  }
                  placeholder="名前・部署・拠点を検索..."
                  autoComplete="off"
                />
              </div>

              <div className="employeeList">
                {employeeLoading ? (
                  <div className="empty">
                    <span className="loadingOrb">
                      ✦
                    </span>

                    <p>
                      冒険者名簿を読み込み中...
                    </p>
                  </div>
                ) : filteredEmployees.length ===
                  0 ? (
                  <div className="empty">
                    <span>📜</span>

                    <p>
                      冒険者が見つかりません
                    </p>
                  </div>
                ) : (
                  filteredEmployees.map(
                    (item) => (
                      <button
                        key={item.id}
                        className="employeeRow"
                        onClick={() =>
                          selectEmployee(item)
                        }
                      >
                        <div className="employeeAvatar">
                          {item.name?.slice(
                            0,
                            1
                          )}
                        </div>

                        <div className="employeeInfo">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.department ||
                              "営業部"}

                            {item.office
                              ? ` ・ ${item.office}`
                              : ""}
                          </span>
                        </div>

                        <span className="arrow">
                          →
                        </span>
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {employee &&
          !session &&
          !result && (
            <QuestBoard
              stats={stats}
              employee={employee}
              onStart={start}
              loading={loading}
              onLogout={logout}
            />
          )}

        {session && !result && (
          <section className="quest">
            <div className="questHead">
              <div>
                <div className="questBreadcrumb">
                  <span>
                    STAGE 1
                  </span>

                  <span>›</span>

                  <span>
                    LIVE ROLEPLAY
                  </span>
                </div>

                <h2>
                  {session.customer.industry}
                  オーナー
                </h2>

                <p>
                  {session.customer.business_size}
                  {" ・ "}
                  {session.customer.owner_type}
                </p>
              </div>

              <div className="battleStatus">
                <span className="difficultyMini">
                  {difficulty.icon}{" "}
                  {difficulty.name}
                </span>

                <div
                  className={`status ${session.status}`}
                >
                  {session.status ===
                  "cleared"
                    ? "QUEST CLEAR"
                    : session.status ===
                      "failed"
                    ? "会話終了"
                    : "⚔ 商談中"}
                </div>
              </div>
            </div>

            <div className="battleMission">
              <span>
                🎯 MISSION
              </span>

              <strong>
                顧客から
                「ホームページについて詳しく聞きたい」
                を引き出せ
              </strong>

              <small>
                GBP → 現状 → 理想 → GAP → HP
              </small>
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
                        <div className="messageName">
                          {item.role === "user"
                            ? `🧙 ${employee.name}`
                            : "👤 顧客"}
                        </div>

                        <p>
                          {item.content}
                        </p>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="message assistant">
                      <div className="messageName">
                        👤 顧客
                      </div>

                      <p className="thinking">
                        顧客が考えています…
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
                    placeholder="コマンドを入力する…"
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
                    話す
                  </button>
                </form>

                <div className="finish">
                  <span>
                    会話を終えたら採点できます。
                  </span>

                  <button
                    onClick={finish}
                    disabled={loading}
                  >
                    📜 クエスト終了・採点
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
            <div className="resultBanner">
              {result.status ===
              "cleared"
                ? "🏆 QUEST CLEAR"
                : "📜 QUEST RESULT"}
            </div>

            <p className="eyebrow">
              ADVENTURE RESULT
            </p>

            <h2>
              {result.evaluation.total}
              <small>/ 100</small>
            </h2>

            <p className="scoreCaption">
              営業スコア　+
              {result.expGained} EXP
            </p>

            <div className="resultLevel">
              <div>
                <small>
                  CURRENT LEVEL
                </small>

                <strong>
                  Lv.{stats.level}
                </strong>
              </div>

              <div>
                <small>
                  TITLE
                </small>

                <strong>
                  {getTitle(stats.level)}
                </strong>
              </div>
            </div>

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
                <h3>
                  🟢 GOOD
                </h3>

                {result.evaluation.goodPoints.map(
                  (item, index) => (
                    <p key={index}>
                      ・{item}
                    </p>
                  )
                )}
              </article>

              <article>
                <h3>
                  🔴 NEXT
                </h3>

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

            <div className="resultActions">
              <button
                className="secondaryButton"
                onClick={reset}
              >
                📜 もう一度挑戦
              </button>

              <button
                className="primary"
                onClick={logout}
              >
                🏰 冒険者の城へ
              </button>
            </div>
          </section>
        )}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 26px 18px 60px;
          background:
            radial-gradient(
              circle at 50% -10%,
              #29376e 0,
              #10172d 35%,
              #080b15 75%
            );
        }

        .shell {
          max-width: 1180px;
          margin: auto;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 68px;
          margin-bottom: 30px;
        }

        .back {
          color: #9ba8cc;
          text-decoration: none;
          font-size: 12px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-right: auto;
        }

        .brandIcon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid #6f5ba7;
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              #2e2555,
              #151a35
            );
          box-shadow:
            0 8px 30px #0008;
          font-size: 20px;
        }

        .brand small {
          display: block;
          color: #a992ff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .brand h1 {
          margin: 2px 0 0;
          font-size: 20px;
        }

        .headerPlayer {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          border: 1px solid #303b62;
          border-radius: 10px;
          background: #11182c;
        }

        .headerAvatar {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #6950bc;
          font-weight: 900;
        }

        .headerPlayer strong,
        .headerPlayer span {
          display: block;
        }

        .headerPlayer strong {
          font-size: 11px;
        }

        .headerPlayer span {
          color: #8996b8;
          font-size: 9px;
          margin-top: 2px;
        }

        .error {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid #843b55;
          color: #ffc3d0;
          background: #42202c;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 12px;
        }

        .eyebrow {
          margin: 0;
          color: #ad91ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        /* LOGIN */

        .loginScreen {
          max-width: 650px;
          margin: 0 auto;
          text-align: center;
        }

        .castle {
          position: relative;
          height: 135px;
          display: grid;
          place-items: center;
        }

        .castleGlow {
          position: absolute;
          width: 180px;
          height: 100px;
          border-radius: 50%;
          background: #8661ff22;
          filter: blur(25px);
        }

        .castleEmoji {
          position: relative;
          font-size: 76px;
          filter:
            drop-shadow(
              0 15px 30px #0008
            );
        }

        .loginScreen h2 {
          margin: 8px 0 14px;
          font-size: 34px;
          line-height: 1.25;
        }

        .loginLead {
          color: #9faaca;
          font-size: 12px;
          line-height: 1.8;
          margin: 0 0 25px;
        }

        .loginPanel {
          text-align: left;
          padding: 18px;
          border: 1px solid #394568;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              #141c35ee,
              #0e1426ee
            );
          box-shadow:
            0 25px 80px #0006;
        }

        .loginPanelHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .loginPanelHeader small,
        .loginPanelHeader strong {
          display: block;
        }

        .loginPanelHeader small {
          color: #8e9abd;
          font-size: 8px;
          letter-spacing: 1.4px;
        }

        .loginPanelHeader strong {
          font-size: 15px;
          margin-top: 3px;
        }

        .loginPanelHeader > span {
          color: #8996b8;
          font-size: 10px;
        }

        .searchBox {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 13px;
          border: 1px solid #364263;
          border-radius: 9px;
          background: #090f20;
          margin-bottom: 10px;
        }

        .searchBox input {
          flex: 1;
          min-width: 0;
          outline: none;
          border: 0;
          background: transparent;
          color: white;
          font-size: 12px;
        }

        .employeeList {
          max-height: 390px;
          overflow: auto;
        }

        .employeeRow {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px;
          margin-top: 5px;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 9px;
          background: #151d35;
          color: white;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .employeeRow:hover {
          transform: translateX(3px);
          border-color: #6d5a9e;
          background: #1d2745;
        }

        .employeeAvatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background:
            linear-gradient(
              135deg,
              #7658d0,
              #43318b
            );
          font-weight: 900;
          font-size: 12px;
        }

        .employeeInfo {
          flex: 1;
          min-width: 0;
        }

        .employeeInfo strong,
        .employeeInfo span {
          display: block;
        }

        .employeeInfo strong {
          font-size: 12px;
        }

        .employeeInfo span {
          color: #7886aa;
          font-size: 9px;
          margin-top: 3px;
        }

        .arrow {
          color: #8e79d4;
          font-size: 17px;
        }

        .empty {
          padding: 45px 20px;
          text-align: center;
          color: #7785a9;
        }

        .empty span {
          font-size: 28px;
        }

        .empty p {
          font-size: 11px;
        }

        .loadingOrb {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          50% {
            opacity: 0.35;
            transform: scale(0.85);
          }
        }

        /* BOARD */

        .boardPage {
          animation: fadeIn 0.35s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .heroTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .heroTop h2 {
          margin: 5px 0 7px;
          font-size: 29px;
        }

        .heroLead {
          margin: 0;
          color: #929fbe;
          font-size: 12px;
          line-height: 1.7;
        }

        .logoutButton {
          color: #8996b8;
          background: #11182b;
          border: 1px solid #303b5d;
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 10px;
        }

        .adventurerCard {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px;
          margin-bottom: 15px;
          border: 1px solid #4a416f;
          border-radius: 15px;
          background:
            linear-gradient(
              110deg,
              #1c1938,
              #11172d
            );
          box-shadow:
            0 15px 50px #0005;
        }

        .avatar {
          width: 62px;
          height: 62px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 12px;
          border: 2px solid #7c65c4;
          background:
            linear-gradient(
              145deg,
              #7455ca,
              #342563
            );
          font-size: 25px;
          font-weight: 900;
        }

        .adventurerMain {
          flex: 1;
        }

        .adventurerName {
          font-size: 17px;
          font-weight: 900;
        }

        .title {
          color: #a992f4;
          font-size: 10px;
          margin-top: 3px;
        }

        .expRow {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          color: #858fb0;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .expBar {
          height: 8px;
          margin-top: 6px;
          background: #292d4a;
          border-radius: 8px;
          overflow: hidden;
        }

        .expBar i {
          display: block;
          height: 100%;
          background:
            linear-gradient(
              90deg,
              #6f4bd0,
              #b58aff
            );
          border-radius: 8px;
          transition: width 0.5s ease;
        }

        .levelBadge {
          min-width: 76px;
          text-align: center;
          padding-left: 15px;
          border-left: 1px solid #343c5c;
        }

        .levelBadge small,
        .levelBadge strong,
        .levelBadge span {
          display: block;
        }

        .levelBadge small {
          color: #7885a7;
          font-size: 8px;
        }

        .levelBadge strong {
          color: #cdbaff;
          font-size: 28px;
          line-height: 1.05;
        }

        .levelBadge span {
          color: #7885a7;
          font-size: 8px;
        }

        .boardGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 15px;
        }

        .questBoard,
        .guildCard,
        .tipCard,
        .difficultyCard {
          border: 1px solid #303b5d;
          border-radius: 14px;
          background: #11182d;
        }

        .questBoard {
          padding: 20px;
        }

        .sectionTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .sectionTitle > div {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .sectionIcon {
          font-size: 20px;
        }

        .sectionTitle small {
          display: block;
          color: #7e8bae;
          font-size: 8px;
          letter-spacing: 1.4px;
        }

        .sectionTitle h3 {
          margin: 2px 0 0;
          font-size: 15px;
        }

        .available {
          color: #70e5ad;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .questCard {
          display: flex;
          gap: 17px;
          padding: 18px;
          border: 1px solid #594b85;
          border-radius: 12px;
          background:
            linear-gradient(
              135deg,
              #201b3d,
              #131a30
            );
          box-shadow:
            inset 0 0 30px #8b6cff08;
        }

        .questIcon {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #725cae;
          border-radius: 11px;
          background: #17152d;
          font-size: 27px;
        }

        .questContent {
          flex: 1;
        }

        .questMeta {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .questMeta span {
          padding: 4px 7px;
          border-radius: 5px;
          background: #292345;
          color: #b29af0;
          font-size: 8px;
          font-weight: 900;
        }

        .questContent h3 {
          margin: 9px 0 7px;
          font-size: 18px;
        }

        .questContent > p {
          margin: 0;
          color: #919dbc;
          font-size: 11px;
          line-height: 1.7;
        }

        .questObjective {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0;
          padding: 10px;
          border-radius: 8px;
          background: #0c1223;
        }

        .questObjective span {
          color: #a78df0;
          font-size: 9px;
          font-weight: 900;
        }

        .questObjective strong {
          color: #d3d9eb;
          font-size: 10px;
        }

        .questStart,
        .primary {
          color: white;
          font-weight: 900;
          border-radius: 8px;
          padding: 11px 17px;
          cursor: pointer;
          background:
            linear-gradient(
              135deg,
              #8060df,
              #5737bd
            );
          box-shadow:
            0 8px 25px #6d4de633;
        }

        .questStart:disabled,
        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .lockedQuest {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 9px;
          padding: 12px 14px;
          border: 1px solid #242e49;
          border-radius: 9px;
          background: #0e1425;
          color: #596681;
        }

        .lockedQuest > span {
          font-size: 16px;
        }

        .lockedQuest strong,
        .lockedQuest small {
          display: block;
        }

        .lockedQuest strong {
          font-size: 10px;
        }

        .lockedQuest small {
          font-size: 8px;
          margin-top: 3px;
        }

        .guildSide {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .guildCard,
        .tipCard,
        .difficultyCard {
          padding: 17px;
        }

        .compact {
          margin-bottom: 15px;
        }

        .guildStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .guildStats div {
          padding: 11px;
          border-radius: 8px;
          background: #171f36;
        }

        .guildStats div:last-child {
          grid-column: 1 / -1;
        }

        .guildStats span,
        .guildStats strong {
          display: block;
        }

        .guildStats span {
          color: #7785a6;
          font-size: 8px;
        }

        .guildStats strong {
          margin-top: 4px;
          color: #cbb8ff;
          font-size: 20px;
        }

        .tipCard {
          border-color: #514174;
          background: #17152b;
        }

        .tipCard > span,
        .difficultyCard > span {
          display: block;
          color: #a88ff0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .tipCard strong {
          display: block;
          margin-top: 9px;
          font-size: 12px;
        }

        .tipCard p,
        .difficultyCard p {
          margin: 6px 0 0;
          color: #919cba;
          font-size: 10px;
          line-height: 1.55;
        }

        .difficultyCard strong {
          display: block;
          margin-top: 8px;
          color: #d7dded;
          font-size: 14px;
        }

        /* BATTLE */

        .quest {
          overflow: hidden;
          border: 1px solid #35405f;
          border-radius: 16px;
          background: #11182c;
          box-shadow:
            0 25px 80px #0005;
          animation: fadeIn 0.3s ease;
        }

        .questHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 19px 22px;
          border-bottom: 1px solid #303a5c;
        }

        .questBreadcrumb {
          display: flex;
          gap: 7px;
          align-items: center;
          color: #a78bf0;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .questHead h2 {
          margin: 7px 0 3px;
          font-size: 19px;
        }

        .questHead p {
          margin: 0;
          color: #8995b5;
          font-size: 10px;
        }

        .battleStatus {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .difficultyMini {
          color: #d2c6f4;
          padding: 6px 8px;
          border: 1px solid #3b4163;
          border-radius: 6px;
          background: #191f36;
          font-size: 8px;
          font-weight: 800;
        }

        .status {
          padding: 7px 10px;
          border-radius: 6px;
          background: #233052;
          color: #bdc8e9;
          font-size: 8px;
          font-weight: 900;
        }

        .status.cleared {
          background: #164a3a;
          color: #87f5c0;
        }

        .status.failed {
          background: #532a38;
          color: #ffc0cf;
        }

        .battleMission {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 22px;
          background: #0c1222;
          border-bottom: 1px solid #272f4a;
        }

        .battleMission span {
          color: #a68bf0;
          font-size: 8px;
          font-weight: 900;
        }

        .battleMission strong {
          color: #d7dcef;
          font-size: 9px;
        }

        .battleMission small {
          margin-left: auto;
          color: #687697;
          font-size: 8px;
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
          min-height: 365px;
          max-height: 50vh;
          overflow: auto;
          padding: 22px;
        }

        .message {
          max-width: 78%;
          margin-bottom: 17px;
        }

        .message.user {
          margin-left: auto;
        }

        .messageName {
          color: #8996b7;
          font-size: 9px;
          font-weight: 900;
          margin-bottom: 5px;
        }

        .message p {
          margin: 0;
          padding: 11px 13px;
          border: 1px solid #2e3857;
          border-radius: 4px 12px 12px 12px;
          background: #1b2440;
          color: #dbe1f0;
          line-height: 1.7;
          font-size: 12px;
          white-space: pre-wrap;
        }

        .message.user p {
          border-color: #6d51c0;
          border-radius: 12px 4px 12px 12px;
          background: #6242ba;
          color: white;
        }

        .thinking {
          color: #8793b1 !important;
          font-style: italic;
        }

        .psychology {
          margin: 0 20px 10px;
          padding: 11px 13px;
          border: 1px solid #514174;
          border-radius: 8px;
          background: #17152b;
        }

        .psychology span {
          color: #b997ff;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .psychology p {
          margin: 4px 0 0;
          color: #cfc5ed;
          font-size: 10px;
          line-height: 1.5;
        }

        .liveTip {
          display: flex;
          gap: 10px;
          margin: 0 20px 12px;
          padding: 10px 12px;
          border: 1px solid #2d3858;
          border-radius: 8px;
          background: #0e1527;
        }

        .liveTip > span {
          color: #a88ff0;
          font-size: 8px;
          font-weight: 900;
        }

        .liveTip strong {
          color: #d7ddef;
          font-size: 9px;
        }

        .liveTip p {
          margin: 3px 0 0;
          color: #7e8ba9;
          font-size: 9px;
          line-height: 1.45;
        }

        .composer {
          display: flex;
          gap: 8px;
          padding: 15px 20px;
          border-top: 1px solid #303a5c;
        }

        .composer input {
          min-width: 0;
          flex: 1;
          padding: 11px 12px;
          border: 1px solid #34405f;
          border-radius: 8px;
          outline: none;
          background: #0a1020;
          color: white;
          font-size: 11px;
        }

        .send {
          padding: 10px 18px;
          border-radius: 8px;
          background: #6949c8;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .finish {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-top: 1px solid #303a5c;
          color: #6f7c9e;
          font-size: 9px;
        }

        .finish button {
          color: #ad95f0;
          background: transparent;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .sidePanel {
          background: #0d1427;
        }

        .customerInfo {
          padding: 18px;
          border-bottom: 1px solid #303a5c;
        }

        .customerInfoHeader,
        .stateHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .customerInfoHeader {
          margin-bottom: 13px;
        }

        .customerInfoHeader h3,
        .stateHeader h3 {
          margin: 4px 0 0;
          font-size: 14px;
        }

        .researchBadge {
          padding: 4px 6px;
          border: 1px solid #35436a;
          border-radius: 5px;
          background: #18213b;
          color: #9cb2ef;
          font-size: 7px;
          font-weight: 900;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .infoItem {
          padding: 8px 9px;
          border: 1px solid #252f4b;
          border-radius: 7px;
          background: #131c32;
        }

        .infoItem span,
        .infoItem strong {
          display: block;
        }

        .infoItem span {
          color: #6f7d9f;
          font-size: 7px;
        }

        .infoItem strong {
          margin-top: 3px;
          color: #d2d9ea;
          font-size: 9px;
          line-height: 1.3;
        }

        .customerNotes {
          margin-top: 9px;
          padding-top: 9px;
          border-top: 1px solid #252f4b;
        }

        .customerNotes > p {
          margin: 0 0 5px;
          color: #7e8bab;
          font-size: 8px;
        }

        .customerNotes > div {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .customerNotes span {
          color: #687697;
          font-size: 7px;
        }

        .customerNotes b {
          color: #b8c2d9;
          font-size: 8px;
          font-weight: 600;
        }

        .statePanel {
          padding: 18px;
        }

        .live {
          padding: 4px 6px;
          border: 1px solid #285c49;
          border-radius: 5px;
          background: #10251f;
          color: #7cf0bb;
          font-size: 7px;
          font-weight: 900;
        }

        .stateList {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .stateItem {
          padding-bottom: 9px;
          border-bottom: 1px solid #242e49;
        }

        .stateTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .stateName {
          color: #cbd3e6;
          font-size: 9px;
          font-weight: 800;
        }

        .stateIcon {
          margin-right: 4px;
        }

        .stateTop strong {
          color: #c6b2ff;
          font-size: 12px;
        }

        .stateBar {
          height: 6px;
          overflow: hidden;
          border-radius: 8px;
          background: #242e49;
        }

        .stateBar i {
          display: block;
          height: 100%;
          border-radius: 8px;
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
          margin-top: 4px;
          color: #687697;
          font-size: 7px;
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
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #303a5c;
        }

        .stateLegend span {
          color: #687697;
          font-size: 7px;
        }

        /* RESULT */

        .result {
          padding: 38px;
          border: 1px solid #3d4770;
          border-radius: 16px;
          background:
            linear-gradient(
              145deg,
              #151d38,
              #0e1427
            );
          text-align: center;
          box-shadow:
            0 25px 80px #0006;
          animation: fadeIn 0.3s ease;
        }

        .resultBanner {
          display: inline-block;
          padding: 7px 11px;
          margin-bottom: 12px;
          border: 1px solid #665394;
          border-radius: 7px;
          background: #211b3d;
          color: #c6b1ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .result h2 {
          margin: 7px 0 0;
          color: #d1bfff;
          font-size: 72px;
          line-height: 1;
        }

        .result h2 small {
          color: #7985a5;
          font-size: 20px;
        }

        .scoreCaption {
          color: #8c98b7;
          font-size: 10px;
          margin: 8px 0 22px;
        }

        .resultLevel {
          display: flex;
          justify-content: center;
          gap: 1px;
          margin: 0 auto 25px;
        }

        .resultLevel div {
          min-width: 150px;
          padding: 12px;
          background: #151d34;
        }

        .resultLevel div:first-child {
          border-radius: 8px 0 0 8px;
        }

        .resultLevel div:last-child {
          border-radius: 0 8px 8px 0;
        }

        .resultLevel small,
        .resultLevel strong {
          display: block;
        }

        .resultLevel small {
          color: #7180a2;
          font-size: 7px;
        }

        .resultLevel strong {
          color: #d1c3f2;
          font-size: 12px;
          margin-top: 4px;
        }

        .scoreGrid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          text-align: left;
          margin-bottom: 20px;
        }

        .scoreGrid > div {
          padding: 12px;
          border: 1px solid #293451;
          border-radius: 9px;
          background: #151d34;
        }

        .scoreGrid span,
        .scoreGrid b {
          display: block;
        }

        .scoreGrid span {
          color: #9ca8c6;
          font-size: 8px;
        }

        .scoreGrid b {
          margin: 6px 0;
          font-size: 18px;
        }

        .scoreGrid b small {
          color: #7784a5;
          font-size: 8px;
        }

        .scoreGrid i {
          display: block;
          height: 4px;
          overflow: hidden;
          border-radius: 4px;
          background: #2d3858;
        }

        .scoreGrid em {
          display: block;
          height: 100%;
          border-radius: 4px;
          background: #a578ff;
        }

        .feedback {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          text-align: left;
        }

        .feedback article {
          padding: 16px;
          border: 1px solid #293451;
          border-radius: 9px;
          background: #151d34;
        }

        .feedback h3 {
          margin: 0 0 9px;
          color: #ad8aff;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .feedback p {
          margin: 5px 0;
          color: #bdc6da;
          font-size: 10px;
          line-height: 1.6;
        }

        .summary {
          max-width: 650px;
          margin: 20px auto;
          color: #c0c9dc;
          font-size: 11px;
          line-height: 1.7;
        }

        .resultActions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .secondaryButton {
          padding: 11px 16px;
          border: 1px solid #424e71;
          border-radius: 8px;
          background: #161e35;
          color: #c0c9dc;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .boardGrid {
            grid-template-columns: 1fr;
          }

          .guildSide {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .guildSide .difficultyCard {
            grid-column: 1 / -1;
          }

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
            border-right: 1px solid #303a5c;
            border-bottom: 0;
          }

          .statePanel {
            min-width: 0;
          }

          .stateList {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .scoreGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 18px 10px 40px;
          }

          .header {
            flex-wrap: wrap;
          }

          .back {
            order: 3;
            width: 100%;
          }

          .headerPlayer {
            margin-left: auto;
          }

          .loginScreen h2 {
            font-size: 28px;
          }

          .adventurerCard {
            align-items: flex-start;
          }

          .levelBadge {
            display: none;
          }

          .questCard {
            flex-direction: column;
          }

          .questIcon {
            width: 48px;
            height: 48px;
          }

          .guildSide {
            display: flex;
          }

          .questHead {
            align-items: flex-start;
            gap: 10px;
          }

          .battleMission {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .battleMission small {
            width: 100%;
            margin-left: 0;
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
            grid-template-columns: 1fr 1fr;
          }

          .message {
            max-width: 92%;
          }

          .composer {
            padding: 12px;
          }

          .finish span {
            display: none;
          }

          .feedback {
            grid-template-columns: 1fr;
          }

          .result {
            padding: 28px 15px;
          }

          .result h2 {
            font-size: 58px;
          }

          .resultLevel div {
            min-width: 0;
            width: 50%;
          }

          .resultActions {
            flex-direction: column;
          }

          .resultActions button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
