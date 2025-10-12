// src/App.js
import React, { useState } from "react";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";

export default function App() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div style={{ display:"flex", gap:32, justifyContent:"space-around", padding:32 }}>
      <div>
        <h1>Thêm người dùng</h1>
        <AddUser onUserAdded={() => setRefresh(r => r + 1)} />
      </div>
      <div>
        <UserList refreshToken={refresh} />
      </div>
    </div>
  );
}
