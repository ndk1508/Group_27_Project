// controllers/userController.js
const User = require("../models/User");

// GET /users - lấy danh sách người dùng từ MongoDB
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Lấy tất cả người dùng
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /users - thêm người dùng mới vào MongoDB
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!/\S+@\S+\.\S+/.test(email || "")) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    // Kiểm tra trùng email
    const exists = await User.findOne({ email: email.trim() });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Tạo và lưu người dùng mới
    const newUser = new User({ name: name.trim(), email: email.trim() });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /users/:id - Cập nhật người dùng trong MongoDB
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true } // trả về bản ghi sau khi cập nhật
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /users/:id - Xóa người dùng khỏi MongoDB
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(deletedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
