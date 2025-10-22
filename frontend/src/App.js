// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ thêm dòng này

function UsersCrud() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Vui lòng nhập đủ thông tin!");

    if (editingId) {
      const res = await fetch(`http://localhost:3000/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
        setEditingId(null);
        setForm({ name: "", email: "" });
      } else alert("Không thể cập nhật!");
    } else {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers([...users, newUser]);
        setForm({ name: "", email: "" });
      } else {
        const err = await res.json();
        alert(err.message);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Lỗi khi xoá:", error);
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
        </nav>

        <Routes>
          {/* ✅ Chặn truy cập nếu chưa đăng nhập */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UsersCrud />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
