
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
    const { name, email, role } = req.body;

    // Xây dựng object cập nhật động; chỉ cập nhật các trường được cung cấp
    const update = {};
    if (typeof name !== "undefined") update.name = name;
    if (typeof email !== "undefined") update.email = email;
    if (typeof role !== "undefined") update.role = role; // route đã bảo vệ: chỉ admin mới gọi

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,           // trả về doc sau cập nhật
      runValidators: true, // chạy validate của schema
    }).select("-password"); // ẩn password trong response

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
// Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Cập nhật thông tin
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Nếu có đổi mật khẩu thì mã hóa lại
    if (password) {
      const bcrypt = require("bcryptjs");
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Lấy danh sách tất cả user (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ẩn mật khẩu
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa user (Admin hoặc chính chủ)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin hoặc tự xóa
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Không có quyền xóa tài khoản này" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ message: "Xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

