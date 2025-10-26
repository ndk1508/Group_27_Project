const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables FIRST
dotenv.config();
console.log('MONGO_URI =', process.env.MONGO_URI);

// 🔗 Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Route test nhanh
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/", userRoutes); // => /users

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));