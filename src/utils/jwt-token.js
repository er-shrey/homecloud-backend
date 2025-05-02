require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getExpiryTime = (token) => {
  const decoded = jwt.decode(token); //✅ decode without verifying
  return decoded?.exp;
};

module.exports = { generateToken, verifyToken, getExpiryTime };
