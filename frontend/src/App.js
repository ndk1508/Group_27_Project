import React, { useState } from "react";
import AddUser from "./components/AddUser";
import UserList from "./components/UserList";
import "./App.css";

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  const triggerRefresh = () => setRefreshToken((t) => t + 1);

  return (
    <div className="App" style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Quản lý người dùng 👤</h1>
      <AddUser onAdded={triggerRefresh} />
      <UserList refreshToken={refreshToken} />
    </div>
  );
}

export default App;
