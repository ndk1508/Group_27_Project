const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { refreshToken } = require('../controllers/authController');

// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

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

router.post('/refresh', refreshToken);

module.exports = router;