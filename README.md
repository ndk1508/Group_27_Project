Project: Group_27_Project — Fullstack Auth & Admin Demo

This repository contains a Node/Express backend and a React frontend used for a class project
that implements authentication (JWT with refresh), RBAC, avatar upload, password reset (email),
activity logging and a simple rate limiter.

Quick contacts / responsibilities
- Nguyễn Đăng Khoa — Backend, APIs, DB, CI
- Lâm Minh Hiếu — Frontend, React UI
- Lê Minh Huy — Database, seed scripts

This README covers how to run the app locally, seed test users, and run smoke tests useful for
Activity 7 (final integration + demo).

## Prerequisites
- Node.js (>=18 recommended) and npm installed
- MongoDB access: either local MongoDB or MongoDB Atlas connection string
- (Optional) Cloudinary account for avatar uploads
- (Optional) Gmail App Password or Mailtrap credentials for sending emails

## Repo layout (important paths)
- backend/ — Express server, controllers, models, scripts
- frontend/ — React app (Create React App)

## Backend setup
1. Open a terminal and install deps:

```powershell
cd backend
npm install
```

2. Create `backend/.env` from `backend/.env.example` and fill values (DO NOT commit `.env`).
	 - `MONGODB_URI` (or `MONGO_URI`) must point to your MongoDB instance.
	 - Set `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` for JWTs.

3. Seed test users (creates admin@example.com and user@example.com):

```powershell
npm run seed:users
```

4. Start backend in development mode (nodemon):

```powershell
npm run dev
```

5. Available useful endpoints:
- POST /api/auth/signup — register (supports optional avatar upload)
- POST /api/auth/login — login (returns accessToken + refreshToken)
- POST /api/auth/refresh — rotate refresh token, obtain new accessToken
- POST /api/auth/forgot-password — start password reset (dev returns raw token)
- POST /api/auth/reset-password — complete reset (token in body or URL param)
- GET /api/auth/me — protected, returns current user info (use Authorization header)
- POST /api/auth/upload-avatar — protected, multipart/form-data (avatar)
- GET /admin/logs — protected admin-only (view activity logs)

## Frontend setup
1. Install deps and start dev server:

```powershell
cd frontend
npm install
npm start
```

2. Default frontend runs on http://localhost:3000 — set `FRONTEND_URL` in backend `.env` accordingly.

## Smoke tests (what to exercise for Activity 7)
- Signup a new account (or use seeded users)
- Login and verify you receive `accessToken` and `refreshToken`
- Call `GET /api/auth/me` with `Authorization: Bearer <accessToken>` to fetch profile
- Call `POST /api/auth/refresh` with current refresh token and verify new tokens
- Trigger forgot-password for a user and use the returned raw token (dev) to call reset
- Upload an avatar via the upload endpoint and confirm Cloudinary URL saved
- Check admin-only endpoints with `admin@example.com` (seeded admin)

I provide `backend/scripts/smokeTest.js` (if present) to run the flow automatically — or use
the Postman collection (optional) to run the same checks.

## Postman / Demo artifacts
- For the deliverable, prepare:
	- A short screen recording (5–10 min) showing: signup, login, refresh token, avatar upload,
		forgot/reset password, and admin logs.
	- Exported Postman collection with requests for the flows above and include sample environment
		with `baseUrl`, `accessToken` variables.

## Notes / Production cautions
- Seeder and dev-mode behaviors (raw reset token) are for development/testing only. Remove
	debug responses before production.
- Rate limiter is in-memory (suitable only for single-server development). Use Redis for
	distributed rate limiting in production.
- Ensure secrets (JWT, DB, email) are stored securely and never committed.

## Help / troubleshooting
- If DB connection fails, confirm `MONGODB_URI` and network access (Atlas IP whitelist).
- If email sending fails, check `EMAIL_USER`/`EMAIL_PASS` and provider settings (Gmail App
	Password or Mailtrap credentials recommended for testing).

---

If you want, I can now: (A) add/commit this README and improved `backend/.env.example` to a
branch and push it (recommended), and (B) add a smoke-test script or Postman collection.
Choose which and I'll proceed.