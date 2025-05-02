require("dotenv").config();
const db = require("./db");
const { getExpiryTime } = require("./jwt-token");

const blackListToken = (token) => {
  const expiryTime = getExpiryTime(token);
  // Blacklist the token (store it in the database)
  const blacklist_token = db.prepare(
    "INSERT INTO jwt_blacklist (token, expiry) VALUES (?, ?)"
  );
  blacklist_token.run(token, expiryTime);
};

const isTokenBlacklisted = (token) => {
  const tokenDetails = db.prepare(
    "SELECT 1 FROM jwt_blacklist WHERE token = ?"
  );
  const result = tokenDetails.get(token);
  return result !== undefined;
};

module.exports = { blackListToken, isTokenBlacklisted };
