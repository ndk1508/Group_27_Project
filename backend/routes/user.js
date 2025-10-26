const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin routes (đặt TRƯỚC public routes)
router.get("/admin/users", authMiddleware, roleMiddleware(["admin"]), userController.getAllUsers);
router.delete("/admin/users/:id", authMiddleware, roleMiddleware(["admin"]), userController.deleteUser);

// Public user routes
router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", authMiddleware, userController.deleteUser);

// Profile routes (yêu cầu auth)
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

module.exports = router;