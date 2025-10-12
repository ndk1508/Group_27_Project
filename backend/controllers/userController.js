// controllers/userController.js

let autoId = 1;
let users = [
  { id: autoId++, name: "Nguyen Van A", email: "a@example.com" },
  { id: autoId++, name: "Tran Thi B", email: "b@example.com" },
];

// GET /users
exports.getUsers = (req, res) => {
  res.json(users);
};

// POST /users
exports.createUser = (req, res) => {
  const { name, email } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!/\S+@\S+\.\S+/.test(email || "")) {
    return res.status(400).json({ message: "Email is invalid" });
  }
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const newUser = { id: autoId++, name: name.trim(), email: email.trim() };
  users.push(newUser);
  res.status(201).json(newUser);
};
