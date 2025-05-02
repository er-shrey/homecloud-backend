const express = require("express");
const authentication = require("../middlewaares/authMiddleware");
const { blackListToken } = require("../utils/token_blacklist");
const { verifyPassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt-token");
const db = require("../utils/db");

const router = express.Router();

// POST /api/auth/login - Login route to generate JWT token
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Query database for user
  const userDetails = db.prepare("SELECT * FROM users WHERE username = ?");
  const user = userDetails.get(username);

  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Compare password
  const isPasswordMatch = await verifyPassword(password, user.password_hash);
  if (!isPasswordMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken({ userId: user.id, role: user.role });

  return res.json({
    success: true,
    message: "Login successful",
    token,
  });
});

// POST /api/auth/logout - Logout route to blacklist JWT token
router.post("/logout", authentication, (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  // Blacklist the token
  blackListToken(token);

  return res.json({
    success: true,
    message: "Logged out successfully. Token has been blacklisted.",
  });
});

module.exports = router;
