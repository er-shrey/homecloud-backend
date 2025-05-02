require("dotenv").config();
const path = require("path");
const Database = require("better-sqlite3");

// Load SQLite DB path from env
const dbPath = process.env.SQLITE_DB_PATH;
const db = new Database(dbPath);

// Cleanup expired tokens
const now = Math.floor(Date.now() / 1000); // current time in seconds
const stmt = db.prepare("DELETE FROM jwt_blacklist WHERE expiry < ?");
const result = stmt.run(now);

console.log(`✅ Expired tokens deleted: ${result.changes}`);
db.close();
