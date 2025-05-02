const express = require("express");
const db = require("../utils/db");
const { hashPassword, verifyPassword } = require("../utils/hash");
const isAdmin = require("../middlewares/isAdmin");
const authentication = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/users - List all usernames (Admin only)
router.get("/", authentication, isAdmin, (req, res) => {
  try {
    const userList = db.prepare("SELECT username FROM users");
    const users = userList.all();
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new user (admin only)
router.post("/", authentication, isAdmin, async (req, res) => {
  const { username, password, role = "user" } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const existingUser = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await hashPassword(password);

  db.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
  ).run(username, hashedPassword, role);
  res.json({ message: "User created successfully" });
});

// Delete user (admin only)
router.delete("/:username", authentication, isAdmin, (req, res) => {
  const { username } = req.params;

  if (username === req.user.username) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.role === "admin") {
    const adminCount = db
      .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'")
      .get().count;
    if (adminCount <= 1) {
      return res
        .status(400)
        .json({ error: "Cannot delete the last remaining admin" });
    }
  }

  db.prepare("DELETE FROM users WHERE username = ?").run(username);
  res.json({ message: "User deleted successfully" });
});

// Reset password (self or admin)
router.post("/reset-password", authentication, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  if (!username || !newPassword) {
    return res
      .status(400)
      .json({ error: "Username and new password are required" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isSelf = req.user.username === username;
  const isAdminUser = req.user.role === "admin";

  if (!isSelf && !isAdminUser) {
    return res
      .status(403)
      .json({ error: "Not authorized to reset another user's password" });
  }

  if (isSelf) {
    if (
      !currentPassword ||
      !(await verifyPassword(currentPassword, user.password))
    ) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
  }

  const hashedPassword = await hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ? WHERE username = ?").run(
    hashedPassword,
    username
  );
  res.json({ message: "Password reset successful" });
});

module.exports = router;
