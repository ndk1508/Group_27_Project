
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// Admin routes (đặt TRƯỚC public routes)
router.get("/admin/users", authMiddleware, roleMiddleware(["admin"]), userController.getAllUsers);
router.delete("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), userController.deleteUser);

// Public user routes
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
// Chỉnh sửa thông tin user: chỉ Admin được phép
router.put("/users/:id", authMiddleware, roleMiddleware(["admin"]), userController.updateUser);
// Xóa user: cho phép Admin hoặc chính chủ (kiểm tra trong controller)
router.delete("/users/:id", authMiddleware, userController.deleteUser);

// Profile routes (yêu cầu auth)
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

// Các route /api cho frontend hiện tại (Profile.jsx)
router.get("/api/profile", authMiddleware, userController.getProfile);
router.put("/api/profile", authMiddleware, userController.updateProfile);
router.post(
	"/api/profile/upload-avatar",
	authMiddleware,
	upload.single("avatar"),
	authController.uploadAvatar
);


module.exports = router;