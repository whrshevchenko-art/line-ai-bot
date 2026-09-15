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
  const [dragging, setDragging] = useState(false);
  const [activeMenu, setActiveMenu] = useState("knowledge");

  const loadKnowledge = async () => {
    try {
      const res = await fetch("/api/knowledge");
      const text = await res.text();

      if (!text) {
        console.error("ナレッジAPIが空のレスポンスを返しました");
        return;
      }

      const data = JSON.parse(text);

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

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        alert(
          `保存に失敗しました\n\nHTTPステータス: ${res.status}\n\nサーバーの返答:\n${text || "(空)"}`
        );
        return;
      }

      if (!res.ok) {
        alert(
          `保存に失敗しました\n\n${data.error || "不明なエラー"}`
        );
        return;
      }

      setTitle("");
      setCategory("");
      setContent("");

      await loadKnowledge();

      alert("ナレッジを保存したで！");
    } catch (error) {
      console.error("ナレッジ保存エラー:", error);

      alert(`保存に失敗しました\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

      const res = await fetch("/api/knowledge", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        alert(
          `PDF登録に失敗しました\n\nHTTPステータス: ${res.status}\n\nサーバーの返答:\n${text || "(空)"}`
        );
        return;
      }

      if (!res.ok) {
        alert(
          `PDF登録に失敗しました\n\nHTTPステータス: ${res.status}\n\n${data.error || "不明なエラー"}`
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

      alert(`PDF登録に失敗しました\n\n${error.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      alert("PDFファイルを選んでな");
      return;
    }

    setPdfFile(file);

    if (!pdfTitle) {
      setPdfTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #f5f7fb;
          color: #172033;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            "Hiragino Kaku Gothic ProN",
            "Hiragino Sans",
            Meiryo,
            sans-serif;
        }

        button,
        input,
        textarea {
          font: inherit;
        }

        button {
          border: none;
        }

        ::selection {
          background: #dbeafe;
        }
      `}</style>

      <div style={styles.app}>

        {/* =========================
            Sidebar
        ========================= */}

        <aside style={styles.sidebar}>

          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>
              AI
            </div>

            <div>
              <div style={styles.logoTitle}>
                AI部長
              </div>

              <div style={styles.logoSub}>
                SALES INTELLIGENCE
              </div>
            </div>
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarLabel}>
              MANAGEMENT
            </div>

            <button
              onClick={() => setActiveMenu("dashboard")}
              style={{
                ...styles.menuButton,
                ...(activeMenu === "dashboard"
                  ? styles.menuButtonActive
                  : {}),
              }}
            >
              <span style={styles.menuIcon}>⌂</span>
              ダッシュボード
            </button>

            <button
              onClick={() => setActiveMenu("knowledge")}
              style={{
                ...styles.menuButton,
                ...(activeMenu === "knowledge"
                  ? styles.menuButtonActive
                  : {}),
              }}
            >
              <span style={styles.menuIcon}>▤</span>
              ナレッジ
              <span style={styles.menuCount}>
                {knowledge.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("pdf")}
              style={{
                ...styles.menuButton,
                ...(activeMenu === "pdf"
                  ? styles.menuButtonActive
                  : {}),
              }}
            >
              <span style={styles.menuIcon}>□</span>
              PDF管理
            </button>

            <button
              onClick={() => setActiveMenu("ai")}
              style={{
                ...styles.menuButton,
                ...(activeMenu === "ai"
                  ? styles.menuButtonActive
                  : {}),
              }}
            >
              <span style={styles.menuIcon}>✦</span>
              AI設定
            </button>
  <a
  href="/sales-quest"
  style={{
    ...styles.menuButton,
    textDecoration: "none",
    boxSizing: "border-box",
  }}
>
  <span style={styles.menuIcon}>⚔</span>
  営業クエスト
</a>
          </div>

          <div style={styles.sidebarBottom}>
            <div style={styles.statusCard}>
              <div style={styles.statusDot} />

              <div>
                <div style={styles.statusTitle}>
                  AI部長 稼働中
                </div>

                <div style={styles.statusSub}>
                  LINE接続済み
                </div>
              </div>
            </div>

            <div style={styles.version}>
              AI Manager v1.0
            </div>
          </div>
        </aside>

        {/* =========================
            Main
        ========================= */}

        <main style={styles.main}>

          <header style={styles.header}>
            <div>
              <div style={styles.breadcrumb}>
                MANAGEMENT
                <span> / </span>
                KNOWLEDGE
              </div>

              <h1 style={styles.pageTitle}>
                ナレッジ管理
              </h1>

              <p style={styles.pageDescription}>
                AI部長が営業判断に利用する社内ナレッジを管理します。
              </p>
            </div>

            <div style={styles.headerStatus}>
              <span style={styles.headerStatusDot} />
              SYSTEM ONLINE
            </div>
          </header>

          {/* =========================
              Dashboard Cards
          ========================= */}

          <section style={styles.statsGrid}>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>▤</div>

              <div>
                <div style={styles.statLabel}>
                  TOTAL KNOWLEDGE
                </div>

                <div style={styles.statNumber}>
                  {knowledge.length}
                </div>

                <div style={styles.statDescription}>
                  登録済みナレッジ
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>□</div>

              <div>
                <div style={styles.statLabel}>
                  DOCUMENTS
                </div>

                <div style={styles.statNumber}>
                  {
                    knowledge.filter(
                      (item) =>
                        String(item.category || "").toLowerCase() ===
                        "pdf"
                    ).length
                  }
                </div>

                <div style={styles.statDescription}>
                  PDFドキュメント
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>✦</div>

              <div>
                <div style={styles.statLabel}>
                  AI STATUS
                </div>

                <div style={styles.statOnline}>
                  ONLINE
                </div>

                <div style={styles.statDescription}>
                  LINE AI接続中
                </div>
              </div>
            </div>

          </section>

          {/* =========================
              Content
          ========================= */}

          {activeMenu === "knowledge" && (
            <>
              {/* PDF Upload */}

              <section style={styles.sectionCard}>

                <div style={styles.sectionHeader}>
                  <div>
                    <div style={styles.sectionEyebrow}>
                      DOCUMENT IMPORT
                    </div>

                    <h2 style={styles.sectionTitle}>
                      PDFからナレッジを追加
                    </h2>

                    <p style={styles.sectionDescription}>
                      営業マニュアルや資料をアップロードすると、
                      AI部長が内容を参照できるようになります。
                    </p>
                  </div>

                  <div style={styles.pdfBadge}>
                    PDF
                  </div>
                </div>

                <div style={styles.formGrid}>

                  <div>
                    <label style={styles.label}>
                      タイトル
                    </label>

                    <input
                      type="text"
                      placeholder="例：2026年度 営業マニュアル"
                      value={pdfTitle}
                      onChange={(e) =>
                        setPdfTitle(e.target.value)
                      }
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>
                      カテゴリ
                    </label>

                    <input
                      type="text"
                      placeholder="例：営業マニュアル"
                      value={pdfCategory}
                      onChange={(e) =>
                        setPdfCategory(e.target.value)
                      }
                      style={styles.input}
                    />
                  </div>

                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => {
                    setDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);

                    const file =
                      e.dataTransfer.files?.[0];

                    handleFile(file);
                  }}
                  style={{
                    ...styles.dropZone,
                    ...(dragging
                      ? styles.dropZoneActive
                      : {}),
                  }}
                >

                  <div style={styles.uploadIcon}>
                    ↑
                  </div>

                  {pdfFile ? (
                    <>
                      <div style={styles.selectedFile}>
                        {pdfFile.name}
                      </div>

                      <div style={styles.dropDescription}>
                        PDFが選択されています
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.dropTitle}>
                        PDFをここにドラッグ＆ドロップ
                      </div>

                      <div style={styles.dropDescription}>
                        または
                      </div>

                      <label
                        htmlFor="pdf-upload"
                        style={styles.fileButton}
                      >
                        ファイルを選択
                      </label>
                    </>
                  )}

                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      handleFile(
                        e.target.files?.[0]
                      );
                    }}
                    style={{ display: "none" }}
                  />

                </div>

                <div style={styles.actionRow}>

                  <button
                    onClick={uploadPdf}
                    disabled={pdfLoading || !pdfFile}
                    style={{
                      ...styles.primaryButton,
                      ...(pdfLoading || !pdfFile
                        ? styles.buttonDisabled
                        : {}),
                    }}
                  >
                    {pdfLoading
                      ? "PDFを処理中..."
                      : "PDFをナレッジに登録"}
                  </button>

                  {pdfFile && (
                    <button
                      onClick={() => {
                        setPdfFile(null);
                        setPdfTitle("");

                        const input =
                          document.getElementById(
                            "pdf-upload"
                          );

                        if (input) {
                          input.value = "";
                        }
                      }}
                      style={styles.secondaryButton}
                    >
                      クリア
                    </button>
                  )}

                </div>

              </section>

              {/* Manual Knowledge */}

              <section style={styles.sectionCard}>

                <div style={styles.sectionHeader}>
                  <div>
                    <div style={styles.sectionEyebrow}>
                      MANUAL ENTRY
                    </div>

                    <h2 style={styles.sectionTitle}>
                      ナレッジを手動で追加
                    </h2>

                    <p style={styles.sectionDescription}>
                      FAQ、成功事例、営業ルールなどを直接登録できます。
                    </p>
                  </div>

                  <div style={styles.textBadge}>
                    TEXT
                  </div>
                </div>

                <div style={styles.formStack}>

                  <div>
                    <label style={styles.label}>
                      タイトル
                    </label>

                    <input
                      type="text"
                      placeholder="例：確アポの判断基準"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value)
                      }
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>
                      カテゴリ
                    </label>

                    <input
                      type="text"
                      placeholder="営業マニュアル / 成功事例 / FAQ など"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      style={styles.input}
                    />
                  </div>

                  <div>
                    <label style={styles.label}>
                      ナレッジ本文
                    </label>

                    <textarea
                      placeholder="AI部長に覚えさせたい内容を入力してください。"
                      value={content}
                      onChange={(e) =>
                        setContent(e.target.value)
                      }
                      rows={9}
                      style={{
                        ...styles.input,
                        ...styles.textarea,
                      }}
                    />
                  </div>

                </div>

                <div style={styles.actionRow}>

                  <button
                    onClick={addKnowledge}
                    disabled={loading}
                    style={{
                      ...styles.primaryButton,
                      ...(loading
                        ? styles.buttonDisabled
                        : {}),
                    }}
                  >
                    {loading
                      ? "保存中..."
                      : "ナレッジを保存"}
                  </button>

                </div>

              </section>

              {/* Knowledge List */}

              <section style={styles.listSection}>

                <div style={styles.listHeader}>
                  <div>
                    <div style={styles.sectionEyebrow}>
                      KNOWLEDGE BASE
                    </div>

                    <h2 style={styles.sectionTitle}>
                      登録済みナレッジ
                    </h2>
                  </div>

                  <div style={styles.knowledgeCount}>
                    {knowledge.length} 件
                  </div>
                </div>

                {knowledge.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      ▤
                    </div>

                    <div style={styles.emptyTitle}>
                      ナレッジはまだありません
                    </div>

                    <div style={styles.emptyDescription}>
                      PDFまたはテキストからナレッジを追加してください。
                    </div>
                  </div>
                ) : (
                  <div style={styles.knowledgeGrid}>

                    {knowledge.map((item) => (

                      <article
                        key={item.id}
                        style={styles.knowledgeCard}
                      >

                        <div style={styles.cardTop}>

                          <div
                            style={{
                              ...styles.cardType,
                              ...(String(
                                item.category || ""
                              ).toLowerCase() === "pdf"
                                ? styles.cardTypePdf
                                : {}),
                            }}
                          >
                            {String(
                              item.category || ""
                            ).toLowerCase() === "pdf"
                              ? "PDF"
                              : "DOC"}
                          </div>

                          <div style={styles.cardDate}>
                            {formatDate(
                              item.created_at
                            )}
                          </div>

                        </div>

                        <h3 style={styles.cardTitle}>
                          {item.title}
                        </h3>

                        <div style={styles.cardCategory}>
                          {item.category}
                        </div>

                        <p style={styles.cardContent}>
                          {item.content}
                        </p>

                        <div style={styles.cardFooter}>
                          <span>
                            ID #{item.id}
                          </span>

                          <span style={styles.aiReady}>
                            ● AI参照可能
                          </span>
                        </div>

                      </article>

                    ))}

                  </div>
                )}

              </section>
            </>
          )}

          {/* =========================
              Dashboard
          ========================= */}

          {activeMenu === "dashboard" && (
            <section style={styles.sectionCard}>

              <div style={styles.sectionEyebrow}>
                DASHBOARD
              </div>

              <h2 style={styles.sectionTitle}>
                AI部長ダッシュボード
              </h2>

              <p style={styles.sectionDescription}>
                現在のAI部長の状態です。
              </p>

              <div style={styles.dashboardPanel}>

                <div style={styles.dashboardStatusIcon}>
                  ✓
                </div>

                <div>
                  <div style={styles.dashboardStatusTitle}>
                    AI部長は正常に稼働しています
                  </div>

                  <div style={styles.dashboardStatusText}>
                    LINEからの質問に対して、
                    Supabaseに登録されたナレッジを参照して回答します。
                  </div>
                </div>

              </div>

            </section>
          )}

          {/* =========================
              PDF
          ========================= */}

          {activeMenu === "pdf" && (
            <section style={styles.sectionCard}>

              <div style={styles.sectionEyebrow}>
                PDF MANAGEMENT
              </div>

              <h2 style={styles.sectionTitle}>
                PDF管理
              </h2>

              <p style={styles.sectionDescription}>
                登録済みのPDFナレッジを確認できます。
              </p>

              <div style={styles.pdfList}>

                {knowledge
                  .filter(
                    (item) =>
                      String(
                        item.category || ""
                      ).toLowerCase() === "pdf"
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      style={styles.pdfItem}
                    >
                      <div style={styles.pdfItemIcon}>
                        PDF
                      </div>

                      <div>
                        <div style={styles.pdfItemTitle}>
                          {item.title}
                        </div>

                        <div style={styles.pdfItemSub}>
                          登録日：
                          {formatDate(
                            item.created_at
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

              </div>

            </section>
          )}

          {/* =========================
              AI Settings
          ========================= */}

          {activeMenu === "ai" && (
            <section style={styles.sectionCard}>

              <div style={styles.sectionEyebrow}>
                AI CONFIGURATION
              </div>

              <h2 style={styles.sectionTitle}>
                AI設定
              </h2>

              <p style={styles.sectionDescription}>
                AI部長の基本設定です。
              </p>

              <div style={styles.settingRow}>

                <div>
                  <div style={styles.settingTitle}>
                    AIナレッジ参照
                  </div>

                  <div style={styles.settingDescription}>
                    Supabaseに登録されたナレッジを回答に利用します。
                  </div>
                </div>

                <div style={styles.enabledBadge}>
                  ENABLED
                </div>

              </div>

              <div style={styles.settingRow}>

                <div>
                  <div style={styles.settingTitle}>
                    LINE連携
                  </div>

                  <div style={styles.settingDescription}>
                    LINE公式アカウントからAI部長を利用できます。
                  </div>
                </div>

                <div style={styles.enabledBadge}>
                  CONNECTED
                </div>

              </div>

            </section>
          )}

        </main>
      </div>
    </>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f7fb",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#101828",
    color: "#fff",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "4px 8px 30px",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.5px",
    boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
  },

  logoTitle: {
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },

  logoSub: {
    fontSize: "8px",
    color: "#98a2b3",
    letterSpacing: "1.2px",
    marginTop: "3px",
  },

  sidebarSection: {
    marginTop: "10px",
  },

  sidebarLabel: {
    fontSize: "9px",
    color: "#667085",
    fontWeight: 700,
    letterSpacing: "1.5px",
    padding: "0 12px 10px",
  },

  menuButton: {
    width: "100%",
    height: "46px",
    borderRadius: "10px",
    background: "transparent",
    color: "#98a2b3",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 12px",
    marginBottom: "4px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontSize: "13px",
    fontWeight: 500,
  },

  menuButtonActive: {
    background: "#1d2939",
    color: "#fff",
    boxShadow: "inset 3px 0 0 #8b5cf6",
  },

  menuIcon: {
    width: "18px",
    textAlign: "center",
    fontSize: "17px",
    opacity: 0.9,
  },

  menuCount: {
    marginLeft: "auto",
    background: "#344054",
    color: "#d0d5dd",
    fontSize: "10px",
    minWidth: "22px",
    height: "20px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "12px",
    background: "#182230",
    border: "1px solid #253247",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#12b76a",
    boxShadow: "0 0 0 4px rgba(18,183,106,0.1)",
  },

  statusTitle: {
    fontSize: "11px",
    fontWeight: 600,
  },

  statusSub: {
    fontSize: "9px",
    color: "#667085",
    marginTop: "2px",
  },

  version: {
    textAlign: "center",
    color: "#475467",
    fontSize: "9px",
    marginTop: "14px",
  },

  main: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
    padding: "38px 46px 70px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    gap: "20px",
  },

  breadcrumb: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#98a2b3",
    letterSpacing: "1.4px",
    marginBottom: "8px",
  },

  pageTitle: {
    fontSize: "30px",
    lineHeight: 1.2,
    margin: 0,
    fontWeight: 750,
    letterSpacing: "-1px",
    color: "#101828",
  },

  pageDescription: {
    margin: "9px 0 0",
    color: "#667085",
    fontSize: "13px",
  },

  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 12px",
    borderRadius: "20px",
    background: "#ecfdf3",
    color: "#027a48",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },

  headerStatusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#12b76a",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #eaecf0",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 5px rgba(16,24,40,0.025)",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f4f3ff",
    color: "#6941c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: 700,
  },

  statLabel: {
    fontSize: "8px",
    color: "#98a2b3",
    fontWeight: 700,
    letterSpacing: "1.1px",
  },

  statNumber: {
    fontSize: "24px",
    lineHeight: 1,
    fontWeight: 750,
    color: "#101828",
    marginTop: "4px",
  },

  statOnline: {
    fontSize: "18px",
    lineHeight: 1,
    fontWeight: 750,
    color: "#039855",
    marginTop: "6px",
  },

  statDescription: {
    fontSize: "10px",
    color: "#98a2b3",
    marginTop: "5px",
  },

  sectionCard: {
    background: "#fff",
    border: "1px solid #eaecf0",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 3px 8px rgba(16,24,40,0.025)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  sectionEyebrow: {
    fontSize: "8px",
    color: "#7f56d9",
    fontWeight: 800,
    letterSpacing: "1.4px",
    marginBottom: "7px",
  },

  sectionTitle: {
    fontSize: "19px",
    fontWeight: 700,
    color: "#101828",
    margin: 0,
    letterSpacing: "-0.4px",
  },

  sectionDescription: {
    color: "#667085",
    fontSize: "12px",
    lineHeight: 1.6,
    margin: "7px 0 0",
  },

  pdfBadge: {
    height: "28px",
    padding: "0 10px",
    borderRadius: "7px",
    background: "#fff1f3",
    color: "#c01048",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 800,
  },

  textBadge: {
    height: "28px",
    padding: "0 10px",
    borderRadius: "7px",
    background: "#eff8ff",
    color: "#175cd3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: 800,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "16px",
    marginBottom: "18px",
  },

  formStack: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 650,
    color: "#344054",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    border: "1px solid #d0d5dd",
    borderRadius: "9px",
    padding: "11px 13px",
    outline: "none",
    background: "#fff",
    color: "#101828",
    fontSize: "12px",
    boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
  },

  textarea: {
    resize: "vertical",
    lineHeight: 1.7,
    minHeight: "170px",
  },

  dropZone: {
    border: "1.5px dashed #d0d5dd",
    borderRadius: "13px",
    minHeight: "185px",
    background: "#fcfcfd",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
    transition: "all 0.2s ease",
  },

  dropZoneActive: {
    borderColor: "#7f56d9",
    background: "#faf8ff",
    boxShadow: "0 0 0 4px rgba(127,86,217,0.08)",
  },

  uploadIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#f4f3ff",
    color: "#6941c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: 600,
    marginBottom: "10px",
  },

  dropTitle: {
    fontSize: "12px",
    fontWeight: 650,
    color: "#344054",
  },

  dropDescription: {
    fontSize: "10px",
    color: "#98a2b3",
    marginTop: "5px",
  },

  selectedFile: {
    fontSize: "13px",
    fontWeight: 650,
    color: "#6941c6",
    maxWidth: "90%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  fileButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10px",
    padding: "8px 14px",
    borderRadius: "8px",
    background: "#fff",
    border: "1px solid #d0d5dd",
    color: "#344054",
    fontSize: "10px",
    fontWeight: 650,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
  },

  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "18px",
  },

  primaryButton: {
    padding: "11px 18px",
    borderRadius: "9px",
    background: "#6941c6",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(105,65,198,0.18)",
  },

  secondaryButton: {
    padding: "11px 16px",
    borderRadius: "9px",
    background: "#fff",
    color: "#475467",
    border: "1px solid #d0d5dd",
    fontSize: "11px",
    fontWeight: 650,
    cursor: "pointer",
  },

  buttonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  listSection: {
    marginTop: "32px",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "16px",
  },

  knowledgeCount: {
    color: "#667085",
    fontSize: "11px",
    fontWeight: 600,
  },

  knowledgeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "15px",
  },

  knowledgeCard: {
    background: "#fff",
    border: "1px solid #eaecf0",
    borderRadius: "14px",
    padding: "19px",
    boxShadow: "0 2px 5px rgba(16,24,40,0.025)",
    minWidth: 0,
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  cardType: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "22px",
    padding: "0 8px",
    borderRadius: "6px",
    background: "#eff8ff",
    color: "#175cd3",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },

  cardTypePdf: {
    background: "#fff1f3",
    color: "#c01048",
  },

  cardDate: {
    fontSize: "9px",
    color: "#98a2b3",
  },

  cardTitle: {
    fontSize: "14px",
    lineHeight: 1.4,
    margin: 0,
    fontWeight: 700,
    color: "#101828",
  },

  cardCategory: {
    display: "inline-block",
    marginTop: "8px",
    padding: "4px 7px",
    borderRadius: "5px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "8px",
    fontWeight: 600,
  },

  cardContent: {
    color: "#667085",
    fontSize: "10px",
    lineHeight: 1.65,
    margin: "12px 0 15px",
    display: "-webkit-box",
    WebkitLineClamp: 5,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
  },

  cardFooter: {
    borderTop: "1px solid #f2f4f7",
    paddingTop: "11px",
    display: "flex",
    justifyContent: "space-between",
    color: "#98a2b3",
    fontSize: "8px",
  },

  aiReady: {
    color: "#039855",
    fontWeight: 650,
  },

  emptyState: {
    background: "#fff",
    border: "1px dashed #d0d5dd",
    borderRadius: "14px",
    padding: "55px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f4f3ff",
    color: "#6941c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    fontSize: "20px",
  },

  emptyTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#344054",
  },

  emptyDescription: {
    marginTop: "5px",
    fontSize: "10px",
    color: "#98a2b3",
  },

  dashboardPanel: {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "13px",
    background: "#ecfdf3",
    border: "1px solid #abefc6",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  dashboardStatusIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#12b76a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  dashboardStatusTitle: {
    color: "#027a48",
    fontSize: "13px",
    fontWeight: 700,
  },

  dashboardStatusText: {
    color: "#039855",
    fontSize: "10px",
    marginTop: "4px",
  },

  pdfList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "24px",
  },

  pdfItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px",
    border: "1px solid #eaecf0",
    borderRadius: "10px",
  },

  pdfItemIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background: "#fff1f3",
    color: "#c01048",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "8px",
    fontWeight: 800,
  },

  pdfItemTitle: {
    fontSize: "12px",
    fontWeight: 650,
    color: "#344054",
  },

  pdfItemSub: {
    fontSize: "9px",
    color: "#98a2b3",
    marginTop: "3px",
  },

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px 0",
    borderBottom: "1px solid #f2f4f7",
  },

  settingTitle: {
    fontSize: "12px",
    fontWeight: 650,
    color: "#344054",
  },

  settingDescription: {
    fontSize: "10px",
    color: "#98a2b3",
    marginTop: "4px",
  },

  enabledBadge: {
    padding: "6px 9px",
    borderRadius: "6px",
    background: "#ecfdf3",
    color: "#027a48",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
};
