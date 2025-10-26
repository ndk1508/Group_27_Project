import React, { useState } from "react";
import api from "../api/axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/signup", form);
      setMsg(res.data?.message || "Đăng ký thành công");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="form-section" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h2>Đăng ký</h2>
      <form onSubmit={onSubmit}>
        <input name="name" placeholder="Họ và tên" value={form.name} onChange={onChange} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={onChange} />
        <button type="submit">Đăng ký</button>
      </form>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
