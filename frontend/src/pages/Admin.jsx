// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const startEdit = (u) => {
    setEditId(u._id);
    setEditForm({ name: u.name || "", email: u.email || "", role: u.role || "user" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: "", email: "", role: "user" });
  };

  const saveEdit = async (id) => {
    try {
      const { data: updated } = await api.put(`/users/${id}`, editForm);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
      cancelEdit();
      setMsg("✅ Cập nhật người dùng thành công");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      alert(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header + Logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2>Admin: Danh sách người dùng</h2>
          <button
            onClick={handleLogout}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Đăng xuất
          </button>
        </div>

        {msg && <p style={{ color: "#16a34a", marginBottom: 10 }}>{msg}</p>}

        {/* Bảng quản lý user */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={th}>Tên</th>
              <th style={th}>Email</th>
              <th style={th}>Role</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = editId === u._id;
              return (
                <tr key={u._id}>
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                    ) : (
                      u.name
                    )}
                  </td>
                  <td style={td}>
                    {isEditing ? (
                      <input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td style={td}>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, role: e.target.value }))
                        }
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          background: u.role === "admin" ? "#fee2e2" : "#e0f2fe",
                          color: u.role === "admin" ? "#b91c1c" : "#0369a1",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => startEdit(u)}
                          style={btnBlue}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          style={btnRed}
                        >
                          Xoá
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => saveEdit(u._id)}
                          style={btnGreen}
                        >
                          Lưu
                        </button>
                        <button onClick={cancelEdit} style={btnGray}>
                          Hủy
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
};
const td = {
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "middle",
};

const btnBase = {
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  marginRight: 8,
  color: "#fff",
};
const btnRed = { ...btnBase, background: "#dc2626" };
const btnBlue = { ...btnBase, background: "#2563eb" };
const btnGreen = { ...btnBase, background: "#16a34a" };
const btnGray = { ...btnBase, background: "#6b7280" };
