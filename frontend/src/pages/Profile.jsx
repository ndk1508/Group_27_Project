// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import resizeImage from "../utils/imageUtils";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", role: "", avatar: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadController, setUploadController] = useState(null);

  const loadProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      setUser(res.data || {});
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/api/profile", { name: user.name, email: user.email });
      if (res?.data?.user) setUser(res.data.user);
      setMsg("✅ Cập nhật thành công!");
    } catch (err) {
      setMsg(err?.response?.data?.message || "❌ Cập nhật thất bại!");
    }
  };

  const { updateUser } = useAuth();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const uploadAvatar = async (e) => {
    e.preventDefault();
    if (!file) return setMsg("Chưa chọn ảnh");
    try {
      setMsg("Đang xử lý ảnh...");
      setUploading(true);
      // prepare abort controller for upload
      const controller = new AbortController();
      setUploadController(controller);
      // Resize on client before upload
      const blob = await resizeImage(file, 300, 300);
      if (!blob) return setMsg("Không thể xử lý ảnh");

      const fd = new FormData();
      // give a filename so backend/multer has one
      fd.append("avatar", blob, "avatar.jpg");

      const res = await api.post("/api/profile/upload-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal
      });

      if (res?.data?.user) {
        setUser(res.data.user);
      } else if (res?.data?.avatar) {
        setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      } else {
        await loadProfile();
      }

      setMsg("🖼️ Upload avatar thành công");
      setFile(null);
      setPreview("");
      // update global user so header/nav sees new avatar
      try { updateUser({ avatar: res?.data?.avatar || (res?.data?.user && res.data.user.avatar) }); } catch (e) {}
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.message === 'canceled') {
        setMsg('Upload đã bị hủy');
      } else {
        setMsg(e?.response?.data?.message || 'Upload thất bại');
      }
    }
    finally {
      setUploading(false);
      setUploadController(null);
    }
  };

  const cancelUpload = () => {
    if (uploadController) {
      try { uploadController.abort(); } catch (e) {}
    }
    setUploading(false);
    setUploadController(null);
    setFile(null);
    setPreview("");
    setMsg('Upload đã được hủy');
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Đang tải...</p>;

  const avatarField = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url;
  const avatarUrl = preview || avatarField || "https://via.placeholder.com/80x80?text=Avatar";

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      {/* User info */}
      <div className="list-section" style={{ marginBottom: 16 }}>
        <h2>Thông tin cá nhân</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
          <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: "#555" }}>{user.email}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ background: user.role === "admin" ? "#fee2e2" : "#e0f2fe", color: user.role === "admin" ? "#b91c1c" : "#0369a1", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                role: {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update info */}
      <div className="form-section">
        <h3>Cập nhật thông tin</h3>
        <form onSubmit={handleUpdate}>
          <input type="text" placeholder="Họ và tên" value={user?.name || ""} onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <input type="email" placeholder="Email" value={user?.email || ""} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          <button type="submit">Cập nhật</button>
        </form>
      </div>

      {/* Upload avatar */}
      <div className="form-section">
        <h3>Upload Avatar</h3>
        <form onSubmit={uploadAvatar}>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
          <button type="submit" disabled={!file || uploading}>
            {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
          </button>
          {uploading && (
            <button type="button" onClick={cancelUpload} style={{ marginLeft: 8 }}>
              Huỷ
            </button>
          )}
        </form>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
