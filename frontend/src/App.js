import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  // 🟢 Lấy danh sách người dùng từ Mongo
  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  // 🟢 Thêm hoặc cập nhật người dùng
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Vui lòng nhập đủ thông tin!");

    if (editingId) {
      // PUT (update)
      const res = await fetch(`http://localhost:3000/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
        setEditingId(null);
        setForm({ name: "", email: "" });
      } else {
        alert("Không thể cập nhật!");
      }
    } else {
      // POST (create)
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers([...users, newUser]);
        setForm({ name: "", email: "" });
      } else {
        const err = await res.json();
        alert(err.message);
      }
    }
  };

  // 🟢 Sửa người dùng
  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email });
  };

  // 🟢 Xoá người dùng
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Lỗi khi xoá:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>{editingId ? "Sửa người dùng" : "Thêm người dùng"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit">
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingId && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", email: "" });
              }}
            >
              Hủy
            </button>
          )}
        </form>
      </div>

      <div className="list-section">
        <h2>Danh sách người dùng</h2>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Sửa</button>
                  <button onClick={() => handleDelete(u._id)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
