import React, { useState } from "react";
import api from "../api/axios";

export default function AddUser({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users", { name, email });
      alert("Thêm người dùng thành công!");
      setName("");
      setEmail("");
      onUserAdded(); // reload danh sách
    } catch (err) {
      console.error(err);
      alert("Thêm người dùng thất bại!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email (vd: a@b.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Thêm User</button>
    </form>
  );
}
