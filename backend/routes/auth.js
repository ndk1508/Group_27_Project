const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { verifyAccessToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const loginRateLimiter = require("../middleware/loginRateLimiter")();
const { refreshToken } = require('../controllers/authController');

// Đăng ký (hỗ trợ upload avatar tùy chọn)
router.post("/signup", upload.single("avatar"), authController.signup);

// Đăng nhập (rate-limited)
router.post("/login", loginRateLimiter, authController.login);

// Đăng xuất
router.post("/logout", authController.logout);

// Quên mật khẩu - gửi email
router.post("/forgot-password", authController.forgotPassword);

// Đặt lại mật khẩu với token (token nằm ở URL params)
router.post("/reset-password/:token", authController.resetPassword);
// Đặt lại mật khẩu với token trong body (cho frontend hiện tại)
router.post("/reset-password", authController.resetPassword);
// Upload avatar (cần đăng nhập)
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), authController.uploadAvatar);

// Get current logged-in user (for frontend auth check)
router.get("/me", verifyAccessToken, authController.getMe);

router.post('/refresh', refreshToken);

module.exports = router;