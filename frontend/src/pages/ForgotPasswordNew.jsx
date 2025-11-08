// src/pages/ForgotPasswordNew.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function ForgotPasswordNew() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setMsg(res.data?.message || "Đã gửi link reset mật khẩu qua email!");
      setMsgType("success");
      setEmail("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Gửi email thất bại");
      setMsgType("error");
    }
  };

  return (
    <div className="auth-container">
      <Link to="/login" className="back-home">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại đăng nhập
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Quên mật khẩu</h1>
          <p className="auth-subtitle">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {msg && (
          <div className={`alert alert-${msgType}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Gửi link reset
          </button>
        </form>

        <div className="form-footer">
          <p style={{ color: "#718096" }}>
            Nhớ lại mật khẩu?{" "}
            <Link to="/login" className="form-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
