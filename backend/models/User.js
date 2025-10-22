// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 👈 thêm dòng này
  role: { type: String, default: "user" } // (tùy chọn nếu bạn dùng role)
});

module.exports = mongoose.model("User", userSchema);
