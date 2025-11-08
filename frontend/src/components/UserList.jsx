import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserList({ reloadKey }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi tải danh sách:", err));
  }, [reloadKey]);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users.map((u) => (
          <li
            key={u.id || u._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {u?.avatar ? (
              <img
                src={u.avatar}
                alt={u.name}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {(u?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ color: "#718096", fontSize: 14 }}>{u.email}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
