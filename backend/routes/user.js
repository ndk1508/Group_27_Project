
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { verifyAccessToken } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// Admin & Moderator routes (đặt TRƯỚC public routes)
router.get("/admin/users", verifyAccessToken, roleMiddleware(["admin", "moderator"]), userController.getAllUsers);
router.delete("/admin/users/:id", verifyAccessToken, roleMiddleware(["admin"]), userController.deleteUser);

// Public user routes
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
// Chỉnh sửa thông tin user: Admin hoặc Moderator (Moderator bị giới hạn trong controller)
router.put("/users/:id", verifyAccessToken, roleMiddleware(["admin", "moderator"]), userController.updateUser);
// Xóa user: cho phép Admin hoặc chính chủ (kiểm tra trong controller)
router.delete("/users/:id", verifyAccessToken, userController.deleteUser);

// Profile routes (yêu cầu auth)
router.get("/profile", verifyAccessToken, userController.getProfile);
router.put("/profile", verifyAccessToken, userController.updateProfile);

// Các route /api cho frontend hiện tại (Profile.jsx)
// Dùng Access Token (ACCESS_TOKEN_SECRET) cho các route /api/profile
router.get("/api/profile", verifyAccessToken, userController.getProfile);
router.put("/api/profile", verifyAccessToken, userController.updateProfile);
router.post(
	"/api/profile/upload-avatar",
	verifyAccessToken,
	upload.single("avatar"),
	authController.uploadAvatar
);


module.exports = router;