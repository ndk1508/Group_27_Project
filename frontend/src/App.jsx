import React, { useState } from "react";
import AddUser from "./components/AddUser";
import UserList from "./components/UserList";

export default function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  const triggerRefresh = () => setRefreshToken((x) => x + 1);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Quản lý người dùng</h1>
      <AddUser onAdded={triggerRefresh} />
      <UserList refreshToken={refreshToken} />
    </div>
  );
}
