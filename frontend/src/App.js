// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import api from "./api/axios";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import Profile from "./pages/Profile";

// --- Trang CRUD Users (chỉ người đăng nhập mới xem được) ---
function UsersCrud() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách người dùng
  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data || []))
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Vui lòng nhập đủ thông tin!");

    try {
      if (editingId) {
        const { data: updated } = await api.put(`/users/${editingId}`, form);
        setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
        setEditingId(null);
        setForm({ name: "", email: "" });
      } else {
        const { data: newUser } = await api.post("/users", form);
        setUsers((prev) => [...prev, newUser]);
        setForm({ name: "", email: "" });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Thao tác thất bại!";
      alert(msg);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      alert(err?.response?.data?.message || "Xoá thất bại");
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>{editingId ? "Sửa người dùng" : "Thêm người dùng"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</button>
          {editingId && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", email: "" });
              }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="list-section">
        <h2>Danh sách người dùng</h2>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Sửa</button>
                  <button onClick={() => handleDelete(u._id)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- App chính ---
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        {/* Thanh menu điều hướng */}
        <nav
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Link to="/">CRUD Users</Link>
          <Link to="/signup">Đăng ký</Link>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/profile">Hồ sơ cá nhân</Link>
        </nav>

        {/* Định nghĩa các route */}
        <Routes>
          {/* Trang CRUD cần đăng nhập */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UsersCrud />
              </ProtectedRoute>
            }
          />

          {/* Trang đăng ký / đăng nhập */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Trang chỉ dành cho admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Trang hồ sơ cá nhân (profile) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
