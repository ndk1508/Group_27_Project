import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.post("/api/auth/signup", formData);
      setMsg(res.data?.message || "Đăng ký thành công! Vui lòng đăng nhập.");
      setMsgType("success");
      setForm({ name: "", email: "", password: "" });
      setAvatarFile(null);
      
      // Tự động chuyển sang login sau 1.5s
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Đăng ký thất bại");
      setMsgType("error");
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="back-home">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Về trang chủ
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng ký</h1>
          <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu</p>
        </div>

        {msg && (
          <div className={`alert alert-${msgType}`}>
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ảnh đại diện (tùy chọn)</label>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="form-input"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>

          <button type="submit" className="btn-submit">
            Đăng ký
          </button>
        </form>

        <div className="form-footer">
          <p style={{ color: "#718096" }}>
            Đã có tài khoản?{" "}
            <Link to="/login" className="form-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
