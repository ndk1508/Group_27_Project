import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
  const res = await api.post("/login", form); // backend trả {token}
  // If backend returns refreshToken and user, pass through; otherwise use legacy token
  const { accessToken, refreshToken, user, token: legacyToken } = res.data || {};
  const effectiveToken = accessToken || legacyToken;
  login(effectiveToken, user, refreshToken);
      alert("Đăng nhập thành công!");
    } catch (err) {
      console.error(err);
      alert("Sai email/mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange}/>
      <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={onChange}/>
      <button disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
    </form>
  );
}
