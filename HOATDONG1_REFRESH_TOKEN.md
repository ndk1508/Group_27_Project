# HOẠT ĐỘNG 1 - REFRESH TOKEN & SESSION MANAGEMENT

**Sinh viên thực hiện:** SV1 - Backend Advanced  
**Branch:** `feature/refresh-token`  
**Ngày:** October 28, 2025

---

## 📋 MỤC TIÊU

Tạo cơ chế JWT Access Token + Refresh Token, duy trì session an toàn, revoke token khi logout.

---

## ✅ CÔNG VIỆC ĐÃ HOÀN THÀNH

### 1. **RefreshToken Schema** (`backend/models/RefreshToken.js`)
```javascript
- token: String (unique)
- userId: ObjectId (ref User)
- expiresAt: Date
- createdAt: Date
- TTL Index: tự động xóa token hết hạn
```

### 2. **API Login** (`POST /api/auth/login`)
**Thay đổi:**
- Tạo cả Access Token (15 phút) và Refresh Token (7 ngày)
- Lưu Refresh Token vào database
- Response trả về cả 2 tokens

### 3. **API Refresh** (`POST /api/auth/refresh`)
**Chức năng:**
- Nhận refresh token từ client
- Verify token và kiểm tra trong DB
- Tạo cặp token mới
- Cập nhật refresh token trong DB

### 4. **API Logout** (`POST /api/auth/logout`)
**Thay đổi:**
- Nhận refresh token từ client
- Xóa token khỏi database (revoke)
- Ngăn chặn token bị đánh cắp tiếp tục sử dụng

### 5. **Middleware** (`backend/middleware/authMiddleware.js`)
- `authMiddleware`: Verify JWT_SECRET (tương thích code cũ)
- `verifyAccessToken`: Verify ACCESS_TOKEN_SECRET (cho refresh token flow)

---

## 🧪 HƯỚNG DẪN TEST POSTMAN

### ✅ TEST 1: Login - Nhận Access + Refresh Token

**Request:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response mong đợi:**
```json
{
  "message": "Đăng nhập thành công",
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "_id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**📸 Screenshot:** Lưu response để lấy cả 2 tokens

---

### ✅ TEST 2: Sử dụng Access Token

**Request:**
```
GET http://localhost:3000/api/profile
Authorization: Bearer <ACCESS_TOKEN>
```

**Response mong đợi:**
```json
{
  "_id": "...",
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

### ✅ TEST 3: Refresh Token - Làm mới Access Token

**Request:**
```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

Body (raw JSON):
{
  "refreshToken": "<REFRESH_TOKEN từ TEST 1>"
}
```

**Response mong đợi:**
```json
{
  "accessToken": "eyJhbGci... (token mới)",
  "refreshToken": "eyJhbGci... (refresh token mới)"
}
```

**📸 Screenshot:** Chứng minh nhận được tokens mới

---

### ✅ TEST 4: Logout - Revoke Refresh Token

**Request:**
```
POST http://localhost:3000/api/auth/logout
Content-Type: application/json

Body (raw JSON):
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

**Response mong đợi:**
```json
{
  "message": "Đã đăng xuất thành công"
}
```

---

### ✅ TEST 5: Verify Token Revoked

**Request:**
```
POST http://localhost:3000/api/auth/refresh
Content-Type: application/json

Body (raw JSON):
{
  "refreshToken": "<REFRESH_TOKEN vừa logout>"
}
```

**Response mong đợi (LỖI):**
```json
{
  "message": "Invalid refresh token"
}
```

**📸 Screenshot:** Chứng minh token đã bị revoke

---

## 🔧 CẤU HÌNH BIẾN MÔI TRƯỜNG

File `.env`:
```properties
# JWT & Token
ACCESS_TOKEN_SECRET=Th1sIsMy@ccessKey!123
REFRESH_TOKEN_SECRET=R3freshKey$456!VerySecret
TOKEN_EXPIRE=15m
REFRESH_EXPIRE=7d
JWT_SECRET=secret123  # backward compatibility
```

---

## 📦 FILES CHANGED

```
backend/
├── models/
│   └── RefreshToken.js          [NEW] Schema lưu refresh token
├── controllers/
│   └── authController.js        [MODIFIED] login, logout, refreshToken
├── middleware/
│   └── authMiddleware.js        [MODIFIED] thêm verifyAccessToken
└── .env                         [MODIFIED] thêm token secrets
```

---

## 🎯 CHECKLIST NỘP BÀI

- [ ] Screenshot TEST 1: Login nhận 2 tokens
- [ ] Screenshot TEST 2: Dùng access token thành công
- [ ] Screenshot TEST 3: Refresh token thành công
- [ ] Screenshot TEST 4: Logout thành công
- [ ] Screenshot TEST 5: Token đã revoke (lỗi 403)
- [ ] Code đã commit vào branch `feature/refresh-token`
- [ ] Đã push lên GitHub
- [ ] Đã tạo Pull Request
- [ ] Link PR GitHub

---

## 🚀 LỆNH GIT

```bash
# Tạo branch (đã làm)
git checkout -b feature/refresh-token

# Stage và commit
git add .
git commit -m "Hoạt động 1: Thêm Refresh Token & Session Management"

# Push lên GitHub
git push origin feature/refresh-token

# Tạo PR trên GitHub
# Vào https://github.com/ndk1508/Group_27_Project
# Click "Compare & pull request"
```

---

## 💡 LƯU Ý

1. **Access Token:** Thời gian ngắn (15 phút), lưu trong memory/state
2. **Refresh Token:** Thời gian dài (7 ngày), lưu trong localStorage
3. **Security:** Refresh token được lưu trong DB, có thể revoke bất cứ lúc nào
4. **TTL Index:** MongoDB tự động xóa token hết hạn

---

## 🤝 PHÂN CÔNG TIẾP THEO

- **SV2 (Frontend):** Tích hợp refresh token flow vào React app
- **SV3 (Database):** Verify schema, test performance, optimize indexes
