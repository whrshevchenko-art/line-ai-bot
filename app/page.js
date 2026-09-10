"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [knowledge, setKnowledge] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfCategory, setPdfCategory] = useState("PDF");

  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge");
      const data = await res.json();

      if (Array.isArray(data)) {
        setKnowledge(data);
      }
    } catch (error) {
      console.error("ナレッジ取得エラー:", error);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

  // =========================
  // 通常のナレッジ追加
  // =========================
  const addKnowledge = async () => {
    if (!title || !category || !content) {
      alert("タイトル・カテゴリ・本文を全部入れてな");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/knowledge", {
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

      const data = await res.json();

      if (!res.ok) {
        alert(`保存に失敗しました: ${data.error || "不明なエラー"}`);
        return;
      }

      setTitle("");
      setCategory("");
      setContent("");

      await loadKnowledge();

      alert("ナレッジを保存したで！");
    } catch (error) {
      console.error("ナレッジ保存エラー:", error);
      alert(`保存に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PDFアップロード
  // =========================
  const uploadPdf = async () => {
    if (!pdfFile) {
      alert("PDFファイルを選んでな");
      return;
    }

    setPdfLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", pdfFile);
      formData.append("title", pdfTitle || pdfFile.name);
      formData.append("category", pdfCategory || "PDF");

      console.log("PDFアップロード開始:", pdfFile.name);

      const res = await fetch("/api/knowledge", {
        method: "POST",
        body: formData,
      });

      console.log("APIレスポンス:", res.status);

      const data = await res.json();

      console.log("APIデータ:", data);

      if (!res.ok) {
        alert(
          `PDF登録に失敗しました\n\nステータス: ${res.status}\n\n${data.error || "不明なエラー"}`
        );
        return;
      }

      setPdfFile(null);
      setPdfTitle("");
      setPdfCategory("PDF");

      const fileInput = document.getElementById("pdf-upload");

      if (fileInput) {
        fileInput.value = "";
      }

      await loadKnowledge();

      alert("PDFをナレッジに登録したで！");
    } catch (error) {
      console.error("PDFアップロードエラー:", error);

      alert(
        `PDF登録に失敗しました\n\nエラー内容:\n${error.message}`
      );
    } finally {
      setPdfLoading(false);
    }
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

      {/* =========================
          PDFアップロード
      ========================= */}
      <h2>📄 PDFからナレッジ追加</h2>

      <input
        type="text"
        placeholder="PDFのタイトル（空欄ならファイル名）"
        value={pdfTitle}
        onChange={(e) => setPdfTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <input
        type="text"
        placeholder="カテゴリ"
        value={pdfCategory}
        onChange={(e) => setPdfCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          setPdfFile(e.target.files?.[0] || null);
        }}
        style={{
          marginBottom: "10px",
        }}
      />

      {pdfFile && (
        <p>
          選択中：<strong>{pdfFile.name}</strong>
        </p>
      )}

      <button
        onClick={uploadPdf}
        disabled={pdfLoading}
        style={{
          padding: "12px 24px",
          cursor: pdfLoading ? "not-allowed" : "pointer",
        }}
      >
        {pdfLoading ? "PDF処理中..." : "PDFを登録"}
      </button>

      <hr />

      {/* =========================
          通常のナレッジ追加
      ========================= */}
      <h2>📝 ナレッジ追加</h2>

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
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "保存中..." : "ナレッジを保存"}
      </button>

      <hr />

      {/* =========================
          登録済みナレッジ
      ========================= */}
      <h2>📚 登録済みナレッジ</h2>

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

          <p
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {item.content}
          </p>
        </div>
      ))}
    </main>
  );
}
