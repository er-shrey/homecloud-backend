require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const authentication = require("../middlewaares/authMiddleware");
const { blackListToken } = require("../utils/token_blacklist");
const router = express.Router();

const dbPath = process.env.SQLITE_DB_PATH;
const db = new Database(dbPath);

// POST /api/auth/login - Login route to generate JWT token
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Query database for user
  const userDetails = db.prepare("SELECT * FROM users WHERE username = ?");
  const user = userDetails.get(username);

  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Compare password
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err || !isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Default expiry time 7 days
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
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
