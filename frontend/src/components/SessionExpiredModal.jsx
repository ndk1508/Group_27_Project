import React from 'react';

export default function SessionExpiredModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', background: '#fff', padding: 24, borderRadius: 8, width: 420, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0 }}>Phiên làm việc đã hết hạn</h3>
        <p style={{ color: '#475569' }}>Phiên của bạn đã đăng xuất hoặc hết hạn. Vui lòng đăng nhập lại để tiếp tục.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
