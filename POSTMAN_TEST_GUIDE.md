# POSTMAN TEST - HOẠT ĐỘNG 4

## Setup Environment trong Postman

Tạo environment mới với các biến:
- `base_url`: http://localhost:3000
- `token`: (sẽ set sau khi login)

---

## 1. FORGOT PASSWORD

### Request
```
POST {{base_url}}/api/auth/forgot-password
```

### Body (raw JSON)
```json
{
  "email": "test@example.com"
}
```

### Expected Response (Success - 200)
```json
{
  "message": "Email đặt lại mật khẩu đã được gửi",
  "resetToken": "abc123..." 
}
```

### Expected Response (Error - 404)
```json
{
  "message": "Email không tồn tại trong hệ thống"
}
```

### Screenshot cần chụp:
- [x] Request body với email
- [x] Response thành công với message
- [x] Email inbox nhận được với link reset

---

## 2. RESET PASSWORD

### Request
```
POST {{base_url}}/api/auth/reset-password
```

### Body (raw JSON)
```json
{
  "token": "copy-token-từ-email-hoặc-response",
  "newPassword": "newpassword123"
}
```

### Expected Response (Success - 200)
```json
{
  "message": "Đặt lại mật khẩu thành công"
}
```

### Expected Response (Error - 400)
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### Screenshot cần chụp:
- [x] Request với token và newPassword
- [x] Response thành công
- [x] Login lại với mật khẩu mới thành công

---

## 3. UPLOAD AVATAR

### Bước 1: Login để lấy token

```
POST {{base_url}}/api/auth/login
```

Body:
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Copy token từ response và set vào environment variable `token`**

### Bước 2: Upload Avatar

### Request
```
POST {{base_url}}/api/auth/upload-avatar
```

### Headers
```
Authorization: Bearer {{token}}
```

### Body (form-data)
```
Key: avatar (type: File)
Value: [Chọn file ảnh từ máy]
```

### Expected Response (Success - 200)
```json
{
  "message": "Upload avatar thành công",
  "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/avatars/xyz.jpg"
}
```

### Expected Response (Error - 400 No File)
```json
{
  "message": "Vui lòng chọn ảnh"
}
```

### Expected Response (Error - 401 No Token)
```json
{
  "message": "Không có token hoặc token không hợp lệ"
}
```

### Screenshot cần chụp:
- [x] Request với Headers Authorization
- [x] Body form-data với file ảnh
- [x] Response thành công với URL Cloudinary
- [x] Ảnh hiển thị trên Cloudinary dashboard

---

## Test Flow Hoàn Chỉnh

### Flow 1: Forgot Password → Reset Password
1. POST /forgot-password với email → Nhận token qua email
2. Kiểm tra email inbox
3. POST /reset-password với token + mật khẩu mới
4. POST /login với mật khẩu mới → Thành công

### Flow 2: Upload Avatar
1. POST /login → Lấy JWT token
2. POST /upload-avatar với token + file ảnh
3. Kiểm tra URL ảnh trả về
4. GET /profile → Xem avatar đã cập nhật

---

## Common Errors & Solutions

### Error: "Không thể gửi email"
- Kiểm tra EMAIL_USER và EMAIL_PASS trong .env
- Đảm bảo dùng Gmail App Password, không phải mật khẩu thường
- Check firewall/antivirus có chặn port 587 không

### Error: "Upload thất bại"
- Kiểm tra CLOUDINARY_* credentials trong .env
- Đảm bảo file < 5MB
- Chỉ chấp nhận: jpg, jpeg, png, gif

### Error: "Token không hợp lệ hoặc đã hết hạn"
- Token chỉ có hiệu lực 10 phút
- Phải dùng token NGUYÊN DẠNG từ email (không hash)
- Không có khoảng trắng thừa

### Error: "Không có quyền truy cập"
- Phải login trước khi upload avatar
- Token phải được set trong header Authorization
- Format: Bearer [token] (có dấu cách)
