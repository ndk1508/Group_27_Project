const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());             
app.use(express.json());

// (tùy chọn) route kiểm tra nhanh
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const userRoutes = require("./routes/user");
app.use("/", userRoutes);   // => /users

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
