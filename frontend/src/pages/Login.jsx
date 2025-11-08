// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { accessToken, refreshToken, user, message, token: legacyToken } = res.data || {};
      const effectiveToken = accessToken || legacyToken;
      
      if (!effectiveToken || !user) {
        setMsg("Không nhận được token");
        setMsgType("error");
        return;
      }

      // Lưu vào AuthContext + localStorage
      setAuth(effectiveToken, user);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      
      setMsg(message || "Đăng nhập thành công!");
      setMsgType("success");

      // Điều hướng sau 500ms
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Đăng nhập thất bại");
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
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại!</p>
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

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="btn-submit">
            Đăng nhập
          </button>
        </form>

        <div className="form-footer">
          <p style={{ color: "#718096" }}>
            Chưa có tài khoản?{" "}
            <Link to="/signup" className="form-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
