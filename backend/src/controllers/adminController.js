const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createUserByRole = async (req, res) => {
  const { name, email, password, role, studentCode, className } = req.body;
  if (!["teacher", "student"].includes(role)) {
    return res.status(400).json({ message: "Role must be teacher or student" });
  }
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    studentCode: role === "student" ? studentCode : undefined,
    className
  });

  return res.status(201).json({
    message: `${role} created successfully`,
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

const listUsersByRole = async (req, res) => {
  const { role } = req.params;
  if (!["teacher", "student"].includes(role)) {
    return res.status(400).json({ message: "Role must be teacher or student" });
  }
  const users = await User.find({ role, isActive: true }).select("-password").sort({ createdAt: -1 });
  res.json(users);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, className, studentCode } = req.body;
  const user = await User.findById(id);
  if (!user || !["teacher", "student"].includes(user.role)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (typeof className === "string") user.className = className;
  if (user.role === "student" && typeof studentCode === "string") user.studentCode = studentCode;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();
  res.json({ message: "User updated successfully" });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || !["teacher", "student"].includes(user.role)) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isActive = false;
  await user.save();
  res.json({ message: "User deactivated successfully" });
};

module.exports = { createUserByRole, listUsersByRole, updateUser, deleteUser };
