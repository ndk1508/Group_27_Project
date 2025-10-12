import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi tải danh sách:", err));
  }, []);

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <ul>
        {users.map(u => (
          <li key={u.id || u._id}>
            <strong>{u.name}</strong> — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
