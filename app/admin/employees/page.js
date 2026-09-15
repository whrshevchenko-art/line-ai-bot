"use client";

import { useEffect, useState } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/employees");

      if (!res.ok) {
        throw new Error("従業員一覧の取得に失敗しました");
      }

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "従業員一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      employee.name?.toLowerCase().includes(keyword) ||
      employee.department?.toLowerCase().includes(keyword) ||
      employee.office?.toLowerCase().includes(keyword)
    );
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>AI部長 MANAGEMENT</div>
            <h1 style={styles.title}>従業員管理</h1>
            <p style={styles.subtitle}>
              営業クエストを利用する従業員を管理します。
            </p>
          </div>

          <a href="/" style={styles.backButton}>
            ← AI部長へ戻る
          </a>
        </div>

        <section style={styles.toolbar}>
          <div style={styles.searchArea}>
            <span style={styles.searchIcon}>🔍</span>

            <input
              type="text"
              placeholder="名前・部署・拠点で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            type="button"
            onClick={loadEmployees}
            style={styles.refreshButton}
          >
            ↻ 更新
          </button>
        </section>

        <section style={styles.summary}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>TOTAL</div>
            <div style={styles.summaryValue}>{employees.length}</div>
            <div style={styles.summaryText}>従業員</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>ACTIVE</div>
            <div style={styles.summaryValue}>
              {employees.filter((employee) => employee.active).length}
            </div>
            <div style={styles.summaryText}>有効</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>QUEST</div>
            <div style={styles.summaryValue}>
              {
                employees.filter(
                  (employee) => employee.active && employee.quest_enabled
                ).length
              }
            </div>
            <div style={styles.summaryText}>営業クエスト利用可能</div>
          </div>
        </section>

        {error && (
          <div style={styles.error}>
            <strong>エラー：</strong> {error}
          </div>
        )}

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>従業員一覧</h2>
              <p style={styles.cardDescription}>
                {search
                  ? `${filteredEmployees.length}件 / ${employees.length}件`
                  : `${employees.length}件`}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={styles.empty}>
              <div style={styles.loadingIcon}>⏳</div>
              <p>従業員情報を読み込んでいます...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>👤</div>

              {search ? (
                <>
                  <h3 style={styles.emptyTitle}>
                    「{search}」に一致する従業員がいません
                  </h3>
                  <p style={styles.emptyText}>
                    検索条件を変えてみてください。
                  </p>
                </>
              ) : (
                <>
                  <h3 style={styles.emptyTitle}>
                    従業員がまだ登録されていません
                  </h3>
                  <p style={styles.emptyText}>
                    Supabaseのemployeesテーブルに従業員を登録すると、ここに表示されます。
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>名前</th>
                    <th style={styles.th}>部署</th>
                    <th style={styles.th}>拠点</th>
                    <th style={styles.th}>状態</th>
                    <th style={styles.th}>営業クエスト</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.employeeName}>
                          <div style={styles.avatar}>
                            {(employee.name || "?").charAt(0)}
                          </div>

                          <div>
                            <div style={styles.nameText}>
                              {employee.name || "名前未設定"}
                            </div>

                            <div style={styles.idText}>
                              ID: {employee.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        {employee.department || "-"}
                      </td>

                      <td style={styles.td}>
                        {employee.office || "-"}
                      </td>

                      <td style={styles.td}>
                        {employee.active ? (
                          <span style={styles.activeBadge}>
                            ● 有効
                          </span>
                        ) : (
                          <span style={styles.inactiveBadge}>
                            ● 無効
                          </span>
                        )}
                      </td>

                      <td style={styles.td}>
                        {employee.quest_enabled ? (
                          <span style={styles.questBadge}>
                            利用可能
                          </span>
                        ) : (
                          <span style={styles.disabledBadge}>
                            利用不可
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    padding: "40px 24px 80px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "30px",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.14em",
    color: "#667085",
    marginBottom: "8px",
  },

  title: {
    fontSize: "32px",
    lineHeight: "1.2",
    margin: 0,
    fontWeight: "800",
    letterSpacing: "-0.03em",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "#667085",
    fontSize: "14px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    color: "#344054",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  searchArea: {
    flex: 1,
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    padding: "0 16px 0 44px",
    borderRadius: "10px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },

  refreshButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "10px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    color: "#344054",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(16, 24, 40, 0.04)",
  },

  summaryLabel: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#98a2b3",
    marginBottom: "8px",
  },

  summaryValue: {
    fontSize: "30px",
    lineHeight: "1",
    fontWeight: "800",
  },

  summaryText: {
    marginTop: "7px",
    fontSize: "12px",
    color: "#667085",
  },

  error: {
    background: "#fff4f4",
    border: "1px solid #f3b7b7",
    color: "#b42318",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(16, 24, 40, 0.04)",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #eef0f4",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  cardDescription: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#667085",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
  },

  th: {
    textAlign: "left",
    padding: "14px 20px",
    background: "#f9fafb",
    borderBottom: "1px solid #eef0f4",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #f0f2f5",
  },

  td: {
    padding: "16px 20px",
    fontSize: "14px",
    color: "#344054",
    verticalAlign: "middle",
  },

  employeeName: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#4338ca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "800",
    flexShrink: 0,
  },

  nameText: {
    fontWeight: "800",
    color: "#172033",
  },

  idText: {
    marginTop: "3px",
    fontSize: "10px",
    color: "#98a2b3",
    maxWidth: "240px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#ecfdf3",
    color: "#027a48",
    fontSize: "12px",
    fontWeight: "700",
  },

  inactiveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "700",
  },

  questBadge: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#eef4ff",
    color: "#175cd3",
    fontSize: "12px",
    fontWeight: "700",
  },

  disabledBadge: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "700",
  },

  empty: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px 20px",
    color: "#667085",
  },

  loadingIcon: {
    fontSize: "28px",
    marginBottom: "12px",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "14px",
  },

  emptyTitle: {
    margin: 0,
    color: "#344054",
    fontSize: "16px",
  },

  emptyText: {
    margin: "8px 0 0",
    fontSize: "13px",
    maxWidth: "520px",
    lineHeight: "1.7",
  },
};
