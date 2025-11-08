# Frontend Changes: Refresh Token & Session Management

## Thay đổi đã thực hiện

### 1. Token Service (`src/utils/tokenService.js`)

- Quản lý trung tâm cho access token và refresh token
- Hỗ trợ lưu trữ refresh token trong localStorage hoặc httpOnly cookie
- Cung cấp API để thông báo khi token thay đổi hoặc session hết hạn
- Export default một object có tên để tránh ESLint warning

### 2. Auth Context (`src/context/AuthContext.jsx`)

- Sử dụng tokenService để quản lý token
- Subscribe để cập nhật UI khi token thay đổi
- Thêm modal thông báo khi session hết hạn
- Hỗ trợ refreshToken trong phương thức login

### 3. Axios Interceptor (`src/api/axios.js`)

- Tự động gắn Authorization header với access token
- Xử lý 401 bằng cách:
  - Gọi `/api/auth/refresh` với refreshToken (từ localStorage hoặc cookie)
  - Lưu access token mới và retry request gốc
  - Nếu refresh thất bại: xóa token và thông báo session expired
- Xử lý concurrent 401s:
  - Single refresh-token-request inflight
  - Queue các request khác và retry sau khi refresh thành công
  - Reject tất cả nếu refresh thất bại
- Hỗ trợ httpOnly cookie cho refresh token

### 4. Components

- `SessionExpiredModal`: Hiển thị khi refresh thất bại
- `ProtectedRoute`: Sử dụng useAuth() để reactive với thay đổi token
- `Dashboard`: Thêm nút Test Refresh để kiểm thử
- `Login/LoginForm`: Lưu refreshToken khi login

### 5. Test Utilities

- `scripts/simulate-refresh.js`: Test flow refresh không cần browser
- `scripts/e2e-test-refresh.js`: E2E test với Puppeteer (cần dev server)

## Hướng dẫn tích hợp Backend

### API Endpoints Required

1. POST /api/auth/login

   ```typescript
   // Request
   { email: string, password: string }

   // Response
   {
     accessToken: string,     // JWT access token
     refreshToken?: string,   // Optional: JWT refresh token
     user: {                  // User info
       id: string,
       email: string,
       name: string,
       role?: string
     }
   }
   ```

2. POST /api/auth/refresh

   ```typescript
   // Request - một trong hai cách:
   {
     refreshToken: string;
   } // refreshToken in body
   // HOẶC
   {
   } // empty body, refreshToken from httpOnly cookie

   // Response
   {
     accessToken: string; // new access token
   }
   ```

3. POST /api/auth/logout

   ```typescript
   // Request (optional)
   { refreshToken?: string }

   // Response
   { message: string }
   ```

### Hỗ trợ httpOnly Cookie (Recommended)

Nếu muốn lưu refresh token trong httpOnly cookie:

1. Backend cần:

```javascript
// Login success
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

// Logout
res.clearCookie("refreshToken");
```

2. CORS configuration:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
```

### Test Flow

1. Login: kiểm tra nhận được access token và refresh token
2. Gọi API được bảo vệ: kiểm tra header có `Authorization: Bearer <token>`
3. Khi token hết hạn (401):
   - Frontend tự gọi refresh
   - Lưu token mới
   - Retry request gốc
4. Khi refresh thất bại:
   - Hiện modal thông báo
   - Redirect về login sau khi user xác nhận

## Lưu ý cho Frontend Developers

- Token được lưu trong tokenService, không truy cập localStorage trực tiếp
- Sử dụng `useAuth()` hook để truy cập token/user info
- Protected routes nên dùng `ProtectedRoute` component
- Có thể test manual bằng nút "Test Refresh" trên Dashboard

## Known Issues / Future Improvements

- [ ] Hiển thị loading state khi đang refresh
- [ ] Thêm auto-retry cho network errors
- [ ] Hỗ trợ refresh token rotation
- [ ] Thêm rate limiting cho refresh requests
