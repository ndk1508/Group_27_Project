const User = require('../models/User');

exports.getUsers = async (req, res) => {
  const users = await User.find().lean();
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { name, email } = req.body || {};
  if (!name?.trim() || !email?.trim())
    return res.status(400).json({ message: 'Name & email are required' });

  try {
    const u = await User.create({ name: name.trim(), email: email.trim() });
    res.status(201).json(u);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email đã tồn tại' });
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted', deletedUser: u });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
