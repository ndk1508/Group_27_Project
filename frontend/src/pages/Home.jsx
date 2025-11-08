// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">
            <span className="gradient-text">User Management</span>
            <br />
            System
          </h1>
          <p className="home-subtitle">
            Quản lý người dùng dễ dàng, bảo mật và hiệu quả
          </p>
        </div>

        <div className="home-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={() => navigate("/login")}
          >
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Đăng nhập
          </button>

          <button
            className="btn btn-secondary btn-large"
            onClick={() => navigate("/signup")}
          >
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Đăng ký
          </button>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bảo mật</h3>
            <p>JWT Authentication & Refresh Token</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Nhanh chóng</h3>
            <p>CRUD operations với MongoDB</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Phân quyền</h3>
            <p>Role-based Access Control</p>
          </div>
        </div>
      </div>
    </div>
  );
}
