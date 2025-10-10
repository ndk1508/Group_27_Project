// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');

router.get('/users', userController.getUsers);
router.post('/users', userController.addUser);

module.exports = router;
