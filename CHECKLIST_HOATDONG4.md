# ✅ CHECKLIST - HOÀN THÀNH HOẠT ĐỘNG 4

## Đã tạo xong tự động:
- [x] backend/config/cloudinary.js
- [x] backend/utils/sendEmail.js
- [x] backend/middleware/upload.js
- [x] backend/controllers/authController_new_functions.js
- [x] backend/uploads/ (thư mục)
- [x] backend/.env.example
- [x] SETUP_HOATDONG4.md (hướng dẫn chi tiết)
- [x] POSTMAN_TEST_GUIDE.md (hướng dẫn test)

## CẦN LÀM NGAY BÂY GIỜ (5 bước):

### 1. Cập nhật backend/.env
Mở `backend/.env` và thêm:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Group 27 Project
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3001
```

### 2. Sửa backend/models/User.js
Thêm 3 dòng này vào schema (sau dòng role):
```javascript
  avatar: { type: String, default: "" },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
```

Và thêm `{ timestamps: true }` vào cuối schema.

### 3. Cập nhật backend/controllers/authController.js

**Thêm import ở đầu file:**
```javascript
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../config/cloudinary");
```

**Copy 3 functions từ `authController_new_functions.js` vào cuối file:**
- forgotPassword
- resetPassword  
- uploadAvatar

### 4. Cập nhật backend/routes/auth.js

Thêm vào đầu file:
```javascript
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
```

Thêm 3 routes mới (sau route logout):
```javascript
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), authController.uploadAvatar);
```

### 5. Cập nhật .gitignore (root project)

Thêm dòng:
```
backend/uploads/
```

---

## SAU KHI XONG 5 BƯỚC TRÊN:

1. Restart server: `cd backend` → `npm run dev`
2. Đọc `POSTMAN_TEST_GUIDE.md` để test
3. Chụp screenshots theo yêu cầu

---

## Lấy credentials:

### Gmail App Password:
1. https://myaccount.google.com/security
2. Bật 2-Step Verification
3. App passwords → Generate → Copy

### Cloudinary:
1. https://cloudinary.com (đăng ký free)
2. Dashboard → Copy Cloud name, API Key, API Secret

---

## ❓ Gặp lỗi?

Xem file `SETUP_HOATDONG4.md` cho hướng dẫn chi tiết hoặc `POSTMAN_TEST_GUIDE.md` cho troubleshooting.
