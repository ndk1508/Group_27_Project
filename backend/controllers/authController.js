const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const RefreshToken = require('../models/RefreshToken'); // SV3 tạo schema này
const { logActivity } = require('../utils/activityLogger');

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nếu có file avatar khi đăng ký, upload lên Cloudinary
    let avatarUrl = "";
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "avatars" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        avatarUrl = result.secure_url || "";
      } catch (uploadErr) {
        return res.status(500).json({ message: "Lỗi upload ảnh đại diện", error: uploadErr.message });
      }
    }

    const newUser = new User({ name, email, password: hashedPassword, avatar: avatarUrl });
    await newUser.save();

    // Trả về user đã được lược bỏ password
    const { password: _pw, ...safeUser } = newUser.toObject();
    res.status(201).json({ message: "Đăng ký thành công", user: safeUser });
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
      {
        // Log failed login attempt (unknown user)
        await logActivity({ action: 'login_failed', ip: req.ip, meta: { email } });
        return res.status(400).json({ message: "Email không tồn tại" });
      }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      {
        // Log failed login attempt
        await logActivity({ userId: user._id, action: 'login_failed', ip: req.ip, meta: { email } });
        return res.status(400).json({ message: "Sai mật khẩu" });
      }

    // Tạo access token và refresh token
    const tokens = generateTokens(user);

    // Lưu refresh token vào database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    await RefreshToken.create({
      token: tokens.refreshToken,
      userId: user._id,
      expiresAt: expiresAt
    });

    // Log successful login
    await logActivity({ userId: user._id, action: 'login_success', ip: req.ip, meta: { email: user.email } });

    res.json({ 
      message: "Đăng nhập thành công", 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======================================================
//  ĐĂNG XUẤT
// ======================================================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Xóa refresh token khỏi database (revoke)
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    res.json({ message: "Đã đăng xuất thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ======================================================
//  QUÊN MẬT KHẨU
// ======================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Tạo token raw gửi qua email, nhưng lưu hash vào DB
    const resetTokenRaw = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetTokenRaw).digest("hex");
    const resetExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetURL = `${frontendUrl}/reset-password/${resetTokenRaw}`;

    const message = `Bạn nhận được yêu cầu đặt lại mật khẩu.\nLink reset: ${resetURL}`;

    // Send both plain text and simple HTML version
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      message,
      html: `<p>Bạn nhận được yêu cầu đặt lại mật khẩu.</p><p>Nhấn vào <a href="${resetURL}">đây</a> để đặt lại mật khẩu.</p><p>Nếu không phải bạn, bỏ qua email này.</p>`,
    });

    // For safety, return raw token only in non-production to help testing.
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      return res.json({ message: "Token reset đã gửi qua email", token: resetTokenRaw });
    }

    res.json({ message: "Token reset đã gửi qua email" });
  } catch (error) {
    console.error("forgotPassword error:", error);
    // If sending email failed, remove token from user for safety
    try {
      if (typeof user !== 'undefined' && user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    } catch (e) {
      console.error('Failed to cleanup reset token after email error:', e);
    }
    res.status(500).json({ error: error.message });
  }
};

// ======================================================
//  ĐẶT LẠI MẬT KHẨU
// ======================================================
exports.resetPassword = async (req, res) => {
  try {
    // Nhận token từ params HOẶC body để tương thích cả Postman và frontend
    const tokenRaw = req.params.token || req.body.token;
    const { newPassword } = req.body;

    if (!tokenRaw) {
      return res.status(400).json({ message: "Thiếu token reset" });
    }

    // Hash token trước khi so sánh với DB
    const tokenHash = crypto.createHash("sha256").update(tokenRaw).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
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
    console.error("resetPassword error:", error);
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
// Hàm tạo token
const generateTokens = (user) => {
  // Dùng fallback để tránh lỗi "secretOrPrivateKey must have a value" nếu biến môi trường thiếu
  const accessSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_fallback_secret";
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "refresh_fallback_secret";
  const accessExpire = process.env.TOKEN_EXPIRE || "15m";
  const refreshExpire = process.env.REFRESH_EXPIRE || "7d";

  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    accessSecret,
    { expiresIn: accessExpire }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    refreshSecret,
    { expiresIn: refreshExpire }
  );

  return { accessToken, refreshToken };
};
// API refresh
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) return res.status(403).json({ message: 'Invalid refresh token' });

  const verifySecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "refresh_fallback_secret";
  jwt.verify(refreshToken, verifySecret, async (err, user) => {
      if (err) return res.status(403).json({ message: 'Expired refresh token' });

      const newTokens = generateTokens({ _id: user.id, email: user.email });

      // Cập nhật refresh token trong DB
      storedToken.token = newTokens.refreshToken;
      await storedToken.save();

      res.json({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ======================================================
//  GET CURRENT USER (for frontend Redux / protected routes)
// ======================================================
exports.getMe = async (req, res) => {
  try {
    // verifyAccessToken middleware already attached req.user
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    // Return only safe/public fields
    const safe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
    };

    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};