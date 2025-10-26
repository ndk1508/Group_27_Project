import React, { useState } from "react";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setMsg(res.data?.message || "Đã gửi token nếu email tồn tại.");
      setEmail("");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Lỗi gửi token");
    }
  };

  return (
    <div className="form-section" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Nhập email để nhận token"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi token reset</button>
      </form>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      <p style={{ marginTop: 6 }}>👉 Mở email để lấy <b>token</b>.</p>
    </div>
  );
}
