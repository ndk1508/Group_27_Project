import React, { useState } from "react";
import api from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/login", form);
      const { token, user, message } = res.data || {};
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user || null));
        setToken(token);
        setMsg(message || "Đăng nhập thành công");
      } else {
        setMsg("Không nhận được token");
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const onLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setMsg("Đã đăng xuất");
  };

  return (
    <div className="form-section" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={onSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={onChange} />
        <button type="submit">Đăng nhập</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <strong>JWT token (rút gọn):</strong>{" "}
        {token ? `${token.slice(0, 24)}...${token.slice(-12)}` : "(chưa có)"}
      </div>

      <button onClick={onLogout} style={{ marginTop: 8 }}>Đăng xuất</button>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
