const { verifyToken } = require("../utils/jwt-token");
const { isTokenBlacklisted } = require("../utils/token_blacklist");

const authentication = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (isTokenBlacklisted(token)) {
    return res
      .status(401)
      .json({ error: "Token has been revoked. Please login again." });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

module.exports = authentication;
