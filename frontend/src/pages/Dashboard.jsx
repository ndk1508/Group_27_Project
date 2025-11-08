// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data: updated } = await api.put(`/users/${editingId}`, form);
        setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
        setMsg("✅ Cập nhật thành công!");
      } else {
        const { data: newUser } = await api.post("/users", form);
        setUsers((prev) => [...prev, newUser]);
        setMsg("✅ Thêm người dùng thành công!");
      }
      resetForm();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email, role: user.role || "user" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setMsg("✅ Xóa thành công!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || "Xóa thất bại!");
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", role: "user" });
    setEditingId(null);
  };

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem("refreshToken");
      await api.post("/api/auth/logout", rt ? { refreshToken: rt } : {});
    } catch {}
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p style={{ color: "#718096", margin: "4px 0 0 0" }}>
            Quản lý người dùng và hệ thống
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="dashboard-user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role || "user"}</div>
            </div>
          </div>
          <Link
            to="/profile"
            style={{
              padding: "10px 14px",
              background: "#6366f1",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cập nhật avatar
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <h2 className="section-title">Quản lý người dùng</h2>

        {msg && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            {msg}
          </div>
        )}

        <div className="crud-form">
          <h3 style={{ marginTop: 0, marginBottom: 16, color: "#2d3748" }}>
            {editingId ? "Sửa thông tin" : "Thêm người dùng mới"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {user?.role === "admin" && (
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select
                    className="form-input"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="crud-actions">
              <button type="submit" className="btn-add">
                {editingId ? "Cập nhật" : "Thêm người dùng"}
              </button>
              {editingId && (
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  Chưa có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="avatar-cell">
                      {u?.avatar ? (
                        <img src={u.avatar} alt={u.name} className="avatar-img" />
                      ) : (
                        <div className="avatar-fallback">
                          {(u?.name?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role || "user"}`}>
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button className="btn-edit" onClick={() => handleEdit(u)}>
                      Sửa
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(u._id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
