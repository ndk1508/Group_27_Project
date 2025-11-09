Project: Group_27_Project — Demo toàn diện (Authentication & Admin)

Kho chứa này gồm backend Node/Express và frontend React cho bài tập môn, triển khai các
tính năng: xác thực JWT (kèm refresh), phân quyền (RBAC), upload avatar, đặt lại mật khẩu qua
email, ghi nhận hoạt động (activity logs) và một rate limiter đơn giản.

Người phụ trách chính
- Nguyễn Đăng Khoa — Backend, API, cơ sở dữ liệu
- Lâm Minh Hiếu — Frontend, giao diện React
- Lê Minh Huy — Database, script seed

Tài liệu này hướng dẫn chạy dự án local, seed dữ liệu kiểm thử và các bước kiểm tra cho
Hoạt động 7 (tích hợp và demo).

## Yêu cầu trước khi chạy
- Cài Node.js (khuyến nghị >=18) và npm
- Có truy cập MongoDB (local hoặc MongoDB Atlas)
- (Tuỳ chọn) Tài khoản Cloudinary nếu muốn upload avatar
- (Tuỳ chọn) Gmail App Password hoặc Mailtrap để gửi email khi test

## Cấu trúc repo (đường dẫn quan trọng)
- `backend/` — server Express, controllers, models, scripts
- `frontend/` — ứng dụng React (Create React App)

## Thiết lập backend
1. Cài dependency:

```powershell
cd backend
npm install
```

2. Tạo file `backend/.env` từ `backend/.env.example` và điền giá trị (KHÔNG commit `.env`).
	 - `MONGODB_URI` (hoặc `MONGO_URI`) trỏ tới MongoDB của bạn.
	 - Thiết lập `ACCESS_TOKEN_SECRET` và `REFRESH_TOKEN_SECRET` cho JWT.

3. Tạo user kiểm thử (seed):

```powershell
npm run seed:users
```

4. Chạy server ở chế độ dev (nodemon):

```powershell
npm run dev
```

5. Một số endpoint chính:
- `POST /api/auth/signup` — đăng ký (hỗ trợ upload avatar)
- `POST /api/auth/login` — đăng nhập (trả `accessToken` + `refreshToken`)
- `POST /api/auth/refresh` — refresh token, lấy access token mới
- `POST /api/auth/forgot-password` — bắt đầu đặt lại mật khẩu (dev trả raw token để test)
- `POST /api/auth/reset-password` — hoàn tất đặt lại mật khẩu
- `GET /api/auth/me` — protected, trả info người dùng hiện tại (dùng header Authorization)
- `POST /api/auth/upload-avatar` — protected, multipart/form-data (avatar)
- `GET /admin/logs` — protected (chỉ admin), xem activity logs

## Thiết lập frontend
1. Cài dependency và chạy:

```powershell
cd frontend
npm install
npm start
```

2. Frontend mặc định chạy ở `http://localhost:3000` — thiết lập `FRONTEND_URL` trong
	 `backend/.env` nếu cần.

## Kiểm thử nhanh (Smoke tests) — các flow cần kiểm tra cho Hoạt động 7
- Đăng ký tài khoản mới (hoặc dùng tài khoản đã seed)
- Đăng nhập và xác nhận nhận `accessToken` + `refreshToken`
- Gọi `GET /api/auth/me` với header `Authorization: Bearer <accessToken>` để lấy profile
- Gọi `POST /api/auth/refresh` với refresh token và kiểm tra nhận token mới
- Thực hiện forgot-password (dev trả raw token), dùng token đó để gọi reset-password
- Upload avatar và kiểm tra URL Cloudinary được lưu
- Dùng `admin@example.com` (seeded admin) để kiểm tra endpoint admin (/admin/logs)

Có thể dùng `backend/scripts/smokeTest.js` (nếu có) để chạy tự động các bước trên, hoặc
sử dụng Postman collection.

## Postman / Tài liệu demo
- Để nộp bài, chuẩn bị:
	- Video quay màn hình (5–10 phút) minh họa: signup, login, refresh token, upload avatar,
		forgot/reset password, và truy cập admin logs.
	- Export Postman collection chứa các request dùng cho flow trên, kèm environment mẫu
		(`baseUrl`, `accessToken`…).

## Lưu ý khi đưa lên production
- Seeder và việc trả raw reset token chỉ dùng cho phát triển; loại bỏ debug responses trước
	khi deploy.
- Rate limiter hiện dùng bộ nhớ trong (in-memory) — chỉ phù hợp môi trường single-node.
	Sử dụng Redis nếu cần triển khai đa node.
- Đảm bảo lưu trữ bí mật (JWT secrets, DB credentials, email creds) an toàn; không commit vào
	Git.

## Khắc phục sự cố
- Nếu không kết nối được DB, kiểm tra `MONGODB_URI` và whitelist IP (nếu dùng Atlas).
- Nếu gửi email thất bại, kiểm tra `EMAIL_USER` / `EMAIL_PASS` và cấu hình nhà cung cấp
	(Gmail App Password hoặc Mailtrap cho testing).

---

Tôi đã cập nhật tài liệu README và `backend/.env.example`. Muốn tôi tiếp tục thêm: (A) script
smoke-test tự động, (B) Postman collection, hoặc (C) tạo PR và mô tả merge, hãy nói tôi biết —
tôi sẽ làm tiếp.