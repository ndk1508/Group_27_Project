import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const params = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If route is /reset-password/:token, prefill token
    if (params?.token) setToken(params.token);
  }, [params]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (password !== confirm) return setMsg("❌ Mật khẩu xác nhận không khớp");
    if (!token) return setMsg("❌ Thiếu token reset");
    try {
      setLoading(true);
      const res = await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      setMsg(res.data?.message || "Đổi mật khẩu thành công!");
      setToken(""); setPassword(""); setConfirm("");
      // redirect to login after short delay
      setTimeout(() => navigate("/login"), 2200);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-section" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h2>Đặt lại mật khẩu bằng token</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Token reset (trong email)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Đổi mật khẩu'}</button>
      </form>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
