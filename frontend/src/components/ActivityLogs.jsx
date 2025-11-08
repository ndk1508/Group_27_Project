import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setErr("");
    try {
      // Endpoint backend có thể là /logs hoặc /api/logs; nếu backend khác, đổi path ở đây
      const res = await api.get("/logs");
      setLogs(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được logs. Kiểm tra endpoint /logs và token.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Activity Logs</h3>
        <div>
          <button
            onClick={loadLogs}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div>Đang tải...</div>}
      {err && <div style={{ color: "#dc2626" }}>{err}</div>}

      {!loading && !err && (
        <>
          {logs.length === 0 ? (
            <div style={{ color: "#6b7280" }}>Chưa có log nào.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>User</th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Action</th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>When</th>
                    <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Meta</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, idx) => (
                    <tr key={l._id || idx}>
                      <td style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>{l.userId || l.user || "-"}</td>
                      <td style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>{l.action}</td>
                      <td style={{ padding: 8, borderBottom: "1px solid #e5e7eb" }}>
                        {l.timestamp ? new Date(l.timestamp).toLocaleString() : l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid #e5e7eb", fontSize: 12, color: "#374151" }}>
                        {/* hiển thị ngắn gọn meta nếu có */}
                        {l.meta ? JSON.stringify(l.meta) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}