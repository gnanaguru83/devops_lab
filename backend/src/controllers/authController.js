const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "attendance-secret", {
    expiresIn: "1d"
  });

const registerInitialAdmin = async (req, res) => {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return res.status(403).json({ message: "Initial admin already exists" });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  const admin = await User.create({ name, email, password, role: "admin" });
  const token = signToken(admin);
  return res.status(201).json({
    token,
    user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentCode: user.studentCode,
      className: user.className
    }
  });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { registerInitialAdmin, login, me };
