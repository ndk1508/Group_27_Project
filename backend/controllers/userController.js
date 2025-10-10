// controllers/userController.js
let users = [
  { id: 1, name: "Nguyen Van A" },
  { id: 2, name: "Tran Thi B" }
];

// GET /users
const getUsers = (req, res) => {
  res.json(users);
};

// POST /users
const addUser = (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
};

module.exports = { getUsers, addUser };
