// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuth, logout: clearAuth } = useAuth();

  // ----- common -----
  const [mode, setMode] = useState("login"); // 'login' | 'forgot' | 'reset'
  const [msg, setMsg] = useState("");

  // ----- login state -----
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // ----- forgot state -----
  const [forgotEmail, setForgotEmail] = useState("");

  // ----- reset state -----
  const [resetToken, setResetToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // ================== ACTIONS ==================
  const doLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/login", loginForm);
      const { accessToken, refreshToken, user, message, token: legacyToken } = res.data || {};
      const effectiveToken = accessToken || legacyToken; // hỗ trợ cả tên cũ 'token' nếu backend trả về
      if (!effectiveToken || !user) return setMsg("Không nhận được token");

      // Lưu vào AuthContext + localStorage
      setAuth(effectiveToken, user);
      // Lưu refreshToken (nếu cần dùng cho /refresh)
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setToken(effectiveToken);
      setMsg(message || "Đăng nhập thành công ✅");

      // điều hướng theo role
      if (user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      setMsg(err?.response?.data?.message || "Đăng nhập thất bại ❌");
    }
  };

  const doLogout = async () => {
    try {
      // Gửi refreshToken nếu có để revoke
      const rt = localStorage.getItem("refreshToken");
      await api.post("/api/auth/logout", rt ? { refreshToken: rt } : {});
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearAuth?.();
    setToken("");
    setMsg("Đã đăng xuất 👋");
  };

  const doForgot = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/api/auth/forgot-password", { email: forgotEmail });
      setMsg(res.data?.message || "Đã gửi token nếu email tồn tại ✅");
      setForgotEmail("");
      setMode("reset"); // chuyển qua tab reset luôn
    } catch (e) {
      setMsg(e?.response?.data?.message || "Gửi token thất bại ❌");
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    setMsg("");
    if (newPass !== confirmPass) return setMsg("❌ Mật khẩu xác nhận không khớp");
    try {
      const res = await api.post("/api/auth/reset-password", {
        token: resetToken,
        newPassword: newPass,
      });
      setMsg(res.data?.message || "Đổi mật khẩu thành công ✅");
      setResetToken(""); setNewPass(""); setConfirmPass("");
      setMode("login");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Đổi mật khẩu thất bại ❌");
    }
  };

  // ================== UI ==================
  const Wrapper = ({ children }) => (
    <div className="form-section" style={{ maxWidth: 520, margin: "24px auto" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Tab label="Đăng nhập" active={mode === "login"} onClick={() => { setMode("login"); setMsg(""); }} />
        <Tab label="Quên mật khẩu" active={mode === "forgot"} onClick={() => { setMode("forgot"); setMsg(""); }} />
        <Tab label="Đổi mật khẩu" active={mode === "reset"} onClick={() => { setMode("reset"); setMsg(""); }} />
      </div>
      {children}
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );

  return (
    <Wrapper>
      {mode === "login" && (
        <>
          <h2>Đăng nhập</h2>
          <form onSubmit={doLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button type="submit">Đăng nhập</button>
          </form>

          <div style={{ marginTop: 12 }}>
            <strong>JWT token (rút gọn):</strong>{" "}
            {token ? `${token.slice(0, 24)}...${token.slice(-12)}` : "(chưa có)"}
          </div>
          <button onClick={doLogout} style={{ marginTop: 8 }}>
            Đăng xuất
          </button>
        </>
      )}

      {mode === "forgot" && (
        <>
          <h2>Quên mật khẩu</h2>
          <form onSubmit={doForgot}>
            <input
              type="email"
              placeholder="Nhập email để nhận token"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button type="submit">Gửi token reset</button>
          </form>
          <p style={{ marginTop: 8 }}>
            👉 Token sẽ được gửi qua email. Sau đó chuyển qua tab <b>Đổi mật khẩu</b> để nhập token.
          </p>
        </>
      )}

      {mode === "reset" && (
        <>
          <h2>Đổi mật khẩu bằng token</h2>
          <form onSubmit={doReset}>
            <input
              type="text"
              placeholder="Token reset (trong email)"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
            <button type="submit">Đổi mật khẩu</button>
          </form>
        </>
      )}
    </Wrapper>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #0428e0ff",
        background: active ? "#d28016ff" : "#e11515ff",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
