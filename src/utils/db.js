require("dotenv").config();
const Database = require("better-sqlite3");

const dbPath = process.env.SQLITE_DB_PATH;
const db = new Database(dbPath);

module.exports = db;
