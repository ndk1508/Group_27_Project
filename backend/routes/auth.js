const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

// Đăng xuất
router.post("/logout", authController.logout);

module.exports = router;