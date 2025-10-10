import React, { useState } from "react";
import api from "../api/axios";

export default function AddUser({ onAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      alert("Name không được để trống");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Email không hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post("/users", { name: name.trim(), email: email.trim() });
      setName("");
      setEmail("");
      onAdded?.(); // báo App reload danh sách
    } catch (err) {
      console.error(err);
      alert("Thêm người dùng thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
      <h2>Thêm người dùng</h2>
      <input
        placeholder="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email (ví dụ: a@b.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Thêm User"}
      </button>
    </form>
  );
}
