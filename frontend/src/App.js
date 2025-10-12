import React, { useState } from "react";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";

function App() {
  const [refreshToken, setRefreshToken] = useState(0);

  const reloadUsers = () => setRefreshToken(prev => prev + 1);

  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: 32 }}>
      <div>
        <h1>Thêm người dùng</h1>
        <AddUser onUserAdded={reloadUsers} />
      </div>
      <div>
        <UserList key={refreshToken} />
      </div>
    </div>
  );
}

export default App;
