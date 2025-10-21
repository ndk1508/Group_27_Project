const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/users", userController.getUsers);
router.post("/users", userController.createUser);
router.put("/users/:id", userController.updateUser);  // 👈 thêm
router.delete("/users/:id", userController.deleteUser); // 👈 thêm

module.exports = router;
