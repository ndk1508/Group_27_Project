const User = require('../models/User');

// GET: Lấy danh sách user từ MongoDB
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

// POST: Thêm user vào MongoDB
exports.createUser = async (req, res) => {
    try {
        // Prevent client from setting _id or id which can cause Cast errors
        const payload = { ...req.body };
        delete payload._id;
        delete payload.id;
        const user = new User(payload);
        const saved = await user.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error creating user:', err);
        // Duplicate key (unique) error from MongoDB
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Duplicate field value', error: err.keyValue });
        }
        res.status(400).json({ message: 'Error creating user', error: err.message });
    }
};

// PUT: Cập nhật user theo ID MongoDB
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json(updated);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(400).json({ message: 'Error updating user', error: err.message });
    }
};

// DELETE: Xóa user theo ID MongoDB
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(400).json({ message: 'Error deleting user', error: err.message });
    }
};
