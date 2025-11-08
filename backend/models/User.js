const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { 
    type: String, 
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
    required: true
  },
  avatar: { type: String, default: "" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Thêm timestamps để track thời gian tạo/cập nhật
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
