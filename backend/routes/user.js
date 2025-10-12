const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET: Lấy danh sách user
router.get('/users', userController.getUsers);

// POST: Thêm user mới
router.post('/users', userController.createUser);

// PUT: Cập nhật thông tin user theo ID
router.put('/users/:id', userController.updateUser);

// DELETE: Xóa user theo ID
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
