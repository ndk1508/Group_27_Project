const User = require('../models/User');

// GET /users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /users
exports.createUser = async (req, res) => {
    const { name, email } = req.body;
    const user = new User({ name, email });
    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
