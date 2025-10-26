// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthStatus from "./components/AuthStatus";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ padding: 16 }}>
          <nav
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Link to="/">Trang chủ</Link>
            <Link to="/signup">Đăng ký</Link>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/dashboard">Dashboard</Link>
          </nav>

          {/* Hiển thị trạng thái đăng nhập + token (phục vụ screenshot yêu cầu) */}
          <AuthStatus />

          <Routes>
            <Route path="/" element={<div style={{ padding: 12 }}>Home</div>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Chặn truy cập nếu chưa đăng nhập */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
