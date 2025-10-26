// controllers/authController_new_functions.js
// COPY CÁC FUNCTION NÀY VÀO authController.js

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../config/cloudinary");

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo reset token (random string)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token và lưu vào DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Token hết hạn sau 10 phút
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Tạo URL reset (frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Nội dung email
    const message = `
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
      <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Đặt lại mật khẩu</a>
      <p>Hoặc copy link này vào trình duyệt:</p>
      <p>${resetUrl}</p>
      <p><strong>Token chỉ có hiệu lực trong 10 phút!</strong></p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    `;

    // Gửi email
    await sendEmail({
      email: user.email,
      subject: "Đặt lại mật khẩu",
      message
    });

    res.json({ 
      message: "Email đặt lại mật khẩu đã được gửi",
      resetToken // Chỉ để test, production nên bỏ
    });

  } catch (err) {
    // Nếu lỗi, xóa token
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    
    res.status(500).json({ message: "Không thể gửi email", error: err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });
    }

    // Hash token từ request để so sánh với DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Token chưa hết hạn
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Cập nhật mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công" });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// POST /api/auth/upload-avatar (cần authMiddleware)
exports.uploadAvatar = async (req, res) => {
  try {
    // Kiểm tra có file không
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh" });
    }

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars", // Thư mục trên Cloudinary
      width: 300,
      height: 300,
      crop: "fill"
    });

    // Cập nhật avatar của user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    user.avatar = result.secure_url; // URL ảnh trên Cloudinary
    await user.save();

    res.json({ 
      message: "Upload avatar thành công",
      avatar: result.secure_url 
    });

  } catch (err) {
    res.status(500).json({ message: "Upload thất bại", error: err.message });
  }
};
