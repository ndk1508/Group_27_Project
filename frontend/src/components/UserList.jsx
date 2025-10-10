import React, { useEffect, useState } from "react";
import api from "../api/axios";

const normalizeId = (u) => u.id || u._id; // hỗ trợ cả mảng tạm và MongoDB

export default function UserList({ refreshToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshToken]); // reload khi form thêm xong

  if (loading) return <p>Đang tải...</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Danh sách người dùng</h2>
      {users.length === 0 ? (
        <p>Chưa có người dùng.</p>
      ) : (
        <ul style={{ lineHeight: 1.8 }}>
          {users.map((u) => (
            <li key={normalizeId(u)}>
              <strong>{u.name}</strong> — {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
