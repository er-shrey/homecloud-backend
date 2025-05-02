require("dotenv").config();
const readline = require("readline");
const { hashPassword } = require("../src/utils/hash");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dbPath = path.resolve(process.env.SQLITE_DB_PATH);

if (!fs.existsSync(dbPath)) {
  console.error(
    "❌ SQLite DB file not found. Please run the DB init script first."
  );
  process.exit(1);
}

const db = new Database(dbPath);

// Prompt helper
const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

(async () => {
  const username = await ask("Enter admin username: ");
  const password = await ask("Enter admin password: ");

  if (!username || !password) {
    console.error("❌ Username and password are required.");
    rl.close();
    process.exit(1);
  }

  const existing = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    console.error("❌ User already exists.");
    rl.close();
    process.exit(1);
  }

  const password_hash = await hashPassword(password);

  db.prepare(
    `
    INSERT INTO users (username, password_hash, role)
    VALUES (?, ?, 'admin')
  `
  ).run(username, password_hash);

  console.log(`✅ Admin user '${username}' created successfully.`);
  rl.close();
})();
