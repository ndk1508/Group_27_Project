// src/components/AuthStatus.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthStatus() {
  const { user, token, logout, isAuthenticated } = useAuth();

  return (
    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 12 }}>
      <div>
        <strong>Trạng thái:</strong>{" "}
        {isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập"}
      </div>

      {isAuthenticated && (
        <>
          <div><strong>User:</strong> {user?.name} — {user?.email}</div>
          <div style={{ marginTop: 6 }}>
            <strong>JWT token (rút gọn):</strong>{" "}
            {token.slice(0, 24)}...{token.slice(-12)}
          </div>
          <button
            onClick={logout}
            style={{
              marginTop: 8,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </>
      )}
    </div>
  );
}
