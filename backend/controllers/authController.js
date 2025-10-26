const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

// Multer để nhận file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ======================================================
//  ĐĂNG KÝ
// ======================================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======================================================
//  ĐĂNG NHẬP
// ======================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ message: "Đăng nhập thành công", token, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======================================================
//  ĐĂNG XUẤT
// ======================================================
exports.logout = (req, res) => {
  res.json({ message: "Đã đăng xuất (xóa token phía client)" });
};

// ======================================================
//  QUÊN MẬT KHẨU
// ======================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `Bạn nhận được yêu cầu đặt lại mật khẩu.\nLink reset: ${resetURL}`;

    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      message,
    });

    res.json({ message: "Token reset đã gửi qua email", token: resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
//  ĐẶT LẠI MẬT KHẨU
// ======================================================
exports.resetPassword = async (req, res) => {
  try {
    // Nhận token từ params HOẶC body để tương thích cả Postman và frontend
    const token = req.params.token || req.body.token;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Thiếu token reset" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token không hợp lệ hoặc hết hạn" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ======================================================
//  UPLOAD AVATAR
// ======================================================
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Chưa chọn ảnh để upload" });
    }

    // Tải ảnh lên Cloudinary từ buffer
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avatars" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User không tồn tại" });
        }

        user.avatar = result.secure_url;
        await user.save();

        res.json({
          message: "Cập nhật avatar thành công",
          avatar: result.secure_url,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};