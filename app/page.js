"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [knowledge, setKnowledge] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const loadKnowledge = async () => {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    setKnowledge(data);
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

  const addKnowledge = async () => {
    if (!title || !category || !content) {
      alert("タイトル・カテゴリ・本文を全部入れてな");
      return;
    }

    setLoading(true);

    await fetch("/api/knowledge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        category,
        content,
      }),
    });

    setTitle("");
    setCategory("");
    setContent("");

    await loadKnowledge();

    setLoading(false);
  };

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AI部長 管理画面</h1>

      <p>営業ナレッジを管理する画面やで。</p>

      <hr />

      <h2>ナレッジ追加</h2>

      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <input
        type="text"
        placeholder="カテゴリ（営業マニュアル / 成功事例 / 失注事例 / FAQ など）"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <textarea
        placeholder="ナレッジ本文"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={addKnowledge}
        disabled={loading}
        style={{
          padding: "12px 24px",
          cursor: "pointer",
        }}
      >
        {loading ? "保存中..." : "ナレッジを保存"}
      </button>

      <hr />

      <h2>登録済みナレッジ</h2>

      {knowledge.length === 0 && (
        <p>まだナレッジは登録されてへん。</p>
      )}

      {knowledge.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{item.title}</h3>

          <p>
            <strong>カテゴリ：</strong>
            {item.category}
          </p>

          <p style={{ whiteSpace: "pre-wrap" }}>
            {item.content}
          </p>
        </div>
      ))}
    </main>
  );
}
