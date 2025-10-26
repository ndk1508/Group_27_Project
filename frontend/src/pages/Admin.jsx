// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const me = JSON.parse(localStorage.getItem("user") || "null");

  const load = async () => {
    try {
      const res = await api.get("/users"); // đã có interceptor gắn Bearer
      setUsers(res.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Không tải được danh sách (cần quyền Admin)");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Xóa user này?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((list) => list.filter((u) => u._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Xóa thất bại");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <div className="list-section" style={{ width: "100%" }}>
        <h2>Admin: Danh sách người dùng</h2>
        <p><strong>Đang đăng nhập:</strong> {me?.name} — role: {me?.role}</p>
        <table>
          <thead>
            <tr><th>Tên</th><th>Email</th><th>Role</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><button onClick={() => remove(u._id)}>Xoá</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
