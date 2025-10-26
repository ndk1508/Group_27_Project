// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user hiện tại
  const loadProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      setUser(res.data || {});
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/api/profile", {
        name: user.name,
        email: user.email,
      });
      setUser(res.data.user);
      setMsg("✅ Cập nhật thành công!");
    } catch (err) {
      setMsg(err?.response?.data?.message || "❌ Cập nhật thất bại!");
    }
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Đang tải...</p>;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      {/* Thẻ hiển thị thông tin user */}
      <div className="list-section" style={{ marginBottom: 16 }}>
        <h2>Thông tin cá nhân</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
            }}
            title="Avatar"
          >
            {(user.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "#555" }}>{user.email}</div>
            <div style={{ marginTop: 4 }}>
              <span
                style={{
                  background: user.role === "admin" ? "#fee2e2" : "#e0f2fe",
                  color: user.role === "admin" ? "#b91c1c" : "#0369a1",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                role: {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form cập nhật */}
      <div className="form-section">
        <h3>Cập nhật thông tin</h3>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Họ và tên"
            value={user.name || ""}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
          <button type="submit">Cập nhật</button>
        </form>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>
    </div>
  );
}
