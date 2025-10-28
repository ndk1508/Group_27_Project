const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const fallbackSecret = process.env.JWT_SECRET; // tương thích token cũ nếu còn dùng

  jwt.verify(token, accessSecret || '', (err, user) => {
    if (err) {
      // Thử verify bằng JWT_SECRET để tương thích token cũ
      if (fallbackSecret) {
        return jwt.verify(token, fallbackSecret, (err2, user2) => {
          if (err2) return res.status(403).json({ message: 'Invalid or expired token' });
          req.user = user2;
          next();
        });
      }
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Export cả 2 middleware
module.exports = authMiddleware;
module.exports.verifyAccessToken = verifyAccessToken;
