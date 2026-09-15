"use client";

import { useEffect, useRef, useState } from "react";

const labels = { problem_discovery: "課題発掘", numbers: "数字確認", problem_awareness: "課題認識", interest: "興味喚起", conversation_control: "会話コントロール" };

function getUserId() {
  const key = "sales-quest-user-id";
  let id = window.localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); window.localStorage.setItem(key, id); }
  return id;
}

export default function SalesQuestPage() {
  const [userId, setUserId] = useState("");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ level: 1, exp: 0, average_score: 0, best_score: 0 });
  const endRef = useRef(null);

  useEffect(() => setUserId(getUserId()), []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  async function request(url, body) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "通信に失敗しました。");
    return data;
  }

  async function start() {
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await request("/api/sales-quest/start", { userId });
      setSession(data.session);
      setStats(data.stats);
      setMessages([{ role: "assistant", content: data.opening }]);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function send(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || !session || loading) return;
    setInput(""); setError(""); setMessages((old) => [...old, { role: "user", content }]); setLoading(true);
    try {
      const data = await request("/api/sales-quest/chat", { sessionId: session.id, message: content });
      setMessages((old) => [...old, { role: "assistant", content: data.reply }]);
      setSession((old) => ({ ...old, status: data.status }));
    } catch (e) { setMessages((old) => old.slice(0, -1)); setInput(content); setError(e.message); } finally { setLoading(false); }
  }

  async function finish() {
    if (!session || loading) return;
    setLoading(true); setError("");
    try {
      const data = await request("/api/sales-quest/finish", { sessionId: session.id });
      setResult(data); setStats(data.stats || stats);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  function reset() { setSession(null); setMessages([]); setResult(null); setInput(""); setError(""); }
  const expInLevel = stats.exp % 100;

  return <main className="page">
    <style jsx global>{`
      *{box-sizing:border-box} body{margin:0;background:#090d18;color:#edf1ff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Kaku Gothic ProN",Meiryo,sans-serif} button,input{font:inherit} button{border:0} 
    `}</style>
    <section className="shell">
      <header><a href="/" className="back">← AI部長に戻る</a><div className="brand"><span>⚔</span><div><small>SALES INTELLIGENCE TRAINING</small><h1>営業クエスト</h1></div></div><div className="level">営業 Lv.{stats.level}<div className="bar"><i style={{ width: `${expInLevel}%` }} /></div><small>{expInLevel} / 100 EXP</small></div></header>
      {error && <div className="error">{error}</div>}
      {!session && !result && <section className="startCard">
        <p className="eyebrow">STAGE 1</p><h2>興味なし → 興味あり</h2><p className="lead">警戒している店舗オーナーから、「もう少し詳しく聞きたい」を引き出しましょう。正解の選択肢はありません。自由に営業してください。</p>
        <div className="rules"><span>🎯 課題を聞き出す</span><span>🔢 数字で状況を捉える</span><span>💬 興味を引き出す</span></div>
        <button className="primary" disabled={!userId || loading} onClick={start}>{loading ? "顧客を準備中..." : "QUEST START"}</button>
        <div className="miniStats"><div><b>{stats.average_score || "-"}</b><small>平均スコア</small></div><div><b>{stats.best_score || "-"}</b><small>最高スコア</small></div></div>
      </section>}
      {session && !result && <section className="quest">
        <div className="questHead"><div><p className="eyebrow">STAGE 1 / LIVE ROLEPLAY</p><h2>{session.customer.industry}オーナー</h2><p>{session.customer.business_size}・{session.customer.owner_type}</p></div><div className={`status ${session.status}`}>{session.status === "cleared" ? "興味あり！" : session.status === "failed" ? "会話終了" : "商談中"}</div></div>
        <div className="chat">{messages.map((item, index) => <div className={`message ${item.role}`} key={index}><span>{item.role === "user" ? "あなた" : "顧客"}</span><p>{item.content}</p></div>)}{loading && <div className="message assistant"><span>顧客</span><p className="thinking">考えています…</p></div>}<div ref={endRef}/></div>
        <form onSubmit={send} className="composer"><input value={input} disabled={loading || session.status !== "in_progress"} onChange={(e) => setInput(e.target.value)} placeholder="自由に営業してみよう…" maxLength={5000}/><button className="send" disabled={loading || !input.trim() || session.status !== "in_progress"}>送信</button></form>
        <div className="finish"><span>会話を終えたら、AI評価を受けましょう。</span><button onClick={finish} disabled={loading}>会話を終了して採点</button></div>
      </section>}
      {result && <section className="result">
        <p className="eyebrow">{result.status === "cleared" ? "QUEST CLEAR" : "QUEST RESULT"}</p><h2>{result.evaluation.total}<small> / 100</small></h2><p className="scoreCaption">営業スコア　+{result.expGained} EXP</p>
        <div className="scoreGrid">{Object.entries(result.evaluation.scores).map(([key, value]) => <div key={key}><span>{labels[key]}</span><b>{value}<small>/20</small></b><i><em style={{ width: `${value * 5}%` }}/></i></div>)}</div>
        <div className="feedback"><article><h3>GOOD</h3>{result.evaluation.goodPoints.map((item, index) => <p key={index}>・{item}</p>)}</article><article><h3>NEXT</h3>{result.evaluation.improvements.map((item, index) => <p key={index}>・{item}</p>)}</article></div>
        <div className="summary">{result.evaluation.summary}</div><button className="primary" onClick={reset}>もう一度挑戦する</button>
      </section>}
    </section>
    <style jsx>{`
      .page{min-height:100vh;padding:36px 18px;background:radial-gradient(circle at top,#24305b 0,#0b1020 43%,#090d18 100%)}.shell{max-width:980px;margin:auto}header{display:flex;align-items:center;gap:24px;min-height:70px;margin-bottom:38px}.back{color:#a9b5dc;text-decoration:none;font-size:13px}.brand{display:flex;align-items:center;gap:12px;margin-right:auto}.brand>span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#9c6cff,#5a36d8);font-size:20px}.brand small,.eyebrow{font-size:10px;letter-spacing:1.5px;color:#ac95ff;font-weight:800;margin:0}.brand h1{font-size:21px;margin:2px 0 0}.level{font-weight:700;font-size:13px;text-align:right}.level small{display:block;color:#9ca8c9;font-size:10px;margin-top:5px}.bar{height:5px;width:130px;background:#252e4a;border-radius:9px;margin-top:7px;overflow:hidden}.bar i{height:100%;display:block;background:#a578ff;border-radius:9px}.startCard,.quest,.result{background:rgba(20,27,49,.9);border:1px solid #323d63;border-radius:20px;box-shadow:0 20px 70px rgba(0,0,0,.25)}.startCard{text-align:center;padding:68px 40px}.startCard h2,.quest h2{font-size:28px;margin:8px 0 12px}.lead{max-width:590px;color:#bdc6df;font-size:14px;line-height:1.8;margin:0 auto 26px}.rules{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:0 0 31px}.rules span{font-size:12px;padding:9px 12px;background:#202a48;border-radius:8px;color:#d6dcf0}.primary,.send{background:linear-gradient(135deg,#9b6bff,#7046eb);color:white;font-weight:800;border-radius:10px;padding:13px 24px;cursor:pointer;box-shadow:0 8px 20px #6f45eb33}.primary:disabled,.send:disabled{opacity:.5;cursor:not-allowed}.miniStats{display:flex;justify-content:center;gap:1px;margin:44px auto 0;max-width:360px;border-top:1px solid #303a5c;padding-top:22px}.miniStats div{width:50%}.miniStats b{display:block;font-size:24px}.miniStats small,.scoreCaption{display:block;color:#9ca8c9;font-size:11px;margin-top:5px}.quest{overflow:hidden}.questHead{display:flex;justify-content:space-between;padding:24px 28px;border-bottom:1px solid #303a5c}.questHead h2{font-size:20px;margin:5px 0}.questHead p:not(.eyebrow){font-size:12px;color:#aab5d1;margin:0}.status{height:max-content;padding:8px 11px;border-radius:20px;background:#243052;color:#bfcaf1;font-size:11px;font-weight:800}.status.cleared{background:#164a3a;color:#87f5c0}.status.failed{background:#532a38;color:#ffc0cf}.chat{min-height:370px;max-height:52vh;overflow:auto;padding:25px}.message{max-width:78%;margin-bottom:18px}.message.user{margin-left:auto}.message span{font-size:10px;font-weight:800;color:#acb7d5}.message p{background:#222b48;border-radius:4px 13px 13px 13px;padding:12px 14px;margin:5px 0 0;line-height:1.65;font-size:13px;white-space:pre-wrap}.message.user p{background:#7850e8;border-radius:13px 4px 13px 13px}.thinking{color:#aab5d1;font-style:italic}.composer{display:flex;gap:10px;padding:18px 22px;border-top:1px solid #303a5c}.composer input{min-width:0;flex:1;color:white;background:#11172a;border:1px solid #374365;border-radius:10px;padding:12px 13px;outline:none}.send{padding:11px 18px}.finish{border-top:1px solid #303a5c;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;color:#99a7c8;font-size:11px}.finish button{cursor:pointer;color:#c9b9ff;background:transparent;font-weight:700}.result{text-align:center;padding:40px}.result h2{font-size:68px;line-height:1;margin:8px 0 0;color:#cfb8ff}.result h2 small{font-size:21px;color:#8995b8}.scoreCaption{margin-bottom:32px}.scoreGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;text-align:left;margin-bottom:28px}.scoreGrid>div{padding:13px;background:#171f37;border-radius:11px}.scoreGrid span{font-size:10px;color:#aeb8d2;display:block}.scoreGrid b{font-size:21px;display:block;margin:7px 0}.scoreGrid b small{font-size:10px;color:#8e9ab9}.scoreGrid i{display:block;height:4px;border-radius:4px;background:#2d3858;overflow:hidden}.scoreGrid em{display:block;height:100%;background:#a578ff}.feedback{display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left}.feedback article{padding:18px;background:#171f37;border-radius:11px}.feedback h3{color:#ad8aff;margin:0 0 10px;font-size:11px;letter-spacing:1px}.feedback p,.summary{font-size:12px;color:#c4cde1;line-height:1.65;margin:5px 0}.summary{max-width:650px;margin:24px auto}.error{padding:12px 15px;border:1px solid #843b55;color:#ffc3d0;background:#42202c;border-radius:10px;margin-bottom:18px;font-size:13px}@media(max-width:650px){.page{padding:20px 12px}header{flex-wrap:wrap;margin-bottom:24px}.back{order:3;width:100%}.level{margin-left:auto}.startCard,.result{padding:36px 20px}.startCard h2{font-size:23px}.scoreGrid{grid-template-columns:repeat(2,1fr)}.questHead{padding:18px}.composer{padding:13px}.finish{gap:13px}.finish span{display:none}.feedback{grid-template-columns:1fr}.message{max-width:90%}}
    `}</style>
  </main>;
}
