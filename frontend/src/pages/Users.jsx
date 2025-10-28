// src/pages/Users.jsx
import React, { useCallback, useState } from "react";
import AddUser from "../components/AddUser";
import UserList from "../components/UserList";

export default function Users() {
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="container">
      <div className="form-section" style={{ width: "100%" }}>
        <h2>CRUD Users</h2>
        <p>Thêm user mới và xem danh sách từ MongoDB.</p>
        <AddUser onUserAdded={reload} />
        <div style={{ marginTop: 16 }}>
          {/* Truyền reloadKey làm prop để UserList tự refetch thay vì remount */}
          <UserList reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}
