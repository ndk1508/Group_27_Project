# HƯỚNG DẪN CÀI ĐẶT - HOẠT ĐỘNG 4: TÍNH NĂNG NÂNG CAO

## BƯỚC 1: Cập nhật file .env

Mở file `backend/.env` và thêm các dòng sau:

```env
# Email configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Group 27 Project
# Optional: set to 'gmail' to use Gmail SMTP helper in sendEmail.js
EMAIL_SERVICE=gmail

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (để tạo link reset password)
FRONTEND_URL=http://localhost:3001
```

### Lấy Gmail App Password:
1. Vào Google Account → Security
2. Bật 2-Step Verification
3. Tạo App Password tại https://myaccount.google.com/apppasswords
4. Copy password và paste vào EMAIL_PASS

### Lấy Cloudinary credentials:
1. Đăng ký tài khoản miễn phí tại https://cloudinary.com
2. Vào Dashboard → Copy Cloud name, API Key, API Secret
3. Paste vào file .env

---

## BƯỚC 2: Cập nhật User Model

Mở file `backend/models/User.js` và **THAY TOÀN BỘ** bằng code sau:

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  avatar: { type: String, default: "" }, // ← THÊM
  resetPasswordToken: { type: String }, // ← THÊM
  resetPasswordExpire: { type: Date }   // ← THÊM
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
```

---

## BƯỚC 3: Cập nhật authController.js

Mở file `backend/controllers/authController.js`

**Thêm import ở đầu file:**
```javascript
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../config/cloudinary");
```

**Thêm 3 functions mới vào CUỐI file** (copy từ `authController_new_functions.js`):
- `exports.forgotPassword`
- `exports.resetPassword`
- `exports.uploadAvatar`

---

## BƯỚC 4: Cập nhật auth routes

Mở file `backend/routes/auth.js` và **THAY TOÀN BỘ** bằng:

```javascript
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

// Đăng xuất
router.post("/logout", authController.logout);

// Quên mật khẩu - gửi email
router.post("/forgot-password", authController.forgotPassword);

// Đặt lại mật khẩu với token
router.post("/reset-password", authController.resetPassword);

// Upload avatar (cần đăng nhập)
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), authController.uploadAvatar);

module.exports = router;
```

---

## BƯỚC 5: Thêm uploads/ vào .gitignore

Mở file `.gitignore` (ở root project) và thêm:

```
# Upload files
backend/uploads/
```

---

## BƯỚC 6: Restart server

```bash
cd backend
npm run dev
```

---

## BƯỚC 7: Test trên Postman

### 1. Forgot Password
- Method: POST
- URL: http://localhost:3000/api/auth/forgot-password
- Body (JSON):
```json
{
  "email": "test@example.com"
}
```
- Kiểm tra email để lấy token

Note: If you configured Gmail and used an App Password, the email should be delivered to the recipient's Gmail inbox (or Promotions/Spam). If you don't get email, check backend logs for errors and ensure EMAIL_USER / EMAIL_PASS are correct.

### 2. Reset Password
- Method: POST
- URL: http://localhost:3000/api/auth/reset-password
- Body (JSON):
```json
{
  "token": "token-từ-email",
  "newPassword": "newpass123"
}
```

### 3. Upload Avatar
- Method: POST
- URL: http://localhost:3000/api/auth/upload-avatar
- Headers: 
  - Authorization: Bearer YOUR_JWT_TOKEN
- Body: form-data
  - Key: avatar (chọn type: File)
  - Value: Chọn file ảnh từ máy

---

## LƯU Ý:

1. File `authController_new_functions.js` chỉ để tham khảo, KHÔNG chạy trực tiếp
2. Phải copy 3 functions từ file đó vào `authController.js` chính
3. Đảm bảo tất cả biến môi trường trong .env đã được cấu hình đúng
4. Kiểm tra Gmail App Password phải là app password, không phải mật khẩu thường

---

## FILE ĐÃ TẠO XONG:

✅ backend/config/cloudinary.js
✅ backend/utils/sendEmail.js
✅ backend/middleware/upload.js
✅ backend/controllers/authController_new_functions.js (file tham khảo)
✅ backend/uploads/ (thư mục)

## FILE CẦN SỬA THỦ CÔNG:

❌ backend/.env (thêm email + cloudinary config)
❌ backend/models/User.js (thêm 3 fields: avatar, resetPasswordToken, resetPasswordExpire)
❌ backend/controllers/authController.js (thêm 3 functions mới)
❌ backend/routes/auth.js (thêm 3 routes mới)
❌ .gitignore (thêm backend/uploads/)
