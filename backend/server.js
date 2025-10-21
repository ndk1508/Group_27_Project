const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();
console.log('MONGO_URI =', process.env.MONGO_URI);

// 🔗 Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());

// Route test nhanh
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import routes
const userRoutes = require("./routes/user");
app.use("/", userRoutes); // => /users

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
