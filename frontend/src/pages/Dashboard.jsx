// src/pages/Dashboard.jsx
import React from "react";
import AuthStatus from "../components/AuthStatus";

export default function Dashboard() {
  return (
    <div className="container">
      <div className="form-section" style={{ width: "100%" }}>
        <h2>Dashboard</h2>
        <p>Chào mừng! Bạn đã đăng nhập thành công.</p>
        <AuthStatus />
        <p style={{ marginTop: 12 }}>
          👉 Bạn có thể chuyển sang màn hình CRUD User hiện có của bạn sau khi
          đăng nhập (vd: liên kết đến trang quản lý người dùng).
        </p>
      </div>
    </div>
  );
}
