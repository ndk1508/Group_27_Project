// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /users
router.get("/users", userController.getUsers);

// POST /users
router.post("/users", userController.createUser);

module.exports = router;
