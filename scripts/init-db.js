require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.SQLITE_DB_PATH;
const dbDir = path.dirname(dbPath);

if (!dbPath) {
  console.error("SQLITE_DB_PATH not set in .env");
  process.exit(1);
}

// Ensure the DB directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("📁 Created database directory:", dbDir);
}

const db = new Database(dbPath);

/** User table */
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

/** JWT blacklist table */
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS jwt_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    expiry DATETIME NOT NULL
  )
`
).run();

/** Logs table */
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    action TEXT NOT NULL,
    file_path TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

console.log("✅ SQLite DB initialized at", dbPath);
