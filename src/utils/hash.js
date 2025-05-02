// utils/hash.js
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hash) =>
  await bcrypt.compare(password, hash);

module.exports = { hashPassword, verifyPassword };
