"use client";

import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  id: "",
  name: "",
  department: "",
  office: "",
  active: true,
  quest_enabled: true,
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/employees", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "従業員一覧の取得に失敗しました");
      }

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

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return employees;

    return employees.filter((employee) => {
      return (
        employee.name?.toLowerCase().includes(keyword) ||
        employee.department?.toLowerCase().includes(keyword) ||
        employee.office?.toLowerCase().includes(keyword)
      );
    });
  }, [employees, search]);

  function openAddModal() {
    setEditing(false);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(employee) {
    setEditing(true);

    setForm({
      id: employee.id || "",
      name: employee.name || "",
      department: employee.department || "",
      office: employee.office || "",
      active: employee.active !== false,
      quest_enabled: employee.quest_enabled !== false,
    });

    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditing(false);
    setForm(emptyForm);
  }

  function updateForm(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveEmployee(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("名前を入力してください");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        department: form.department.trim(),
        office: form.office.trim(),
        active: form.active,
        quest_enabled: form.quest_enabled,
      };

      let res;

      if (editing) {
        res = await fetch("/api/employees", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: form.id,
            ...payload,
          }),
        });
      } else {
        res = await fetch("/api/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            (editing
              ? "従業員情報の更新に失敗しました"
              : "従業員の登録に失敗しました")
        );
      }

      setModalOpen(false);
      setEditing(false);
      setForm(emptyForm);

      setMessage(
        editing
          ? "従業員情報を更新しました"
          : "従業員を登録しました"
      );

      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError(err.message || "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function toggleEmployee(employee, field) {
    try {
      setError("");
      setMessage("");

      const newValue = !employee[field];

      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: employee.id,
          [field]: newValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更新に失敗しました");
      }

      setMessage(
        field === "active"
          ? newValue
            ? `${employee.name}さんを有効にしました`
            : `${employee.name}さんを無効にしました`
          : newValue
          ? `${employee.name}さんの営業クエストを利用可能にしました`
          : `${employee.name}さんの営業クエストを利用不可にしました`
      );

      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError(err.message || "更新に失敗しました");
    }
  }

  const totalCount = employees.length;

  const activeCount = employees.filter(
    (employee) => employee.active
  ).length;

  const questCount = employees.filter(
    (employee) => employee.active && employee.quest_enabled
  ).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
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
        </header>

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={styles.success}>
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        <section style={styles.summary}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>TOTAL</div>
            <div style={styles.summaryValue}>{totalCount}</div>
            <div style={styles.summaryText}>登録従業員</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>ACTIVE</div>
            <div style={styles.summaryValue}>{activeCount}</div>
            <div style={styles.summaryText}>現在有効</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>QUEST</div>
            <div style={styles.summaryValue}>{questCount}</div>
            <div style={styles.summaryText}>
              営業クエスト利用可能
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.toolbar}>
            <div style={styles.searchArea}>
              <span style={styles.searchIcon}>🔍</span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="名前・部署・拠点で検索"
                style={styles.searchInput}
              />
            </div>

            <button
              type="button"
              onClick={loadEmployees}
              disabled={loading}
              style={styles.refreshButton}
            >
              ↻ 更新
            </button>

            <button
              type="button"
              onClick={openAddModal}
              style={styles.addButton}
            >
              ＋ 従業員を追加
            </button>
          </div>

          <div style={styles.listHeader}>
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
              <div style={styles.emptyIcon}>⏳</div>
              <div style={styles.emptyTitle}>
                読み込み中...
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>👤</div>

              {search ? (
                <>
                  <div style={styles.emptyTitle}>
                    「{search}」に一致する従業員がいません
                  </div>

                  <div style={styles.emptyText}>
                    名前・部署・拠点を確認してください。
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.emptyTitle}>
                    従業員がまだ登録されていません
                  </div>

                  <div style={styles.emptyText}>
                    「＋ 従業員を追加」から登録できます。
                  </div>

                  <button
                    type="button"
                    onClick={openAddModal}
                    style={styles.emptyButton}
                  >
                    ＋ 最初の従業員を登録
                  </button>
                </>
              )}
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>従業員</th>
                    <th style={styles.th}>部署</th>
                    <th style={styles.th}>拠点</th>
                    <th style={styles.th}>状態</th>
                    <th style={styles.th}>営業クエスト</th>
                    <th style={styles.th}>操作</th>
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
                              {employee.id}
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
                        <button
                          type="button"
                          onClick={() =>
                            toggleEmployee(employee, "active")
                          }
                          style={
                            employee.active
                              ? styles.activeBadge
                              : styles.inactiveBadge
                          }
                        >
                          {employee.active
                            ? "● 有効"
                            : "● 無効"}
                        </button>
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleEmployee(
                              employee,
                              "quest_enabled"
                            )
                          }
                          style={
                            employee.quest_enabled
                              ? styles.questBadge
                              : styles.disabledBadge
                          }
                        >
                          {employee.quest_enabled
                            ? "利用可能"
                            : "利用不可"}
                        </button>
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(employee)
                          }
                          style={styles.editButton}
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div style={styles.overlay} onMouseDown={closeModal}>
          <div
            style={styles.modal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalEyebrow}>
                  EMPLOYEE
                </div>

                <h2 style={styles.modalTitle}>
                  {editing
                    ? "従業員情報を編集"
                    : "従業員を追加"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveEmployee}>
              <div style={styles.form}>
                <label style={styles.label}>
                  名前
                  <span style={styles.required}>必須</span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      updateForm("name", e.target.value)
                    }
                    placeholder="例：山田 太郎"
                    style={styles.input}
                    autoFocus
                  />
                </label>

                <label style={styles.label}>
                  部署

                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      updateForm(
                        "department",
                        e.target.value
                      )
                    }
                    placeholder="例：営業部"
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  拠点

                  <input
                    type="text"
                    value={form.office}
                    onChange={(e) =>
                      updateForm("office", e.target.value)
                    }
                    placeholder="例：大阪"
                    style={styles.input}
                  />
                </label>

                <div style={styles.switchSection}>
                  <div style={styles.switchRow}>
                    <div>
                      <div style={styles.switchTitle}>
                        有効
                      </div>

                      <div style={styles.switchDescription}>
                        無効にするとログイン候補から除外できます。
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "active",
                          !form.active
                        )
                      }
                      style={
                        form.active
                          ? styles.switchOn
                          : styles.switchOff
                      }
                    >
                      <span
                        style={
                          form.active
                            ? styles.switchKnobOn
                            : styles.switchKnobOff
                        }
                      />
                    </button>
                  </div>

                  <div style={styles.switchRow}>
                    <div>
                      <div style={styles.switchTitle}>
                        営業クエスト
                      </div>

                      <div style={styles.switchDescription}>
                        この従業員が営業クエストを利用できます。
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "quest_enabled",
                          !form.quest_enabled
                        )
                      }
                      style={
                        form.quest_enabled
                          ? styles.switchOn
                          : styles.switchOff
                      }
                    >
                      <span
                        style={
                          form.quest_enabled
                            ? styles.switchKnobOn
                            : styles.switchKnobOff
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={styles.cancelButton}
                >
                  キャンセル
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving
                    ? "保存中..."
                    : editing
                    ? "変更を保存"
                    : "従業員を登録"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

  error: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#fff4f4",
    border: "1px solid #f3b7b7",
    color: "#b42318",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
    fontSize: "14px",
  },

  success: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "#ecfdf3",
    border: "1px solid #abefc6",
    color: "#027a48",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "16px",
    fontSize: "14px",
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

  card: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(16, 24, 40, 0.04)",
    overflow: "hidden",
  },

  toolbar: {
    display: "flex",
    gap: "10px",
    padding: "20px 24px",
    borderBottom: "1px solid #eef0f4",
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
    height: "46px",
    boxSizing: "border-box",
    padding: "0 16px 0 44px",
    borderRadius: "10px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },

  refreshButton: {
    height: "46px",
    padding: "0 16px",
    borderRadius: "10px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    color: "#344054",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  addButton: {
    height: "46px",
    padding: "0 18px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  listHeader: {
    padding: "20px 24px 14px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  cardDescription: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#667085",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "13px 20px",
    background: "#f9fafb",
    borderTop: "1px solid #eef0f4",
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
    width: "40px",
    height: "40px",
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
    maxWidth: "220px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  activeBadge: {
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#ecfdf3",
    color: "#027a48",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  inactiveBadge: {
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  questBadge: {
    border: "none",
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eef4ff",
    color: "#175cd3",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  disabledBadge: {
    border: "none",
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f2f4f7",
    color: "#667085",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  editButton: {
    border: "1px solid #d9dee8",
    background: "#ffffff",
    color: "#344054",
    padding: "7px 13px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  empty: {
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px 20px",
    color: "#667085",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "14px",
  },

  emptyTitle: {
    color: "#344054",
    fontSize: "16px",
    fontWeight: "800",
  },

  emptyText: {
    marginTop: "8px",
    fontSize: "13px",
  },

  emptyButton: {
    marginTop: "18px",
    padding: "11px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "24px 24px 20px",
    borderBottom: "1px solid #eef0f4",
  },

  modalEyebrow: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.14em",
    color: "#98a2b3",
    marginBottom: "6px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: "800",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid #e4e7ec",
    background: "#ffffff",
    color: "#667085",
    fontSize: "22px",
    lineHeight: "1",
    cursor: "pointer",
  },

  form: {
    padding: "24px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "800",
    color: "#344054",
    marginBottom: "18px",
  },

  required: {
    marginLeft: "7px",
    padding: "3px 6px",
    borderRadius: "5px",
    background: "#fff1f3",
    color: "#c01048",
    fontSize: "9px",
    fontWeight: "800",
  },

  input: {
    display: "block",
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    marginTop: "8px",
    padding: "0 13px",
    border: "1px solid #d9dee8",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#172033",
    fontSize: "14px",
    outline: "none",
  },

  switchSection: {
    marginTop: "8px",
    borderTop: "1px solid #eef0f4",
  },

  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px 0",
    borderBottom: "1px solid #eef0f4",
  },

  switchTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#344054",
  },

  switchDescription: {
    marginTop: "4px",
    fontSize: "11px",
    lineHeight: "1.5",
    color: "#98a2b3",
  },

  switchOn: {
    width: "46px",
    height: "26px",
    border: "none",
    borderRadius: "999px",
    background: "#111827",
    padding: "3px",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end",
  },

  switchOff: {
    width: "46px",
    height: "26px",
    border: "none",
    borderRadius: "999px",
    background: "#d0d5dd",
    padding: "3px",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-start",
  },

  switchKnobOn: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ffffff",
  },

  switchKnobOff: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ffffff",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "18px 24px",
    borderTop: "1px solid #eef0f4",
    background: "#f9fafb",
  },

  cancelButton: {
    height: "42px",
    padding: "0 17px",
    borderRadius: "9px",
    border: "1px solid #d9dee8",
    background: "#ffffff",
    color: "#344054",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    height: "42px",
    padding: "0 20px",
    borderRadius: "9px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
  },
};
