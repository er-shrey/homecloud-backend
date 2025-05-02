require("dotenv").config();
const Database = require("better-sqlite3");

const dbPath = process.env.SQLITE_DB_PATH;
const db = new Database(dbPath);

const blackListToken = (token) => {
  // Blacklist the token (store it in the database)
  const blacklist_token = db.prepare(
    "INSERT INTO jwt_blacklist (token) VALUES (?)"
  );
  blacklist_token.run(token);
};

const isTokenBlacklisted = (token) => {
  const tokenDetails = db.prepare(
    "SELECT 1 FROM blacklisted_tokens WHERE token = ?"
  );
  const result = tokenDetails.get(token);
  return result !== undefined;
};

module.exports = { blackListToken, isTokenBlacklisted };
