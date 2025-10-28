const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ✅ Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// ✅ Register routes
app.use('/api/auth', authRoutes);   // => /api/auth/refresh
app.use('/', userRoutes);           // => /users

// Test route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ✅ Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
